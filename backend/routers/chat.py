from fastapi import APIRouter, HTTPException
from models.schemas import ChatMessage, ChatResponse, Artwork
from services.claude_client import claude_assistant
from services.supabase_client import get_supabase_client

router = APIRouter(prefix='/chat', tags=['chat'])


@router.post('', response_model=ChatResponse)
async def chat(message: ChatMessage):
    """Chat with AI assistant for art discovery"""
    supabase = get_supabase_client()
    
    try:
        # Get user profile
        user_profile = None
        if supabase:
            user_response = supabase.table('users').select('*').eq('id', message.user_id).execute()
            if user_response.data:
                user_profile = user_response.data[0]
        
        # Get conversation history from context if provided
        conversation_history = message.context.get('history', []) if message.context else []
        
        # Chat with Claude
        result = claude_assistant.chat(
            message=message.message,
            user_profile=user_profile,
            conversation_history=conversation_history
        )
        
        response_text = result['response']
        filters = result.get('filters')
        
        # If filters were extracted, search for matching artworks
        artworks = None
        if filters and supabase:
            artworks = await search_artworks_with_filters(filters)
        
        # Generate suggested follow-up queries
        suggested_queries = [
            'Show me more like this',
            'What styles would complement my collection?',
            'Find artworks under my budget'
        ]
        
        return ChatResponse(
            response=response_text,
            artworks=artworks[:5] if artworks else None,
            suggested_queries=suggested_queries
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def search_artworks_with_filters(filters: dict) -> list:
    """Search artworks based on extracted filters"""
    supabase = get_supabase_client()
    if not supabase:
        return []
    
    try:
        query = supabase.table('artworks').select('*').eq('availability_status', 'available')
        
        if 'styles' in filters:
            query = query.in_('style', filters['styles'])
        
        if 'mediums' in filters:
            query = query.in_('medium', filters['mediums'])
        
        if 'price_max' in filters:
            query = query.lte('price', filters['price_max'])
        
        if 'price_min' in filters:
            query = query.gte('price', filters['price_min'])
        
        response = query.limit(10).execute()
        return response.data if response.data else []
    except Exception as e:
        print(f'Error searching artworks: {e}')
        return []
