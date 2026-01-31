import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Initialize Supabase client with new secret key (not legacy service_role key)
supabase_url = os.getenv('SUPABASE_URL', '')
supabase_key = os.getenv('SUPABASE_SECRET_KEY', '')

if not supabase_url or not supabase_key:
    print('Warning: Supabase credentials not found in environment variables')
    print('Make sure SUPABASE_URL and SUPABASE_SECRET_KEY are set in backend/.env')
    supabase: Client = None
else:
    supabase: Client = create_client(supabase_url, supabase_key)


def get_supabase_client() -> Client:
    """Get the Supabase client instance"""
    return supabase
