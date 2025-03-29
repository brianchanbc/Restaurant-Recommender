from fastapi import FastAPI, HTTPException, Header, Depends
from .services.yelp import *
from .models import SearchCriteria, User
from .authentication.validation import create_user, login_user, change_password

import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

app = FastAPI()

@app.post("/search")
def search(criteria: SearchCriteria):
    logger.info(f"Searching for {criteria.term}")
    result = search_restaurants(criteria)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result

@app.get("/restaurant/{alias}")
def get_restaurant_detail(alias: str):
    logger.info(f"Getting restaurant with alias {alias}")
    result = search_restaurant_detail(alias)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result

@app.post("/signup")
def signup(
    email: str = Header(None),
    password: str = Header(None),
):
    logger.info(f"Signing up user {email}")
    user = User(email=email, password=password)
    result = create_user(user)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result

@app.get("/login")
def login(
    email: str = Header(None),
    password: str = Header(None),
):
    logger.info(f"Logging in user {email}")
    user = User(email=email, password=password)
    result = login_user(user)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result
    
@app.put("/change_password")  
def change_password(
    email: str = Header(None),  
    new_password: str = Header(None),
    api_key: str = Header(None),
):
    logger.info(f"Changing password for user {email}")
    user = User(email=email, password=new_password)
    result = change_password(user, api_key)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result