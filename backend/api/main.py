from fastapi import FastAPI, HTTPException
from .services.yelp import *
from .models import SearchCriteria

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