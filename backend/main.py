from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers
from routers import recommendations, users, artworks, chat, galleries

# Create FastAPI app
app = FastAPI(
    title='ArtMatch API',
    description='Backend API for ArtMatch - AI-powered art discovery platform',
    version='1.0.0',
    redirect_slashes=False
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Include routers
app.include_router(recommendations.router, prefix='/api')
app.include_router(users.router, prefix='/api')
app.include_router(artworks.router, prefix='/api')
app.include_router(chat.router, prefix='/api')
app.include_router(galleries.router, prefix='/api')


@app.get('/')
async def root():
    """Root endpoint"""
    return {
        'message': 'Welcome to ArtMatch API',
        'version': '1.0.0',
        'docs': '/docs'
    }


@app.get('/health')
async def health_check():
    """Health check endpoint"""
    return {'status': 'healthy'}
