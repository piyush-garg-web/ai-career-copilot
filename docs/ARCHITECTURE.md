# System Architecture

**AI Career Copilot** is designed on a modern, decoupled serverless architecture using Next.js 15, PostgreSQL (via Neon DB), Prisma ORM, and the Google Gemini AI Suite.

---

## 1. Architectural Topology

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│   React 18 · Next.js 15 (App Router) · Tailwind CSS · Framer   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS (JSON API / Server Actions)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      VERCEL HOSTING ENVIRONMENT                 │
│                                                                 │
│  ┌──────────────────────┐  ┌────────────────┐  ┌─────────────┐  │
│  │ Clerk Authentication │  │ Next.js Router │  │ Middlewares │  │
│  │ Middleware           │  │ API Handlers   │  │ Route Guard │  │
│  └──────────────────────┘  └───────┬────────┘  └─────────────┘  │
└────────────────────────────────────┼────────────────────────────┘
                                     │
                 ┌───────────────────┼───────────────────┐
                 ▼                   ▼                   ▼
        ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
        │  Clerk Auth API │ │ Neon PostgreSQL │ │  UploadThing S3 │
        │  (User Identity)│ │ (via Prisma ORM)│ │  (Resume Files) │
        └─────────────────┘ └────────┬────────┘ └─────────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │ Google Gemini   │
                            │ AI Studio API   │
                            └─────────────────┘
```

---

## 2. Directory Layout Reference

This showcases the physical organization of the workspace:

```
ai-career-copilot/
├── docs/                         # Professional Documentation
│   ├── ARCHITECTURE.md           # Architecture overview
│   ├── SETUP.md                  # Prerequisites and setup details
│   ├── FEATURES.md               # Explanation of capabilities
│   ├── DATABASE.md               # Database schema and relational design
│   └── API.md                    # Backend API endpoint reference
├── prisma/
│   └── schema.prisma             # Primary Prisma relational database schema
├── public/                       # Static public assets
├── screenshots/                  # Repository visualization mockups
└── src/
    ├── app/                      # Next.js App Router
    │   ├── (auth)/               # Clerk Authentication routes
    │   ├── (marketing)/          # Public Landing/Marketing pages
    │   ├── api/                  # Backend endpoints (/api/*)
    │   │   ├── ai/               # AI endpoint tester
    │   │   ├── interviews/       # Mock interview handlers
    │   │   ├── job-matches/      # Resume & JD comparison matches
    │   │   ├── notifications/    # Candidate updates and reminders
    │   │   ├── resumes/          # Resume upload, parsing & AI analyze
    │   │   ├── uploadthing/      # File upload handler
    │   │   └── webhooks/clerk/   # Clerk User identity synchronizer
    │   ├── layout.js             # Root layout element
    │   └── globals.css           # Styling configuration
    ├── components/               # React Interface Components
    │   ├── ats/                  # ATS scoring UI components
    │   ├── dashboard/            # Profile statistics and analytics widgets
    │   ├── interview/            # Active interview screen and results UI
    │   ├── layout/               # Header, sidebar, and nav layouts
    │   ├── resume/               # Upload dropzones and analysis gauges
    │   ├── shared/               # Reusable buttons, dialogs, charts
    │   └── ui/                   # shadcn primitives (button, card, dialog)
    ├── lib/                      # Core Logic Libraries
    │   ├── ai/                   # Gemini services, prompts, validators
    │   │   ├── prompts/          # AI prompt definition lists
    │   │   ├── services/         # Custom LLM interface logic
    │   │   ├── client.js         # Google Gen AI initialization
    │   │   └── service.js        # Core AI processor integration
    │   ├── db.js                 # Prisma client instance definition
    │   ├── parsers/              # Raw document text extractors (PDF, DOCX)
    │   ├── uploadthing.js        # File upload router setup
    │   └── utils.js              # Class merger and style utilities
    └── middleware.js             # Clerk authentication route guard
```

---

## 3. Main Operational Layers

### 3.1 Client-Side Application Layer
*   **Next.js 15 React Architecture**: Built with React Server Components (RSC) to minimize initial load time and optimize SEO, while employing client interactive containers for state-heavy modules like the Interview Coach and Upload Dropzone.
*   **Design & Theme system**: Tailored layout responsive on both desktop and mobile platforms using Tailwind CSS utilities, utilizing `next-themes` for seamless Dark and Light aesthetic preferences.

### 3.2 Service Middleware & API Route Handlers
*   **Authentication Boundary**: The global route middleware intercepts incoming requests, verifying the Clerk JSON Web Tokens (JWT) before passing context to route endpoints.
*   **Stateless Handlers**: Endpoints process client parameters, orchestrate parsing tasks, fetch corresponding records using Prisma, and leverage Google Gemini for scoring.

### 3.3 Relational Database Layer
*   **Neon DB (Serverless PostgreSQL)**: Scalable database storing user profiles, resumes, parsed texts, keyword matchups, and turn-based mock interview interactions.
*   **Prisma Client**: Encapsulates connections, runs queries cleanly, provides robust type safety, and handles cascading deletes on user profile removals.

### 3.4 External Integrations
*   **Clerk**: Houses primary candidate identities, providing out-of-the-box OAuth provider bridges. It updates the database using webhook callbacks (`/api/webhooks/clerk`).
*   **UploadThing**: Serves as a secure developer-friendly file bridge, streaming document binary buffers directly into an AWS S3 bucket and returning secure resource keys.
*   **Google Gemini AI**: Direct REST wrapper query engine that generates structured JSON evaluations using optimized system prompts.

---

## 4. Key Architectural Data Flows

### 4.1 Onboarding and Synchronization Flow
1.  Candidate signs up via Clerk OAuth or email confirmation.
2.  Clerk triggers a `user.created` webhook payload POST request.
3.  The webhook verifies the signing signature, parses fields, and creates a matching record in the database `users` table.
4.  Next.js client detects the new user and redirects them to the onboarding questionnaire to save their career targets.

### 4.2 Document Upload, Parsing & AI Analysis Flow
1.  Candidate drops a file (PDF or DOCX) in the `UploadZone` component.
2.  UploadThing streams it to cloud storage and returns the remote URL.
3.  The client hits the resume POST API route to create a resume record marked `UPLOADED`.
4.  The parse service is called, running `pdf-parse` or `mammoth` on the file buffer to capture raw text. The state updates to `PARSED`.
5.  An AI analysis pipeline calls the Google Gemini API with a targeted parser instruction.
6.  Gemini returns structured JSON with an overall ATS rating, breakdown scores, spelling checks, and missing keywords.
7.  Prisma saves the parsed metrics into the `resume_analyses` table and sets the status to `ANALYZED`.

### 4.3 Interactive Interview Coaching Loop
1.  User starts a session, prompting Next.js to trigger the `/api/interviews` POST endpoint.
2.  Gemini evaluates the user's Primary Resume and Role to compile an array of questions, inserting them into `interview_questions`.
3.  For each question, the user inputs their response and hits `/api/interviews/[id]/answer`.
4.  Gemini reviews the answer, returns a score out of 100, lists strengths/weaknesses, and drafts an "Ideal Answer".
5.  On completion, the aggregated metrics are saved and final review cards render.
