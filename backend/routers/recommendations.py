from fastapi import APIRouter, HTTPException
from typing import List
from models.schemas import RecommendationRequest, Artwork
from services.recommendation_engine import recommendation_engine

router = APIRouter(prefix='/recommendations', tags=['recommendations'])


@router.post('', response_model=List[Artwork])
async def get_recommendations(request: RecommendationRequest):
    """Get personalized artwork recommendations for a user"""
    try:
        artworks = recommendation_engine.get_recommendations(
            user_id=request.user_id,
            limit=request.limit,
            exclude_ids=request.exclude_ids
        )
        return artworks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/popular', response_model=List[Artwork])
async def get_popular_artworks(limit: int = 20):
    """Get popular artworks for cold start"""
    try:
        artworks = recommendation_engine._get_cold_start_recommendations(limit, None)
        return artworks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
