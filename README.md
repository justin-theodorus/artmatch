# ArtMatch - AI-Powered Art Discovery Platform

ArtMatch is a React Native mobile application that revolutionizes art discovery through AI-powered recommendations, a Tinder-style swipe interface, AR preview capabilities, and a conversational art advisory powered by Claude AI.

![Logo](assets/ArtMatch%20logo.png)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [Application Screens](#application-screens)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)
- [License](#license)

## Features

### Core Features

1. **Swipe-Based Discovery**
   - Tinder-style card swiper with smooth gesture animations
   - Like (swipe right) or Pass (swipe left) on artworks
   - Real-time recommendation updates based on user preferences

2. **User Onboarding**
   - Style quiz with artwork pairs to understand user preferences
   - Budget range selection
   - Creates personalized user profile

3. **AI-Powered Recommendations**
   - Hybrid collaborative and content-based filtering algorithm
   - Personalized artwork suggestions based on style preferences and budget
   - "Why you might like this" explanations for each recommendation

4. **Artwork Detail View**
   - Comprehensive artwork information (title, artist, year, medium, dimensions)
   - Pricing and availability status
   - Gallery information and contact options

5. **AR Preview**
   - View artworks in your physical space using device camera
   - Drag to reposition artwork on walls
   - Pinch to resize
   - Distance simulation (3ft, 6ft, 10ft views)
   - Actual dimension display

6. **AI Chat Assistant**
   - Claude-powered conversational art search
   - Natural language queries (e.g., "Find me abstract art under $2000")
   - Inline artwork results with images and pricing
   - Suggested query prompts

7. **Collection Management**
   - Save and organize liked artworks
   - Collection statistics and total value calculation
   - Style breakdown analysis
   - Grid view of saved pieces

8. **Gallery Discovery**
   - Map view with gallery location pins
   - List view with gallery details
   - Personalized gallery recommendations based on liked artworks
   - Gallery profiles with available artworks
   - Operating hours and contact information
   - Directions integration

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React Native | Cross-platform mobile framework |
| Expo | Development and build toolchain |
| React Navigation | Navigation (Stack + Bottom Tabs) |
| React Native Reanimated | Smooth animations |
| React Native Gesture Handler | Touch gesture handling |
| Expo Camera | AR preview functionality |
| React Native Maps | Gallery map integration |
| Zustand | State management |
| Axios | HTTP client |
| TypeScript | Type safety |

### Backend

| Technology | Purpose |
|------------|---------|
| FastAPI | Python web framework |
| Uvicorn | ASGI server |
| Supabase | PostgreSQL database and authentication |
| Anthropic Claude API | AI chat and recommendations |
| Scikit-learn | Recommendation engine algorithms |
| NumPy | Numerical computations |
| Pydantic | Data validation |

### Database

Due to a lack of comprehensive dataset about physical arts in Singapore, we decide to resort to mock data for the artworks. These data can easily be replaced by real data after successful collaborations with physical art spaces accross Singapore.

- PostgreSQL via Supabase
- 12 Singapore galleries with real locations
- 55+ artworks across 10 art styles
- User preferences and swipe tracking
- Collection management tables

## Project Structure

```
pinus-hack/
├── backend/                    # FastAPI backend server
│   ├── routers/               # API route handlers
│   │   ├── artworks.py        # Artwork CRUD and swipe endpoints
│   │   ├── chat.py            # AI chat endpoints
│   │   ├── galleries.py       # Gallery endpoints
│   │   ├── recommendations.py # Recommendation endpoints
│   │   └── users.py           # User management endpoints
│   ├── services/              # Business logic layer
│   │   ├── claude_client.py   # Claude AI integration
│   │   ├── recommendation_engine.py # ML recommendation logic
│   │   └── supabase_client.py # Database client
│   ├── models/                # Pydantic schemas
│   ├── main.py                # FastAPI application entry
│   ├── requirements.txt       # Python dependencies
│   └── run.sh                 # Backend startup script
├── src/                       # React Native application
│   ├── screens/               # Screen components
│   │   ├── SwipeScreen.tsx    # Main discovery interface
│   │   ├── OnboardingScreen.tsx # User onboarding flow
│   │   ├── ArtworkDetailScreen.tsx # Artwork details
│   │   ├── ARPreviewScreen.tsx # AR visualization
│   │   ├── ChatScreen.tsx     # AI chat interface
│   │   ├── CollectionScreen.tsx # User collections
│   │   ├── GalleryScreen.tsx  # Gallery list and map
│   │   └── GalleryProfileScreen.tsx # Individual gallery
│   ├── components/            # Reusable UI components
│   │   └── animations/        # Animation components
│   ├── services/              # API client services
│   │   └── api.ts             # Backend API integration
│   ├── hooks/                 # Custom React hooks
│   ├── store/                 # Zustand state stores
│   │   └── userStore.ts       # User state management
│   ├── types/                 # TypeScript type definitions
│   ├── constants/             # Design system constants
│   │   └── styles.ts          # Colors, typography, spacing
│   └── utils/                 # Helper functions
├── assets/                    # Static assets (images, fonts)
├── App.tsx                    # Root application component
├── app.json                   # Expo configuration
├── package.json               # Node.js dependencies
├── tsconfig.json              # TypeScript configuration
├── babel.config.js            # Babel configuration
└── seed_artworks.sql          # Database seed data
```

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18.0 or higher
- npm 9.0 or higher
- Python 3.9 or higher
- pip (Python package manager)
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your mobile device (iOS App Store or Google Play Store)
- Git

You will also need accounts for:

- Supabase (https://supabase.com) - for database
- Anthropic (https://console.anthropic.com) - for Claude API access

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/justin-theodorus/artmatch
cd pinus-hack
```

### 2. Frontend Environment Variables

Create a `.env` file in the project root:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API URL (use your computer's local IP address)
EXPO_PUBLIC_API_URL=http://192.168.x.x:8000
```

To find your local IP address:
- macOS/Linux: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Windows: `ipconfig`

### 3. Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your_supabase_secret_key

# Claude API Configuration
CLAUDE_API_KEY=your_anthropic_api_key
```

Note: Use the service role / secret key (not the anon key) for the backend to bypass Row Level Security.

### 4. Database Setup

The database schema includes the following tables:

- `users` - User profiles and preferences
- `artworks` - Artwork catalog
- `galleries` - Gallery information
- `swipes` - User swipe history
- `collections` - User collections
- `collection_items` - Items in collections

Run the seed script to populate initial data:

```bash
# In Supabase SQL Editor, run:
# Contents of seed_artworks.sql
```

## Running the Application

### Starting the Backend Server

Option 1: Using the startup script (recommended)

```bash
cd backend
chmod +x run.sh
./run.sh
```

Option 2: Manual startup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`. You can access the interactive API documentation at `http://localhost:8000/docs`.

### Starting the Frontend Application

```bash
# From the project root directory

# Install dependencies
npm install

# Start the Expo development server
npm start
```

This will display a QR code in your terminal. Scan it with:
- iOS: Camera app or Expo Go app
- Android: Expo Go app

### Development Workflow

1. Start the backend server first
2. Start the frontend Expo server
3. Ensure your mobile device is on the same network as your development machine
4. Scan the QR code to open the app

## Application Screens

### Onboarding Screen

The entry point for new users featuring:
- Three-step style quiz with artwork image pairs
- Budget range selection ($1,000 to $10,000+)
- Progress indicator
- Creates user profile upon completion

### Swipe Screen (Discover)

The main discovery interface featuring:
- Card stack with three visible cards
- Smooth swipe gestures with rotation effects
- Like/Pass buttons for tap-based interaction
- AI-generated explanation badges
- Artwork title, artist, price, and tags overlay

### Artwork Detail Screen

Comprehensive artwork view including:
- Full-size artwork image
- Title, artist, and year
- Price with availability status
- Medium, style, and dimensions
- Gallery information
- "View in AR" button
- "Contact Gallery" button

### AR Preview Screen

Augmented reality visualization:
- Live camera feed
- Artwork overlay with frame
- Drag gesture for repositioning
- Distance selector (3ft, 6ft, 10ft)
- Actual dimension display
- Reset position button

### AI Chat Screen

Conversational art discovery:
- Chat interface with message bubbles
- Typing indicator animation
- Suggested query chips
- Inline artwork cards in responses
- Send button with input field

### Gallery Screen

Gallery discovery with two view modes:

List View:
- Recommended galleries based on preferences
- All galleries with verification badges
- Address and operating hours
- "Directions" quick action

Map View:
- Interactive map with gallery pins
- Tap markers for gallery info
- Zoom and location controls

### Collection Screen

Personal art collection management:
- Statistics row (artwork count, total value, styles)
- Favorite styles tags
- Grid of liked artworks with prices
- Tap to view details

## API Documentation

### Base URL

```
http://localhost:8000/api
```

### Endpoints

#### Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/recommendations/` | Get personalized artwork recommendations |
| GET | `/recommendations/popular` | Get popular artworks |

#### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/` | Create a new user |
| GET | `/users/{user_id}` | Get user profile |
| PUT | `/users/{user_id}/preferences` | Update user preferences |

#### Artworks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/artworks/` | List artworks with optional filters |
| GET | `/artworks/{artwork_id}` | Get artwork details |
| POST | `/artworks/swipe` | Record a swipe action |
| GET | `/artworks/user/{user_id}/likes` | Get user's liked artworks |

#### Galleries

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/galleries/` | List all galleries |
| GET | `/galleries/{gallery_id}` | Get gallery details |
| GET | `/galleries/{gallery_id}/artworks` | Get artworks from a gallery |
| GET | `/galleries/recommended/{user_id}` | Get recommended galleries for user |

#### Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat/` | Send message to AI assistant |

### Example Requests

Get recommendations:
```bash
curl -X POST "http://localhost:8000/api/recommendations/" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user-uuid", "limit": 10}'
```

Record a swipe:
```bash
curl -X POST "http://localhost:8000/api/artworks/swipe" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user-uuid", "artwork_id": "artwork-uuid", "action": "like"}'
```

Chat with AI:
```bash
curl -X POST "http://localhost:8000/api/chat/" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user-uuid", "message": "Find me abstract art under $2000"}'
```

## Database Schema

### Users Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR | User email (optional) |
| preferred_styles | TEXT[] | Array of preferred art styles |
| budget_min | INTEGER | Minimum budget |
| budget_max | INTEGER | Maximum budget |
| onboarding_completed | BOOLEAN | Onboarding status |
| created_at | TIMESTAMP | Creation timestamp |

### Artworks Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | VARCHAR | Artwork title |
| artist | VARCHAR | Artist name |
| year_created | INTEGER | Year of creation |
| medium | VARCHAR | Art medium |
| style | VARCHAR | Art style category |
| dimensions | JSONB | Width, height, depth |
| price | DECIMAL | Price in USD |
| image_url | VARCHAR | Image URL |
| description | TEXT | Artwork description |
| gallery_id | UUID | Foreign key to galleries |
| availability_status | VARCHAR | available, sold, reserved |

### Galleries Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR | Gallery name |
| address | VARCHAR | Street address |
| city | VARCHAR | City |
| country | VARCHAR | Country |
| latitude | DECIMAL | GPS latitude |
| longitude | DECIMAL | GPS longitude |
| phone | VARCHAR | Contact phone |
| email | VARCHAR | Contact email |
| website | VARCHAR | Website URL |
| operating_hours | JSONB | Hours by day |
| verified | BOOLEAN | Verification status |

### Swipes Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| artwork_id | UUID | Foreign key to artworks |
| action | VARCHAR | like or pass |
| created_at | TIMESTAMP | Swipe timestamp |

## Troubleshooting

### Common Fixes

```bash
# Reset Expo cache
expo start -c

# Reinstall dependencies
rm -rf node_modules
npm install

# Reset backend virtual environment
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Webhook Alerts for Gallery Price Drops

You can trigger a webhook alert for price drops in a gallery by calling:

```
POST /api/galleries/{gallery_id}/price-drop-alert?threshold=YOUR_PRICE&webhook_url=YOUR_WEBHOOK_URL
```
- `threshold`: Price threshold (required, integer)
- `webhook_url`: Optional override for the webhook destination

If any artwork in the gallery is at or below the threshold, a webhook POST will be sent with details of the artworks.

## Future Enhancements

- Secondary marketplace for user-to-user artwork sales
- Provenance verification via blockchain integration
- Social features (follow collectors, share collections)
- Investment insights and price predictions
- Multi-image room context for AR placement
- Push notifications for new artworks matching preferences
- Advanced filters (artist, year, provenance, gallery)
- Collection sharing and collaborative curation
- Artwork authentication and certification
- Integration with payment processors

## License

MIT License - Built for Pinus Hackathon 2026 (Team sawit)

## Credits

- Built with React Native, FastAPI, Supabase, and Claude AI
- Artwork images sourced from Unsplash
- Gallery data based on real Singapore gallery locations
