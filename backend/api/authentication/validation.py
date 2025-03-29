from ..models import User
import sqlite3
from pathlib import Path
from .user_lookup import users
import bcrypt  
import logging
import secrets 

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

def get_db_connection():
    """Create a connection to the SQLite database."""
    db_path = Path(__file__).parents[3] / "db" / "recommender.db"
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

# Add this function for future password verification
def verify_password(plain_password, hashed_password):
    """Verify a password against its hash."""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password)

def generate_api_key():
    """Generate a secure random API key."""
    return secrets.token_urlsafe(32)

def authenticate_api_key(api_key):
    """Authenticate the API key."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user WHERE api_key = ?", (api_key,))
        user = cursor.fetchone()
        if user:
            return {"message": "API key is valid."}
        else:
            return {"error": "Invalid API key."}
    except sqlite3.Error as db_error:
        logger.error(f"Database error: {db_error}")
        return {"error": str(db_error)}
    finally:
        if 'conn' in locals():
            conn.close()

def create_user(user: User):
    """Validate and create a new user."""
    # Validate email format
    if not user.email or "@" not in user.email:
        raise ValueError("Invalid email format.")
    
    # Validate password length
    if len(user.password) < 8:
        raise ValueError("Password must be at least 8 characters long.")
    
    # Check if this is a valid email, in the real world, check against a database
    # Here for simplicity, we are showing the available users for testing to work 
    if user.email not in users:
        raise ValueError("Invalid email.")
    username = users[user.email]
        
    try:
        # Check if the user already exists in database
        get_user_query = "SELECT * FROM user WHERE email = ?"    
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(get_user_query, (user.email,))
        existing_user = cursor.fetchone()
        if existing_user:
            raise ValueError("User with this email already exists.")
        logger.info(f"Passed all validation checks, creating user {user.email}.")
        
        # Generate an API key
        api_key = generate_api_key()
        # Hash the password using bcrypt with a salt 
        hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
        # Now insert the user with the hashed password
        insert_query = "INSERT INTO user (username, email, password, api_key) VALUES (?, ?, ?, ?)"
        cursor.execute(insert_query, (username, user.email, hashed_password, api_key))
        conn.commit()
        return {"message": "User created successfully."}
    except sqlite3.Error as db_error:
        logger.error(f"Database error: {db_error}")
        raise ValueError(f"Database error: {db_error}")
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        return {"error": str(e)}
    finally:
        if 'conn' in locals():
            conn.close()  

def login_user(user: User):
    """Validate and log in a user."""
    # Validate email format
    if not user.email or "@" not in user.email:
        raise ValueError("Invalid email format.")
    
    # Validate password length
    if len(user.password) < 8:
        raise ValueError("Password must be at least 8 characters long.")
    
    # Check if this is a valid email, in the real world, check against a database
    # Here for simplicity, we are showing the available users for testing to work 
    if user.email not in users:
        raise ValueError("Invalid email.")
    username = users[user.email]
    
    try:
        # Check if the user already exists in database
        get_user_query = "SELECT * FROM user WHERE email = ?"
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(get_user_query, (user.email,))
        existing_user = cursor.fetchone()
        if not existing_user:
            raise ValueError("User with this email does not exist.")
        
        # Verify the password
        if not verify_password(user.password, existing_user['password']):
            raise ValueError("Incorrect password.")
        
        logger.info(f"Passed all validation checks, logging in user {user.email}.")
        
        return {
            "message": "User logged in successfully.", 
            "api_key": existing_user['api_key'], 
            "username": existing_user['username']
        }
    except sqlite3.Error as db_error:
        logger.error(f"Database error: {db_error}")
        raise ValueError(f"Database error: {db_error}")
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        return {"error": str(e)}
    finally:
        if 'conn' in locals():
            conn.close()   

def change_password(user: User, api_key: str):
    """Validate and change the user's password."""
    try:
        # Check if the user already exists in database 
        get_user_query = "SELECT * FROM user WHERE email = ?"
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(get_user_query, (user.email,))
        existing_user = cursor.fetchone()
        if not existing_user:
            raise ValueError("User with this email does not exist.")
        
        # Verify the API key
        if existing_user['api_key'] != api_key:
            raise ValueError("Invalid API key.")
        
        logger.info(f"Passed all validation checks, changing password for user {user.email}.")
        
        # Hash the new password using bcrypt with a salt 
        hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
        
        # Now update the user's password
        update_query = "UPDATE user SET password = ? WHERE email = ?"
        cursor.execute(update_query, (hashed_password, user.email))
        conn.commit()
        
        return {"message": "Password changed successfully."}
    except sqlite3.Error as db_error:
        logger.error(f"Database error: {db_error}")
        raise ValueError(f"Database error: {db_error}")
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        return {"error": str(e)}
    finally:
        if 'conn' in locals():
            conn.close()  