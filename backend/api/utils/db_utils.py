import sqlite3
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

def get_db_connection():
    """Create a connection to the SQLite database."""
    db_path = Path(__file__).parents[2] / "db" / "recommender.db"
    logger.info(f"Connecting to database at {db_path}")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def execute_query(query, params=(), fetch_all=False, commit=False):
    """Execute a database query with error handling."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)
        
        if commit:
            conn.commit()
            return cursor.rowcount
        
        if fetch_all:
            return cursor.fetchall()
        else:
            return cursor.fetchone()
    except sqlite3.Error as e:
        logger.error(f"Database error in execute_query: {e}")
        raise
    finally:
        if conn in locals():
            conn.close()

def get_user_id_by_api_key(api_key):
    """Get user ID from API key."""
    try:
        row = execute_query("SELECT id FROM user WHERE api_key = ?", (api_key,))
        return row['id'] if row else None
    except sqlite3.Error:
        return None
