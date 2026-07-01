# AI Career Copilot — Task Breakdown

**Version:** 1.0  
**Last Updated:** July 1, 2026  
**Total Tasks:** 120  
**Estimated Duration:** ~8 weeks (60 hours)

---

## Task Format

Each task includes:
- **ID** — Unique identifier
- **Title** — Short description
- **Dependencies** — Task IDs that must be completed first
- **Acceptance Criteria** — How to verify completion

---

## Phase 1: Project Foundation (Tasks 1–20)

| ID | Title | Dependencies | Acceptance Criteria |
|----|-------|-------------|---------------------|
| T001 | Initialize Next.js 15 project with App Router | — | `npx create-next-app` completes; app runs on localhost:3000 |
| T002 | Configure JavaScript (disable TypeScript) | T001 | Project uses `.js`/`.jsx` files; `jsconfig.json` configured with `@/*` alias |
| T003 | Install and configure Tailwind CSS | T001 | Tailwind classes render correctly; `globals.css` has base directives |
| T004 | Initialize shadcn/ui with default theme | T003 | `components.json` exists; `npx shadcn@latest init` succeeds |
| T005 | Install core shadcn/ui components (button, card, input, label, dialog, toast) | T004 | Components importable from `@/components/ui/*` |
| T006 | Install remaining shadcn/ui components (select, tabs, badge, avatar, progress, skeleton, sheet, separator, dropdown-menu, textarea, tooltip) | T005 | All UI primitives available |
| T007 | Install Framer Motion and Lucide React | T001 | Packages in `package.json`; test animation renders |
| T008 | Set up CSS variables for color palette (light + dark) | T003 | All color tokens from UI.md defined in `globals.css` |
| T009 | Configure dark mode with `next-themes` | T008 | Theme toggle switches between light/dark/system |
| T010 | Create `.env.example` with all required variables | T001 | File documents all env vars from ARCHITECTURE.md |
| T011 | Install and configure Prisma ORM | T001 | `prisma init` complete; `schema.prisma` exists |
| T012 | Define complete Prisma schema (all models) | T011 | Schema matches DATABASE.md; `prisma validate` passes |
| T013 | Create and run initial database migration | T012 | `prisma migrate dev --name init` succeeds; tables created in Neon |
| T014 | Create Prisma client singleton (`lib/db.js`) | T013 | Client imports without error; connection to Neon verified |
| T015 | Install and configure Clerk authentication | T001 | Clerk packages installed; env vars set |
| T016 | Create Clerk middleware for route protection | T015 | Public routes accessible; protected routes redirect to sign-in |
| T017 | Create sign-in page with Clerk `<SignIn />` | T015, T005 | `/sign-in` renders Clerk sign-in form |
| T018 | Create sign-up page with Clerk `<SignUp />` | T015, T005 | `/sign-up` renders Clerk sign-up form |
| T019 | Create Clerk webhook handler (`/api/webhooks/clerk`) | T014, T015 | User created/updated/deleted events sync to database |
| T020 | Create root layout with providers (Clerk, Theme, Toast) | T009, T015, T005 | App renders with all providers; no console errors |

---

## Phase 2: Layout & Navigation (Tasks 21–30)

| ID | Title | Dependencies | Acceptance Criteria |
|----|-------|-------------|---------------------|
| T021 | Create `DashboardShell` layout component | T020 | Wraps children with sidebar + header structure |
| T022 | Create `Sidebar` component with navigation links | T021, T007 | All nav items from UI.md render with Lucide icons |
| T023 | Create `Header` component with breadcrumbs and user button | T021, T015 | Header shows current page; Clerk UserButton works |
| T024 | Create `MobileNav` sheet component for mobile | T022, T006 | Hamburger menu opens navigation sheet on mobile |
| T025 | Create `(dashboard)` route group layout | T021 | All dashboard pages use DashboardShell |
| T026 | Create `(marketing)` route group layout | T020 | Marketing pages use full-width layout without sidebar |
| T027 | Create `(auth)` route group layout | T020 | Auth pages use centered card layout |
| T028 | Create shared `PageHeader` component | T005 | Renders title, description, and action slot |
| T029 | Create shared `LoadingSpinner` component | T007 | Animated spinner with optional text prop |
| T030 | Create shared `EmptyState` and `ErrorState` components | T005, T007 | Both render with icon, title, description, and optional CTA |

---

## Phase 3: Landing Page & Onboarding (Tasks 31–40)

| ID | Title | Dependencies | Acceptance Criteria |
|----|-------|-------------|---------------------|
| T031 | Create landing page hero section | T026, T007 | Hero renders headline, CTA buttons, and animation |
| T032 | Create features grid section | T031 | 6 feature cards with icons render on landing page |
| T033 | Create "How It Works" section | T031 | 4-step visual flow renders |
| T034 | Create testimonials section | T031 | 3 testimonial cards render |
| T035 | Create CTA section and footer | T031 | Bottom CTA and footer links render |
| T036 | Assemble complete landing page | T031–T035 | `/` renders all sections with scroll animations |
| T037 | Create onboarding wizard container with step navigation | T025, T007 | 3-step wizard with progress bar and back/next nav |
| T038 | Create onboarding Step 1: Career Goal form | T037 | Captures target role, industry, career goals |
| T039 | Create onboarding Step 2: Experience Level selector | T037 | 4 radio cards (Entry, Mid, Senior, Executive) |
| T040 | Create onboarding Step 3: Resume Upload + completion handler | T037, T038, T039 | Upload zone renders; completing onboarding sets `onboardingComplete = true` and redirects to dashboard |

---

## Phase 4: Profile & Settings (Tasks 41–48)

| ID | Title | Dependencies | Acceptance Criteria |
|----|-------|-------------|---------------------|
| T041 | Create GET/PATCH `/api/profile` route | T014, T019 | Returns and updates user profile from database |
| T042 | Create profile page with `ProfileForm` component | T041, T028 | Form displays and saves all profile fields |
| T043 | Create PATCH `/api/profile/settings` route | T041 | Updates theme and notification preferences |
| T044 | Create settings page with theme toggle | T043, T009 | Theme changes persist to database and apply immediately |
| T045 | Create notification settings component | T044 | Email notification toggle saves to database |
| T046 | Create danger zone component (delete account) | T044 | Delete button shows confirmation dialog; soft-deletes user |
| T047 | Create DELETE `/api/profile` route | T041 | Soft-deletes user and cascades related data |
| T048 | Add onboarding redirect logic in middleware | T016, T040 | Users with `onboardingComplete = false` redirect to `/onboarding` |

---

## Phase 5: Resume Upload & Parsing (Tasks 49–62)

| ID | Title | Dependencies | Acceptance Criteria |
|----|-------|-------------|---------------------|
| T049 | Install and configure UploadThing | T001 | UploadThing packages installed; env vars configured |
| T050 | Create UploadThing file router for resume uploads | T049 | Accepts PDF/DOCX up to 10MB; auth required |
| T051 | Create `/api/uploadthing` route handler | T050 | Upload endpoint works; files stored in UploadThing |
| T052 | Create `UploadZone` component with drag-and-drop | T051, T007 | Drag-and-drop and click-to-upload work; shows progress |
| T053 | Create PDF parser (`lib/parsers/pdf-parser.js`) | T001 | Extracts text from PDF buffer; unit test with sample PDF |
| T054 | Create DOCX parser (`lib/parsers/docx-parser.js`) | T001 | Extracts text from DOCX buffer; unit test with sample DOCX |
| T055 | Install and configure Gemini API client (`lib/gemini.js`) | T010 | Client connects; test prompt returns response |
| T056 | Create resume parsing AI prompt template | T055 | Prompt extracts structured JSON from raw resume text |
| T057 | Create GET/POST `/api/resumes` routes | T014 | List and create resume records |
| T058 | Create GET/PATCH/DELETE `/api/resumes/[id]` routes | T057 | CRUD operations scoped to authenticated user |
| T059 | Create POST `/api/resumes/[id]/parse` route | T053, T054, T056, T058 | Parses uploaded file; saves structured data to DB |
| T060 | Create resume list page with `ResumeCard` component | T057, T028 | Lists user's resumes with status badges |
| T061 | Create resume upload page | T052, T059 | Upload → parse flow works end-to-end |
| T062 | Create `ResumePreview` component | T058 | Renders parsed resume data in structured format |

---

## Phase 6: Resume Analysis (Tasks 63–72)

| ID | Title | Dependencies | Acceptance Criteria |
|----|-------|-------------|---------------------|
| T063 | Create resume analysis AI prompt template | T055 | Prompt returns ATS score, breakdown, suggestions, keywords |
| T064 | Create ATS scoring AI prompt template | T055 | Prompt returns category scores with issues |
| T065 | Create `resume-analyzer.js` service | T063, T064 | Orchestrates AI calls and validates JSON response |
| T066 | Create POST `/api/resumes/[id]/analyze` route | T065, T059 | Runs analysis; creates ResumeAnalysis record |
| T067 | Create `AtsScoreGauge` component | T007 | Circular gauge animates to score on mount; color-coded |
| T068 | Create `ScoreBreakdown` component | T005 | 4 horizontal progress bars for categories |
| T069 | Create `SuggestionCard` component | T005 | Priority badge, title, description, impact label |
| T070 | Create `AnalysisResults` container component | T067, T068, T069 | Combines gauge, breakdown, suggestions, keywords |
| T071 | Create resume detail page (`/resume/[id]`) | T058, T070, T062 | Full analysis results render for analyzed resume |
| T072 | Create Activity logging utility and RESUME events | T014 | Resume upload and analysis create Activity records |

---

## Phase 7: Job Matching (Tasks 73–80)

| ID | Title | Dependencies | Acceptance Criteria |
|----|-------|-------------|---------------------|
| T073 | Create job matching AI prompt template | T055 | Prompt returns match score, skills, gaps, suggestions |
| T074 | Create `job-matcher.js` service | T073 | Orchestrates matching AI call and validates response |
| T075 | Create GET/POST `/api/job-matches` routes | T074, T014 | List and create job match records |
| T076 | Create GET/DELETE `/api/job-matches/[id]` routes | T075 | Get full match details; delete match |
| T077 | Create `JdInput` form component | T005 | Job title, company, description textarea, resume selector |
| T078 | Create `MatchScoreDisplay` and `SkillComparison` components | T067 | Match percentage gauge; matched vs missing skills columns |
| T079 | Create job match page and results page | T077, T078, T075 | Input form → results display flow works end-to-end |
| T080 | Add JOB_MATCHED activity logging | T072, T075 | Job match creation logs activity |

---

## Phase 8: Cover Letter Generation (Tasks 81–88)

| ID | Title | Dependencies | Acceptance Criteria |
|----|-------|-------------|---------------------|
| T081 | Create cover letter AI prompt template | T055 | Prompt generates letter from resume + JD + tone |
| T082 | Create `cover-letter-gen.js` service | T081 | Generates letter; supports tone parameter |
| T083 | Create GET/POST `/api/cover-letters` routes | T082, T014 | List and generate cover letters |
| T084 | Create GET/PATCH/DELETE `/api/cover-letters/[id]` routes | T083 | View, edit, and delete cover letters |
| T085 | Create `ToneSelector` component | T005 | 3 tone pills with selection state |
| T086 | Create `LetterEditor` and `LetterPreview` components | T005 | Editor with content; formatted preview |
| T087 | Create cover letter page and detail page | T085, T086, T083 | Generate → edit → save flow works |
| T088 | Add COVER_LETTER_GENERATED activity logging | T072, T083 | Cover letter creation logs activity |

---

## Phase 9: Interview Coach (Tasks 89–102)

| ID | Title | Dependencies | Acceptance Criteria |
|----|-------|-------------|---------------------|
| T089 | Create interview coach AI prompt template | T055 | Prompt generates contextual interview questions |
| T090 | Create interview evaluation AI prompt template | T055 | Prompt evaluates transcript and returns scores + feedback |
| T091 | Create `interview-engine.js` service | T089 | Manages Q&A flow; generates next question from transcript |
| T092 | Create GET/POST `/api/interviews` routes | T091, T014 | List sessions; create session with first AI question |
| T093 | Create GET/DELETE `/api/interviews/[id]` routes | T092 | Get session with messages; delete session |
| T094 | Create POST `/api/interviews/[id]/message` route | T091, T093 | Sends candidate message; returns AI follow-up |
| T095 | Create POST `/api/interviews/[id]/evaluate` route | T090, T093 | Ends session; generates and saves evaluation |
| T096 | Create `SessionConfig` component | T005 | Role, difficulty, question type configuration form |
| T097 | Create `ChatInterface` and `MessageBubble` components | T007 | Chat UI with interviewer/candidate message styling |
| T098 | Create new interview page and active interview page | T096, T097, T092, T094 | Configure → chat → end flow works |
| T099 | Create `EvaluationReport` and `ScoreRadar` components | T007 | Evaluation display with radar chart |
| T100 | Create interview results page | T095, T099 | Full evaluation report renders after session ends |
| T101 | Create interview history page with `HistoryList` | T092 | Lists past sessions with scores and dates |
| T102 | Add INTERVIEW activity logging | T072, T092, T095 | Interview start and completion log activities |

---

## Phase 10: Analytics Dashboard (Tasks 103–108)

| ID | Title | Dependencies | Acceptance Criteria |
|----|-------|-------------|---------------------|
| T103 | Create GET `/api/analytics` route | T014, T072 | Returns overview stats, score trends, interview performance, recent activity |
| T104 | Create `StatCard` component | T005, T007 | Displays metric with icon, value, and optional change indicator |
| T105 | Create `ScoreChart` component (line chart) | T007 | Renders ATS score trend over time |
| T106 | Create `ActivityFeed` component | T005 | Timeline of recent user activities |
| T107 | Create dashboard page assembling all analytics components | T103–T106, T028 | Dashboard renders stats, charts, activity feed, quick actions |
| T108 | Create `AnimatedContainer` for page transitions | T007 | Pages fade in on navigation; respects reduced motion |

---

## Phase 11: Career Roadmap (Tasks 109–114)

| ID | Title | Dependencies | Acceptance Criteria |
|----|-------|-------------|---------------------|
| T109 | Create roadmap AI prompt template | T055 | Prompt generates roadmap with milestones and resources |
| T110 | Create `roadmap-gen.js` service | T109 | Generates roadmap JSON with ordered milestones |
| T111 | Create GET/POST `/api/roadmaps` routes | T110, T014 | List and generate roadmaps with milestones |
| T112 | Create GET/DELETE `/api/roadmaps/[id]` and PATCH milestone routes | T111 | View, delete roadmap; update milestone status |
| T113 | Create `RoadmapTimeline`, `MilestoneCard`, `ProgressTracker` components | T005, T007 | Timeline renders milestones with status toggling |
| T114 | Create roadmap page | T113, T111 | Generate roadmap → view timeline → mark milestones complete |

---

## Phase 12: Polish & Deployment (Tasks 115–120)

| ID | Title | Dependencies | Acceptance Criteria |
|----|-------|-------------|---------------------|
| T115 | Create global error boundary and 404 page | T020 | Error boundary catches crashes; 404 page renders for unknown routes |
| T116 | Create global loading UI (skeleton screens) | T006 | Loading states show skeletons for all major pages |
| T117 | Create `ConfirmDialog` shared component | T005 | Reusable dialog for delete confirmations across app |
| T118 | Add rate limiting to AI API endpoints | T066, T075, T083, T094 | Rate limits enforced; 429 returned when exceeded |
| T119 | Create Prisma seed script for development | T013 | `prisma db seed` creates sample user, resume, and analysis data |
| T120 | Configure Vercel deployment with env vars and Prisma migrate | T013, T010 | App deploys to Vercel; production DB migrated; all features work in production |

---

## Dependency Graph (Critical Path)

```
T001 → T003 → T004 → T005 → T020
T001 → T011 → T012 → T013 → T014
T001 → T015 → T016 → T019
T014 + T019 → T041 → T042
T049 → T050 → T051 → T052
T055 → T056 → T059 → T063 → T065 → T066 → T071
T073 → T074 → T075 → T079
T081 → T082 → T083 → T087
T089 → T091 → T092 → T094 → T095 → T100
T103 → T107
T109 → T110 → T111 → T114
T120 (depends on all feature phases)
```

---

## Task Execution Guidelines

1. **Complete tasks in dependency order** — never start a task until its dependencies are done
2. **Test after each task** — every task must be independently verifiable
3. **Commit after each phase** — create a git commit at the end of each phase
4. **Update PROJECT_CONTEXT.md** — after each phase, update the living context document
5. **Reference planning docs** — PRD.md for features, DATABASE.md for schema, API.md for endpoints, UI.md for design

---

## Phase Completion Checklist

| Phase | Tasks | Key Deliverable | Status |
|-------|-------|-----------------|--------|
| 1. Foundation | T001–T020 | Project runs with auth + DB | ⬜ |
| 2. Layout | T021–T030 | Dashboard shell + navigation | ⬜ |
| 3. Landing & Onboarding | T031–T040 | Landing page + onboarding wizard | ⬜ |
| 4. Profile & Settings | T041–T048 | Profile CRUD + settings | ⬜ |
| 5. Resume Upload | T049–T062 | Upload + parse pipeline | ⬜ |
| 6. Resume Analysis | T063–T072 | ATS score + suggestions | ⬜ |
| 7. Job Matching | T073–T080 | JD matching + gap analysis | ⬜ |
| 8. Cover Letter | T081–T088 | AI cover letter generation | ⬜ |
| 9. Interview Coach | T089–T102 | Mock interview + evaluation | ⬜ |
| 10. Analytics | T103–T108 | Dashboard with charts | ⬜ |
| 11. Career Roadmap | T109–T114 | AI roadmap + milestones | ⬜ |
| 12. Polish & Deploy | T115–T120 | Production deployment | ⬜ |
