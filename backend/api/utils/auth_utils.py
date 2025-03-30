import bcrypt
import secrets
import logging

logger = logging.getLogger(__name__)

def verify_password(plain_password, hashed_password):
    """Verify a password against its hash."""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password)

def generate_api_key():
    """Generate a secure random API key."""
    return secrets.token_urlsafe(32)

def authenticate_api_key(api_key):
    """Authenticate the API key."""
    try:
        from ..utils.db_utils import execute_query
        user = execute_query("SELECT * FROM user WHERE api_key = ?", (api_key,))
        if user:
            return {"message": "API key is valid."}, 200
        else:
            return {"error": "Invalid API key."}, 401
    except Exception as e:
        logger.error(f"Error authenticating API key: {e}")
        return {"error": str(e)}, 500

def hash_password(password):
    """Hash a password using bcrypt with a salt."""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

def validate_email_format(email):
    """Validate basic email format."""
    return email and "@" in email

def validate_password_length(password, min_length=8):
    """Validate password meets minimum length requirements."""
    return len(password) >= min_length
