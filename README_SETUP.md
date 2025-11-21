# Vietnamese Sign Language Learning Platform - Setup Guide

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+ (for AI model)
- PostgreSQL database (Neon recommended)

---

## 📦 Installation

### 1. Clone and Install Dependencies

```bash
# Install Next.js dependencies
npm install

# Navigate to model directory and setup
cd ../yen-model
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:

- `DATABASE_URL` - Your Neon PostgreSQL URL
- `NEXT_PUBLIC_CLERK_*` - Clerk authentication keys
- `MODEL_SERVER_URL` - Model server URL (default: http://localhost:8000)

### 3. Database Setup

```bash
# Push schema to database
npm run db:push

# Seed with Vietnamese sign language data
npm run db:seed-signs
```

---

## 🎯 Running the Application

You need to run **TWO servers** simultaneously:

### Terminal 1: Model Server (Python FastAPI)

```bash
# Option 1: Use npm script (Windows)
npm run model:start

# Option 2: Manual start
cd ../yen-model
venv\Scripts\activate  # or source venv/bin/activate
python app.py
```

The model server will start on **http://localhost:8000**

### Terminal 2: Next.js App

```bash
npm run dev
```

The web app will start on **http://localhost:3000**

---

## 🎬 How It Works

### Lesson Structure (9 Questions per Lesson)

Each lesson contains **9 challenges** from 3 signs:

1. **Questions 1-3: VIDEO_LEARN** 📚

   - Watch and learn 3 signs
   - Video auto-plays and loops
   - Minimum 3-second watch time

2. **Questions 4-6: VIDEO_SELECT** ✅

   - Show 1 video + 3 text options
   - User picks the correct meaning
   - Like Duolingo multiple choice

3. **Questions 7-9: SIGN_DETECT** 🎥
   - User performs the sign on camera
   - Real-time detection with MediaPipe
   - AI model validates correctness
   - Confidence score displayed

### Data Structure

From your CSV (287 signs):

- **Topics** → **Units** (Câu hỏi, Chữ cái, Đồ vật, etc.)
- **Levels** (1, 2, 3) → **Lessons** within each Unit
- ~**95 lessons** total, each with 9 challenges

---

## 🤖 Model Integration

The AI model uses:

- **MediaPipe Holistic** - Extract pose, hand, and face landmarks
- **LSTM Neural Network** - Classify sign language gestures
- **274 sign classes** - Vietnamese sign language vocabulary

### Model Files Required

```
yen-model/
├── artifacts/
│   └── lstm_150.pt          # Trained model (REQUIRED)
├── label_mapping.json       # Label mappings (auto-loaded)
└── data/
    └── cleaned_data.csv     # Video dataset
```

---

## 🛠️ Troubleshooting

### Model Server Issues

**Error: "Model not loaded"**

```bash
# Check if lstm_150.pt exists
cd ../yen-model
ls artifacts/lstm_150.pt

# If missing, download or train the model
```

**Error: "Port 8000 already in use"**

```bash
# Kill the process using port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:8000 | xargs kill -9
```

### Database Issues

**Error: "No changes detected"**

- Schema is already up to date, this is normal

**Error: "Connection failed"**

- Check DATABASE_URL in .env
- Ensure Neon database is active

### Camera Issues

**Error: "Cannot access camera"**

- Allow camera permissions in browser
- Use HTTPS or localhost (required for camera access)
- Check if another app is using the camera

---

## 📊 API Endpoints

### Next.js API

- `POST /api/detect-sign` - Validate user's sign performance

### Model Server API

- `POST /api/predict` - Predict from video file
- `POST /api/predict-keypoints` - Predict from keypoints (real-time)
- `GET /api/labels` - Get all available sign labels
- `GET /api/videos` - Get video dataset

---

## 🎨 Features

- ✅ No hearts system - unlimited practice
- ✅ 9-question lesson structure
- ✅ Video-based learning
- ✅ Real-time sign detection
- ✅ Progress tracking
- ✅ Leaderboard system
- ✅ Points and XP
- ✅ Multiple topics and levels

---

## 📝 Scripts Reference

```bash
# Development
npm run dev                 # Start Next.js dev server
npm run model:start        # Start model server

# Database
npm run db:push            # Push schema changes
npm run db:studio          # Open Drizzle Studio
npm run db:seed-signs      # Seed Vietnamese sign data

# Production
npm run build              # Build for production
npm run start              # Start production server

# Code Quality
npm run lint               # Run ESLint
npm run format             # Check formatting
npm run format:fix         # Fix formatting
```

---

## 🙏 Credits

- Model: yen-model (LSTM + MediaPipe)
- Dataset: 287 Vietnamese sign language videos
- UI Framework: Next.js 14 + Tailwind CSS
- Database: Neon PostgreSQL + Drizzle ORM

---

## 📧 Support

If you encounter issues, check:

1. Both servers are running (ports 3000 and 8000)
2. Environment variables are set correctly
3. Model file exists at `yen-model/artifacts/lstm_150.pt`
4. Database is accessible

Happy Learning! 🇻🇳 ✋
