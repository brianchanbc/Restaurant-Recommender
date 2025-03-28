import requests
import logging
from ..config import YELP_API_KEY, YELP_API_BASE_URL
from ..models import SearchCriteria

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

def search_restaurants(criteria: SearchCriteria):
    """Search for restaurants using the Yelp API."""
    try:
        url = f"{YELP_API_BASE_URL}/businesses/search"
        
        # Map SearchCriteria fields to Yelp API parameters
        params = {
            "term": criteria.term,
        }
        
        # Add optional parameters if they exist
        if criteria.location:
            params["location"] = criteria.location
        if criteria.limit:
            params["limit"] = criteria.limit
        if criteria.radius:
            params["radius"] = criteria.radius
        if criteria.price:
            params["price"] = criteria.price
        if criteria.sort_by:
            params["sort_by"] = criteria.sort_by
        if criteria.attributes:
            params["attributes"] = criteria.attributes
        
        logger.info(f"Searching Yelp with parameters: {params}")
        
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

def search_restaurant_detail(alias):
    """Get details of a restaurant using the Yelp API."""
    try:
        url = f"{YELP_API_BASE_URL}/businesses/{alias}"
        response = requests.get(
            url, 
            headers=get_headers()
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Error getting restaurant details from Yelp: {e}")
        return {"error": str(e)}