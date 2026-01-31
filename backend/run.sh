#!/bin/bash

echo "Starting ArtMatch Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Warning: .env file not found. Please create one from .env.example"
    exit 1
fi

# Start the server
echo "Starting FastAPI server on port 8000..."
uvicorn main:app --reload --host 0.0.0.0 --port 8000
