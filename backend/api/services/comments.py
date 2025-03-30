import sqlite3
import logging
from ..utils.db_utils import execute_query, get_db_connection
from ..utils.auth_utils import authenticate_api_key

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

def get_comments(restaurant_id):
    """Get all comments for a restaurant."""
    try:
        rows = execute_query("""
            SELECT r.id, r.content, r.commented_at, u.username 
            FROM review r 
            JOIN user u ON r.user_id = u.id 
            WHERE r.restaurant_id = ? 
            ORDER BY r.commented_at DESC
        """, (restaurant_id,), fetch_all=True)
        
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
        logger.error(f"Database error in get_comments: {e}")
        return {"error": str(e)}, 500

def add_comment(restaurant_id, content, api_key):
    """Add a new comment for a restaurant."""
    conn = None
    try:
        # First authenticate the API key
        auth_result, status_code = authenticate_api_key(api_key)
        if status_code != 200:
            return auth_result, status_code
        
        # Get user ID and username
        user = execute_query("SELECT id, username FROM user WHERE api_key = ?", (api_key,))
        if not user:
            return {"error": "User not found"}, 404
        
        user_id = user["id"]
        username = user["username"]
        
        # Use a single connection for both operations
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Insert the comment
        cursor.execute(
            "INSERT INTO review (user_id, restaurant_id, content) VALUES (?, ?, ?)",
            (user_id, restaurant_id, content)
        )
        conn.commit()
        
        # Get the newly created comment using the same connection
        cursor.execute(
            "SELECT id, content, commented_at FROM review WHERE id = last_insert_rowid()"
        )
        comment = cursor.fetchone()
        
        if not comment:
            logger.error("Failed to retrieve the newly created comment")
            return {"error": "Failed to retrieve the newly created comment"}, 500
        
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
        if conn:
            conn.close()

