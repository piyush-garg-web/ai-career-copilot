# AI Career Copilot — System Architecture

**Version:** 1.0  
**Last Updated:** July 1, 2026  
**Status:** Planning

---

## 1. Architecture Overview

AI Career Copilot follows a **modern full-stack serverless architecture** deployed on Vercel with a PostgreSQL database on Neon, Clerk for authentication, and Gemini for AI capabilities.

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│  Next.js 15 App Router · React · Tailwind · shadcn/ui · Motion  │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼────────────────────────────────────┐
│                      VERCEL (Edge + Serverless)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │  Middleware   │  │  API Routes  │  │  Server Components    │  │
│  │  (Clerk Auth) │  │  /api/*      │  │  + Server Actions     │  │
│  └──────────────┘  └──────┬───────┘  └───────────────────────┘  │
└───────────────────────────┼─────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
┌─────────▼──────┐  ┌───────▼───────┐  ┌──────▼───────┐
│  Clerk Auth    │  │  Neon Postgres │  │ UploadThing  │
│  (Identity)    │  │  (via Prisma)  │  │ (File Store) │
└────────────────┘  └───────────────┘  └──────────────┘
                            │
                    ┌───────▼───────┐
                    │  Gemini API   │
                    │  (Google AI)  │
                    └───────────────┘
```

---

## 2. Folder Structure

```
ai-career-copilot/
├── .env.local                    # Local environment variables (gitignored)
├── .env.example                  # Template for required env vars
├── .gitignore
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.js
├── components.json               # shadcn/ui configuration
├── jsconfig.json                 # Path aliases (@/*)
├── package.json
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.js                   # Seed data for development
├── public/
│   ├── logo.svg
│   ├── og-image.png
│   └── favicon.ico
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Auth route group (no sidebar)
│   │   │   ├── sign-in/
│   │   │   │   └── [[...sign-in]]/
│   │   │   │       └── page.js
│   │   │   └── sign-up/
│   │   │       └── [[...sign-up]]/
│   │   │           └── page.js
│   │   ├── (marketing)/          # Public pages (no auth required)
│   │   │   ├── layout.js
│   │   │   └── page.js             # Landing page
│   │   ├── (dashboard)/            # Protected app routes
│   │   │   ├── layout.js           # Dashboard shell (sidebar + header)
│   │   │   ├── dashboard/
│   │   │   │   └── page.js         # Analytics dashboard
│   │   │   ├── resume/
│   │   │   │   ├── page.js         # Resume list/upload
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.js     # Resume detail + analysis
│   │   │   │   └── upload/
│   │   │   │       └── page.js     # Upload flow
│   │   │   ├── job-match/
│   │   │   │   ├── page.js         # Job match input
│   │   │   │   └── [id]/
│   │   │   │       └── page.js     # Match results
│   │   │   ├── cover-letter/
│   │   │   │   ├── page.js         # Cover letter generator
│   │   │   │   └── [id]/
│   │   │   │       └── page.js     # View/edit cover letter
│   │   │   ├── interview/
│   │   │   │   ├── page.js         # Interview hub
│   │   │   │   ├── new/
│   │   │   │   │   └── page.js     # Configure new session
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.js     # Active/completed session
│   │   │   │   │   └── results/
│   │   │   │   │       └── page.js # Evaluation results
│   │   │   │   └── history/
│   │   │   │       └── page.js     # Interview history
│   │   │   ├── roadmap/
│   │   │   │   └── page.js         # Career roadmap
│   │   │   ├── profile/
│   │   │   │   └── page.js         # Profile management
│   │   │   └── settings/
│   │   │       └── page.js         # App settings
│   │   ├── onboarding/
│   │   │   └── page.js             # Onboarding wizard
│   │   ├── api/                    # API Route Handlers
│   │   │   ├── uploadthing/
│   │   │   │   └── route.js        # UploadThing handler
│   │   │   ├── webhooks/
│   │   │   │   └── clerk/
│   │   │   │       └── route.js    # Clerk webhook (user sync)
│   │   │   ├── resumes/
│   │   │   │   ├── route.js        # GET (list), POST (create)
│   │   │   │   └── [id]/
│   │   │   │       ├── route.js    # GET, PATCH, DELETE
│   │   │   │       ├── parse/
│   │   │   │       │   └── route.js
│   │   │   │       └── analyze/
│   │   │   │           └── route.js
│   │   │   ├── job-matches/
│   │   │   │   ├── route.js
│   │   │   │   └── [id]/
│   │   │   │       └── route.js
│   │   │   ├── cover-letters/
│   │   │   │   ├── route.js
│   │   │   │   └── [id]/
│   │   │   │       └── route.js
│   │   │   ├── interviews/
│   │   │   │   ├── route.js
│   │   │   │   └── [id]/
│   │   │   │       ├── route.js
│   │   │   │       ├── message/
│   │   │   │       │   └── route.js
│   │   │   │       └── evaluate/
│   │   │   │           └── route.js
│   │   │   ├── roadmaps/
│   │   │   │   ├── route.js
│   │   │   │   └── [id]/
│   │   │   │       └── route.js
│   │   │   ├── analytics/
│   │   │   │   └── route.js
│   │   │   ├── profile/
│   │   │   │   └── route.js
│   │   │   └── ai/
│   │   │       └── stream/
│   │   │           └── route.js    # Streaming AI responses
│   │   ├── layout.js               # Root layout
│   │   ├── loading.js              # Global loading UI
│   │   ├── error.js                # Global error boundary
│   │   └── not-found.js            # 404 page
│   ├── components/
│   │   ├── ui/                     # shadcn/ui primitives
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── dialog.jsx
│   │   │   ├── dropdown-menu.jsx
│   │   │   ├── input.jsx
│   │   │   ├── label.jsx
│   │   │   ├── progress.jsx
│   │   │   ├── select.jsx
│   │   │   ├── separator.jsx
│   │   │   ├── sheet.jsx
│   │   │   ├── skeleton.jsx
│   │   │   ├── tabs.jsx
│   │   │   ├── textarea.jsx
│   │   │   ├── toast.jsx
│   │   │   ├── badge.jsx
│   │   │   ├── avatar.jsx
│   │   │   └── tooltip.jsx
│   │   ├── layout/
│   │   │   ├── sidebar.jsx
│   │   │   ├── header.jsx
│   │   │   ├── mobile-nav.jsx
│   │   │   ├── footer.jsx
│   │   │   └── dashboard-shell.jsx
│   │   ├── auth/
│   │   │   └── user-button.jsx
│   │   ├── resume/
│   │   │   ├── upload-zone.jsx
│   │   │   ├── resume-card.jsx
│   │   │   ├── resume-preview.jsx
│   │   │   ├── ats-score-gauge.jsx
│   │   │   ├── analysis-results.jsx
│   │   │   ├── suggestion-card.jsx
│   │   │   └── score-breakdown.jsx
│   │   ├── job-match/
│   │   │   ├── jd-input.jsx
│   │   │   ├── match-score-display.jsx
│   │   │   ├── skill-comparison.jsx
│   │   │   └── gap-analysis.jsx
│   │   ├── cover-letter/
│   │   │   ├── letter-editor.jsx
│   │   │   ├── tone-selector.jsx
│   │   │   └── letter-preview.jsx
│   │   ├── interview/
│   │   │   ├── session-config.jsx
│   │   │   ├── chat-interface.jsx
│   │   │   ├── message-bubble.jsx
│   │   │   ├── evaluation-report.jsx
│   │   │   ├── score-radar.jsx
│   │   │   └── history-list.jsx
│   │   ├── roadmap/
│   │   │   ├── roadmap-timeline.jsx
│   │   │   ├── milestone-card.jsx
│   │   │   └── progress-tracker.jsx
│   │   ├── analytics/
│   │   │   ├── stat-card.jsx
│   │   │   ├── score-chart.jsx
│   │   │   ├── activity-feed.jsx
│   │   │   └── performance-overview.jsx
│   │   ├── onboarding/
│   │   │   ├── onboarding-wizard.jsx
│   │   │   ├── step-career-goal.jsx
│   │   │   ├── step-experience.jsx
│   │   │   └── step-upload.jsx
│   │   ├── profile/
│   │   │   ├── profile-form.jsx
│   │   │   └── avatar-upload.jsx
│   │   ├── settings/
│   │   │   ├── theme-toggle.jsx
│   │   │   ├── notification-settings.jsx
│   │   │   └── danger-zone.jsx
│   │   ├── marketing/
│   │   │   ├── hero-section.jsx
│   │   │   ├── features-grid.jsx
│   │   │   ├── how-it-works.jsx
│   │   │   ├── testimonials.jsx
│   │   │   └── cta-section.jsx
│   │   └── shared/
│   │       ├── loading-spinner.jsx
│   │       ├── empty-state.jsx
│   │       ├── error-state.jsx
│   │       ├── page-header.jsx
│   │       ├── confirm-dialog.jsx
│   │       └── animated-container.jsx
│   ├── lib/
│   │   ├── db.js                   # Prisma client singleton
│   │   ├── auth.js                 # Clerk auth helpers
│   │   ├── uploadthing.js          # UploadThing client + server utils
│   │   ├── gemini.js               # Gemini API client + prompts
│   │   ├── parsers/
│   │   │   ├── pdf-parser.js       # PDF text extraction
│   │   │   └── docx-parser.js      # DOCX text extraction
│   │   ├── ai/
│   │   │   ├── prompts/
│   │   │   │   ├── resume-analysis.js
│   │   │   │   ├── ats-scoring.js
│   │   │   │   ├── job-matching.js
│   │   │   │   ├── cover-letter.js
│   │   │   │   ├── interview-coach.js
│   │   │   │   ├── interview-eval.js
│   │   │   │   └── roadmap.js
│   │   │   ├── resume-analyzer.js
│   │   │   ├── job-matcher.js
│   │   │   ├── cover-letter-gen.js
│   │   │   ├── interview-engine.js
│   │   │   └── roadmap-gen.js
│   │   ├── utils/
│   │   │   ├── format.js           # Date, number formatting
│   │   │   ├── validation.js       # Input validation schemas
│   │   │   └── constants.js        # App-wide constants
│   │   └── hooks/
│   │       ├── use-resume.js
│   │       ├── use-interview.js
│   │       └── use-analytics.js
│   ├── middleware.js               # Clerk middleware (route protection)
│   └── styles/
│       └── globals.css             # Tailwind directives + CSS variables
└── docs/                           # Planning documents (this folder)
    ├── PRD.md
    ├── ARCHITECTURE.md
    ├── DATABASE.md
    ├── API.md
    ├── UI.md
    ├── TASKS.md
    └── PROJECT_CONTEXT.md
```

---

## 3. Data Flow

### 3.1 Resume Upload & Analysis Flow

```
User selects file (PDF/DOCX)
        │
        ▼
UploadThing uploads to cloud storage
        │
        ▼
POST /api/resumes { fileUrl, fileName, fileType }
        │
        ▼
Create Resume record in DB (status: "uploaded")
        │
        ▼
POST /api/resumes/[id]/parse
        │
        ├── pdf-parser.js or docx-parser.js extracts raw text
        ├── Gemini parses text → structured JSON
        └── Update Resume record (status: "parsed", parsedData)
        │
        ▼
POST /api/resumes/[id]/analyze
        │
        ├── Send parsed data to Gemini (resume-analysis prompt)
        ├── Gemini returns: ATS score, breakdown, suggestions
        └── Create ResumeAnalysis record in DB
        │
        ▼
Client renders AnalysisResults component
```

### 3.2 Job Matching Flow

```
User pastes job description + selects resume
        │
        ▼
POST /api/job-matches { resumeId, jobDescription }
        │
        ├── Fetch resume parsedData from DB
        ├── Send resume + JD to Gemini (job-matching prompt)
        ├── Gemini returns: matchScore, matchedSkills, gaps, suggestions
        └── Create JobMatch record in DB
        │
        ▼
Client renders MatchScoreDisplay + SkillComparison
```

### 3.3 Interview Coach Flow

```
User configures session (role, difficulty, types)
        │
        ▼
POST /api/interviews { config }
        │
        └── Create InterviewSession (status: "active")
        │
        ▼
POST /api/interviews/[id]/message { content }
        │
        ├── Append user message to session transcript
        ├── Send transcript + config to Gemini (interview-coach prompt)
        ├── Gemini returns next question or follow-up
        └── Append AI message to transcript, return to client
        │
        ▼ (repeat until user ends session)
        │
POST /api/interviews/[id]/evaluate
        │
        ├── Send full transcript to Gemini (interview-eval prompt)
        ├── Gemini returns: overallScore, categoryScores, feedback
        └── Update InterviewSession (status: "completed", evaluation)
        │
        ▼
Client renders EvaluationReport
```

### 3.4 Authentication Data Flow

```
User clicks Sign In
        │
        ▼
Clerk handles OAuth/email flow
        │
        ▼
Clerk webhook fires → POST /api/webhooks/clerk
        │
        ├── Verify webhook signature
        ├── On user.created → Create User record in DB
        ├── On user.updated → Update User record
        └── On user.deleted → Soft-delete User record
        │
        ▼
Clerk middleware validates session on every request
        │
        ▼
Protected routes accessible
```

---

## 4. AI Workflow

### 4.1 Gemini Integration Architecture

```
┌─────────────────────────────────────────────┐
│              lib/gemini.js                   │
│  ┌─────────────────────────────────────────┐ │
│  │  GoogleGenerativeAI client              │ │
│  │  Model: gemini-2.0-flash (default)      │ │
│  │  Fallback: gemini-1.5-pro              │ │
│  └─────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───▼───┐   ┌─────▼─────┐  ┌────▼────┐
│Resume │   │Interview  │  │Cover    │
│Analyzer│   │Engine     │  │Letter   │
│       │   │           │  │Gen      │
└───┬───┘   └─────┬─────┘  └────┬────┘
    │              │              │
    └──────────────┼──────────────┘
                   │
         ┌─────────▼─────────┐
         │  Prompt Templates  │
         │  (lib/ai/prompts/) │
         └───────────────────┘
```

### 4.2 AI Operations Map

| Operation | Model | Input | Output | Avg Tokens |
|-----------|-------|-------|--------|------------|
| Resume parsing | gemini-2.0-flash | Raw resume text | Structured JSON | ~2,000 |
| Resume analysis | gemini-2.0-flash | Parsed resume data | Score + suggestions | ~3,000 |
| ATS scoring | gemini-2.0-flash | Parsed resume data | Score breakdown | ~1,500 |
| Job matching | gemini-2.0-flash | Resume + JD | Match analysis | ~3,000 |
| Cover letter | gemini-2.0-flash | Resume + JD + tone | Cover letter text | ~2,000 |
| Interview Q&A | gemini-2.0-flash | Transcript + config | Next question | ~1,000 |
| Interview eval | gemini-2.0-flash | Full transcript | Evaluation report | ~4,000 |
| Career roadmap | gemini-2.0-flash | Profile + goals | Roadmap JSON | ~3,000 |

### 4.3 Prompt Engineering Strategy

- **System prompts** define the AI persona and output format (JSON schema)
- **Structured output** — all AI responses return validated JSON
- **Temperature settings:**
  - Analysis/scoring: `0.2` (deterministic)
  - Cover letters: `0.7` (creative)
  - Interview questions: `0.5` (balanced)
  - Interview evaluation: `0.3` (consistent)
- **Token management:** Truncate inputs exceeding model context limits
- **Retry logic:** 3 attempts with exponential backoff on API failures
- **Rate limiting:** Server-side queue to respect Gemini API limits

### 4.4 Error Handling for AI Calls

```
AI Request
    │
    ├── Success → Parse JSON → Validate schema → Return
    │
    ├── Timeout (>15s) → Retry (up to 3x) → Return cached or error
    │
    ├── Rate limit → Queue request → Retry after delay
    │
    ├── Invalid JSON → Retry with stricter prompt → Fallback error
    │
    └── API down → Return graceful error + "Try again" UI
```

---

## 5. Authentication Workflow

### 5.1 Clerk Integration

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser    │────▶│  Clerk SDK   │────▶│ Clerk Cloud  │
│  (Clerk UI)  │◀────│  (Next.js)   │◀────│   (Auth)     │
└──────────────┘     └──────┬───────┘     └──────┬───────┘
                            │                     │
                            │                     │ Webhook
                            ▼                     ▼
                     ┌──────────────┐     ┌──────────────┐
                     │  Middleware   │     │  /api/webhooks│
                     │  (protects    │     │  /clerk       │
                     │   routes)     │     │  (syncs User) │
                     └──────────────┘     └──────┬───────┘
                                                  │
                                                  ▼
                                          ┌──────────────┐
                                          │  PostgreSQL   │
                                          │  (User table) │
                                          └──────────────┘
```

### 5.2 Route Protection Strategy

| Route Pattern | Auth Required | Redirect |
|---------------|---------------|----------|
| `/` | No | — |
| `/sign-in`, `/sign-up` | No (redirect if authed) | `/dashboard` |
| `/onboarding` | Yes | — |
| `/dashboard/*` | Yes | `/sign-in` |
| `/api/*` (except webhooks) | Yes | 401 |
| `/api/webhooks/*` | No (signature verified) | — |

### 5.3 Middleware Configuration

```javascript
// src/middleware.js
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
]);

// All other routes require authentication
// Onboarding check: redirect to /onboarding if user.onboardingComplete === false
```

### 5.4 User Sync Flow

1. User signs up via Clerk
2. Clerk fires `user.created` webhook
3. Webhook handler creates `User` record with `clerkId`
4. User redirected to `/onboarding`
5. Onboarding completion sets `onboardingComplete = true`
6. Subsequent logins go directly to `/dashboard`

---

## 6. Deployment Architecture

### 6.1 Vercel Deployment

```
┌─────────────────────────────────────────────────┐
│                    VERCEL                         │
│                                                   │
│  ┌─────────────┐  ┌──────────────┐               │
│  │  Edge Network│  │  Serverless  │               │
│  │  (CDN + Edge │  │  Functions   │               │
│  │   Middleware)│  │  (API Routes)│               │
│  └─────────────┘  └──────────────┘               │
│                                                   │
│  ┌─────────────┐  ┌──────────────┐               │
│  │  Static      │  │  ISR/SSR     │               │
│  │  Assets      │  │  Pages       │               │
│  └─────────────┘  └──────────────┘               │
│                                                   │
│  Environment Variables (encrypted)                │
│  ├── DATABASE_URL                                 │
│  ├── CLERK_SECRET_KEY                             │
│  ├── GEMINI_API_KEY                               │
│  ├── UPLOADTHING_SECRET                           │
│  └── ...                                          │
└─────────────────────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
    ┌─────────┐   ┌──────────┐   ┌──────────┐
    │  Neon    │   │  Clerk   │   │ Upload   │
    │ Postgres │   │  Auth    │   │ Thing    │
    └─────────┘   └──────────┘   └──────────┘
                                       │
                                  ┌────▼─────┐
                                  │  Gemini  │
                                  │  API     │
                                  └──────────┘
```

### 6.2 Environment Strategy

| Environment | Branch | URL | Database |
|-------------|--------|-----|----------|
| Development | local | localhost:3000 | Neon dev branch |
| Preview | feature/* | *.vercel.app | Neon dev branch |
| Production | main | ai-career-copilot.vercel.app | Neon main |

### 6.3 CI/CD Pipeline

```
Git Push → Vercel Build
    │
    ├── Install dependencies (npm ci)
    ├── Generate Prisma client (prisma generate)
    ├── Build Next.js (next build)
    ├── Run linting (next lint)
    └── Deploy to Vercel
         │
         ├── Preview deploy (PR branches)
         └── Production deploy (main branch)
              │
              └── Run Prisma migrations (prisma migrate deploy)
```

### 6.4 Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://...@neon.tech/ai_career_copilot

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Gemini
GEMINI_API_KEY=...

# UploadThing
UPLOADTHING_SECRET=sk_...
UPLOADTHING_APP_ID=...

# App
NEXT_PUBLIC_APP_URL=https://ai-career-copilot.vercel.app
```

---

## 7. Security Architecture

| Layer | Mechanism |
|-------|-----------|
| Transport | HTTPS everywhere (Vercel enforced) |
| Authentication | Clerk JWT validation via middleware |
| Authorization | User ID scoping on all DB queries |
| API protection | Clerk session required on all `/api/*` routes |
| Webhook verification | Clerk/UploadThing signature validation |
| File uploads | UploadThing server-side auth, type/size validation |
| Data isolation | All queries filtered by `userId` |
| Secrets | Vercel encrypted env vars, never in client bundle |
| Input validation | Server-side validation on all API inputs |
| Rate limiting | Vercel edge rate limiting on AI endpoints |

---

## 8. Performance Strategy

| Concern | Strategy |
|---------|----------|
| Page loads | Server Components for data fetching, minimal client JS |
| AI latency | Streaming responses, optimistic UI, background processing |
| Database | Connection pooling (Neon), indexed queries, Prisma select |
| Images/assets | Next.js Image optimization, Vercel CDN |
| Caching | React cache for repeated server fetches, stale-while-revalidate |
| Bundle size | Dynamic imports for heavy components (charts, editor) |
| File parsing | Background job pattern, webhook callback on completion |

---

## 9. Monitoring & Observability

| Tool | Purpose |
|------|---------|
| Vercel Analytics | Web vitals, page performance |
| Vercel Logs | Serverless function logs |
| Prisma query logging | Slow query detection (dev) |
| Custom error tracking | Structured error logs in API routes |
| Uptime monitoring | Vercel status + external ping |
