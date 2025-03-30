from ..models import User
import sqlite3
import logging
from .user_lookup import users
from ..utils.db_utils import execute_query
from ..utils.auth_utils import (
    verify_password, generate_api_key, 
    hash_password, validate_email_format, validate_password_length
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

def validate_user_input(user):
    """Validate user input for email and password."""
    if not validate_email_format(user.email):
        return "Invalid email format."
    
    if not validate_password_length(user.password):
        return "Password must be at least 8 characters long."
    
    if user.email not in users:
        return "Unauthorized email/user."
    
    return None

def create_user(user: User):
    """Validate and create a new user."""
    try:
        # Validate user input
        validation_error = validate_user_input(user)
        if validation_error:
            raise ValueError(validation_error)
        
        # Check if the user already exists in database
        existing_user = execute_query("SELECT * FROM user WHERE email = ?", (user.email,))
        if existing_user:
            raise ValueError("User already exists.")
        
        logger.info(f"Passed all validation checks, creating user {user.email}.")
        
        # Generate an API key
        api_key = generate_api_key()
        # Hash the password
        hashed_password = hash_password(user.password)
        
        # Insert the new user
        execute_query(
            "INSERT INTO user (username, email, password, api_key) VALUES (?, ?, ?, ?)",
            (users[user.email], user.email, hashed_password, api_key),
            commit=True
        )
        
        return {
            "message": "User created successfully.", 
            "username": users[user.email],
            "api_key": api_key
        }, 201
    except sqlite3.Error as db_error:
        logger.error(f"Database error: {db_error}")
        return {"error": str(db_error)}, 500
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        if "already exists" in str(e):
            return {"error": str(e)}, 409  # Conflict
        return {"error": str(e)}, 400  # Bad Request

def login_user(user: User):
    """Validate and log in a user."""
    try:
        # Validate user input
        validation_error = validate_user_input(user)
        if validation_error:
            raise ValueError(validation_error)
        
        # Check if the user exists in database
        existing_user = execute_query("SELECT * FROM user WHERE email = ?", (user.email,))
        if not existing_user:
            raise ValueError("Email/User does not exist.")
        
        # Verify the password
        if not verify_password(user.password, existing_user['password']):
            raise ValueError("Incorrect password.")
        
        logger.info(f"Passed all validation checks, logging in user {user.email}.")
        
        return {
            "message": "User logged in successfully.", 
            "api_key": existing_user['api_key'], 
            "username": existing_user['username']
        }, 200
    except sqlite3.Error as db_error:
        logger.error(f"Database error: {db_error}")
        return {"error": str(db_error)}, 500
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        if "Incorrect password" in str(e):
            return {"error": str(e)}, 401  # Unauthorized
        return {"error": str(e)}, 400  # Bad Request

def change_password(user: User, api_key: str):
    """Validate and change the user's password."""
    try:
        # Check if the user exists in database 
        existing_user = execute_query("SELECT * FROM user WHERE email = ?", (user.email,))
        if not existing_user:
            raise ValueError("User with this email does not exist.")
        
        # Verify the API key
        if existing_user['api_key'] != api_key:
            raise ValueError("Invalid API key.")
        
        # Validate password length
        if not validate_password_length(user.password):
            raise ValueError("Password must be at least 8 characters long.")
        
        logger.info(f"Passed all validation checks, changing password for user {user.email}.")
        
        # Hash the new password
        hashed_password = hash_password(user.password)
        
        # Update the user's password
        execute_query(
            "UPDATE user SET password = ? WHERE email = ?", 
            (hashed_password, user.email),
            commit=True
        )
        
        return {"message": "Password changed successfully."}, 200
    except sqlite3.Error as db_error:
        logger.error(f"Database error: {db_error}")
        return {"error": str(db_error)}, 500
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        return {"error": str(e)}, 401