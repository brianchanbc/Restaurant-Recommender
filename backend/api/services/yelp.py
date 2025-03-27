import requests
import logging
from ..config import YELP_API_KEY, YELP_API_BASE_URL

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

def get_headers():
    """Return headers required for Yelp API requests."""
    return {
        "Authorization": f"Bearer {YELP_API_KEY}",
        "accept": "application/json"
    }

def search_restaurants(query, location="New York", limit=10):
    """Search for restaurants using the Yelp API."""
    try:
        url = f"{YELP_API_BASE_URL}/businesses/search"
        params = {
            "term": query,
            "location": location,
            "categories": "restaurants,food",
            "limit": limit
        }
        
        response = requests.get(
            url, 
            headers=get_headers(),
            params=params
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Error searching Yelp: {e}")
        return {"error": str(e)}
