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
        
        # Build params dict with only non-None values
        params = {k: v for k, v in {
            "term": criteria.term,
            "location": criteria.location,
            "limit": criteria.limit,
            "radius": criteria.radius,
            "price": criteria.price,
            "sort_by": criteria.sort_by,
            "attributes": criteria.attributes
        }.items() if v is not None}
        
        logger.info(f"Searching Yelp with parameters: {params}")
        
        response = requests.get(
            url, 
            headers=get_headers(),
            params=params,
            timeout=10
        )
        response.raise_for_status()
        return response.json(), 200
        
    except requests.exceptions.Timeout:
        logger.error("Yelp API request timed out")
        return {"error": "Request to Yelp API timed out"}, 408
    except requests.exceptions.HTTPError as e:
        status_code = e.response.status_code
        logger.error(f"HTTP error from Yelp API: {e}, Status Code: {status_code}")
        return {"error": f"Yelp API error: {str(e)}"}, status_code
    except requests.exceptions.RequestException as e:
        logger.error(f"Error searching Yelp: {e}")
        return {"error": f"Request error: {str(e)}"}, 400
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        return {"error": "Internal server error"}, 500

def get_restaurant_by_id(business_id):
    """Get details of a restaurant using the Yelp API."""
    if not business_id:
        return {"error": "Business ID is required"}, 400
        
    try:
        url = f"{YELP_API_BASE_URL}/businesses/{business_id}"
        response = requests.get(
            url, 
            headers=get_headers(),
            timeout=10
        )
        response.raise_for_status()
        return response.json(), 200
        
    except requests.exceptions.Timeout:
        logger.error("Yelp API request timed out")
        return {"error": "Request to Yelp API timed out"}, 408
    except requests.exceptions.HTTPError as e:
        status_code = e.response.status_code
        logger.error(f"HTTP error from Yelp API: {e}, Status Code: {status_code}")
        return {"error": f"Yelp API error: {str(e)}"}, status_code
    except requests.exceptions.RequestException as e:
        logger.error(f"Error getting restaurant details from Yelp: {e}")
        return {"error": f"Request error: {str(e)}"}, 400
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        return {"error": "Internal server error"}, 500