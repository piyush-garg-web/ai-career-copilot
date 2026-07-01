# AI Career Copilot — Product Requirements Document

**Version:** 1.0  
**Last Updated:** July 1, 2026  
**Status:** Planning  
**Owner:** Product Team

---

## 1. Product Vision

**AI Career Copilot** is a production-quality SaaS platform that empowers job seekers to land their dream roles faster by combining intelligent resume optimization, job matching, and AI-powered interview preparation into a single, cohesive experience.

### Vision Statement

> *"Every job seeker deserves a personal career coach — available 24/7, powered by AI, and grounded in real hiring data."*

### Problem Statement

Job seekers face fragmented tools: one app for resume building, another for ATS checking, a third for interview prep, and spreadsheets for tracking applications. None of these tools talk to each other, forcing users to re-enter the same information repeatedly and miss critical optimization opportunities.

### Solution

AI Career Copilot unifies the entire job search lifecycle — from resume upload and ATS optimization, through job matching and cover letter generation, to mock interviews with detailed feedback — in one intelligent platform that learns from the user's career profile over time.

### Success Metrics (Post-Launch)

| Metric | Target (90 days) |
|--------|------------------|
| Monthly Active Users | 1,000+ |
| Resume analyses completed | 5,000+ |
| Interview sessions completed | 2,000+ |
| User retention (30-day) | ≥ 40% |
| Average ATS score improvement | ≥ 15 points |
| NPS Score | ≥ 50 |

---

## 2. Target Users

### Primary Personas

#### Persona 1: Recent Graduate — "Alex"
- **Age:** 22–26
- **Goal:** Land first full-time role in tech/business
- **Pain Points:** No resume feedback, nervous about interviews, doesn't know what ATS systems look for
- **Needs:** Resume templates, ATS scoring, interview practice, career roadmap

#### Persona 2: Career Changer — "Jordan"
- **Age:** 28–40
- **Goal:** Transition to a new industry or role
- **Pain Points:** Existing resume doesn't translate skills, needs tailored cover letters per application
- **Needs:** Job description matching, skill gap analysis, personalized cover letters, career roadmap

#### Persona 3: Experienced Professional — "Sam"
- **Age:** 35–50
- **Goal:** Advance to senior/leadership roles
- **Pain Points:** Outdated resume format, needs executive-level interview prep
- **Needs:** Advanced resume analysis, behavioral interview coaching, analytics on application performance

### Secondary Users

- **Career counselors / coaches** — may recommend the platform to clients
- **University career centers** — potential B2B licensing (future)

---

## 3. Features

### 3.1 Authentication & Onboarding

| Feature | Description | Priority |
|---------|-------------|----------|
| Sign up / Sign in | Email, Google, GitHub via Clerk | P0 |
| Onboarding wizard | Collect career goals, target role, experience level | P0 |
| Profile creation | Name, photo, location, LinkedIn URL | P0 |

### 3.2 Resume Management

| Feature | Description | Priority |
|---------|-------------|----------|
| Resume upload | PDF and DOCX via UploadThing | P0 |
| Resume parsing | Extract structured data (experience, education, skills) | P0 |
| Multiple resumes | Support up to 3 resume versions per user | P1 |
| Resume preview | Render parsed resume in-app | P0 |
| Resume download | Export improved version as PDF | P1 |

### 3.3 AI Resume Analysis

| Feature | Description | Priority |
|---------|-------------|----------|
| Full resume analysis | Gemini-powered comprehensive review | P0 |
| ATS score | 0–100 score with breakdown by category | P0 |
| Improvement suggestions | Actionable, prioritized recommendations | P0 |
| Keyword analysis | Missing keywords, overused terms | P0 |
| Formatting check | Layout, font, section structure review | P1 |
| Before/after comparison | Side-by-side score comparison after edits | P1 |

### 3.4 Job Matching

| Feature | Description | Priority |
|---------|-------------|----------|
| Job description input | Paste or upload job description | P0 |
| Match score | Resume-to-JD compatibility percentage | P0 |
| Gap analysis | Skills/experience gaps highlighted | P0 |
| Tailoring suggestions | Specific edits to improve match | P0 |
| Saved job descriptions | Store and manage multiple JDs | P1 |

### 3.5 Cover Letter Generation

| Feature | Description | Priority |
|---------|-------------|----------|
| AI cover letter | Generate tailored cover letter from resume + JD | P0 |
| Tone selection | Professional, enthusiastic, concise | P1 |
| Edit & regenerate | Inline editing with regenerate option | P0 |
| Export | Copy to clipboard or download as PDF/DOCX | P0 |
| Cover letter history | Save generated letters linked to job applications | P1 |

### 3.6 Interview Coach

| Feature | Description | Priority |
|---------|-------------|----------|
| Mock interview setup | Select role, difficulty, question types | P0 |
| AI interviewer | Gemini-powered conversational mock interview | P0 |
| Real-time Q&A | Text-based interview with follow-up questions | P0 |
| Interview evaluation | Score on clarity, relevance, structure, confidence | P0 |
| Detailed feedback | Per-question breakdown with improvement tips | P0 |
| Interview history | View past sessions with scores and transcripts | P0 |

### 3.7 Career Roadmap

| Feature | Description | Priority |
|---------|-------------|----------|
| Personalized roadmap | AI-generated career path based on profile | P0 |
| Milestone tracking | Skills to learn, certifications, projects | P1 |
| Progress visualization | Timeline/progress bar view | P1 |
| Resource recommendations | Courses, books, projects per milestone | P2 |

### 3.8 Analytics Dashboard

| Feature | Description | Priority |
|---------|-------------|----------|
| Overview stats | Total analyses, interviews, avg ATS score | P0 |
| Score trends | ATS score over time chart | P0 |
| Interview performance | Average scores by category | P0 |
| Activity feed | Recent actions timeline | P1 |
| Export reports | PDF summary of progress | P2 |

### 3.9 Profile & Settings

| Feature | Description | Priority |
|---------|-------------|----------|
| Profile management | Edit personal info, career goals | P0 |
| Account settings | Email preferences, notification toggles | P0 |
| Data management | Export data, delete account | P1 |
| Theme preference | Light/dark mode | P1 |

---

## 4. User Flows

### 4.1 New User Onboarding Flow

```
Landing Page → Sign Up (Clerk) → Onboarding Wizard
  → Step 1: Career Goal (target role, industry)
  → Step 2: Experience Level (entry/mid/senior)
  → Step 3: Upload Resume (PDF/DOCX)
  → Resume Parsing (background)
  → Dashboard (with first analysis prompt)
```

### 4.2 Resume Analysis Flow

```
Dashboard → Resume Page → Upload/Select Resume
  → Parsing (loading state)
  → Analysis Results Page
    → ATS Score (hero metric)
    → Category Breakdown (formatting, keywords, content, structure)
    → Improvement Suggestions (prioritized list)
    → Apply Suggestions → Re-analyze → Score Comparison
```

### 4.3 Job Matching Flow

```
Dashboard → Job Match Page → Paste Job Description
  → Select Resume Version
  → Run Match Analysis (loading)
  → Match Results
    → Match Score
    → Matched Skills (green)
    → Missing Skills (red)
    → Tailoring Suggestions
    → [Generate Cover Letter] button
```

### 4.4 Cover Letter Flow

```
Job Match Results → Generate Cover Letter
  → Select Tone (optional)
  → AI Generation (streaming)
  → Review & Edit
  → Save / Copy / Download
```

### 4.5 Interview Coach Flow

```
Dashboard → Interview Coach → New Session
  → Configure: Role, Difficulty, Question Types
  → Start Interview
  → Q&A Loop (AI asks → User answers → AI follow-up)
  → End Interview
  → Evaluation Report
    → Overall Score
    → Category Scores (clarity, relevance, structure, confidence)
    → Per-Question Feedback
    → Improvement Recommendations
  → Save to History
```

### 4.6 Career Roadmap Flow

```
Dashboard → Career Roadmap → Generate Roadmap
  → AI analyzes profile + goals
  → Roadmap displayed (timeline view)
  → Mark milestones complete
  → View recommended resources
```

---

## 5. MVP Scope

### MVP Goal

Deliver a functional, polished product that covers the core job search workflow: upload resume → get ATS score and suggestions → match against a job description → generate a cover letter → practice an interview.

### MVP Features (Phase 1 — Launch)

| # | Feature | Included |
|---|---------|----------|
| 1 | Clerk authentication (email + Google) | ✅ |
| 2 | Onboarding wizard (3 steps) | ✅ |
| 3 | Resume upload (PDF/DOCX) | ✅ |
| 4 | Resume parsing | ✅ |
| 5 | AI resume analysis | ✅ |
| 6 | ATS score with breakdown | ✅ |
| 7 | Improvement suggestions | ✅ |
| 8 | Job description matching | ✅ |
| 9 | AI cover letter generation | ✅ |
| 10 | Interview coach (text-based) | ✅ |
| 11 | Interview evaluation | ✅ |
| 12 | Interview history | ✅ |
| 13 | Basic analytics dashboard | ✅ |
| 14 | Profile management | ✅ |
| 15 | Settings (theme, account) | ✅ |

### MVP Exclusions (Deferred)

- Multiple resume versions
- Resume PDF export
- Career roadmap (Phase 2)
- Advanced analytics / export reports
- Cover letter history
- Saved job descriptions library
- Voice-based interview
- Mobile app
- B2B / team features
- Payment / subscription (free tier only for MVP)

### MVP Timeline Estimate

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Foundation | Week 1–2 | Project setup, auth, DB, base UI |
| Core Resume | Week 3–4 | Upload, parse, analyze, ATS score |
| Job Matching | Week 5 | JD matching, cover letter |
| Interview Coach | Week 6–7 | Mock interview, evaluation, history |
| Dashboard & Polish | Week 8 | Analytics, profile, settings, QA |
| **Total** | **~8 weeks** | **MVP Launch** |

---

## 6. Future Roadmap

### Phase 2 — Enhancement (Months 3–4)

- Career roadmap with milestone tracking
- Multiple resume versions
- Resume PDF export with improvements applied
- Cover letter history linked to applications
- Saved job descriptions library
- Advanced analytics with export
- Email notifications (analysis complete, weekly digest)

### Phase 3 — Growth (Months 5–6)

- Subscription tiers (Free / Pro / Team)
- Stripe payment integration
- Voice-based mock interviews
- LinkedIn profile import
- Job board integration (Indeed, LinkedIn API)
- Application tracker (kanban board)
- Chrome extension for quick JD analysis

### Phase 4 — Scale (Months 7–12)

- B2B for universities and career centers
- Team accounts with admin dashboard
- Custom AI model fine-tuning on hiring data
- Multi-language support
- Mobile app (React Native)
- API for third-party integrations
- White-label solution

---

## 7. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Page load time | < 2s (LCP) |
| API response time | < 500ms (non-AI endpoints) |
| AI response time | < 15s (analysis), streaming for interviews |
| Uptime | 99.9% |
| Data encryption | At rest (Neon) and in transit (TLS) |
| File upload limit | 10 MB per file |
| Concurrent users | 500+ |
| Accessibility | WCAG 2.1 AA |
| Browser support | Chrome, Firefox, Safari, Edge (latest 2 versions) |

---

## 8. Assumptions & Constraints

### Assumptions
- Users have a resume ready to upload (PDF or DOCX)
- Gemini API remains available and performant
- Clerk free tier sufficient for MVP user volume
- Neon free tier sufficient for MVP data volume
- Text-based interview is acceptable for MVP (no voice/video)

### Constraints
- JavaScript only (no TypeScript) per project decision
- Vercel serverless function timeout limits (10s hobby, 60s pro)
- Gemini API rate limits and token costs
- UploadThing free tier file storage limits

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Gemini API downtime | High | Graceful error handling, retry logic, status page |
| Poor resume parsing accuracy | High | Fallback to raw text extraction, manual edit option |
| Slow AI responses | Medium | Streaming UI, progress indicators, background processing |
| Clerk auth issues | High | Session persistence, clear error messages |
| Data privacy concerns | High | Clear privacy policy, data export/delete, no training on user data |
| Scope creep | Medium | Strict MVP boundaries, phased roadmap |

---

## 10. Glossary

| Term | Definition |
|------|-----------|
| ATS | Applicant Tracking System — software used by employers to filter resumes |
| ATS Score | 0–100 rating of how well a resume passes ATS filters |
| JD | Job Description |
| Mock Interview | Simulated interview session with AI interviewer |
| Parsing | Extracting structured data from an uploaded resume file |
| Roadmap | AI-generated career development plan with milestones |
