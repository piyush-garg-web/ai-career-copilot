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
- **Professional Permission Flow**: Pre-interview permission dialog for microphone and camera access
- **Smart Question Management**: Never repeats skipped or answered questions
- **Silence Detection**: Configurable 5-second silence timeout with polite question repeat
- **Dynamic Question Rendering**: Typewriter effect synchronized with AI speech
- **Stable Video Preview**: Reliable camera initialization with proper aspect ratio
- **Comprehensive Cleanup**: Automatic media resource cleanup on completion/exit
- **Edge Case Handling**: Graceful handling of disconnections, refresh, and network errors

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
- **Left Section**: Enhanced with smooth fade-in, slide from left (-40px), soft upward movement (20px), staggered animations, and continuous swirling/floating animation (increased x/y offsets, rotation, and scale for more visibility)
- **Right Section**: Enhanced floating cards with unique animation durations for organic feel, each card has continuous swirling/floating movement (increased x/y offsets, rotation, and scale for more visibility)
- **Button Hover**: Added slight scale (1.05), soft shadow enhancement, smooth transition (300ms), animated glow
- **Card Hover**: Added soft scale (1.06) with smooth transition, enhanced shadow, y offset lift
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

### VoiceVideo Image Update
- Copied voiceVideoAI.png from root screenshots folder to public/screenshots
- Updated Product Preview component to use `public/screenshots/voiceVideoAI.png`

### Dashboard Welcome Section Adjustment
- Adjusted Premium Badge margin top to mt-2 for perfect vertical alignment with welcome text

### Dashboard Button Adjustments
- Adjusted button container to use items-start (removed margin top) for perfect vertical alignment with text
- Increased button size to lg with larger icon for better visual balance

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
- **PermissionDialog**: Professional pre-interview permission request dialog
- **useVoiceSession**: Custom hook managing voice session logic, silence detection, and media cleanup

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

---

## AI Mock Interview Improvements (July 6, 2026)

### Pre-Interview Permission Flow
- **Professional Permission Dialog**: Added dedicated permission dialog component before interview starts
- **Voice Interview**: Requests microphone permission with clear messaging
- **Video Interview**: Requests both camera and microphone permissions
- **Error Handling**: Graceful error messages for permission denial, device not found, and other errors
- **Retry Support**: Users can retry permission request after denial
- **Never Bypass**: Interview cannot start without required permissions
- **File**: `src/components/voice-interview/permission-dialog.jsx`

### Smart Question Management
- **Skip Tracking**: Skipped questions are tracked and never asked again in current interview
- **Answer Tracking**: Answered questions are tracked and never repeated
- **State Persistence**: Skip and answer states maintained throughout session
- **Professional Behavior**: Mimics real interviewer behavior - no duplicate questions
- **File**: `src/hooks/voice/useVoiceSession.js`

### Silence Detection with Configurable Timeout
- **Configurable Constant**: `SILENCE_TIMEOUT_MS = 5000` (5 seconds)
- **First Silence**: AI politely repeats question once: "I didn't hear your response. Could you please answer the question?"
- **Second Silence**: Auto-submits "No Response" and moves to next question
- **Reset on Speech**: Silence counter resets when user starts speaking
- **Per-Question Reset**: Silence tracking resets for each new question
- **File**: `src/hooks/voice/useVoiceSession.js`

### Dynamic Question Rendering
- **Typewriter Effect**: Question appears progressively while AI speaks
- **Speech Synchronization**: Typing starts when TTS speech begins
- **Smooth Animation**: 50ms per character for natural typewriter effect
- **Full Text Display**: Complete question shown after speech completes
- **Real-time Transcript Update**: Transcript updates in real-time as question types
- **File**: `src/hooks/voice/useVoiceSession.js`

### Video Interview Camera Fixes
- **Stable Initialization**: Proper camera stream initialization with metadata loading
- **Resolution Support**: 480p, 720p, and 1080p resolution options
- **Aspect Ratio**: Correct aspect ratio maintained for all resolutions
- **Error Handling**: Comprehensive error messages for various camera errors
  - Permission denied
  - Camera not found
  - Camera in use by another app
  - Resolution not supported
  - Browser not supported
 - **Live Preview**: Camera preview visible throughout interview
 - **Mirror Support**: Proper horizontal mirroring with CSS transform
 - **Track Monitoring**: Detects camera disconnection during interview
 - **File**: `src/components/voice-interview/voice-interview-flow.jsx`

### Comprehensive Media Cleanup
- **Interview Completion**: All media resources stopped immediately on completion
  - Microphone recording stopped
  - Webcam stopped
  - MediaStreams released
  - Browser permissions released
  - Event listeners removed
  - Timers and intervals cleared
  - Interview state reset
  - Memory freed
 - **Exit/Cancel**: Same comprehensive cleanup on interview exit
 - **Browser Refresh**: Cleanup triggered on beforeunload event
 - **Visibility Change**: Auto-pause when tab hidden
 - **File**: `src/hooks/voice/useVoiceSession.js`, `src/components/voice-interview/voice-interview-flow.jsx`

### Edge Case Handling
- **Browser Refresh**: Media cleanup on page unload
- **Visibility Change**: Auto-pause interview when tab hidden
- **Network Loss**: Auto-pause on internet disconnection
- **Network Restore**: Toast notification on connection restored
- **Camera Disconnection**: Detects and handles camera track end events
- **API Failures**: Graceful handling of API errors without breaking flow
- **Browser Compatibility**: Check for MediaDevices API support
- **File**: `src/components/voice-interview/voice-interview-flow.jsx`

### Performance Improvements
- **Low Latency**: Optimized audio processing for minimal delay
- **Stable Streaming**: Reliable media stream handling
- **Memory Leak Prevention**: Comprehensive cleanup in all scenarios
- **GPU-Friendly Animations**: Hardware-accelerated transforms only
- **Efficient Re-renders**: Optimized React state updates

### Testing Checklist
- ✅ Permission dialog appears before every interview
- ✅ Interview never starts without required permissions
- ✅ Retry works after permission denial
- ✅ Skipped questions never reappear
- ✅ Answered questions never repeat
- ✅ Wrong answers are simply evaluated
- ✅ Silence repeats question only once
- ✅ Second silence records "No Response"
- ✅ Next Question submits current response
- ✅ Skip permanently skips question
- ✅ Questions appear dynamically while AI speaks
- ✅ Voice interview works correctly
- ✅ Video interview camera works correctly
- ✅ Live preview is stable
- ✅ AI metrics continue updating
- ✅ Camera and microphone automatically stop after interview
- ✅ Browser camera indicator turns off
- ✅ No MediaStreams remain active
- ✅ No memory leaks
- ✅ Final report generates correctly
- ✅ No console errors
- ✅ No JavaScript errors

---

## Future Roadmap

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
