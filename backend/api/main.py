from fastapi import FastAPI, HTTPException
from .services.yelp import search_restaurants

import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

app = FastAPI()

@app.get("/search")
def search(query: str, location: str = "Toronto"):
    logger.info(f"Searching for {query} in {location}")
    result = search_restaurants(query, location)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result