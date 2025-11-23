<a name="readme-top"></a>

# Visign

## Interactive Platform for Sign Language Learning

> **A Sudocode 2025 LLMates Team Project**

An immersive, gamified educational platform designed to make learning sign language accessible, engaging, and fun. Built with modern web technologies, Visign combines interactive lessons, AI-powered feedback, progress tracking, and competitive leaderboards to create a comprehensive learning experience.

---

## Table of Contents

- [About Sudocode 2025](#about-sudocode-2025)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Checking Out Source Code](#checking-out-source-code)
- [Development](#development)
- [Scripts](#scripts)
- [Key Features Explained](#key-features-explained)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Team](#team)
- [Support](#support)

---

## About Sudocode 2025

**Sudocode 2025** is a comprehensive program designed to nurture the next generation of software/ML/AI engineers and builders. Visign is one of the flagship projects developed by the **LLMates Team** during this program, showcasing real-world application development with modern technologies and best practices.

This project demonstrates:

- Full-stack web development expertise
- AI/ML integration in production applications
- Scalable architecture and database design
- Team collaboration and project management
- User-centric design and gamification principles

---

## Features

### **Learning System**

- **Structured Courses & Units**: Organized curriculum with progressive difficulty
- **Interactive Lessons**: Diverse challenge types including:
  - SELECT: Multiple choice questions
  - ASSIST: Guided sign recognition
  - VIDEO_LEARN: Educational videos
  - VIDEO_SELECT: Video-based challenges
  - SIGN_DETECT: Real-time sign detection using MediaPipe
- **Video Integration**: YouTube and custom video support for visual learning

### **Progress Tracking**

- **User Dashboard**: Track XP, completed lessons, and course progress
- **Lesson Analytics**: Detailed performance metrics including:
  - Accuracy per challenge type
  - Time spent on lessons
  - Retry counts and performance trends
  - First-try success rates
- **Achievement System**: Quests and milestones to motivate users

### **Gamification**

- **Points & XP System**: Earn points for completing challenges
- **Quests**: Earn badges and bonuses for reaching XP milestones (20, 50, 100, 250, 500, 1000 XP)
- **Leaderboard**: Competitive ranking system to encourage engagement
- **Shop System**: Spend points on rewards and cosmetics

### **AI-Powered Features**

- **Intelligent Feedback**: AI-generated personalized feedback on performance
- **Sign Detection**: Real-time hand gesture recognition using MediaPipe
- **Performance Analysis**: ML-based insights on learning patterns

### **User Management**

- **Clerk Authentication**: Secure OAuth-based user authentication
- **User Profiles**: Customizable avatars and preferences
- **Notification Preferences**: Reminder settings with timezone support
- **Admin Dashboard**: React Admin interface for content management

### **Admin Interface**

- **Content Management**: CRUD operations for:
  - Courses
  - Units
  - Lessons
  - Challenges
  - Challenge Options
- **Analytics Dashboard**: Track user engagement and learning metrics
- **React Admin**: Enterprise-grade admin panel

---

## Tech Stack

### Frontend

- **Framework**: [Next.js 14](https://nextjs.org/) - React-based framework
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe development
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) - Reusable component library
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) - Lightweight state manager
- **Icons**: [Lucide React](https://lucide.dev/) - Modern icon set
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/) - Toast notifications
- **Animations**: [React Confetti](https://react-confetti.netlify.app/) - Celebration effects

### Backend

- **Runtime**: Node.js with Next.js API Routes
- **Authentication**: [Clerk](https://clerk.com/) - Modern auth platform
- **Database**: [PostgreSQL](https://www.postgresql.org/) - Relational database
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) - Type-safe database ORM
- **Admin Panel**: [React Admin](https://marmelab.com/react-admin/) - Admin UI framework

### AI & ML

- **MediaPipe**: Hand and holistic pose detection
- **Computer Vision**: Real-time gesture recognition

### Development Tools

- **Build**: [ESBuild](https://esbuild.github.io/) - Fast JavaScript bundler
- **Code Quality**: [ESLint](https://eslint.org/), [Prettier](https://prettier.io/)
- **Git Hooks**: Pre-commit validation
- **Package Manager**: npm
- **Deployment**: [Vercel](https://vercel.com/) - Optimized for Next.js

---

## Project Structure

```
visign/
├── app/                          # Next.js app directory
│   ├── (auth)/                  # Auth routes (sign-in, sign-up)
│   ├── (main)/                  # Main app routes
│   │   ├── courses/             # Course selection page
│   │   ├── learn/               # Main learning interface
│   │   ├── leaderboard/         # User rankings
│   │   ├── quests/              # Quest tracking
│   │   ├── settings/            # User preferences
│   │   └── shop/                # Points shop
│   ├── (marketing)/             # Public marketing pages
│   ├── admin/                   # Admin dashboard
│   ├── api/                     # API routes
│   │   ├── challenges/          # Challenge APIs
│   │   ├── courses/             # Course APIs
│   │   ├── lessons/             # Lesson APIs
│   │   ├── units/               # Unit APIs
│   │   ├── detect-sign/         # Sign detection endpoint
│   │   ├── generate-feedback/   # AI feedback generation
│   │   └── webhooks/            # Clerk webhooks
│   ├── lesson/                  # Lesson page layout
│   └── layout.tsx               # Root layout with providers
├── components/                   # React components
│   ├── modals/                  # Dialog modals
│   ├── ui/                      # UI components (shadcn/ui)
│   └── [component files]        # Page-specific components
├── db/                          # Database configuration
│   ├── schema.ts                # Database schema (Drizzle)
│   ├── queries.ts               # Database queries
│   └── drizzle.ts               # ORM setup
├── lib/                         # Utility functions
│   ├── utils.ts                 # Common utilities
│   ├── admin.ts                 # Admin utilities
│   └── calendar-utils.ts        # Date/time utilities
├── config/                      # Configuration
│   └── index.ts                 # App config & metadata
├── store/                       # Zustand stores
│   ├── use-exit-modal.ts        # Exit modal state
│   ├── use-feedback-modal.ts    # Feedback modal state
│   └── use-practice-modal.ts    # Practice modal state
├── actions/                     # Server actions (Next.js)
│   ├── user-progress.ts         # User progress mutations
│   └── challenge-progress.ts    # Challenge progress mutations
├── public/                      # Static assets
├── scripts/                     # Database scripts
│   ├── seed-vietnamese-signs.ts # Seed Vietnamese sign language data
│   └── prod.ts                  # Production utilities
├── middleware.ts                # Clerk middleware
├── constants.ts                 # App constants
├── drizzle.config.ts            # Drizzle kit config
├── next.config.mjs              # Next.js config
├── tailwind.config.ts           # Tailwind CSS config
├── tsconfig.json                # TypeScript config
└── package.json                 # Dependencies & scripts
```

---

## Getting Started

### Prerequisites

- **Node.js**: v18+ (recommend v20 LTS)
- **npm**: v9+
- **PostgreSQL**: v12+ database
- **Clerk Account**: For authentication management
- **Vercel Account**: For deployment (optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/trandongtruclam/visign.git
   cd visign
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup Clerk Authentication**
   - Create a Clerk account at [clerk.com](https://clerk.com)
   - Create a new application
   - Copy your API keys

### Environment Variables

Create a `.env.local` file (or update `.env`) with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/visign

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_webhook_secret

# API Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI/ML Models (Optional)
OPENAI_API_KEY=your_openai_key

# MediaPipe Configuration
NEXT_PUBLIC_MEDIAPIPE_MODEL_PATH=/models/hand_landmarker.task
```

See `.env.example` for additional optional variables.

### Database Setup

1. **Create PostgreSQL database**

   ```bash
   createdb visign
   ```

2. **Generate database migrations**

   ```bash
   npm run db:push
   ```

3. **Seed initial data (Vietnamese sign language)**

   ```bash
   npm run db:prod
   ```

4. **Open Drizzle Studio** (interactive database viewer)
   ```bash
   npm run db:studio
   ```

### Checking Out Source Code

**Important Note on Branches:**

- **`main` branch**: Production-ready code for deployment on Vercel
- **`feat/ai-model` branch**: Full source code including AI/ML model implementation and sign detection system

**GitHub Repository**: [phiyenng/sudocode-visign](https://github.com/phiyenng/sudocode-visign)

To view the complete source code with the AI model components:

```bash
# Clone the repository
git clone https://github.com/phiyenng/sudocode-visign.git
cd sudocode-visign

# Switch to the AI model branch
git checkout feat/ai-model

# Pull the latest changes
git pull origin feat/ai-model
```

The `feat/ai-model` branch contains:

- MediaPipe integration and hand gesture recognition
- AI model training scripts
- Real-time sign detection implementation
- Advanced ML-based feedback generation
- Model optimization and deployment utilities

---

## Development

### Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view in your browser.

### Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Production
npm run build            # Build for production
npm start                # Start production server

# Database
npm run db:push          # Push schema changes to database
npm run db:studio        # Open Drizzle Studio (GUI database manager)
npm run db:prod          # Seed Vietnamese sign language data

# Code Quality
npm run lint             # Run ESLint
npm run format           # Check code formatting with Prettier
npm run format:fix       # Auto-fix formatting issues

# AI Model Server
npm run model:start      # Start the sign detection model server
```

### Code Quality Standards

- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier with Tailwind CSS plugin
- **Type Safety**: Strict TypeScript mode

---

## Key Features Explained

### 🎮 Challenge System

The platform supports 5 challenge types:

1. **SELECT**: Traditional multiple-choice questions

   - User selects the correct answer from options
   - Instant feedback on correctness

2. **ASSIST**: Guided assistance mode

   - Hints provided for challenging questions
   - Scaffolded learning experience

3. **VIDEO_LEARN**: Educational video content

   - Embedded videos demonstrating signs
   - Progress tracking per video

4. **VIDEO_SELECT**: Video-based multiple choice

   - Combines video content with question
   - Tests comprehension and recognition

5. **SIGN_DETECT**: Real-time gesture recognition
   - Uses MediaPipe for hand tracking
   - Recognizes learned signs
   - Immediate visual feedback

### Progress & Analytics

**Challenge Progress Tracking**:

- Completion status per challenge
- Retry count for each attempt
- Time spent on each challenge
- First-try success metrics

**Lesson Analytics**:

- Performance trends (improving/declining/consistent)
- Challenge type performance breakdown
- Time patterns and efficiency metrics
- AI-generated personalized feedback
- Accuracy comparison (first half vs second half of lesson)

### Shop System

Users earn points through:

- Completing challenges (XP rewards)
- Daily streak bonuses
- Quest completions

Points can be spent on:

- Cosmetic upgrades
- Premium features
- Exclusive content access

### Admin Dashboard

React Admin interface for managing:

- Courses, Units, Lessons creation/editing
- Challenge configuration
- User management
- Analytics viewing
- Content approval workflow

---

## Database Schema

### Core Tables

**Courses**

- id, title, imageSrc
- Relationships: Units, UserProgress

**Units**

- id, title, description, courseId, order
- Relationships: Course, Lessons

**Lessons**

- id, title, unitId, order
- Relationships: Unit, Challenges

**Challenges**

- id, lessonId, type (enum), question, order, videoUrl
- Types: SELECT, ASSIST, VIDEO_LEARN, VIDEO_SELECT, SIGN_DETECT
- Relationships: Lesson, ChallengeOptions, ChallengeProgress

**ChallengeOptions**

- id, challengeId, text, correct
- Relationships: Challenge

**ChallengeProgress**

- id, userId, challengeId, completed, retryCount, timeSpentSeconds
- Relationships: Challenge

**UserProgress**

- userId (PK), userName, userImageSrc, activeCourseId, points
- Relationships: ActiveCourse

**LessonAnalytics**

- Comprehensive performance metrics per lesson
- AI feedback, performance trends, time patterns

**NotificationPreferences**

- Reminder settings, timezone, last sent time

---

## API Endpoints

### Courses

- `GET /api/courses` - List all courses
- `POST /api/courses` - Create course (admin)
- `GET /api/courses/[id]` - Get course details
- `PUT /api/courses/[id]` - Update course (admin)
- `DELETE /api/courses/[id]` - Delete course (admin)

### Lessons & Units

- `GET /api/lessons` - List lessons
- `POST /api/lessons` - Create lesson (admin)
- `GET /api/units` - List units
- `POST /api/units` - Create unit (admin)

### Challenges

- `GET /api/challenges` - List challenges
- `POST /api/challenges` - Create challenge (admin)
- `PUT /api/challenges/[id]` - Update challenge progress

### AI Features

- `POST /api/detect-sign` - Real-time sign detection
- `POST /api/generate-feedback` - Generate AI feedback on lesson performance
- `POST /api/test-feedback` - Test feedback generation

### Webhooks

- `POST /api/webhooks` - Clerk event webhooks (user created, updated, deleted)

---

## Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy with one click

```bash
# Or deploy using Vercel CLI
npm install -g vercel
vercel
```

### Pre-deployment Checklist

- All environment variables configured
- Database migrations applied
- Clerk webhook configured
- Production database verified
- AI model endpoints ready
- Build passes without errors

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Use TypeScript for all new code
- Follow ESLint and Prettier rules
- Write clear commit messages
- Add tests for new features
- Update documentation as needed

---


## Team

### Sudocode 2025 - LLMates Team

**Project Lead & Full Stack Developer**

- **Trần Đồng Trúc Lam** ([@trandongtruclam](https://github.com/trandongtruclam))
  - Email: [trandongtruclam@gmail.com](mailto:trandongtruclam@gmail.com)
  - Role: Architecture, Backend, Database, Deployment

**Team Members**

1. **Nguyễn Phi Yến** ([@phiyenng](https://github.com/phiyenng))

   - Frontend Development, UI/UX Implementation
   - Component Architecture, State Management

2. **Lê Nguyễn Anh Khoa** ([@LeNguyenAnhKhoa](https://github.com/LeNguyenAnhKhoa))
   - AI/ML Integration, Sign Detection System
   - Model Optimization, Performance Tuning

**Mentor**

- **Vector Nguyen** ([@vectornguyen76](https://github.com/vectornguyen76))
  - Guidance, Best Practices, Code Review
  - Architecture Consultation

**Organization**: [Sudocode 2025](https://sudocode.wtmhcmc.com/)

- **Repository**: [sudocode-llmates](https://github.com/trandongtruclam/sudocode-llmates)

---

## Resources

### Project Documentation & Data

All project slides, presentations, and datasets are available in our shared Google Drive:

**[Sudocode 2025 LLMates - Resources](https://drive.google.com/drive/u/0/folders/1Qhx6PEqhFTYbGtkwnM53A5yad-WPO08u)**

This drive contains:

- **Presentation Slides** - Project overview, architecture, and demos
- **Dataset** - Vietnamese sign language data for model training
- **Demo Videos** - Application walkthrough and feature demonstrations

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built with [Next.js](https://nextjs.org/) and modern web technologies
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Authentication powered by [Clerk](https://clerk.com/)
- AI models from [OpenAI](https://openai.com/) and [MediaPipe](https://mediapipe.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

<br />
<p align="right">(<a href="#readme-top">back to top</a>)</p>
