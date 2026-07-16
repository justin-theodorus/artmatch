import os
import requests
from typing import List, Dict, Any
from services.supabase_client import get_supabase_client

# Example: Webhook URL should be set in environment or per-user in DB
WEBHOOK_URL = os.getenv('WEBHOOK_URL')


def send_price_drop_alert(gallery_id: str, gallery_name: str, artworks: List[Dict[str, Any]], threshold: int, webhook_url: str = None):
    """
    Send a webhook alert if any artwork in the gallery drops below the threshold price.
    """
    url = webhook_url or WEBHOOK_URL
    if not url:
        print('No webhook URL configured.')
        return False
    if not artworks:
        return False
    data = {
        'gallery_id': gallery_id,
        'gallery_name': gallery_name,
        'threshold': threshold,
        'artworks': [
            {
                'id': a['id'],
                'title': a['title'],
                'price': a['price'],
                'image_url': a['image_url']
            } for a in artworks
        ]
    }
    try:
        resp = requests.post(url, json=data, timeout=5)
        resp.raise_for_status()
        return True
    except Exception as e:
        print(f'Webhook alert failed: {e}')
        return False


def check_and_alert_price_drops(gallery_id: str, threshold: int, webhook_url: str = None):
    """
    Check artworks in a gallery and send webhook if any are below threshold.
    """
    supabase = get_supabase_client()
    if not supabase:
        print('Supabase unavailable')
        return False
    response = supabase.table('artworks').select('*').eq('gallery_id', gallery_id).lte('price', threshold).execute()
    artworks = response.data if response.data else []
    if artworks:
        # Get gallery name
        gallery_resp = supabase.table('galleries').select('name').eq('id', gallery_id).single().execute()
        gallery_name = gallery_resp.data['name'] if gallery_resp.data else gallery_id
        return send_price_drop_alert(gallery_id, gallery_name, artworks, threshold, webhook_url)
    return False
