from fastapi import FastAPI, HTTPException, Header, Depends, Body
from .services.yelp import *
from .services.favorites import get_favorites, add_favorite, remove_favorite, get_favorite_counts
from .models import SearchCriteria, User
from .authentication.validation import create_user, login_user, change_password as change_pwd
from typing import Dict, Any

import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

app = FastAPI()

# Yelp API endpoints
@app.post("/search")
def search(criteria: SearchCriteria):
    logger.info(f"Searching for {criteria.term}")
    result, status_code = search_restaurants(criteria)
    if "error" in result:
        raise HTTPException(status_code=status_code, detail=result["error"])
    return result

# Authentication and Account Management endpoints
@app.post("/register")
def register(
    email: str = Header(None),
    password: str = Header(None),
):
    logger.info(f"Signing up user {email}")
    user = User(email=email, password=password)
    result, status_code = create_user(user)
    if "error" in result:
        raise HTTPException(status_code=status_code, detail=result["error"])
    return result

@app.get("/login")
def login(
    email: str = Header(None),
    password: str = Header(None),
):
    logger.info(f"Logging in user {email}")
    user = User(email=email, password=password)
    result, status_code = login_user(user)
    if "error" in result:
        raise HTTPException(status_code=status_code, detail=result["error"])
    return result
    
@app.put("/change_password")  
def change_password(
    email: str = Header(None),  
    newPassword: str = Header(None),
    apiKey: str = Header(None),
):
    logger.info(f"Changing password for user {email}")
    user = User(email=email, password=newPassword)
    result, status_code = change_pwd(user, apiKey)
    if "error" in result:
        raise HTTPException(status_code=status_code, detail=result["error"])
    return result

# Favorites endpoints
@app.get("/favorites")
def get_user_favorites(apiKey: str = Header(None)):
    logger.info(f"Getting favorites for user with API key: {apiKey}")
    result, status_code = get_favorites(apiKey)
    if "error" in result:
        raise HTTPException(status_code=status_code, detail=result["error"])
    return result

@app.post("/favorites")
def add_to_favorites(restaurant: Dict[str, Any] = Body(...), apiKey: str = Header(None)):
    logger.info(f"Adding restaurant {restaurant.get('id')} to favorites")
    result, status_code = add_favorite(restaurant, apiKey)
    if "error" in result:
        raise HTTPException(status_code=status_code, detail=result["error"])
    return result

@app.delete("/favorites/{restaurant_id}")
def remove_from_favorites(restaurant_id: str, apiKey: str = Header(None)):
    logger.info(f"Removing restaurant {restaurant_id} from favorites")
    result, status_code = remove_favorite(restaurant_id, apiKey)
    if "error" in result:
        raise HTTPException(status_code=status_code, detail=result["error"])
    return result

@app.post("/favorites/counts")
def get_restaurant_favorite_counts(restaurant_ids: list = Body(...)):
    logger.info(f"Getting favorite counts for {len(restaurant_ids)} restaurants")
    result, status_code = get_favorite_counts(restaurant_ids)
    if "error" in result:
        raise HTTPException(status_code=status_code, detail=result["error"])
    return result