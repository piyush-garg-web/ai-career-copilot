# AI Career Copilot - Walkthrough

## Overview
AI Career Copilot is a production-grade SaaS application designed to streamline the modern job application lifecycle. It empowers candidates to optimize their resumes for ATS screening, analyze alignment with job descriptions, and conduct interactive, AI-powered mock interviews with real-time feedback.

## Quick Start

### 1. Installation
```bash
git clone https://github.com/piyushgarg6702-cyber/ai-career-copilot.git
cd ai-career-copilot
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Fill in the required configuration variables:
```env
DATABASE_URL="your-neon-postgres-connection-string"
DIRECT_URL="your-neon-postgres-direct-connection-string"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
CLERK_SECRET_KEY="your-clerk-secret-key"
GEMINI_API_KEY="your-gemini-api-key"
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"
```

### 3. Database Setup
```bash
npx prisma db push
npx prisma generate
```

### 4. Run Development Server
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000)

---

## Features

### 🔐 Authentication & Onboarding
- **Clerk Identity Provider**: Secured sign-in/sign-up through OAuth providers (Google, GitHub) or standard email verification
- **Route Guards**: Next.js Middleware protects internal dashboard sections from unauthenticated users
- **Interactive Onboarding**: Personalized onboarding process to establish user career targets and backgrounds

### 📄 Resume Optimization
- **Secure Uploads**: Utilizes UploadThing for hosting and retrieving PDF/DOCX resumes (up to 10MB)
- **Local Text Parsing**: Extracts text locally using pdf-parse (for PDF) and mammoth (for Word documents)
- **ATS Score Evaluation**: Computes estimated ATS matching ratings based on structure and formatting rules
- **Aesthetic Health Score**: AI-graded criteria for section completeness, formatting, and grammar
- **Actionable Suggestions**: Specific suggestions to resolve typos, format issues, and weak wording

### 🎯 Job Description Alignment
- **Skill Gap Analysis**: Pastes a job description and compares it against the user's primary resume to discover missing keywords
- **Match Scoring**: Calculates overall alignment percentage using semantic overlap checks
- **AI Recommendations**: Offers precise guidance on bullet-point tailoring to address missing criteria

### 💬 Interactive Interview Coach
- **Custom Simulation Hub**: Generates session question sets from the user's resume, specific role, and selected difficulty
- **Live Interactive Prep**: Candidates type answers in a mock interview dialog environment
- **Detailed Evaluations**: Generates question-by-question scoring, strong points, weaknesses, and model "Ideal Answers"
- **History Logs**: Review and revisit previous session summaries and transcripts

### 🎤 AI Voice + Video Mock Interview (Premium)
- **Conversational Voice Practice**: Real-time speech recognition and natural AI voice responses
- **Video Mode Support**: Optional camera feed with posture and eye contact analytics
- **Detailed Communication Analytics**: Fluency, pauses, pacing, grammar, and video posture scoring
- **Personalized Feedback**: Customized roadmaps for improvement
- **Multilingual Support**: Practice in multiple languages (English, Hindi, Spanish, Japanese, German, etc.)

### 📊 Dashboard & UI/UX
- **Centralized Analytics**: Displays overview charts, recent match logs, and pending tasks
- **System Settings**: Fully supports Dark and Light mode preferences with next-themes
- **Premium Badge**: Consistent gradient badge with crown icon across all premium features
- **Go Back Button**: Unified navigation button for nested/detail pages
- **Responsive Design**: Mobile-first approach with proper breakpoints for tablet and desktop
- **Smooth Animations**: Framer Motion powered animations with hardware-accelerated transforms

---

## UI/UX Refinements (July 5, 2026)

### Premium Badge Alignment Fixes
- **Dashboard Welcome Section**: Fixed vertical alignment of Premium badge with welcome heading
- **AI Mock Interview History Card**: Fixed vertical alignment of Premium badge with card heading
- **Implementation**: Added `className="mt-0.5"` to Premium badges for perfect alignment

### AI Mock Interview Page Cleanup
- **Screenshot Preview Removal**: Removed unnecessary mockup preview image section
- **Result**: Cleaner layout restored to previous design
- **File Modified**: `src/components/voice-interview/voice-interview-client.jsx`

### Landing Page Hero Animation Enhancements
- **Left Section**: Enhanced with smooth fade-in, slide from left (-40px), soft upward movement (20px), staggered animations for heading/description/button, breathing animations
- **Right Section**: Improved floating animation (6-7px offset, 5-7s duration), staggered appearance with container variants, fade-in with scale animation, hardware-accelerated transforms, rotation effects
- **Button Hover**: Added slight scale (1.05), soft shadow enhancement, smooth transition (300ms), animated glow
- **Card Hover**: Added soft scale (1.03-1.04) with smooth transition (200ms), hardware-accelerated transforms, enhanced shadow
- **Animated Background**: Added slow-moving gradient blobs for premium feel
- **File Modified**: `src/components/landing/Hero.jsx`

### Landing Page Navbar Animation Enhancements
- **Logo**: Added spin animation for sparkles icon, hover scale and rotation effects
- **Links**: Added smooth hover underline effects from indigo to purple gradient
- **Buttons**: Added hover scale and translate effects
- **Mobile Menu**: Animate height transitions
- **File Modified**: `src/components/landing/Navbar.jsx`

### Landing Page Stats Section Enhancements
- Added enhanced floating animations for stats cards
- Improved whileHover effects (scale, y offset)
- Added enhanced background blobs
- File Modified: `src/components/landing/Stats.jsx`

### Landing Page Features Section Enhancements
- Added enhanced floating animations for feature cards
- Animated icons with rotation and pulse
- Improved whileHover effects
- Enhanced background
- File Modified: `src/components/landing/Features.jsx`

### Landing Page How It Works Section Enhancements
- Animated timeline badge pulse
- Enhanced floating cards
- Animated icons
- Enhanced background blobs
- File Modified: `src/components/landing/HowItWorks.jsx`

### Landing Page Comparison Table Enhancements
- Enhanced floating rows
- Animated icons (Check, X, Sparkles)
- Improved hover effects
- Enhanced background blobs
- File Modified: `src/components/landing/ComparisonTable.jsx`

### VoiceVideo Image
- The image at `public/ss/voiceVideo.png` is used on the landing page in Product Preview component

### Dashboard Voice/Video Button Merge
- **Change**: Merged separate "Voice Interview" and "Video Interview" buttons into single "AI Voice + Video Interview" button
- **Reason**: Consistency with unified AI Mock Interview page design
- **File Modified**: `src/components/dashboard/dashboard-client-view.jsx`

---

## Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 18, Tailwind CSS, Framer Motion
- **Backend**: Next.js Route Handlers (stateless serverless APIs)
- **Database**: PostgreSQL hosted on Neon DB
- **ORM**: Prisma ORM
- **Authentication**: Clerk Identity SDK
- **File Storage**: UploadThing
- **AI Pipeline**: Google Gemini 1.5 API (via Google Gen AI SDK)
- **Deployment**: Vercel

### Repository Structure
```
ai-career-copilot/
├── docs/                         # Extended System Documentation
│   ├── ARCHITECTURE.md           # System components & data flows
│   ├── SETUP.md                  # Detailed environment & installation guide
│   ├── FEATURES.md               # Detailed features walkthrough
│   ├── DATABASE.md               # DB models & relational schemas
│   └── API.md                    # Backend API endpoint reference
├── prisma/                       # Database migrations & schemas
├── public/                       # Assets & favicons
├── screenshots/                  # Repository visualization images
└── src/
    ├── app/                      # Next.js App Router (Views & API Handlers)
    ├── components/               # React UI & Layout components
    └── lib/                      # Shared utility libraries & AI pipeline
```

---

## Key Components

### Shared Components
- **PremiumBadge**: Unified gradient badge with crown icon for premium features
- **GoBackButton**: Unified navigation button for nested/detail pages
- **PremiumRequiredModal**: Modal shown when non-premium users access premium features

### Landing Page Components
- **Hero**: Main hero section with animated feature cards
- **Features**: Floating feature cards with smooth animations
- **ComparisonTable**: Feature comparison table with premium indicators
- **Navbar**: Navigation bar with premium badge integration

### Dashboard Components
- **DashboardClientView**: Main dashboard with analytics and quick actions
- **Analytics Cards**: Resume Score, ATS Score, Job Match %, Interview Score
- **Activity Feed**: Recent activities across all features
- **Quick Actions**: Fast access to main features

### Voice Interview Components
- **VoiceInterviewClient**: Main client component managing all views
- **VoiceInterviewSetup**: Configuration for voice/video interview sessions
- **VoiceInterviewFlow**: Active interview session with real-time feedback
- **VoiceInterviewReport**: Detailed report with analytics and scores
- **VoiceInterviewHistory**: Historical sessions list
- **VoiceInterviewSettings**: User preferences for voice/video settings

---

## Deployment

### Vercel Deployment
1. Connect your repository to Vercel
2. In Environment Variables, paste all the keys configured in your `.env`
3. Set the build command to `npm run build` (auto-detected)
4. Click Deploy

### Clerk Webhook Setup
For user sync functionality, configure Clerk webhooks:
1. Go to Clerk Dashboard → Webhooks
2. Add webhook endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Select events: `user.created`, `user.updated`
4. Copy webhook secret to `.env` as `CLERK_WEBHOOK_SECRET`

---

## Future Roadmap

- 🎙️ **Voice Interviews**: Fully conversational practice using audio transcripts and speech-to-text API models
- 📊 **Detailed Analytics**: Trend graphs detailing ATS improvements and score performance charts over time
- 📂 **Resume Comparison**: Multi-resume side-by-side keyword overlap comparisons
- 💾 **PDF Export**: Generate tailored resumes direct to print-ready PDF formats from recommendations
- 🎥 **Interview Video Playback**: Review candidate posture, expressions, and timing using camera mockups

---

## Support

For issues, questions, or contributions:
- GitHub Issues: [https://github.com/piyushgarg6702-cyber/ai-career-copilot/issues](https://github.com/piyushgarg6702-cyber/ai-career-copilot/issues)
- Email: support@careercopilot.com

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more details.
