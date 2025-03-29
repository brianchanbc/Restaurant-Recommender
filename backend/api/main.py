from fastapi import FastAPI, HTTPException, Header, Depends
from .services.yelp import *
from .models import SearchCriteria, User
from .authentication.validation import create_user, login_user, change_password as change_pwd

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
    result, status_code = search_restaurants(criteria)
    if "error" in result:
        raise HTTPException(status_code=status_code, detail=result["error"])
    return result

@app.get("/restaurant/{alias}")
def get_restaurant_detail(alias: str):
    logger.info(f"Getting restaurant with alias {alias}")
    result, status_code = search_restaurant_detail(alias)
    if "error" in result:
        raise HTTPException(status_code=status_code, detail=result["error"])
    return result

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