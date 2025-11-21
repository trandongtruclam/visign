#!/bin/bash

# Script to start the FastAPI model server

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODEL_DIR="$SCRIPT_DIR/../../../yen-model"

cd "$MODEL_DIR"

echo "Starting Vietnamese Sign Language Model Server..."
echo ""

# Activate virtual environment if exists
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
    echo "Virtual environment activated"
else
    echo "Warning: No virtual environment found at venv/"
    echo "Please create one: python -m venv venv"
    echo "Then install requirements: pip install -r requirements.txt"
    exit 1
fi

# Check if model file exists
if [ ! -f "artifacts/lstm_150.pt" ]; then
    echo "Error: Model file not found at artifacts/lstm_150.pt"
    exit 1
fi

echo ""
echo "========================================"
echo "Model Server Starting on http://localhost:8000"
echo "========================================"
echo ""

# Start FastAPI server
python app.py
