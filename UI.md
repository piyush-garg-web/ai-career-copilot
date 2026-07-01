# AI Career Copilot — UI/UX Design Specification

**Version:** 1.0  
**Last Updated:** July 1, 2026  
**Status:** Planning

---

## 1. Design Philosophy

AI Career Copilot should feel **professional, trustworthy, and empowering** — like having a senior career coach in your pocket. The UI balances data-rich analytics with approachable, conversational AI interactions.

**Design Principles:**
1. **Clarity over cleverness** — Users are stressed about job searching; the UI should reduce anxiety, not add to it
2. **Progressive disclosure** — Show the most important info first (ATS score, match %), details on demand
3. **Action-oriented** — Every screen should have a clear next step
4. **AI transparency** — Always indicate when AI is processing; show confidence and reasoning
5. **Consistent patterns** — Reuse components across features for familiarity

---

## 2. Color Palette

### Primary Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--primary` | `#2563EB` (Blue 600) | `#3B82F6` (Blue 500) | Buttons, links, active states |
| `--primary-foreground` | `#FFFFFF` | `#FFFFFF` | Text on primary |
| `--secondary` | `#F1F5F9` (Slate 100) | `#1E293B` (Slate 800) | Secondary buttons, tags |
| `--secondary-foreground` | `#0F172A` (Slate 900) | `#F8FAFC` (Slate 50) | Text on secondary |

### Semantic Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--success` | `#16A34A` (Green 600) | `#22C55E` (Green 500) | High scores, matched skills |
| `--warning` | `#D97706` (Amber 600) | `#F59E0B` (Amber 500) | Medium scores, suggestions |
| `--destructive` | `#DC2626` (Red 600) | `#EF4444` (Red 500) | Errors, delete actions |
| `--info` | `#0891B2` (Cyan 600) | `#06B6D4` (Cyan 500) | Info badges, tips |

### Score Colors

| Range | Color | Label |
|-------|-------|-------|
| 80–100 | `#16A34A` (Green) | Excellent |
| 60–79 | `#2563EB` (Blue) | Good |
| 40–59 | `#D97706` (Amber) | Needs Work |
| 0–39 | `#DC2626` (Red) | Poor |

### Neutral Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--background` | `#FFFFFF` | `#0A0A0B` | Page background |
| `--foreground` | `#0F172A` | `#F8FAFC` | Primary text |
| `--muted` | `#F8FAFC` | `#18181B` | Subtle backgrounds |
| `--muted-foreground` | `#64748B` | `#A1A1AA` | Secondary text |
| `--border` | `#E2E8F0` | `#27272A` | Borders, dividers |
| `--card` | `#FFFFFF` | `#18181B` | Card backgrounds |
| `--accent` | `#EFF6FF` (Blue 50) | `#172554` (Blue 950) | Hover states, highlights |

### Gradient Accents

| Name | Value | Usage |
|------|-------|-------|
| Hero gradient | `linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)` | Landing hero, score gauges |
| Success gradient | `linear-gradient(135deg, #16A34A 0%, #059669 100%)` | High score badges |
| AI shimmer | `linear-gradient(90deg, transparent, rgba(37,99,235,0.1), transparent)` | AI loading states |

---

## 3. Typography

| Element | Font | Size | Weight | Line Height |
|---------|------|------|--------|-------------|
| H1 (Page title) | Inter | 30px / 1.875rem | 700 | 1.2 |
| H2 (Section title) | Inter | 24px / 1.5rem | 600 | 1.3 |
| H3 (Card title) | Inter | 20px / 1.25rem | 600 | 1.4 |
| H4 (Subsection) | Inter | 16px / 1rem | 600 | 1.5 |
| Body | Inter | 14px / 0.875rem | 400 | 1.6 |
| Body large | Inter | 16px / 1rem | 400 | 1.6 |
| Small / Caption | Inter | 12px / 0.75rem | 400 | 1.5 |
| Score display | Inter | 48px / 3rem | 700 | 1.0 |
| Monospace (code) | JetBrains Mono | 13px | 400 | 1.5 |

**Font loading:** Inter and JetBrains Mono via `next/font/google`

---

## 4. Spacing & Layout

### Grid System
- **Dashboard layout:** Sidebar (256px) + Main content (fluid)
- **Content max-width:** 1280px (`max-w-7xl`)
- **Content padding:** 24px mobile, 32px tablet, 48px desktop
- **Card padding:** 24px
- **Section gap:** 32px vertical between sections
- **Component gap:** 16px between related elements

### Breakpoints

| Name | Width | Layout Changes |
|------|-------|----------------|
| `sm` | 640px | Stack → side-by-side for some cards |
| `md` | 768px | Sidebar collapses to sheet/drawer |
| `lg` | 1024px | Full sidebar visible, 2-column grids |
| `xl` | 1280px | 3-column grids, wider content |
| `2xl` | 1536px | Max content width enforced |

### Border Radius
- **Buttons:** 8px (`rounded-lg`)
- **Cards:** 12px (`rounded-xl`)
- **Inputs:** 8px (`rounded-lg`)
- **Badges:** 9999px (`rounded-full`)
- **Modals:** 16px (`rounded-2xl`)
- **Avatar:** 9999px (`rounded-full`)

---

## 5. Pages

### 5.1 Landing Page `/`

**Layout:** Full-width marketing layout (no sidebar)

| Section | Component | Description |
|---------|-----------|-------------|
| Navbar | `Navbar` | Logo, nav links (Features, How It Works, Pricing), Sign In / Get Started buttons |
| Hero | `HeroSection` | Headline, subheadline, CTA buttons, hero illustration/animation |
| Features | `FeaturesGrid` | 6 feature cards with icons |
| How It Works | `HowItWorks` | 4-step visual flow |
| Social Proof | `Testimonials` | 3 testimonial cards |
| CTA | `CtaSection` | Final call-to-action banner |
| Footer | `Footer` | Links, social, copyright |

**Animations:** Framer Motion fade-in on scroll for each section

---

### 5.2 Sign In `/sign-in` & Sign Up `/sign-up`

**Layout:** Centered card on gradient background

| Element | Description |
|---------|-------------|
| Logo | App logo centered above form |
| Clerk component | `<SignIn />` or `<SignUp />` styled via Clerk appearance API |
| Background | Subtle gradient mesh pattern |

---

### 5.3 Onboarding `/onboarding`

**Layout:** Centered wizard, full viewport height

| Step | Component | Content |
|------|-----------|---------|
| 1 | `StepCareerGoal` | Target role (input), industry (select), career goals (textarea) |
| 2 | `StepExperience` | Experience level (radio cards: Entry, Mid, Senior, Executive) |
| 3 | `StepUpload` | Resume upload zone with drag-and-drop |

**UX:**
- Progress bar at top (3 steps)
- Back/Next navigation
- Skip upload option (can upload later)
- Animated transitions between steps (Framer Motion slide)

---

### 5.4 Dashboard `/dashboard`

**Layout:** Dashboard shell with sidebar

| Section | Component | Description |
|---------|-----------|-------------|
| Page header | `PageHeader` | "Welcome back, {name}" + quick action buttons |
| Stats row | `StatCard` × 4 | Total analyses, avg ATS score, interviews completed, cover letters |
| ATS trend | `ScoreChart` | Line chart of ATS scores over time |
| Interview radar | `ScoreRadar` | Radar chart of interview category scores |
| Recent activity | `ActivityFeed` | Timeline of recent actions |
| Quick actions | Action cards | Upload resume, Start interview, Match job |

---

### 5.5 Resume List `/resume`

| Section | Component | Description |
|---------|-----------|-------------|
| Page header | `PageHeader` | "My Resumes" + Upload button |
| Resume grid | `ResumeCard` × N | File name, status badge, ATS score, date, actions menu |
| Empty state | `EmptyState` | Illustration + "Upload your first resume" CTA |

**ResumeCard contents:**
- File icon (PDF/DOCX)
- File name
- Status badge (Uploaded, Parsing, Analyzed, Error)
- ATS score gauge (if analyzed)
- Upload date
- Actions: View, Analyze, Set Primary, Delete

---

### 5.6 Resume Detail `/resume/[id]`

| Section | Component | Description |
|---------|-----------|-------------|
| Header | `PageHeader` | File name, status, action buttons (Re-analyze, Download) |
| Score hero | `AtsScoreGauge` | Large circular gauge with score + label |
| Breakdown | `ScoreBreakdown` | 4 category bars (formatting, keywords, content, structure) |
| Suggestions | `SuggestionCard` × N | Prioritized improvement cards with impact badges |
| Keywords | Keyword tags | Present (green), Missing (red), Overused (amber) |
| Preview | `ResumePreview` | Parsed resume rendered in structured format |
| History | Analysis timeline | Previous analysis scores with dates |

---

### 5.7 Resume Upload `/resume/upload`

| Section | Component | Description |
|---------|-----------|-------------|
| Upload zone | `UploadZone` | Drag-and-drop area with file type icons |
| Progress | Upload progress bar | UploadThing progress indicator |
| Processing | `LoadingSpinner` | "Parsing your resume..." animated state |
| Success | Redirect | Auto-redirect to resume detail after parse |

---

### 5.8 Job Match `/job-match`

| Section | Component | Description |
|---------|-----------|-------------|
| Input form | `JdInput` | Job title, company, job description textarea |
| Resume selector | Dropdown | Select which resume to match against |
| Submit | Button | "Analyze Match" with loading state |

---

### 5.9 Job Match Results `/job-match/[id]`

| Section | Component | Description |
|---------|-----------|-------------|
| Score hero | `MatchScoreDisplay` | Large percentage with color coding |
| Skills | `SkillComparison` | Two-column: Matched (green) vs Missing (red) |
| Gaps | `GapAnalysis` | Detailed gap cards with importance badges |
| Suggestions | `SuggestionCard` × N | Tailoring recommendations |
| Actions | Button row | "Generate Cover Letter", "Save", "New Match" |

---

### 5.10 Cover Letter `/cover-letter`

| Section | Component | Description |
|---------|-----------|-------------|
| Generator form | Form | Job details, resume selector, tone selector |
| Editor | `LetterEditor` | Rich text area with generated content |
| Preview | `LetterPreview` | Formatted preview of the letter |
| Actions | Button row | Copy, Download, Regenerate, Save |

**Tone selector:** `ToneSelector` — 3 pill buttons (Professional, Enthusiastic, Concise)

---

### 5.11 Cover Letter Detail `/cover-letter/[id]`

Same as generator but pre-filled with saved letter. Editable content with save button.

---

### 5.12 Interview Hub `/interview`

| Section | Component | Description |
|---------|-----------|-------------|
| Page header | `PageHeader` | "Interview Coach" + "New Session" button |
| Active session | Highlight card | Resume active session if exists |
| Stats | Mini stat cards | Total sessions, avg score, best score |
| History link | Button | "View All History" → `/interview/history` |

---

### 5.13 New Interview `/interview/new`

| Section | Component | Description |
|---------|-----------|-------------|
| Config form | `SessionConfig` | Role input, difficulty selector, question type checkboxes |
| Preview | Summary card | Shows selected config before starting |
| Start button | Primary CTA | "Start Interview" |

**Difficulty selector:** 3 cards (Easy, Medium, Hard) with descriptions

**Question types:** Checkboxes — Behavioral, Technical, Situational

---

### 5.14 Active Interview `/interview/[id]`

| Section | Component | Description |
|---------|-----------|-------------|
| Header | Session info bar | Role, difficulty, timer, "End Interview" button |
| Chat | `ChatInterface` | Scrollable message list |
| Messages | `MessageBubble` × N | Interviewer (left, blue) / Candidate (right, gray) |
| Input | Textarea + Send | Multi-line input with send button |
| Typing indicator | Animated dots | Shown while AI generates response |

---

### 5.15 Interview Results `/interview/[id]/results`

| Section | Component | Description |
|---------|-----------|-------------|
| Score hero | Overall score gauge | Large circular score |
| Categories | `ScoreRadar` | Radar chart: clarity, relevance, structure, confidence |
| Summary | Text block | AI overall summary |
| Strengths | Green bullet list | What went well |
| Weaknesses | Amber bullet list | Areas to improve |
| Recommendations | Action cards | Specific next steps |
| Per-question | Accordion | Expandable per-question feedback |
| Actions | Button row | "Practice Again", "View Transcript", "Back to Hub" |

---

### 5.16 Interview History `/interview/history`

| Section | Component | Description |
|---------|-----------|-------------|
| Filters | Tabs + search | All, Completed, filter by role |
| List | `HistoryList` | Table/cards with role, date, score, duration |
| Pagination | Page controls | Standard pagination |

---

### 5.17 Career Roadmap `/roadmap`

| Section | Component | Description |
|---------|-----------|-------------|
| Header | `PageHeader` | "Career Roadmap" + "Generate New" button |
| Timeline | `RoadmapTimeline` | Vertical timeline with milestones |
| Milestones | `MilestoneCard` × N | Title, category badge, status, resources |
| Progress | `ProgressTracker` | Overall completion percentage bar |

**Empty state:** "Generate your personalized career roadmap" CTA

---

### 5.18 Profile `/profile`

| Section | Component | Description |
|---------|-----------|-------------|
| Avatar | `AvatarUpload` | Profile photo with upload |
| Form | `ProfileForm` | Name, bio, location, LinkedIn, target role, industry, experience, goals |
| Save button | Primary CTA | "Save Changes" with success toast |

---

### 5.19 Settings `/settings`

| Section | Component | Description |
|---------|-----------|-------------|
| Appearance | `ThemeToggle` | Light / Dark / System radio buttons |
| Notifications | `NotificationSettings` | Email notification toggles |
| Account | Info display | Email (from Clerk, read-only) |
| Danger zone | `DangerZone` | Export data, Delete account buttons with confirmation dialogs |

---

## 6. Component Library

### 6.1 Layout Components

| Component | File | Props | Description |
|-----------|------|-------|-------------|
| `DashboardShell` | `layout/dashboard-shell.jsx` | `children` | Sidebar + header + main content wrapper |
| `Sidebar` | `layout/sidebar.jsx` | — | Navigation links with active state, logo, collapse toggle |
| `Header` | `layout/header.jsx` | — | Breadcrumbs, search (future), UserButton, theme toggle |
| `MobileNav` | `layout/mobile-nav.jsx` | — | Sheet/drawer navigation for mobile |
| `Footer` | `layout/footer.jsx` | — | Marketing footer |
| `PageHeader` | `shared/page-header.jsx` | `title`, `description`, `actions` | Page title with optional action buttons |

### 6.2 shadcn/ui Primitives (Installed)

| Component | Usage |
|-----------|-------|
| `Button` | All CTAs, actions |
| `Card` | Content containers |
| `Dialog` | Modals, confirmations |
| `DropdownMenu` | Action menus (resume card, etc.) |
| `Input` | Text inputs |
| `Label` | Form labels |
| `Progress` | Upload progress, milestone progress |
| `Select` | Dropdowns (industry, resume selector) |
| `Separator` | Section dividers |
| `Sheet` | Mobile sidebar |
| `Skeleton` | Loading placeholders |
| `Tabs` | Interview history filters, resume detail tabs |
| `Textarea` | Job description, cover letter, interview input |
| `Toast` | Success/error notifications |
| `Badge` | Status badges, skill tags, priority labels |
| `Avatar` | User profile photo |
| `Tooltip` | Icon button hints |

### 6.3 Feature Components

| Component | File | Key Props |
|-----------|------|-----------|
| `UploadZone` | `resume/upload-zone.jsx` | `onUploadComplete`, `accept` |
| `ResumeCard` | `resume/resume-card.jsx` | `resume`, `onAnalyze`, `onDelete` |
| `ResumePreview` | `resume/resume-preview.jsx` | `parsedData` |
| `AtsScoreGauge` | `resume/ats-score-gauge.jsx` | `score`, `size`, `previousScore` |
| `AnalysisResults` | `resume/analysis-results.jsx` | `analysis` |
| `SuggestionCard` | `resume/suggestion-card.jsx` | `suggestion`, `onApply` |
| `ScoreBreakdown` | `resume/score-breakdown.jsx` | `breakdown` |
| `JdInput` | `job-match/jd-input.jsx` | `onSubmit`, `resumes` |
| `MatchScoreDisplay` | `job-match/match-score-display.jsx` | `score` |
| `SkillComparison` | `job-match/skill-comparison.jsx` | `matched`, `missing` |
| `GapAnalysis` | `job-match/gap-analysis.jsx` | `gaps` |
| `LetterEditor` | `cover-letter/letter-editor.jsx` | `content`, `onChange`, `onRegenerate` |
| `ToneSelector` | `cover-letter/tone-selector.jsx` | `value`, `onChange` |
| `LetterPreview` | `cover-letter/letter-preview.jsx` | `content`, `jobTitle`, `company` |
| `SessionConfig` | `interview/session-config.jsx` | `onSubmit` |
| `ChatInterface` | `interview/chat-interface.jsx` | `messages`, `onSend`, `isLoading` |
| `MessageBubble` | `interview/message-bubble.jsx` | `message`, `role` |
| `EvaluationReport` | `interview/evaluation-report.jsx` | `evaluation`, `scores` |
| `ScoreRadar` | `interview/score-radar.jsx` | `scores` |
| `HistoryList` | `interview/history-list.jsx` | `sessions`, `onSelect` |
| `RoadmapTimeline` | `roadmap/roadmap-timeline.jsx` | `milestones` |
| `MilestoneCard` | `roadmap/milestone-card.jsx` | `milestone`, `onToggle` |
| `ProgressTracker` | `roadmap/progress-tracker.jsx` | `completed`, `total` |
| `StatCard` | `analytics/stat-card.jsx` | `title`, `value`, `change`, `icon` |
| `ScoreChart` | `analytics/score-chart.jsx` | `data` |
| `ActivityFeed` | `analytics/activity-feed.jsx` | `activities` |
| `PerformanceOverview` | `analytics/performance-overview.jsx` | `data` |

### 6.4 Shared Components

| Component | File | Description |
|-----------|------|-------------|
| `LoadingSpinner` | `shared/loading-spinner.jsx` | Animated spinner with optional text |
| `EmptyState` | `shared/empty-state.jsx` | Icon + title + description + CTA |
| `ErrorState` | `shared/error-state.jsx` | Error icon + message + retry button |
| `ConfirmDialog` | `shared/confirm-dialog.jsx` | Reusable confirmation modal |
| `AnimatedContainer` | `shared/animated-container.jsx` | Framer Motion wrapper for page transitions |

### 6.5 Marketing Components

| Component | File | Description |
|-----------|------|-------------|
| `HeroSection` | `marketing/hero-section.jsx` | Landing page hero with animation |
| `FeaturesGrid` | `marketing/features-grid.jsx` | 6-feature grid with icons |
| `HowItWorks` | `marketing/how-it-works.jsx` | Step-by-step visual flow |
| `Testimonials` | `marketing/testimonials.jsx` | User testimonial cards |
| `CtaSection` | `marketing/cta-section.jsx` | Bottom CTA banner |

---

## 7. Navigation Structure

### Sidebar Navigation (Dashboard)

```
┌─────────────────────────┐
│  🚀 AI Career Copilot   │
├─────────────────────────┤
│  📊 Dashboard           │
│  📄 Resume              │
│  🎯 Job Match           │
│  ✉️  Cover Letter        │
│  🎤 Interview Coach     │
│  🗺️  Career Roadmap     │
├─────────────────────────┤
│  👤 Profile             │
│  ⚙️  Settings            │
└─────────────────────────┘
```

**Active state:** Primary color background with white text  
**Hover state:** Accent background  
**Icons:** Lucide React icons

---

## 8. Responsive Design

### Mobile (< 768px)
- Sidebar hidden, hamburger menu opens `MobileNav` sheet
- Single-column layouts everywhere
- Score gauges scale down (48px → 36px)
- Cards stack vertically
- Interview chat fills viewport
- Reduced padding (16px)

### Tablet (768px – 1024px)
- Sidebar collapses to icon-only (64px) or sheet
- 2-column grids where applicable
- Standard padding (24px)

### Desktop (> 1024px)
- Full sidebar (256px)
- 2–3 column grids
- Side-by-side layouts (e.g., resume preview + analysis)
- Full padding (32–48px)

---

## 9. UX Guidelines

### Loading States
- **Skeleton screens** for page loads (not spinners)
- **Progress bars** for file uploads
- **Animated AI indicator** (shimmer/pulse) for AI processing
- **Optimistic updates** where safe (e.g., marking milestone complete)
- Always show estimated time for AI operations: "Analyzing your resume... (~10 seconds)"

### Empty States
Every list/page without data shows:
- Relevant illustration or icon
- Clear title: "No resumes yet"
- Helpful description: "Upload your first resume to get started with AI analysis"
- Primary CTA button

### Error States
- Inline form validation (real-time)
- Toast notifications for API errors
- Full-page error state with retry for critical failures
- AI failure: "Analysis failed. Your resume was saved — try again."

### Feedback & Confirmation
- Toast on successful actions (save, delete, generate)
- Confirmation dialog before destructive actions (delete resume, delete account)
- Score changes show delta: "78 (+5 from last analysis)"

### Accessibility (WCAG 2.1 AA)
- All interactive elements keyboard navigable
- Focus rings visible on all focusable elements
- Color contrast ratio ≥ 4.5:1 for text
- Score colors supplemented with text labels (not color-only)
- ARIA labels on icon buttons
- Screen reader announcements for dynamic content (AI responses, score updates)
- Reduced motion: respect `prefers-reduced-motion`

### Animation Guidelines (Framer Motion)
- **Page transitions:** Fade + slight Y translate (200ms)
- **Card hover:** Subtle scale (1.02) + shadow increase
- **Score gauge:** Animated count-up on mount
- **List items:** Staggered fade-in (50ms delay each)
- **Chat messages:** Slide in from bottom
- **Reduced motion:** All animations disabled when `prefers-reduced-motion: reduce`

---

## 10. Icon System

**Library:** Lucide React

| Context | Icon |
|---------|------|
| Dashboard | `LayoutDashboard` |
| Resume | `FileText` |
| Job Match | `Target` |
| Cover Letter | `Mail` |
| Interview | `Mic` |
| Roadmap | `Map` |
| Profile | `User` |
| Settings | `Settings` |
| Upload | `Upload` |
| Download | `Download` |
| Delete | `Trash2` |
| Edit | `Pencil` |
| Success | `CheckCircle` |
| Warning | `AlertTriangle` |
| Error | `XCircle` |
| AI/Sparkle | `Sparkles` |
| Score | `TrendingUp` |

---

## 11. Dark Mode

- Implemented via CSS variables in `globals.css`
- Toggle in Settings page + header quick toggle
- System preference detection as default
- All colors have dark mode variants defined in color palette
- Charts and gauges adapt colors for dark backgrounds
- Clerk components styled to match via appearance API

---

## 12. Wireframe References

### Dashboard Layout (Desktop)
```
┌──────────┬──────────────────────────────────────────────┐
│          │  Welcome back, John          [Upload Resume] │
│  Sidebar │──────────────────────────────────────────────│
│          │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐│
│  📊 Dash │  │ATS: 78 │ │Interv. │ │Matches │ │Letters ││
│  📄 Res  │  │  avg   │ │  8     │ │  4     │ │  3     ││
│  🎯 Match│  └────────┘ └────────┘ └────────┘ └────────┘│
│  ✉️ Letter│──────────────────────────────────────────────│
│  🎤 Inter│  ┌─────────────────────┐ ┌──────────────────┐│
│  🗺️ Road │  │  ATS Score Trend    │ │ Interview Radar  ││
│          │  │  📈 Chart           │ │  🕸️ Chart        ││
│──────────│  └─────────────────────┘ └──────────────────┘│
│  👤 Prof │──────────────────────────────────────────────│
│  ⚙️ Set  │  Recent Activity                            │
│          │  • Resume analyzed — score 78               │
└──────────┴──────────────────────────────────────────────┘
```

### Resume Analysis (Desktop)
```
┌──────────┬──────────────────────────────────────────────┐
│  Sidebar │  john_doe_resume.pdf        [Re-analyze]     │
│          │──────────────────────────────────────────────│
│          │         ┌──────────┐                          │
│          │         │    78    │  Good                    │
│          │         │  ATS Score│                          │
│          │         └──────────┘                          │
│          │──────────────────────────────────────────────│
│          │  Formatting ████████░░ 85                       │
│          │  Keywords   ███████░░░ 72                       │
│          │  Content    █████████░ 90                       │
│          │  Structure  ████████░░ 88                       │
│          │──────────────────────────────────────────────│
│          │  Suggestions                                  │
│          │  ┌─ HIGH ─ Add missing keywords ──── +5 ATS ─┐│
│          │  ┌─ MED ── Quantify achievements ─── +3 ATS ─┐│
│          │  ┌─ LOW ── Fix bullet formatting ── +1 ATS ──┐│
└──────────┴──────────────────────────────────────────────┘
```

### Interview Chat (Desktop)
```
┌──────────┬──────────────────────────────────────────────┐
│  Sidebar │  Frontend Engineer · Medium    ⏱ 12:34  [End]│
│          │──────────────────────────────────────────────│
│          │                                               │
│          │  🤖 Tell me about yourself and your           │
│          │     experience with frontend development.     │
│          │                                               │
│          │              I have over 5 years of experience│
│          │              working with React and TypeScript│
│          │              at various startups...        👤 │
│          │                                               │
│          │  🤖 Can you describe a challenging technical  │
│          │     problem you solved recently?              │
│          │                                               │
│          │──────────────────────────────────────────────│
│          │  ┌──────────────────────────────────────┐   │
│          │  │ Type your answer...                    📤│   │
│          │  └──────────────────────────────────────┘   │
└──────────┴──────────────────────────────────────────────┘
```
