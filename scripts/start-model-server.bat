@echo off
REM Script to start the FastAPI model server

cd /d "%~dp0\..\..\..\yen-model"

echo Starting Vietnamese Sign Language Model Server...
echo.

REM Activate virtual environment if exists
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
    echo Virtual environment activated
) else (
    echo Warning: No virtual environment found at venv\
    echo Please create one: python -m venv venv
    echo Then install requirements: pip install -r requirements.txt
    pause
    exit /b 1
)

REM Check if model file exists
if not exist "artifacts\lstm_150.pt" (
    echo Error: Model file not found at artifacts\lstm_150.pt
    pause
    exit /b 1
)

echo.
echo ========================================
echo Model Server Starting on http://localhost:8000
echo ========================================
echo.

REM Start FastAPI server
python app.py

pause
