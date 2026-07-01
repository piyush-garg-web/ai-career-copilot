# AI Career Copilot — Database Schema

**Version:** 1.0  
**Last Updated:** July 1, 2026  
**Status:** Planning  
**ORM:** Prisma  
**Database:** PostgreSQL (Neon)

---

## 1. Entity Relationship Diagram

```
┌──────────┐       ┌──────────┐       ┌─────────────────┐
│   User   │──1:N──│  Resume  │──1:N──│ ResumeAnalysis  │
└────┬─────┘       └────┬─────┘       └─────────────────┘
     │                  │
     │                  │ 1:N
     │             ┌────▼─────┐       ┌──────────────┐
     │             │ JobMatch │──1:N──│ CoverLetter  │
     │             └──────────┘       └──────────────┘
     │
     │ 1:N
     ├──────────┌──────────────────┐
     │          │ InterviewSession │
     │          └────────┬─────────┘
     │                   │ 1:N
     │          ┌────────▼─────────┐
     │          │ InterviewMessage │
     │          └──────────────────┘
     │
     │ 1:N
     ├──────────┌──────────┐
     │          │ Roadmap  │──1:N──┌────────────┐
     │          └──────────┘       │ Milestone  │
     │                             └────────────┘
     │
     │ 1:N
     └──────────┌──────────┐
                │ Activity │
                └──────────┘
```

---

## 2. Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────
// USER
// ─────────────────────────────────────────────

model User {
  id                  String    @id @default(cuid())
  clerkId             String    @unique
  email               String    @unique
  firstName           String?
  lastName            String?
  imageUrl            String?
  bio                 String?
  location            String?
  linkedinUrl         String?
  targetRole          String?
  targetIndustry      String?
  experienceLevel     ExperienceLevel?
  careerGoals         String?
  onboardingComplete  Boolean   @default(false)
  theme               Theme     @default(SYSTEM)
  emailNotifications  Boolean   @default(true)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  deletedAt           DateTime?

  resumes             Resume[]
  jobMatches          JobMatch[]
  coverLetters        CoverLetter[]
  interviewSessions   InterviewSession[]
  roadmaps            Roadmap[]
  activities          Activity[]

  @@index([clerkId])
  @@index([email])
  @@map("users")
}

enum ExperienceLevel {
  ENTRY
  MID
  SENIOR
  EXECUTIVE
}

enum Theme {
  LIGHT
  DARK
  SYSTEM
}

// ─────────────────────────────────────────────
// RESUME
// ─────────────────────────────────────────────

model Resume {
  id          String       @id @default(cuid())
  userId      String
  fileName    String
  fileUrl     String
  fileType    FileType
  fileSize    Int
  status      ResumeStatus @default(UPLOADED)
  parsedData  Json?
  rawText     String?      @db.Text
  isPrimary   Boolean      @default(false)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  user        User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  analyses    ResumeAnalysis[]
  jobMatches  JobMatch[]

  @@index([userId])
  @@index([userId, isPrimary])
  @@index([status])
  @@map("resumes")
}

enum FileType {
  PDF
  DOCX
}

enum ResumeStatus {
  UPLOADED
  PARSING
  PARSED
  ANALYZING
  ANALYZED
  ERROR
}

// ─────────────────────────────────────────────
// RESUME ANALYSIS
// ─────────────────────────────────────────────

model ResumeAnalysis {
  id              String   @id @default(cuid())
  resumeId        String
  atsScore        Int
  previousScore   Int?
  scoreBreakdown  Json
  suggestions     Json
  keywords        Json
  summary         String?  @db.Text
  createdAt       DateTime @default(now())

  resume          Resume   @relation(fields: [resumeId], references: [id], onDelete: Cascade)

  @@index([resumeId])
  @@index([resumeId, createdAt])
  @@map("resume_analyses")
}

// scoreBreakdown JSON structure:
// {
//   "formatting": { "score": 85, "maxScore": 100, "issues": [...] },
//   "keywords": { "score": 72, "maxScore": 100, "issues": [...] },
//   "content": { "score": 90, "maxScore": 100, "issues": [...] },
//   "structure": { "score": 88, "maxScore": 100, "issues": [...] }
// }

// suggestions JSON structure:
// [
//   { "id": "s1", "priority": "high", "category": "keywords", "title": "...", "description": "...", "impact": "+5 ATS" },
//   ...
// ]

// keywords JSON structure:
// {
//   "present": ["JavaScript", "React", ...],
//   "missing": ["TypeScript", "AWS", ...],
//   "overused": ["responsible for", ...]
// }

// ─────────────────────────────────────────────
// JOB MATCH
// ─────────────────────────────────────────────

model JobMatch {
  id              String   @id @default(cuid())
  userId          String
  resumeId        String
  jobTitle        String?
  company         String?
  jobDescription  String   @db.Text
  matchScore      Int
  matchedSkills   Json
  missingSkills   Json
  suggestions     Json
  summary         String?  @db.Text
  createdAt       DateTime @default(now())

  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  resume          Resume        @relation(fields: [resumeId], references: [id], onDelete: Cascade)
  coverLetters    CoverLetter[]

  @@index([userId])
  @@index([resumeId])
  @@index([userId, createdAt])
  @@map("job_matches")
}

// matchedSkills JSON: ["JavaScript", "React", "Node.js", ...]
// missingSkills JSON: [{ "skill": "AWS", "importance": "high" }, ...]
// suggestions JSON: [{ "title": "...", "description": "...", "impact": "+3 match" }, ...]

// ─────────────────────────────────────────────
// COVER LETTER
// ─────────────────────────────────────────────

model CoverLetter {
  id            String          @id @default(cuid())
  userId        String
  jobMatchId    String?
  resumeId      String?
  jobTitle      String?
  company       String?
  tone          CoverLetterTone @default(PROFESSIONAL)
  content       String          @db.Text
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  user          User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  jobMatch      JobMatch?  @relation(fields: [jobMatchId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([jobMatchId])
  @@index([userId, createdAt])
  @@map("cover_letters")
}

enum CoverLetterTone {
  PROFESSIONAL
  ENTHUSIASTIC
  CONCISE
}

// ─────────────────────────────────────────────
// INTERVIEW SESSION
// ─────────────────────────────────────────────

model InterviewSession {
  id              String            @id @default(cuid())
  userId          String
  title           String
  role            String
  difficulty      InterviewDifficulty
  questionTypes   Json
  status          InterviewStatus   @default(ACTIVE)
  overallScore    Int?
  categoryScores  Json?
  evaluation      Json?
  feedback        String?           @db.Text
  duration        Int?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  completedAt     DateTime?

  user            User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages        InterviewMessage[]

  @@index([userId])
  @@index([userId, status])
  @@index([userId, createdAt])
  @@map("interview_sessions")
}

enum InterviewDifficulty {
  EASY
  MEDIUM
  HARD
}

enum InterviewStatus {
  ACTIVE
  COMPLETED
  ABANDONED
}

// questionTypes JSON: ["behavioral", "technical", "situational"]
// categoryScores JSON: { "clarity": 85, "relevance": 78, "structure": 90, "confidence": 72 }
// evaluation JSON: { "overallSummary": "...", "strengths": [...], "weaknesses": [...], "recommendations": [...] }

// ─────────────────────────────────────────────
// INTERVIEW MESSAGE
// ─────────────────────────────────────────────

model InterviewMessage {
  id          String        @id @default(cuid())
  sessionId   String
  role        MessageRole
  content     String        @db.Text
  questionType String?
  feedback    Json?
  createdAt   DateTime      @default(now())

  session     InterviewSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@index([sessionId])
  @@index([sessionId, createdAt])
  @@map("interview_messages")
}

enum MessageRole {
  INTERVIEWER
  CANDIDATE
}

// feedback JSON (per-question, populated during evaluation):
// { "score": 78, "strengths": [...], "improvements": [...] }

// ─────────────────────────────────────────────
// ROADMAP
// ─────────────────────────────────────────────

model Roadmap {
  id          String          @id @default(cuid())
  userId      String
  title       String
  description String?         @db.Text
  targetRole  String
  timeline    String?
  status      RoadmapStatus   @default(ACTIVE)
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  milestones  Milestone[]

  @@index([userId])
  @@index([userId, status])
  @@map("roadmaps")
}

enum RoadmapStatus {
  ACTIVE
  COMPLETED
  ARCHIVED
}

// ─────────────────────────────────────────────
// MILESTONE
// ─────────────────────────────────────────────

model Milestone {
  id            String          @id @default(cuid())
  roadmapId     String
  title         String
  description   String?         @db.Text
  category      MilestoneCategory
  order         Int
  status        MilestoneStatus @default(PENDING)
  resources     Json?
  completedAt   DateTime?
  createdAt     DateTime        @default(now())

  roadmap       Roadmap         @relation(fields: [roadmapId], references: [id], onDelete: Cascade)

  @@index([roadmapId])
  @@index([roadmapId, order])
  @@map("milestones")
}

enum MilestoneCategory {
  SKILL
  CERTIFICATION
  PROJECT
  NETWORKING
  EDUCATION
}

enum MilestoneStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
}

// resources JSON: [{ "title": "...", "url": "...", "type": "course|book|project" }, ...]

// ─────────────────────────────────────────────
// ACTIVITY (Audit / Analytics Feed)
// ─────────────────────────────────────────────

model Activity {
  id          String       @id @default(cuid())
  userId      String
  type        ActivityType
  title       String
  description String?
  metadata    Json?
  createdAt   DateTime     @default(now())

  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, createdAt])
  @@index([userId, type])
  @@map("activities")
}

enum ActivityType {
  RESUME_UPLOADED
  RESUME_ANALYZED
  JOB_MATCHED
  COVER_LETTER_GENERATED
  INTERVIEW_STARTED
  INTERVIEW_COMPLETED
  ROADMAP_CREATED
  MILESTONE_COMPLETED
  PROFILE_UPDATED
}
```

---

## 3. Table Summary

| Table | Description | Est. Rows (1K users) |
|-------|-------------|----------------------|
| `users` | User profiles synced from Clerk | 1,000 |
| `resumes` | Uploaded resume files | 2,000 |
| `resume_analyses` | AI analysis results per resume | 5,000 |
| `job_matches` | Resume-to-JD match results | 3,000 |
| `cover_letters` | Generated cover letters | 2,000 |
| `interview_sessions` | Mock interview sessions | 2,000 |
| `interview_messages` | Messages within sessions | 20,000 |
| `roadmaps` | Career roadmaps | 500 |
| `milestones` | Roadmap milestones | 5,000 |
| `activities` | User activity feed | 15,000 |

---

## 4. Relationships

| Parent | Child | Type | On Delete |
|--------|-------|------|-----------|
| User | Resume | 1:N | Cascade |
| User | JobMatch | 1:N | Cascade |
| User | CoverLetter | 1:N | Cascade |
| User | InterviewSession | 1:N | Cascade |
| User | Roadmap | 1:N | Cascade |
| User | Activity | 1:N | Cascade |
| Resume | ResumeAnalysis | 1:N | Cascade |
| Resume | JobMatch | 1:N | Cascade |
| JobMatch | CoverLetter | 1:N | Set Null |
| InterviewSession | InterviewMessage | 1:N | Cascade |
| Roadmap | Milestone | 1:N | Cascade |

---

## 5. Indexes

### Primary Indexes (Automatic)
All tables use `cuid()` primary keys with automatic B-tree indexes.

### Custom Indexes

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| `users` | `users_clerkId_idx` | `clerkId` | Fast lookup by Clerk ID |
| `users` | `users_email_idx` | `email` | Email lookup |
| `resumes` | `resumes_userId_idx` | `userId` | List user's resumes |
| `resumes` | `resumes_userId_isPrimary_idx` | `userId, isPrimary` | Find primary resume |
| `resumes` | `resumes_status_idx` | `status` | Filter by processing status |
| `resume_analyses` | `resume_analyses_resumeId_idx` | `resumeId` | Analyses for a resume |
| `resume_analyses` | `resume_analyses_resumeId_createdAt_idx` | `resumeId, createdAt` | Latest analysis |
| `job_matches` | `job_matches_userId_idx` | `userId` | User's matches |
| `job_matches` | `job_matches_userId_createdAt_idx` | `userId, createdAt` | Recent matches |
| `cover_letters` | `cover_letters_userId_createdAt_idx` | `userId, createdAt` | Recent letters |
| `interview_sessions` | `interview_sessions_userId_status_idx` | `userId, status` | Active sessions |
| `interview_sessions` | `interview_sessions_userId_createdAt_idx` | `userId, createdAt` | Session history |
| `interview_messages` | `interview_messages_sessionId_createdAt_idx` | `sessionId, createdAt` | Ordered messages |
| `roadmaps` | `roadmaps_userId_status_idx` | `userId, status` | Active roadmaps |
| `milestones` | `milestones_roadmapId_order_idx` | `roadmapId, order` | Ordered milestones |
| `activities` | `activities_userId_createdAt_idx` | `userId, createdAt` | Activity feed |
| `activities` | `activities_userId_type_idx` | `userId, type` | Filter by type |

---

## 6. JSON Field Schemas

### ResumeAnalysis.scoreBreakdown
```json
{
  "formatting": {
    "score": 85,
    "maxScore": 100,
    "issues": ["Inconsistent bullet point style", "Font size varies"]
  },
  "keywords": {
    "score": 72,
    "maxScore": 100,
    "issues": ["Missing industry keywords", "Low keyword density in skills section"]
  },
  "content": {
    "score": 90,
    "maxScore": 100,
    "issues": ["Experience bullets lack quantified results"]
  },
  "structure": {
    "score": 88,
    "maxScore": 100,
    "issues": ["Education section should come after experience"]
  }
}
```

### ResumeAnalysis.suggestions
```json
[
  {
    "id": "s1",
    "priority": "high",
    "category": "keywords",
    "title": "Add missing technical keywords",
    "description": "Include TypeScript, AWS, and Docker in your skills section to match industry standards.",
    "impact": "+5 ATS score"
  }
]
```

### Resume.parsedData
```json
{
  "contact": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123",
    "location": "San Francisco, CA",
    "linkedin": "linkedin.com/in/johndoe"
  },
  "summary": "Experienced software engineer...",
  "experience": [
    {
      "title": "Senior Software Engineer",
      "company": "Tech Corp",
      "location": "San Francisco, CA",
      "startDate": "2021-01",
      "endDate": "present",
      "bullets": ["Led team of 5 engineers...", "Increased performance by 40%..."]
    }
  ],
  "education": [
    {
      "degree": "B.S. Computer Science",
      "institution": "State University",
      "graduationDate": "2019-05"
    }
  ],
  "skills": ["JavaScript", "React", "Node.js", "Python"],
  "certifications": [],
  "projects": []
}
```

### InterviewSession.evaluation
```json
{
  "overallSummary": "Strong performance with room for improvement in behavioral questions.",
  "strengths": [
    "Clear and concise technical explanations",
    "Good use of the STAR method in situational questions"
  ],
  "weaknesses": [
    "Answers to behavioral questions lacked specific examples",
    "Could improve confidence in salary negotiation topic"
  ],
  "recommendations": [
    "Prepare 3-5 STAR stories covering leadership, conflict, and failure",
    "Practice speaking about achievements with quantified results"
  ],
  "questionFeedback": [
    {
      "questionIndex": 0,
      "question": "Tell me about yourself",
      "score": 85,
      "feedback": "Well-structured answer, good flow from education to current role."
    }
  ]
}
```

---

## 7. Data Retention & Cleanup

| Data | Retention | Cleanup Strategy |
|------|-----------|------------------|
| User accounts | Until deleted | Soft delete via `deletedAt` |
| Resumes | Until user deletes | Cascade delete with user |
| Analyses | Indefinite (per resume) | Cascade delete with resume |
| Interview sessions | Indefinite | User can delete individually |
| Activities | 90 days | Cron job to purge old records |
| Cover letters | Indefinite | User can delete individually |

---

## 8. Migration Strategy

1. **Initial migration:** `prisma migrate dev --name init` creates all tables
2. **Seed script:** `prisma/seed.js` creates sample data for development
3. **Production:** `prisma migrate deploy` runs on Vercel deploy
4. **Schema changes:** Always via Prisma migrations, never manual SQL

---

## 9. Query Patterns

### Most Frequent Queries

```javascript
// Get user with primary resume and latest analysis
const user = await prisma.user.findUnique({
  where: { clerkId },
  include: {
    resumes: {
      where: { isPrimary: true },
      include: {
        analyses: { orderBy: { createdAt: 'desc' }, take: 1 }
      }
    }
  }
});

// Dashboard analytics aggregation
const stats = await prisma.$transaction([
  prisma.resumeAnalysis.aggregate({
    where: { resume: { userId } },
    _avg: { atsScore: true },
    _count: true
  }),
  prisma.interviewSession.count({
    where: { userId, status: 'COMPLETED' }
  }),
  prisma.jobMatch.count({ where: { userId } }),
  prisma.coverLetter.count({ where: { userId } })
]);

// Activity feed (paginated)
const activities = await prisma.activity.findMany({
  where: { userId },
  orderBy: { createdAt: 'desc' },
  take: 20,
  skip: page * 20
});

// Interview session with messages
const session = await prisma.interviewSession.findUnique({
  where: { id: sessionId, userId },
  include: {
    messages: { orderBy: { createdAt: 'asc' } }
  }
});
```
