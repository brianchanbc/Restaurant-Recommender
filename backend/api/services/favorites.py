import sqlite3
import logging
from .yelp import get_restaurant_by_id
from ..utils.db_utils import execute_query, get_user_id_by_api_key

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

def get_favorites(api_key):
    """Get all favorites for a user."""
    try:
        user_id = get_user_id_by_api_key(api_key)
        if not user_id:
            return {"error": "Invalid API key."}, 401

        # Get favorite restaurant IDs
        restaurant_rows = execute_query(
            "SELECT restaurant_id FROM favorite WHERE user_id = ?", 
            (user_id,),
            fetch_all=True
        )
        
        favorites = []
        for row in restaurant_rows:
            restaurant_id = row['restaurant_id']
            restaurant_data, status_code = get_restaurant_by_id(restaurant_id)
            
            if status_code == 200 and "error" not in restaurant_data:
                restaurant_data['isFavorite'] = True
                favorites.append(restaurant_data)
            else:
                logger.error(f"Failed to get details for restaurant ID {restaurant_id}")
        
        return {"favorites": favorites}, 200
    except sqlite3.Error as db_error:
        logger.error(f"Database error in get_favorites: {db_error}")
        return {"error": str(db_error)}, 500

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
        
        # Check if already a favorite
        existing = execute_query(
            "SELECT id FROM favorite WHERE user_id = ? AND restaurant_id = ?",
            (user_id, restaurant_id)
        )
        
        if existing:
            return {"message": "Restaurant is already a favorite."}, 200
        
        # Add to favorites
        execute_query(
            "INSERT INTO favorite (user_id, restaurant_id) VALUES (?, ?)",
            (user_id, restaurant_id),
            commit=True
        )
        
        return {"message": "Restaurant added to favorites."}, 201
    except sqlite3.Error as db_error:
        logger.error(f"Database error in add_favorite: {db_error}")
        return {"error": str(db_error)}, 500

def remove_favorite(restaurant_id, api_key):
    """Remove a restaurant from user's favorites."""
    try:
        user_id = get_user_id_by_api_key(api_key)
        if not user_id:
            return {"error": "Invalid API key."}, 401
        
        # Delete the favorite
        result = execute_query(
            "DELETE FROM favorite WHERE user_id = ? AND restaurant_id = ?",
            (user_id, restaurant_id),
            commit=True
        )
        
        if result > 0:
            return {"message": "Restaurant removed from favorites."}, 200
        else:
            return {"message": "Restaurant was not in favorites."}, 404
    except sqlite3.Error as db_error:
        logger.error(f"Database error in remove_favorite: {db_error}")
        return {"error": str(db_error)}, 500

def get_favorite_counts(restaurant_ids):
    """Get the count of users who favorited each restaurant."""
    try:
        if not restaurant_ids:
            return {"counts": {}}, 200
            
        # Build placeholders for the SQL query
        placeholders = ','.join(['?'] * len(restaurant_ids))
        
        # Query to count favorites for each restaurant
        query = f"""
            SELECT restaurant_id, COUNT(user_id) as favorite_count 
            FROM favorite 
            WHERE restaurant_id IN ({placeholders})
            GROUP BY restaurant_id
        """
        
        rows = execute_query(query, restaurant_ids, fetch_all=True)
        counts = {row['restaurant_id']: row['favorite_count'] for row in rows}
        
        # Add zero counts for restaurants with no favorites
        for restaurant_id in restaurant_ids:
            if restaurant_id not in counts:
                counts[restaurant_id] = 0
                
        return {"counts": counts}, 200
    except sqlite3.Error as db_error:
        logger.error(f"Database error in get_favorite_counts: {db_error}")
        return {"error": str(db_error)}, 500
