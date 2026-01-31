from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class ArtworkDimensions(BaseModel):
    width: float
    height: float
    depth: Optional[float] = None
    unit: str = 'inches'


class Artwork(BaseModel):
    id: str
    title: str
    artist: str
    price: int
    style: str
    medium: str
    dimensions: Dict[str, Any]
    image_url: str
    gallery_id: Optional[str] = None
    description: Optional[str] = None
    year_created: Optional[int] = None
    availability_status: str = 'available'


class Gallery(BaseModel):
    id: str
    name: str
    address: str
    latitude: float
    longitude: float
    contact: Dict[str, Any]
    description: Optional[str] = None
    opening_hours: Optional[str] = None
    verified: bool = False


class UserPreferences(BaseModel):
    styles: Dict[str, float]
    budget_range: List[int]


class User(BaseModel):
    id: str
    username: str
    budget_min: int
    budget_max: int
    preferences: UserPreferences
    onboarding_completed: bool = False
    created_at: str


class SwipeAction(BaseModel):
    user_id: str
    artwork_id: str
    action: str  # 'like' or 'pass'


class RecommendationRequest(BaseModel):
    user_id: str
    limit: int = 20
    exclude_ids: Optional[List[str]] = None


class RecommendationResponse(BaseModel):
    artworks: List[Artwork]
    reasoning: Optional[str] = None


class ChatMessage(BaseModel):
    user_id: str
    message: str
    context: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    response: str
    artworks: Optional[List[Artwork]] = None
    suggested_queries: Optional[List[str]] = None
