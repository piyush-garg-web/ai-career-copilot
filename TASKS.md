# AI Career Copilot — Task Breakdown

**Version:** 2.0  
**Last Updated:** July 1, 2026  
**Total Tasks:** 140  
**Estimated Duration:** ~9 weeks (70 hours)

---

## Task Format

Each task includes:
- **ID** — Unique identifier
- **Title** — Short description
- **Dependencies** — Task IDs that must be completed first
- **Acceptance Criteria** — How to verify completion

---

## Phase 0: Code Quality & Tooling (Tasks 1–6)

| ID | Title | Dependencies | Acceptance Criteria |
|----|-------|-------------|---------------------|
| T001 | Initialize Next.js 15 project with App Router | — | `npx create-next-app@latest . --js --tailwind --app --src-dir --eslint` completes; app runs on localhost:3000 |
| T002 | Install and configure Prettier | T001 | `.prettierrc` and `.prettierignore` exist; `npm run format` works |
| T003 | Configure ESLint with Next.js and Prettier plugins | T002 | `.eslintrc.json` configured; `npm run lint` works without errors |
| T004 | Install Husky and lint-staged | T003 | `.husky` directory exists; pre-commit hook runs lint-staged |
| T005 | Set up environment variable validation (zod) | T001 | `env.mjs` validates all required env vars; clear error messages on missing vars |
| T006 | Configure Conventional Commits with commitlint | T004 | `commitlint.config.js` exists; pre-commit hook validates commit messages |

---

## Phase 1: Project Foundation (Tasks 7–28)

| ID | Title | Dependencies | Acceptance Criteria |
|----|-------|-------------|---------------------|
| T007 | Configure `jsconfig.json` with `@/*` alias | T001 | Path aliases configured; imports from `@/components/` work |
| T008 | Install Framer Motion and Lucide React | T001 | Packages in `package.json`; test animation renders |
| T009 | Set up CSS variables for color palette (light + dark) | T001 | All color tokens from UI.md defined in `globals.css` |
| T010 | Configure dark mode with `next-themes` | T009 | Theme toggle switches between light/dark/system |
| T011 | Create `.env.example` with all required variables | T001 | File documents all env vars from ARCHITECTURE.md |
| T012 | Install and configure Clerk authentication | T001 | Clerk packages installed; env vars set in `.env.example` |
| T013 | Create Clerk middleware for route protection | T012 | Public routes accessible; protected routes redirect to sign-in |
| T014 | Create sign-in page with Clerk `<SignIn />` | T012, T021 | `/sign-in` renders Clerk sign-in form |
| T015 | Create sign-up page with Clerk `<SignUp />` | T012, T021 | `/sign-up` renders Clerk sign-up form |
| T016 | Install and configure shadcn/ui with default theme | T001 | `components.json` exists; `npx shadcn@latest init` succeeds |
| T017 | Install core shadcn/ui components (button, card, input, label, dialog, toast) | T016 | Components importable from `@/components/ui/*` |
| T018 | Install remaining shadcn/ui components (select, tabs, badge, avatar, progress, skeleton, sheet, separator, dropdown-menu, textarea, tooltip) | T017 | All UI primitives available |
| T019 | Install and configure Prisma ORM | T001 | `prisma init` complete; `schema.prisma` exists |
| T020 | Define complete Prisma schema (all models) | T019 | Schema matches DATABASE.md; `prisma validate` passes |
| T021 | Create and run initial database migration | T020 | `prisma migrate dev --name init` succeeds; tables created in Neon |
| T022 | Create Prisma client singleton (`lib/db.js`) | T021 | Client imports without error; connection to Neon verified |
| T023 | Create Prisma seed script for development | T022 | `prisma db seed` creates sample user, resume, and analysis data |
| T024 | Create Clerk webhook handler (`/api/webhooks/clerk`) | T022, T012 | User created/updated/deleted events sync to database |
| T025 | Create root layout with providers (Clerk, Theme, Toast) | T010, T012, T017 | App renders with all providers; no console errors |

---

## Phase 2: UI Foundation (Tasks 29–43)

| ID | Title | Dependencies | Acceptance Criteria |
|----|-------|-------------|---------------------|
| T026 | Create marketing Navbar component | T017, T025 | Navbar renders with logo, nav links, and auth buttons |
| T027 | Create `(marketing)` route group layout | T025, T026 | Marketing pages use full-width layout with Navbar |
| T028 | Create `(auth)` route group layout | T025 | Auth pages use centered card layout |
| T029 | Create `DashboardShell` layout component | T025 | Wraps children with sidebar + header structure |
| T030 | Create `Sidebar` component with navigation links | T029, T008 | All nav items from UI.md render with Lucide icons |
| T031 | Create `Header` component with breadcrumbs and user button | T029, T012 | Header shows current page; Clerk UserButton works |
| T032 | Create `MobileNav` sheet component for mobile | T030, T018 | Hamburger menu opens navigation sheet on mobile |
| T033 | Create `(dashboard)` route group layout | T029 | All dashboard pages use DashboardShell |
| T034 | Create shared `PageHeader` component | T017 | Renders title, description, and action slot |
| T035 | Create shared `SectionCard` component | T017 | Card wrapper for sections with consistent styling |
| T036 | Create shared `LoadingSpinner` component | T008 | Animated spinner with optional text prop |
| T037 | Create shared `LoadingSkeleton` component | T018 | Skeleton placeholders for page content |
| T038 | Create shared `ErrorState` component | T017, T008 | Error display with icon, message, and retry button |
| T039 | Create shared `EmptyState` component | T017, T008 | Empty state with icon, title, description, and optional CTA |
| T040 | Create global 404 (not-found) page | T025 | 404 page renders for unknown routes |
| T041 | Create global error boundary (error.js) | T025 | Error boundary catches crashes and displays ErrorState |
| T042 | Create shared `ConfirmDialog` component | T017 | Reusable dialog for delete confirmations across app |
| T043 | Create shared `AnimatedContainer` component | T008 | Pages fade in on navigation; respects reduced motion |

---

## Phase 3: Landing Page & Onboarding (Tasks 44–53)

| ID | Title | Dependencies | Acceptance Criteria |
|----|-------|-------------|---------------------|
| T044 | Create landing page hero section | T027, T008 | Hero renders headline, CTA buttons, and animation |
| T045 | Create features grid section | T044 | 6 feature cards with icons render on landing page |
| T046 | Create "How It Works" section | T044 | 4-step visual flow renders |
| T047 | Create testimonials section | T044 | 3 testimonial cards render |
| T048 | Create CTA section and footer | T044 | Bottom CTA and footer links render |
| T049 | Assemble complete landing page | T044–T048 | `/` renders all sections with scroll animations |
| T050 | Create onboarding wizard container with step navigation | T033, T008 | 3-step wizard with progress bar and back/next nav |
| T051 | Create onboarding Step 1: Career Goal form | T050, T034 | Captures target role, industry, career goals |
| T052 | Create onboarding Step 2: Experience Level selector | T050, T017 | 4 radio cards (Entry, Mid, Senior, Executive) |
| T053 | Create onboarding Step 3: Resume Upload (placeholder) | T050, T037, T038 | Upload zone placeholder renders; completing onboarding sets `onboardingComplete = true` and redirects to dashboard |

---

## Phase 4: Profile & Settings (Tasks 54–61)

| ID | Title | Dependencies | Acceptance Criteria |
|----|-------|-------------|---------------------|
| T054 | Create GET/PATCH `/api/profile` route | T022, T024 | Returns and updates user profile from database |
| T055 | Create profile page with `ProfileForm` component | T054, T034, T033 | Form displays and saves all profile fields |
| T056 | Create PATCH `/api/profile/settings` route | T054 | Updates theme and notification preferences |
| T057 | Create settings page with theme toggle | T056, T010, T034 | Theme changes persist to database and apply immediately |
| T058 | Create notification settings component | T057, T017 | Email notification toggle saves to database |
| T059 | Create danger zone component (delete account) | T057, T042 | Delete button shows confirmation dialog; soft-deletes user |
| T060 | Create DELETE `/api/profile` route | T054 | Soft-deletes user and cascades related data |
| T061 | Add onboarding redirect logic in middleware | T013, T053 | Users with `onboardingComplete = false` redirect to `/onboarding` |

---

## Phase 5: Resume Upload & Parsing (Tasks 62–75)

| ID | Title | Dependencies | Acceptance Criteria |
|----|-------|-------------|---------------------|
| T062 | Install and configure UploadThing | T001 | UploadThing packages installed; env vars in `.env.example` |
| T063 | Create UploadThing file router for resume uploads | T062 | Accepts PDF/DOCX up to 10MB; auth required |
| T064 | Create `/api/uploadthing` route handler | T063 | Upload endpoint works; files stored in UploadThing |
| T065 | Create `UploadZone` component with drag-and-drop | T064, T008 | Drag-and-drop and click-to-upload work; shows progress |
| T066 | Create PDF parser (`lib/parsers/pdf-parser.js`) | T001 | Extracts text from PDF buffer; test with sample PDF |
| T067 | Create DOCX parser (`lib/parsers/docx-parser.js`) | T001 | Extracts text from DOCX buffer; test with sample DOCX |
| T068 | Install and configure Gemini API client (`lib/gemini.js`) | T011 | Client connects; test prompt returns response |
| T069 | Create resume parsing AI prompt template | T068 | Prompt extracts structured JSON from raw resume text |
| T070 | Create GET/POST `/api/resumes` routes | T022 | List and create resume records |
| T071 | Create GET/PATCH/DELETE `/api/resumes/[id]` routes | T070 | CRUD operations scoped to authenticated user |
| T072 | Create POST `/api/resumes/[id]/parse` route | T066, T067, T069, T071 | Parses uploaded file; saves structured data to DB |
| T073 | Create resume list page with `ResumeCard` component | T070, T034, T033, T039 | Lists user's resumes with status badges; empty state shown |
| T074 | Create resume upload page | T065, T072, T033, T037 | Upload → parse flow works end-to-end |
| T075 | Create `ResumePreview` component | T071 | Renders parsed resume data in structured format |

---

## Phase 6: Resume Analysis (Tasks 76–85)

| ID | Title | Dependencies | Acceptance Criteria |
|----|-------|-------------|---------------------|
| T076 | Create resume analysis AI prompt template | T068 | Prompt returns ATS score, breakdown, suggestions, keywords |
| T077 | Create ATS scoring AI prompt template | T068 | Prompt returns category scores with issues |
| T078 | Create `resume-analyzer.js` service | T076, T077 | Orchestrates AI calls and validates JSON response |
| T079 | Create POST `/api/resumes/[id]/analyze` route | T078, T072 | Runs analysis; creates ResumeAnalysis record |
| T080 | Create `AtsScoreGauge` component | T008 | Circular gauge animates to score on mount; color-coded |
| T081 | Create `ScoreBreakdown` component | T017 | 4 horizontal progress bars for categories |
| T082 | Create `SuggestionCard` component | T017 | Priority badge, title, description, impact label |
| T083 | Create `AnalysisResults` container component | T080, T081, T082 | Combines gauge, breakdown, suggestions, keywords |
| T084 | Create resume detail page (`/resume/[id]`) | T071, T083, T075, T033, T037, T038 | Full analysis results render for analyzed resume |
| T085 | Create Activity logging utility and RESUME events | T022 | Resume upload and analysis create Activity records |

---

## Phase 7: Job Matching (Tasks 86–93)

| ID | Title | Dependencies | Acceptance Criteria |
|----|-------|-------------|---------------------|
| T086 | Create job matching AI prompt template | T068 | Prompt returns match score, skills, gaps, suggestions |
| T087 | Create `job-matcher.js` service | T086 | Orchestrates matching AI call and validates response |
| T088 | Create GET/POST `/api/job-matches` routes | T087, T022 | List and create job match records |
| T089 | Create GET/DELETE `/api/job-matches/[id]` routes | T088 | Get full match details; delete match |
| T090 | Create `JdInput` form component | T017, T034 | Job title, company, description textarea, resume selector |
| T091 | Create `MatchScoreDisplay` and `SkillComparison` components | T080, T017 | Match percentage gauge; matched vs missing skills columns |
| T092 | Create job match page and results page | T090, T091, T088, T033, T037, T038, T039 | Input form → results display flow works end-to-end |
| T093 | Add JOB_MATCHED activity logging | T085, T088 | Job match creation logs activity |

---

## Phase 8: Cover Letter Generation (Tasks 94–101)

| ID | Title | Dependencies | Acceptance Criteria |
|----|-------|-------------|---------------------|
| T094 | Create cover letter AI prompt template | T068 | Prompt generates letter from resume + JD + tone |
| T095 | Create `cover-letter-gen.js` service | T094 | Generates letter; supports tone parameter |
| T096 | Create GET/POST `/api/cover-letters` routes | T095, T022 | List and generate cover letters |
| T097 | Create GET/PATCH/DELETE `/api/cover-letters/[id]` routes | T096 | View, edit, and delete cover letters |
| T098 | Create `ToneSelector` component | T017 | 3 tone pills with selection state |
| T099 | Create `LetterEditor` and `LetterPreview` components | T017 | Editor with content; formatted preview |
| T100 | Create cover letter page and detail page | T098, T099, T096, T033, T037, T038, T039 | Generate → edit → save flow works |
| T101 | Add COVER_LETTER_GENERATED activity logging | T085, T096 | Cover letter creation logs activity |

---

## Phase 9: Interview Coach (Tasks 102–115)

| ID | Title | Dependencies | Acceptance Criteria |
|----|-------|-------------|---------------------|
| T102 | Create interview coach AI prompt template | T068 | Prompt generates contextual interview questions |
| T103 | Create interview evaluation AI prompt template | T068 | Prompt evaluates transcript and returns scores + feedback |
| T104 | Create `interview-engine.js` service | T102 | Manages Q&A flow; generates next question from transcript |
| T105 | Create GET/POST `/api/interviews` routes | T104, T022 | List sessions; create session with first AI question |
| T106 | Create GET/DELETE `/api/interviews/[id]` routes | T105 | Get session with messages; delete session |
| T107 | Create POST `/api/interviews/[id]/message` route | T104, T106 | Sends candidate message; returns AI follow-up |
| T108 | Create POST `/api/interviews/[id]/evaluate` route | T103, T106 | Ends session; generates and saves evaluation |
| T109 | Create `SessionConfig` component | T017, T034 | Role, difficulty, question type configuration form |
| T110 | Create `ChatInterface` and `MessageBubble` components | T008, T017 | Chat UI with interviewer/candidate message styling |
| T111 | Create new interview page and active interview page | T109, T110, T105, T107, T033, T037, T038 | Configure → chat → end flow works |
| T112 | Create `EvaluationReport` and `ScoreRadar` components | T008, T017 | Evaluation display with radar chart |
| T113 | Create interview results page | T108, T112, T033, T037, T038 | Full evaluation report renders after session ends |
| T114 | Create interview history page with `HistoryList` | T105, T033, T037, T039 | Lists past sessions with scores and dates |
| T115 | Add INTERVIEW activity logging | T085, T105, T108 | Interview start and completion log activities |

---

## Phase 10: Analytics Dashboard (Tasks 116–121)

| ID | Title | Dependencies | Acceptance Criteria |
|----|-------|-------------|---------------------|
| T116 | Create GET `/api/analytics` route | T022, T085 | Returns overview stats, score trends, interview performance, recent activity |
| T117 | Create `StatCard` component | T017, T008 | Displays metric with icon, value, and optional change indicator |
| T118 | Create `ScoreChart` component (line chart) | T008 | Renders ATS score trend over time |
| T119 | Create `ActivityFeed` component | T017, T035 | Timeline of recent user activities |
| T120 | Create dashboard page assembling all analytics components | T116–T119, T034, T033, T037, T038, T039 | Dashboard renders stats, charts, activity feed, quick actions |

---

## Phase 11: Career Roadmap (Tasks 122–127)

| ID | Title | Dependencies | Acceptance Criteria |
|----|-------|-------------|---------------------|
| T121 | Create roadmap AI prompt template | T068 | Prompt generates roadmap with milestones and resources |
| T122 | Create `roadmap-gen.js` service | T121 | Generates roadmap JSON with ordered milestones |
| T123 | Create GET/POST `/api/roadmaps` routes | T122, T022 | List and generate roadmaps with milestones |
| T124 | Create GET/DELETE `/api/roadmaps/[id]` and PATCH milestone routes | T123 | View, delete roadmap; update milestone status |
| T125 | Create `RoadmapTimeline`, `MilestoneCard`, `ProgressTracker` components | T017, T008 | Timeline renders milestones with status toggling |
| T126 | Create roadmap page | T125, T123, T033, T037, T038, T039 | Generate roadmap → view timeline → mark milestones complete |

---

## Phase 12: Polish & Deployment (Tasks 128–134)

| ID | Title | Dependencies | Acceptance Criteria |
|----|-------|-------------|---------------------|
| T127 | Add rate limiting to AI API endpoints | T079, T088, T096, T107 | Rate limits enforced; 429 returned when exceeded |
| T128 | End-to-end manual test of all MVP flows | T120, T074, T084, T092, T100, T111, T113 | All MVP user flows work without errors |
| T129 | Cross-browser test (Chrome, Firefox, Safari, Edge) | T128 | App works on latest 2 versions of all major browsers |
| T130 | Responsive design test (mobile, tablet, desktop) | T128 | App is usable at all breakpoints from UI.md |
| T131 | Accessibility audit (WCAG 2.1 AA) | T128 | Key a11y checks pass (keyboard nav, color contrast, ARIA labels) |
| T132 | Configure Vercel deployment with env vars and Prisma migrate | T021, T011 | App deploys to Vercel; production DB migrated; all features work in production |
| T133 | Performance audit (Lighthouse) | T132 | Lighthouse score ≥ 80 for performance, accessibility, best practices |
| T134 | Final documentation review and sign-off | T133 | All planning docs are updated; project is ready for release |

---

## Dependency Graph (Critical Path)

```
T001 → T002 → T003 → T004 → T005 → T006 → T007
T007 → T008 → T009 → T010 → T011 → T012 → T013 → T014 → T015
T007 → T016 → T017 → T018
T001 → T019 → T020 → T021 → T022 → T023 → T024 → T025
T025 → T026 → T027 → T028 → T029 → T030 → T031 → T032 → T033
T033 → T034 → T035 → T036 → T037 → T038 → T039 → T040 → T041 → T042 → T043
T043 → T044 → T045 → T046 → T047 → T048 → T049
T043 → T050 → T051 → T052 → T053 → T061
T061 → T054 → T055 → T056 → T057 → T058 → T059 → T060
T060 → T062 → T063 → T064 → T065 → T066 → T067 → T068 → T069 → T070 → T071 → T072 → T073 → T074 → T075
T075 → T076 → T077 → T078 → T079 → T080 → T081 → T082 → T083 → T084 → T085
T085 → T086 → T087 → T088 → T089 → T090 → T091 → T092 → T093
T093 → T094 → T095 → T096 → T097 → T098 → T099 → T100 → T101
T101 → T102 → T103 → T104 → T105 → T106 → T107 → T108 → T109 → T110 → T111 → T112 → T113 → T114 → T115
T115 → T116 → T117 → T118 → T119 → T120
T120 → T121 → T122 → T123 → T124 → T125 → T126
T126 → T127 → T128 → T129 → T130 → T131 → T132 → T133 → T134
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
| 0. Code Quality | T001–T006 | ESLint, Prettier, Husky, commitlint set up | ⬜ |
| 1. Foundation | T007–T025 | Project runs with auth + DB | ⬜ |
| 2. UI Foundation | T026–T043 | All shared UI components, layouts, error/loading/empty states | ⬜ |
| 3. Landing & Onboarding | T044–T053 | Landing page + onboarding wizard | ⬜ |
| 4. Profile & Settings | T054–T061 | Profile CRUD + settings | ⬜ |
| 5. Resume Upload | T062–T075 | Upload + parse pipeline | ⬜ |
| 6. Resume Analysis | T076–T085 | ATS score + suggestions | ⬜ |
| 7. Job Matching | T086–T093 | JD matching + gap analysis | ⬜ |
| 8. Cover Letter | T094–T101 | AI cover letter generation | ⬜ |
| 9. Interview Coach | T102–T115 | Mock interview + evaluation | ⬜ |
| 10. Analytics | T116–T120 | Dashboard with charts | ⬜ |
| 11. Career Roadmap | T121–T126 | AI roadmap + milestones | ⬜ |
| 12. Polish & Deploy | T127–T134 | Production deployment, testing, audit | ⬜ |
