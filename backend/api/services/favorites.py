import sqlite3
from pathlib import Path
import logging
from .yelp import get_restaurant_by_id

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
    """Get user ID from API key."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM user WHERE api_key = ?", (api_key,))
        user = cursor.fetchone()
        if user:
            return user['id']
        return None
    except sqlite3.Error as db_error:
        logger.error(f"Database error in get_user_id_by_api_key: {db_error}")
        return None
    finally:
        if 'conn' in locals():
            conn.close()

def get_favorites(api_key):
    """Get all favorites for a user."""
    try:
        user_id = get_user_id_by_api_key(api_key)
        if not user_id:
            return {"error": "Invalid API key."}, 401

        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get favorite restaurant IDs
        cursor.execute(
            "SELECT restaurant_id FROM favorite WHERE user_id = ?", 
            (user_id,)
        )
        
        favorites = []
        for row in cursor.fetchall():
            # Get restaurant details from Yelp API
            restaurant_id = row['restaurant_id']
            restaurant_data, status_code = get_restaurant_by_id(restaurant_id)
            
            if status_code == 200 and "error" not in restaurant_data:
                # Add isFavorite flag
                restaurant_data['isFavorite'] = True
                favorites.append(restaurant_data)
            else:
                logger.error(f"Failed to get details for restaurant ID {restaurant_id}")
        
        return {"favorites": favorites}, 200
    except sqlite3.Error as db_error:
        logger.error(f"Database error in get_favorites: {db_error}")
        return {"error": str(db_error)}, 500
    finally:
        if 'conn' in locals():
            conn.close()

def add_favorite(restaurant, api_key):
    """Add a restaurant to user's favorites."""
    try:
        user_id = get_user_id_by_api_key(api_key)
        if not user_id:
            return {"error": "Invalid API key."}, 401

        # Extract restaurant ID
        restaurant_id = restaurant.get("id")
        if not restaurant_id:
            return {"error": "Restaurant ID is required."}, 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if already a favorite
        cursor.execute(
            "SELECT id FROM favorite WHERE user_id = ? AND restaurant_id = ?",
            (user_id, restaurant_id)
        )
        existing = cursor.fetchone()
        
        if existing:
            return {"message": "Restaurant is already a favorite."}, 200
        
        # Add to favorites
        cursor.execute(
            "INSERT INTO favorite (user_id, restaurant_id) VALUES (?, ?)",
            (user_id, restaurant_id)
        )
        conn.commit()
        
        return {"message": "Restaurant added to favorites."}, 201
    except sqlite3.Error as db_error:
        logger.error(f"Database error in add_favorite: {db_error}")
        return {"error": str(db_error)}, 500
    finally:
        if 'conn' in locals():
            conn.close()

def remove_favorite(restaurant_id, api_key):
    """Remove a restaurant from user's favorites."""
    try:
        user_id = get_user_id_by_api_key(api_key)
        if not user_id:
            return {"error": "Invalid API key."}, 401
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Delete the favorite
        cursor.execute(
            "DELETE FROM favorite WHERE user_id = ? AND restaurant_id = ?",
            (user_id, restaurant_id)
        )
        conn.commit()
        
        if cursor.rowcount > 0:
            return {"message": "Restaurant removed from favorites."}, 200
        else:
            return {"message": "Restaurant was not in favorites."}, 404
    except sqlite3.Error as db_error:
        logger.error(f"Database error in remove_favorite: {db_error}")
        return {"error": str(db_error)}, 500
    finally:
        if 'conn' in locals():
            conn.close()

def get_favorite_counts(restaurant_ids):
    """Get the count of users who favorited each restaurant."""
    try:
        if not restaurant_ids:
            return {"counts": {}}, 200
            
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Build placeholders for the SQL query
        placeholders = ','.join(['?'] * len(restaurant_ids))
        
        # Query to count favorites for each restaurant
        query = f"""
            SELECT restaurant_id, COUNT(user_id) as favorite_count 
            FROM favorite 
            WHERE restaurant_id IN ({placeholders})
            GROUP BY restaurant_id
        """
        
        cursor.execute(query, restaurant_ids)
        counts = {row['restaurant_id']: row['favorite_count'] for row in cursor.fetchall()}
        
        # Add zero counts for restaurants with no favorites
        for restaurant_id in restaurant_ids:
            if restaurant_id not in counts:
                counts[restaurant_id] = 0
                
        return {"counts": counts}, 200
    except sqlite3.Error as db_error:
        logger.error(f"Database error in get_favorite_counts: {db_error}")
        return {"error": str(db_error)}, 500
    finally:
        if 'conn' in locals():
            conn.close()
