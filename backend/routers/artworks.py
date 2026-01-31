from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models.schemas import Artwork, SwipeAction
from services.supabase_client import get_supabase_client

router = APIRouter(prefix='/artworks', tags=['artworks'])


@router.get('', response_model=List[Artwork])
async def get_artworks(
    style: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    medium: Optional[str] = None,
    limit: int = 20
):
    """Get artworks with optional filters"""
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(status_code=500, detail='Database connection unavailable')
    
    try:
        query = supabase.table('artworks').select('*')
        
        if style:
            query = query.eq('style', style)
        if min_price is not None:
            query = query.gte('price', min_price)
        if max_price is not None:
            query = query.lte('price', max_price)
        if medium:
            query = query.eq('medium', medium)
        
        response = query.limit(limit).execute()
        return response.data if response.data else []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/{artwork_id}', response_model=Artwork)
async def get_artwork(artwork_id: str):
    """Get artwork by ID"""
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(status_code=500, detail='Database connection unavailable')
    
    try:
        response = supabase.table('artworks').select('*').eq('id', artwork_id).execute()
        if response.data:
            return response.data[0]
        raise HTTPException(status_code=404, detail='Artwork not found')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post('/swipe')
async def record_swipe(swipe: SwipeAction):
    """Record a swipe action (like or pass)"""
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(status_code=500, detail='Database connection unavailable')
    
    try:
        response = supabase.table('swipes').upsert({
            'user_id': swipe.user_id,
            'artwork_id': swipe.artwork_id,
            'action': swipe.action
        }).execute()
        
        return {'success': True, 'data': response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/user/{user_id}/likes', response_model=List[Artwork])
async def get_user_likes(user_id: str):
    """Get artworks liked by a user"""
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(status_code=500, detail='Database connection unavailable')
    
    try:
        # Get liked artwork IDs
        swipes_response = supabase.table('swipes').select('artwork_id').eq('user_id', user_id).eq('action', 'like').execute()
        
        if not swipes_response.data:
            return []
        
        artwork_ids = [s['artwork_id'] for s in swipes_response.data]
        
        # Get artworks
        artworks_response = supabase.table('artworks').select('*').in_('id', artwork_ids).execute()
        
        return artworks_response.data if artworks_response.data else []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
