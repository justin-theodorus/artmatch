from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models.schemas import Gallery, Artwork
from services.supabase_client import get_supabase_client
from collections import Counter
from fastapi import BackgroundTasks
from services.webhook_alerts import check_and_alert_price_drops

router = APIRouter(prefix='/galleries', tags=['galleries'])


@router.get('', response_model=List[Gallery])
async def get_galleries():
    """Get all galleries"""
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(status_code=500, detail='Database connection unavailable')

    try:
        response = supabase.table('galleries').select('*').execute()
        return response.data if response.data else []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/recommended/{user_id}')
async def get_recommended_galleries(user_id: str):
    """Get gallery recommendations based on user's liked artworks.
    Requires at least 5 liked artworks to generate recommendations."""
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(status_code=500, detail='Database connection unavailable')

    try:
        # Get user's liked artworks
        swipes_response = supabase.table('swipes').select('artwork_id').eq('user_id', user_id).eq('action', 'like').execute()
        liked_artwork_ids = [s['artwork_id'] for s in swipes_response.data] if swipes_response.data else []

        # Check if user has at least 5 likes
        if len(liked_artwork_ids) < 5:
            return {
                'has_enough_likes': False,
                'likes_count': len(liked_artwork_ids),
                'required_likes': 5,
                'galleries': []
            }

        # Get the liked artworks to find their galleries and styles
        artworks_response = supabase.table('artworks').select('gallery_id, style').in_('id', liked_artwork_ids).execute()
        liked_artworks = artworks_response.data if artworks_response.data else []

        # Count galleries and styles
        gallery_counts = Counter([a['gallery_id'] for a in liked_artworks if a.get('gallery_id')])
        style_counts = Counter([a['style'] for a in liked_artworks if a.get('style')])
        top_styles = [style for style, _ in style_counts.most_common(3)]

        # Get all galleries
        galleries_response = supabase.table('galleries').select('*').execute()
        all_galleries = galleries_response.data if galleries_response.data else []

        # Score galleries
        scored_galleries = []
        for gallery in all_galleries:
            score = 0
            reasons = []

            # Direct match: user liked artworks from this gallery
            if gallery['id'] in gallery_counts:
                score += gallery_counts[gallery['id']] * 2
                reasons.append(f"You liked {gallery_counts[gallery['id']]} artworks from here")

            # Check if gallery has artworks in user's preferred styles
            gallery_artworks = supabase.table('artworks').select('style').eq('gallery_id', gallery['id']).limit(50).execute()
            gallery_styles = [a['style'] for a in gallery_artworks.data] if gallery_artworks.data else []

            matching_styles = set(gallery_styles) & set(top_styles)
            if matching_styles:
                score += len(matching_styles)
                reasons.append(f"Features {', '.join(matching_styles)} art")

            if score > 0:
                gallery_with_reason = {**gallery, 'recommendation_reason': ' · '.join(reasons), 'score': score}
                scored_galleries.append(gallery_with_reason)

        # Sort by score and return top galleries
        scored_galleries.sort(key=lambda x: x['score'], reverse=True)

        return {
            'has_enough_likes': True,
            'likes_count': len(liked_artwork_ids),
            'required_likes': 5,
            'galleries': scored_galleries[:5]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/{gallery_id}', response_model=Gallery)
async def get_gallery(gallery_id: str):
    """Get gallery by ID"""
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(status_code=500, detail='Database connection unavailable')
    
    try:
        response = supabase.table('galleries').select('*').eq('id', gallery_id).execute()
        if response.data:
            return response.data[0]
        raise HTTPException(status_code=404, detail='Gallery not found')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post('/{gallery_id}/price-drop-alert')
async def trigger_price_drop_alert(
    gallery_id: str,
    threshold: int,
    background_tasks: BackgroundTasks,
    webhook_url: Optional[str] = None
):
    """
    Trigger a webhook alert if any artwork in the gallery is below the threshold price.
    """
    background_tasks.add_task(check_and_alert_price_drops, gallery_id, threshold, webhook_url)
    return {"status": "alert task started"}


@router.get('/{gallery_id}/artworks', response_model=List[Artwork])
async def get_gallery_artworks(gallery_id: str):
    """Get artworks from a specific gallery"""
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(status_code=500, detail='Database connection unavailable')
    
    try:
        response = supabase.table('artworks').select('*').eq('gallery_id', gallery_id).execute()
        return response.data if response.data else []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
