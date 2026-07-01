# AI Career Copilot — Project Context

**Version:** 2.0  
**Last Updated:** July 1, 2026  
**Status:** Planning Complete — Ready for Implementation  
**Purpose:** Living document for AI assistants and developers to continue work at any time

---

## 1. Project Summary

**AI Career Copilot** is a production-quality SaaS application that helps job seekers optimize their resumes, match against job descriptions, generate cover letters, practice interviews with AI, and plan their career trajectory.

| Attribute | Value |
|-----------|-------|
| Project Name | AI Career Copilot |
| Type | Full-stack SaaS web application |
| Stage | Pre-implementation (planning complete) |
| MVP Timeline | ~9 weeks |
| Language | JavaScript (not TypeScript) |

---

## 2. Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|-------|
| Framework | Next.js (App Router) | 15.x | Full-stack React framework |
| UI Library | React | 19.x | Component rendering |
| Language | JavaScript | ES2022+ | Application code |
| Styling | Tailwind CSS | 3.x | Utility-first CSS |
| Components | shadcn/ui | Latest | Accessible UI primitives |
| Animation | Framer Motion | 11.x | Page transitions, micro-interactions |
| Icons | Lucide React | Latest | Consistent icon system |
| Auth | Clerk | Latest | Authentication + user management |
| ORM | Prisma | 5.x | Database access + migrations |
| Database | PostgreSQL (Neon) | 16.x | Primary data store |
| File Upload | UploadThing | 7.x | Resume file storage |
| AI | Google Gemini API | gemini-2.0-flash | All AI features |
| Deployment | Vercel | — | Hosting + serverless functions |
| Charts | Recharts | 2.x | Analytics visualizations |
| Code Quality | ESLint, Prettier, Husky, lint-staged, commitlint | — | Linting, formatting, commit validation |
| Env Validation | Zod | — | Environment variable schema validation |

---

## 3. Planning Documents Index

| Document | Purpose | Key Contents |
|----------|---------|--------------|
| [PRD.md](./PRD.md) | Product requirements | Vision, personas, features, user flows, MVP scope, roadmap |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture | Folder structure, data flow, AI workflow, auth, deployment |
| [DATABASE.md](./DATABASE.md) | Database schema | Prisma schema, tables, relations, indexes, JSON schemas |
| [API.md](./API.md) | API reference | All endpoints, request/response shapes, auth, rate limits |
| [UI.md](./UI.md) | UI/UX specification | Pages, components, colors, typography, responsive design |
| [TASKS.md](./TASKS.md) | Implementation tasks | 134 tasks in 13 phases with dependencies |
| [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) | This document | Living summary for continuity |

---

## 4. Feature Status Tracker

| Feature | PRD Priority | MVP | Status | Tasks |
|-------|-----------|-----|------|-----|
| Code Quality & Tooling | — | ✅ | ⬜ Not started | T001–T006 |
| Authentication (Clerk) | P0 | ✅ | ⬜ Not started | T012–T015, T024 |
| Onboarding wizard | P0 | ✅ | ⬜ Not started | T050–T053 |
| UI Foundation | — | ✅ | ⬜ Not started | T026–T043 |
| Resume upload (PDF/DOCX) | P0 | ✅ | ⬜ Not started | T062–T065 |
| Resume parsing | P0 | ✅ | ⬜ Not started | T066–T069, T072 |
| AI resume analysis | P0 | ✅ | ⬜ Not started | T076–T079 |
| ATS score | P0 | ✅ | ⬜ Not started | T077, T080 |
| Improvement suggestions | P0 | ✅ | ⬜ Not started | T082, T083 |
| Job description matching | P0 | ✅ | ⬜ Not started | T086–T092 |
| AI cover letter generation | P0 | ✅ | ⬜ Not started | T094–T100 |
| Interview coach | P0 | ✅ | ⬜ Not started | T102–T111 |
| Interview evaluation | P0 | ✅ | ⬜ Not started | T103, T108, T112–T113 |
| Interview history | P0 | ✅ | ⬜ Not started | T114 |
| Analytics dashboard | P0 | ✅ | ⬜ Not started | T116–T120 |
| Profile management | P0 | ✅ | ⬜ Not started | T054–T055 |
| Settings | P0 | ✅ | ⬜ Not started | T056–T060 |
| Career Roadmap | P1 | ❌ Phase 2 | ⬜ Not started | T121–T126 |
| Landing page | P0 | ✅ | ⬜ Not started | T044–T049 |

---

## 5. Database Models (Quick Reference)

```
User ──┬── Resume ──── ResumeAnalysis
       ├── JobMatch ── CoverLetter
       ├── InterviewSession ── InterviewMessage
       ├── Roadmap ── Milestone
       └── Activity
```

**10 tables:** users, resumes, resume_analyses, job_matches, cover_letters, interview_sessions, interview_messages, roadmaps, milestones, activities

Full schema in [DATABASE.md](./DATABASE.md).

---

## 6. API Endpoints (Quick Reference)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/webhooks/clerk` | Clerk user sync |
| GET/PATCH | `/api/profile` | User profile |
| PATCH | `/api/profile/settings` | Theme, notifications |
| DELETE | `/api/profile` | Delete account |
| GET/POST | `/api/resumes` | List/create resumes |
| GET/PATCH/DELETE | `/api/resumes/[id]` | Resume CRUD |
| POST | `/api/resumes/[id]/parse` | Parse resume file |
| POST | `/api/resumes/[id]/analyze` | AI analysis |
| GET/POST | `/api/job-matches` | List/create matches |
| GET/DELETE | `/api/job-matches/[id]` | Match details |
| GET/POST | `/api/cover-letters` | List/generate letters |
| GET/PATCH/DELETE | `/api/cover-letters/[id]` | Letter CRUD |
| GET/POST | `/api/interviews` | List/create sessions |
| GET/DELETE | `/api/interviews/[id]` | Session details |
| POST | `/api/interviews/[id]/message` | Send message |
| POST | `/api/interviews/[id]/evaluate` | End + evaluate |
| GET/POST | `/api/roadmaps` | List/generate roadmaps |
| GET/DELETE | `/api/roadmaps/[id]` | Roadmap CRUD |
| PATCH | `/api/roadmaps/[id]/milestones/[milestoneId]` | Update milestone |
| GET | `/api/analytics` | Dashboard data |

Full API spec in [API.md](./API.md).

---

## 7. Page Routes (Quick Reference)

| Route | Page | Auth | Layout |
|-------|------|------|--------|
| `/` | Landing page | No | Marketing |
| `/sign-in` | Sign in | No | Auth |
| `/sign-up` | Sign up | No | Auth |
| `/onboarding` | Onboarding wizard | Yes | Standalone |
| `/dashboard` | Analytics dashboard | Yes | Dashboard |
| `/resume` | Resume list | Yes | Dashboard |
| `/resume/upload` | Upload resume | Yes | Dashboard |
| `/resume/[id]` | Resume detail + analysis | Yes | Dashboard |
| `/job-match` | Job match input | Yes | Dashboard |
| `/job-match/[id]` | Match results | Yes | Dashboard |
| `/cover-letter` | Cover letter generator | Yes | Dashboard |
| `/cover-letter/[id]` | Cover letter detail | Yes | Dashboard |
| `/interview` | Interview hub | Yes | Dashboard |
| `/interview/new` | New interview setup | Yes | Dashboard |
| `/interview/[id]` | Active interview chat | Yes | Dashboard |
| `/interview/[id]/results` | Interview evaluation | Yes | Dashboard |
| `/interview/history` | Interview history | Yes | Dashboard |
| `/roadmap` | Career roadmap | Yes | Dashboard |
| `/profile` | Profile management | Yes | Dashboard |
| `/settings` | App settings | Yes | Dashboard |

---

## 8. Key Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Language | JavaScript (not TypeScript) | Per project requirement |
| Auth provider | Clerk | Fast setup, OAuth, webhooks, free tier |
| AI provider | Google Gemini (flash) | Cost-effective, fast, good JSON output |
| File storage | UploadThing | Native Next.js integration, simple API |
| Database host | Neon PostgreSQL | Serverless-friendly, free tier, branching |
| Deployment | Vercel | Native Next.js support, edge functions |
| State management | React Server Components + client state | Minimal client JS, no Redux needed |
| Styling approach | Tailwind + shadcn/ui | Rapid development, consistent design system |
| API pattern | Next.js Route Handlers | Colocated with app, serverless-ready |
| JSON storage | PostgreSQL JSON columns | Flexible AI output without schema migrations |
| Code quality | ESLint, Prettier, Husky, lint-staged, commitlint | Consistent code style, prevent bad commits |
| Env validation | Zod | Catch missing/invalid env vars early |

---

## 9. Environment Variables Required

```env
# Database
DATABASE_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Gemini
GEMINI_API_KEY=

# UploadThing
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 10. Current Implementation Status

### Completed
- [x] PRD.md — Product requirements document
- [x] ARCHITECTURE.md — System architecture
- [x] DATABASE.md — Database schema
- [x] API.md — API reference
- [x] UI.md — UI/UX specification
- [x] TASKS.md — 134 implementation tasks
- [x] PROJECT_CONTEXT.md — This document

### Not Started
- [ ] All application code (Tasks T001–T134)
- [ ] Database migrations
- [ ] Environment configuration
- [ ] Deployment setup

### Current Task
**Next task to implement:** T001 — Initialize Next.js 15 project with App Router

---

## 11. Implementation Instructions for AI Assistants

When continuing development on this project:

1. **Read this document first** to understand current state
2. **Check TASKS.md** for the next uncompleted task
3. **Reference the relevant planning doc** for details:
   - Building a page → UI.md
   - Building an API route → API.md
   - Database changes → DATABASE.md
   - Architecture questions → ARCHITECTURE.md
4. **Follow the tech stack exactly** — JavaScript, not TypeScript
5. **Match existing conventions** — read surrounding code before writing
6. **Complete one task at a time** — verify acceptance criteria before moving on
7. **Update this document** after completing each phase:
   - Mark features as in-progress or complete in Section 4
   - Update "Current Task" in Section 10
   - Add any architectural decisions to Section 8
8. **Do not skip tasks** — dependencies exist for a reason
9. **Commit after each phase** — not after every task

### Code Conventions

```
- Files: kebab-case (resume-card.jsx, pdf-parser.js)
- Components: PascalCase (ResumeCard, AtsScoreGauge)
- Functions: camelCase (parseResume, analyzeResume)
- Constants: UPPER_SNAKE_CASE (MAX_FILE_SIZE)
- API routes: RESTful, JSON responses
- Imports: @/ alias for src/ directory
- CSS: Tailwind utilities only, no custom CSS files except globals.css
- Components: shadcn/ui primitives as base, feature components on top
```

### File Creation Order (First Session)

```
1. npx create-next-app@latest . --js --tailwind --app --src-dir --eslint
2. Install Prettier, ESLint plugins
3. Install Husky, lint-staged, commitlint
4. Set up env validation with Zod
5. Configure jsconfig.json paths
6. Install dependencies (Framer Motion, Lucide React)
7. Set up globals.css with color variables, next-themes
8. Create .env.example
9. Install and set up shadcn/ui
10. Install Clerk
11. Initialize Prisma
```

---

## 12. Known Constraints & Gotchas

| Constraint | Detail | Mitigation |
|----------|--------|-----------|
| Vercel function timeout | 10s (hobby) / 60s (pro) | Background processing for AI calls; streaming for long operations |
| Gemini rate limits | Varies by tier | Server-side retry with backoff; rate limiting on API routes |
| UploadThing file limit | 10MB default | Validate file size client-side before upload |
| Clerk webhook delay | ~1-2s after signup | Handle race condition: create user on first API call if webhook hasn't fired |
| Prisma on Vercel | Connection pooling needed | Use Neon connection pooling URL (`?pgbouncer=true`) |
| No TypeScript | Project requirement | Use JSDoc comments for complex function signatures; use Zod for runtime validation |

---

## 13. Testing Strategy

| Level | Approach | When |
|-------|----------|------|
| Manual | Test each task's acceptance criteria | After every task |
| API | Test endpoints with curl/Postman | After each API route task |
| Integration | End-to-end user flows | After each phase |
| AI | Test with sample resumes and JDs | After AI service tasks |
| Responsive | Test at mobile/tablet/desktop breakpoints | After UI component tasks |
| Auth | Test protected routes, webhook sync | After auth tasks |
| Production | Smoke test on Vercel deployment | Task T132 |
| Accessibility | WCAG 2.1 AA audit | Task T131 |
| Performance | Lighthouse audit | Task T133 |
| Cross-browser | Test Chrome, Firefox, Safari, Edge | Task T129 |

---

## 14. Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2026-07-01 | 1.0 | Initial planning documents created. All 7 docs complete. Ready for T001. |
| 2026-07-01 | 2.0 | Updated TASKS.md: reordered Phase 1, added Phase 0 (Code Quality), added Phase 2 (UI Foundation), expanded Phase 12 (Polish & Deploy), updated dependencies and task numbers. Updated PROJECT_CONTEXT.md to reflect changes. |

---

## 15. Quick Start for New Developer/AI Session

```bash
# 1. Clone and install
git clone <repo-url>
cd ai-career-copilot
npm install

# 2. Set up environment
cp .env.example .env.local
# Fill in all values (see Section 9)

# 3. Set up database
npx prisma generate
npx prisma migrate dev

# 4. Run development server
npm run dev

# 5. Open TASKS.md and start with the first unchecked task
```

**First implementation session should complete Phase 0 (T001–T006): Code Quality & Tooling.**
