import sqlite3
from pathlib import Path
import logging
from ..authentication.validation import authenticate_api_key

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

def get_db_connection():
    """Create a connection to the SQLite database."""
    db_path = Path(__file__).parents[2] / "db" / "recommender.db"
    logger.info(f"Connecting to database at {db_path}")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def get_user_id_by_api_key(api_key):
    """Get user ID using API key."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM user WHERE api_key = ?", (api_key,))
        user = cursor.fetchone()
        if user:
            return user['id']
        return None
    except sqlite3.Error as e:
        logger.error(f"Database error: {e}")
        return None
    finally:
        if 'conn' in locals():
            conn.close()

def get_comments(restaurant_id):
    """Get all comments for a restaurant."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT r.id, r.content, r.commented_at, u.username 
            FROM review r 
            JOIN user u ON r.user_id = u.id 
            WHERE r.restaurant_id = ? 
            ORDER BY r.commented_at DESC
        """, (restaurant_id,))
        rows = cursor.fetchall()
        
        comments = []
        for row in rows:
            comments.append({
                "id": row["id"],
                "content": row["content"],
                "commented_at": row["commented_at"],
                "username": row["username"]
            })
        
        return {"comments": comments}, 200
    except sqlite3.Error as e:
        logger.error(f"Database error when getting comments: {e}")
        return {"error": str(e)}, 500
    finally:
        if 'conn' in locals():
            conn.close()

def add_comment(restaurant_id, content, api_key):
    """Add a new comment for a restaurant."""
    # First authenticate the API key
    auth_result, status_code = authenticate_api_key(api_key)
    if status_code != 200:
        return auth_result, status_code
    
    user_id = get_user_id_by_api_key(api_key)
    if not user_id:
        return {"error": "User not found"}, 404
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO review (user_id, restaurant_id, content) VALUES (?, ?, ?)",
            (user_id, restaurant_id, content)
        )
        conn.commit()
        
        # Get the username for the response
        cursor.execute("SELECT username FROM user WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        username = user["username"] if user else "Anonymous"
        
        # Get the newly created comment
        cursor.execute(
            "SELECT id, content, commented_at FROM review WHERE rowid = last_insert_rowid()"
        )
        comment = cursor.fetchone()
        
        return {
            "id": comment["id"],
            "content": comment["content"],
            "commented_at": comment["commented_at"],
            "username": username
        }, 201
    except sqlite3.Error as e:
        logger.error(f"Database error when adding comment: {e}")
        return {"error": str(e)}, 500
    finally:
        if 'conn' in locals():
            conn.close()

