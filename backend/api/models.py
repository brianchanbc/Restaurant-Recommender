from pydantic import BaseModel
from typing import Optional

"""Models for API requests and responses"""
class SearchCriteria(BaseModel):
    term: str # "Starbucks", "Italian", "Sushi"
    location: Optional[str] = None # "New York City", "NYC", "350 5th Ave, New York, NY 10118"
    radius: Optional[int] = None  # Search radius in meters (0 to 40000)
    price: Optional[str] = None  # Price range 1-4, 1 means $ (e.g., "1,2,3,4")
    sort_by: Optional[str] = None  # Sort method (best_match, rating, review_count, distance)
    limit: Optional[int] = 20  # Number of results to return
    attributes: Optional[str] = None  # Filter attributes e.g. "reservation,happy_hour,ambience_classy,ambience_upscale,ambience_casual,noise_level_average,noise_level_loud,noise_level_quiet,noise_level_very_loud,outdoor_seating,parking,wifi"

class User(BaseModel):
    email: str
    password: str