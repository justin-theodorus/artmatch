from fastapi import APIRouter, HTTPException
from typing import Optional
from models.schemas import User, UserPreferences
from services.supabase_client import get_supabase_client

router = APIRouter(prefix='/users', tags=['users'])


@router.post('', response_model=User)
async def create_user(username: str, budget_min: int = 0, budget_max: int = 10000):
    """Create a new user"""
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(status_code=500, detail='Database connection unavailable')
    
    try:
        response = supabase.table('users').insert({
            'username': username,
            'budget_min': budget_min,
            'budget_max': budget_max,
            'onboarding_completed': False
        }).execute()
        
        if response.data:
            return response.data[0]
        raise HTTPException(status_code=400, detail='Failed to create user')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/{user_id}', response_model=User)
async def get_user(user_id: str):
    """Get user by ID"""
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(status_code=500, detail='Database connection unavailable')
    
    try:
        response = supabase.table('users').select('*').eq('id', user_id).execute()
        if response.data:
            return response.data[0]
        raise HTTPException(status_code=404, detail='User not found')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put('/{user_id}/preferences')
async def update_preferences(user_id: str, preferences: UserPreferences, 
                            budget_min: Optional[int] = None, 
                            budget_max: Optional[int] = None):
    """Update user preferences"""
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(status_code=500, detail='Database connection unavailable')
    
    try:
        update_data = {
            'preferences': preferences.dict(),
            'onboarding_completed': True
        }
        
        if budget_min is not None:
            update_data['budget_min'] = budget_min
        if budget_max is not None:
            update_data['budget_max'] = budget_max
        
        response = supabase.table('users').update(update_data).eq('id', user_id).execute()
        
        if response.data:
            return {'success': True, 'user': response.data[0]}
        raise HTTPException(status_code=400, detail='Failed to update preferences')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
