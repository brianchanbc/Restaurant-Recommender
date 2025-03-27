import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Yelp API Configuration
YELP_API_KEY = os.environ.get("YELP_API_KEY")
if YELP_API_KEY is None:
    raise ValueError("YELP_API_KEY environment variable is not set. Please set it in your .env file.")
YELP_API_BASE_URL = "https://api.yelp.com/v3"
