# AI Career Copilot

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.2.8-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-7.8.0-emerald)](https://www.prisma.io/)
[![Clerk](https://img.shields.io/badge/Authentication-Clerk-purple)](https://clerk.com/)
[![Gemini](https://img.shields.io/badge/AI-Google_Gemini-orange)](https://deepmind.google/technologies/gemini/)

**AI Career Copilot** is a production-grade SaaS application designed to streamline the modern job application lifecycle. It empowers candidates to optimize their resumes for ATS screening, analyze alignment with job descriptions, and conduct interactive, AI-powered mock interviews with real-time feedback.

**Live Demo:** [https://ai-career-copilot-ehmy.vercel.app](https://ai-career-copilot-ehmy.vercel.app)

---

## 🚀 Live Demo

Check out the live application here: **[https://ai-career-copilot-ehmy.vercel.app](https://ai-career-copilot-ehmy.vercel.app)**

---

## 🎨 Preview & Screenshots

Here is a look at the AI Career Copilot interface:

| Dashboard View | AI Resume Analysis |
| :---: | :---: |
| ![Dashboard](screenshots/dashboard.png) | ![Resume Analysis](screenshots/resume-analysis.png) |

| ATS Score & Metrics | Job Alignment Match |
| :---: | :---: |
| ![ATS Score](screenshots/ats-score.png) | ![Job Match](screenshots/job-match.png) |

| Interactive Interview Coach | Interview History |
| :---: | :---: |
| ![Interview Coach](screenshots/interview-coach.png) | ![Interview History](screenshots/interview-history.png) |

| Profile Preferences |
| :---: |
| ![Profile](screenshots/profile.png) |

---

## ✨ Features

### 🔐 Authentication & Onboarding
*   **Clerk Identity Provider**: Secured sign-in/sign-up through OAuth providers (Google, GitHub) or standard email verification.
*   **Route Guards**: Next.js Middleware protects internal dashboard sections from unauthenticated users.
*   **Interactive Onboarding**: Personalized onboarding process to establish user career targets and backgrounds.

### 📄 Resume Optimization
*   **Secure Uploads**: Utilizes **UploadThing** for hosting and retrieving PDF/DOCX resumes (up to 10MB).
*   **Local Text Parsing**: Extracts text locally using `pdf-parse` (for PDF) and `mammoth` (for Word documents).
*   **ATS Score Evaluation**: Computes estimated ATS matching ratings based on structure and formatting rules.
*   **Aesthetic Health Score**: AI-graded criteria for section completeness, formatting, and grammar.
*   **Actionable Suggestions**: Specific suggestions to resolve typos, format issues, and weak wording.

### 🎯 Job Description Alignment
*   **Skill Gap Analysis**: Pastes a job description and compares it against the user's primary resume to discover missing keywords.
*   **Match Scoring**: Calculates overall alignment percentage using semantic overlap checks.
*   **AI Recommendations**: Offers precise guidance on bullet-point tailoring to address missing criteria.

### 💬 Interactive Interview Coach
*   **Custom Simulation Hub**: Generates session question sets from the user's resume, specific role, and selected difficulty.
*   **Live Interactive Prep**: Candidates type answers in a mock interview dialog environment.
*   **Detailed Evaluations**: Generates question-by-question scoring, strong points, weaknesses, and model "Ideal Answers".
*   **History Logs**: Review and revisit previous session summaries and transcripts.

### 📊 Dashboard & UI/UX
*   **Centralized Analytics**: Displays overview charts, recent match logs, and pending tasks.
*   **System Settings**: Fully supports Dark and Light mode preferences with `next-themes`.

---

## 🛠️ Tech Stack

*   **Frontend**: Next.js 15 (App Router), React 18, Tailwind CSS, Framer Motion
*   **Backend**: Next.js Route Handlers (stateless serverless APIs)
*   **Database**: serverless PostgreSQL on Neon DB
*   **ORM**: Prisma ORM
*   **Authentication**: Clerk Identity SDK
*   **File Storage**: UploadThing
*   **AI Pipeline**: Google Gemini 1.5 API (via Google Gen AI SDK)
*   **Deployment**: Vercel

---

## 📐 Architecture Overview

AI Career Copilot utilizes a serverless architecture optimized for high performance and low maintenance costs:
*   **Client**: Responsive Next.js App Router UI that queries backend API endpoints.
*   **Server**: Next.js API Route Handlers running on Vercel Serverless Functions.
*   **Database**: PostgreSQL hosted on Neon DB, queried via Prisma Client.
*   **AI Pipeline**: Stateless text extraction from documents forwarded to Gemini API with structured JSON system prompts.
*   **Auth Flow**: Authentication checked via JWTs in middleware, with profiles synced to PostgreSQL through Clerk Webhooks.

> 📝 For a deep dive into schemas, diagrams, and folder layouts, refer to the **[System Architecture Guide](docs/ARCHITECTURE.md)**.

---

## 📁 Repository Structure

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

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/piyushgarg6702-cyber/ai-career-copilot.git
cd ai-career-copilot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment File
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

### 4. Database Setup & Sync
```bash
npx prisma db push
npx prisma generate
```

### 5. Launch the Local Dev Server
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

> 💡 For comprehensive setup configurations, refer to the **[Setup Guide](docs/SETUP.md)**.

---

## 📦 Deployment

This project is configured for deployment on **Vercel** with a simple setup:
1. Connect your repository to Vercel.
2. In **Environment Variables**, paste all the keys configured in your `.env`.
3. Set the build command to `npm run build` (auto-detected).
4. Click **Deploy**.

For webhook user sync setups, see the **[Clerk Webhook Configuration Section in SETUP.md](docs/SETUP.md#clerk-webhook-setup-required-for-syncing-users)**.

---

## 🔮 Future Roadmap

*   🎙️ **Voice Interviews**: Fully conversational practice using audio transcripts and speech-to-text API models.
*   📊 **Detailed Analytics**: Trend graphs detailing ATS improvements and score performance charts over time.
*   📂 **Resume Comparison**: Multi-resume side-by-side keyword overlap comparisons.
*   💾 **PDF Export**: Generate tailored resumes direct to print-ready PDF formats from recommendations.
*   🎥 **Interview Video Playback**: Review candidate posture, expressions, and timing using camera mockups.

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork this repository.
2. Create your feature branch (`git checkout -b feature/NewFeature`).
3. Commit your changes (`git commit -m 'Add NewFeature'`).
4. Push to the branch (`git push origin feature/NewFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more details.
