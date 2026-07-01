# AI Career Copilot — API Reference

**Version:** 1.0  
**Last Updated:** July 1, 2026  
**Status:** Planning  
**Base URL:** `https://ai-career-copilot.vercel.app/api`  
**Format:** JSON

---

## 1. Conventions

### Authentication
All endpoints except `/api/webhooks/*` require a valid Clerk session. The session is validated via middleware. Unauthenticated requests receive:

```json
{ "error": "Unauthorized", "status": 401 }
```

### Response Format

**Success:**
```json
{
  "data": { ... },
  "meta": { "timestamp": "2026-07-01T12:00:00Z" }
}
```

**Error:**
```json
{
  "error": "Human-readable message",
  "code": "ERROR_CODE",
  "status": 400,
  "details": { ... }
}
```

### Pagination
List endpoints support:
```
?page=0&limit=20&sort=createdAt&order=desc
```

Paginated response includes:
```json
{
  "data": [...],
  "meta": {
    "page": 0,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request / validation error |
| 401 | Unauthorized |
| 403 | Forbidden (not owner) |
| 404 | Not found |
| 409 | Conflict (duplicate) |
| 422 | Unprocessable (AI parsing failed) |
| 429 | Rate limited |
| 500 | Internal server error |

---

## 2. Webhooks

### POST `/api/webhooks/clerk`

**Auth:** Clerk webhook signature verification (no session)

**Events handled:**
- `user.created` — Create User record
- `user.updated` — Update User record
- `user.deleted` — Soft-delete User record

**Request:** Clerk webhook payload (automatic)

**Response:**
```json
{ "received": true }
```

---

## 3. Upload

### POST `/api/uploadthing`

**Auth:** Required (Clerk session)

**Description:** UploadThing route handler for file uploads. Handles resume file uploads (PDF/DOCX, max 10MB).

**Client usage:** Via `@uploadthing/react` `useUploadThing` hook, not direct API call.

**Allowed file types:** `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

**Max file size:** 10 MB

---

## 4. Profile

### GET `/api/profile`

**Auth:** Required

**Description:** Get current user's profile.

**Response:**
```json
{
  "data": {
    "id": "clx...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "imageUrl": "https://...",
    "bio": "Software engineer passionate about...",
    "location": "San Francisco, CA",
    "linkedinUrl": "https://linkedin.com/in/johndoe",
    "targetRole": "Senior Software Engineer",
    "targetIndustry": "Technology",
    "experienceLevel": "MID",
    "careerGoals": "Transition to engineering leadership",
    "onboardingComplete": true,
    "theme": "SYSTEM",
    "emailNotifications": true,
    "createdAt": "2026-07-01T12:00:00Z"
  }
}
```

---

### PATCH `/api/profile`

**Auth:** Required

**Description:** Update user profile.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Updated bio",
  "location": "New York, NY",
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "targetRole": "Staff Engineer",
  "targetIndustry": "FinTech",
  "experienceLevel": "SENIOR",
  "careerGoals": "Lead engineering teams",
  "onboardingComplete": true
}
```

**Response:** Updated profile object (same shape as GET).

**Validation:**
- `firstName`, `lastName`: max 100 chars
- `bio`: max 500 chars
- `linkedinUrl`: valid URL format
- `experienceLevel`: enum `ENTRY | MID | SENIOR | EXECUTIVE`

---

### PATCH `/api/profile/settings`

**Auth:** Required

**Description:** Update user settings (theme, notifications).

**Request:**
```json
{
  "theme": "DARK",
  "emailNotifications": false
}
```

**Response:**
```json
{
  "data": {
    "theme": "DARK",
    "emailNotifications": false
  }
}
```

---

### DELETE `/api/profile`

**Auth:** Required

**Description:** Soft-delete user account and all associated data.

**Response:**
```json
{
  "data": { "deleted": true }
}
```

---

## 5. Resumes

### GET `/api/resumes`

**Auth:** Required

**Description:** List all resumes for the current user.

**Query params:** `?page=0&limit=20`

**Response:**
```json
{
  "data": [
    {
      "id": "clx...",
      "fileName": "john_doe_resume.pdf",
      "fileUrl": "https://utfs.io/...",
      "fileType": "PDF",
      "fileSize": 245760,
      "status": "ANALYZED",
      "isPrimary": true,
      "latestAnalysis": {
        "id": "clx...",
        "atsScore": 78,
        "createdAt": "2026-07-01T12:00:00Z"
      },
      "createdAt": "2026-07-01T11:00:00Z"
    }
  ],
  "meta": { "page": 0, "limit": 20, "total": 1, "totalPages": 1 }
}
```

---

### POST `/api/resumes`

**Auth:** Required

**Description:** Create a resume record after file upload.

**Request:**
```json
{
  "fileName": "john_doe_resume.pdf",
  "fileUrl": "https://utfs.io/f/...",
  "fileType": "PDF",
  "fileSize": 245760
}
```

**Response (201):**
```json
{
  "data": {
    "id": "clx...",
    "fileName": "john_doe_resume.pdf",
    "fileUrl": "https://utfs.io/f/...",
    "fileType": "PDF",
    "fileSize": 245760,
    "status": "UPLOADED",
    "isPrimary": true,
    "createdAt": "2026-07-01T12:00:00Z"
  }
}
```

**Side effects:**
- Creates Activity record (`RESUME_UPLOADED`)
- If first resume, sets `isPrimary = true`

---

### GET `/api/resumes/[id]`

**Auth:** Required (must own resume)

**Description:** Get resume details with parsed data and latest analysis.

**Response:**
```json
{
  "data": {
    "id": "clx...",
    "fileName": "john_doe_resume.pdf",
    "fileUrl": "https://utfs.io/f/...",
    "fileType": "PDF",
    "status": "ANALYZED",
    "parsedData": { "contact": {...}, "experience": [...], "education": [...], "skills": [...] },
    "rawText": "John Doe\nSoftware Engineer\n...",
    "isPrimary": true,
    "analyses": [
      {
        "id": "clx...",
        "atsScore": 78,
        "scoreBreakdown": { "formatting": {...}, "keywords": {...}, "content": {...}, "structure": {...} },
        "suggestions": [{ "id": "s1", "priority": "high", ... }],
        "keywords": { "present": [...], "missing": [...], "overused": [...] },
        "summary": "Your resume shows strong technical skills...",
        "createdAt": "2026-07-01T12:00:00Z"
      }
    ],
    "createdAt": "2026-07-01T11:00:00Z"
  }
}
```

---

### PATCH `/api/resumes/[id]`

**Auth:** Required (must own resume)

**Description:** Update resume metadata.

**Request:**
```json
{
  "isPrimary": true
}
```

**Response:** Updated resume object.

**Side effects:** If `isPrimary = true`, unsets primary on other resumes.

---

### DELETE `/api/resumes/[id]`

**Auth:** Required (must own resume)

**Description:** Delete a resume and all associated analyses.

**Response:**
```json
{ "data": { "deleted": true } }
```

---

### POST `/api/resumes/[id]/parse`

**Auth:** Required (must own resume)

**Description:** Parse uploaded resume file into structured data.

**Request:** No body required.

**Response:**
```json
{
  "data": {
    "id": "clx...",
    "status": "PARSED",
    "parsedData": { "contact": {...}, "experience": [...], ... }
  }
}
```

**Processing:**
1. Sets status to `PARSING`
2. Downloads file from UploadThing URL
3. Extracts text (PDF or DOCX parser)
4. Sends text to Gemini for structured parsing
5. Saves `parsedData` and `rawText`
6. Sets status to `PARSED`

**Errors:**
- `422` if parsing fails (corrupt file, unreadable format)

---

### POST `/api/resumes/[id]/analyze`

**Auth:** Required (must own resume)

**Description:** Run AI analysis on a parsed resume.

**Request:** No body required (resume must be in `PARSED` status).

**Response:**
```json
{
  "data": {
    "id": "clx...",
    "resumeId": "clx...",
    "atsScore": 78,
    "previousScore": null,
    "scoreBreakdown": {
      "formatting": { "score": 85, "maxScore": 100, "issues": [...] },
      "keywords": { "score": 72, "maxScore": 100, "issues": [...] },
      "content": { "score": 90, "maxScore": 100, "issues": [...] },
      "structure": { "score": 88, "maxScore": 100, "issues": [...] }
    },
    "suggestions": [
      {
        "id": "s1",
        "priority": "high",
        "category": "keywords",
        "title": "Add missing technical keywords",
        "description": "Include TypeScript, AWS...",
        "impact": "+5 ATS score"
      }
    ],
    "keywords": {
      "present": ["JavaScript", "React", "Node.js"],
      "missing": ["TypeScript", "AWS", "Docker"],
      "overused": ["responsible for"]
    },
    "summary": "Your resume demonstrates strong technical experience...",
    "createdAt": "2026-07-01T12:00:00Z"
  }
}
```

**Side effects:**
- Creates Activity record (`RESUME_ANALYZED`)
- Sets resume status to `ANALYZED`
- Stores `previousScore` if prior analysis exists

---

## 6. Job Matches

### GET `/api/job-matches`

**Auth:** Required

**Description:** List all job matches for the current user.

**Query params:** `?page=0&limit=20`

**Response:**
```json
{
  "data": [
    {
      "id": "clx...",
      "jobTitle": "Senior Frontend Engineer",
      "company": "TechCorp",
      "matchScore": 82,
      "resumeId": "clx...",
      "createdAt": "2026-07-01T12:00:00Z"
    }
  ],
  "meta": { "page": 0, "limit": 20, "total": 3, "totalPages": 1 }
}
```

---

### POST `/api/job-matches`

**Auth:** Required

**Description:** Create a new job match analysis.

**Request:**
```json
{
  "resumeId": "clx...",
  "jobTitle": "Senior Frontend Engineer",
  "company": "TechCorp",
  "jobDescription": "We are looking for a Senior Frontend Engineer with 5+ years of experience in React, TypeScript..."
}
```

**Validation:**
- `resumeId`: required, must belong to user, must be parsed
- `jobDescription`: required, min 50 chars, max 10,000 chars
- `jobTitle`: optional, max 200 chars
- `company`: optional, max 200 chars

**Response (201):**
```json
{
  "data": {
    "id": "clx...",
    "jobTitle": "Senior Frontend Engineer",
    "company": "TechCorp",
    "matchScore": 82,
    "matchedSkills": ["JavaScript", "React", "Node.js", "CSS"],
    "missingSkills": [
      { "skill": "TypeScript", "importance": "high" },
      { "skill": "GraphQL", "importance": "medium" }
    ],
    "suggestions": [
      {
        "title": "Highlight React experience",
        "description": "Move React projects to the top of your experience section",
        "impact": "+3 match score"
      }
    ],
    "summary": "Strong match for this role with 82% compatibility...",
    "createdAt": "2026-07-01T12:00:00Z"
  }
}
```

**Side effects:** Creates Activity record (`JOB_MATCHED`)

---

### GET `/api/job-matches/[id]`

**Auth:** Required (must own match)

**Description:** Get full job match details.

**Response:** Same shape as POST response with additional fields:
```json
{
  "data": {
    "id": "clx...",
    "resumeId": "clx...",
    "jobTitle": "...",
    "company": "...",
    "jobDescription": "...",
    "matchScore": 82,
    "matchedSkills": [...],
    "missingSkills": [...],
    "suggestions": [...],
    "summary": "...",
    "coverLetters": [
      { "id": "clx...", "tone": "PROFESSIONAL", "createdAt": "..." }
    ],
    "createdAt": "..."
  }
}
```

---

### DELETE `/api/job-matches/[id]`

**Auth:** Required (must own match)

**Response:**
```json
{ "data": { "deleted": true } }
```

---

## 7. Cover Letters

### GET `/api/cover-letters`

**Auth:** Required

**Query params:** `?page=0&limit=20`

**Response:**
```json
{
  "data": [
    {
      "id": "clx...",
      "jobTitle": "Senior Frontend Engineer",
      "company": "TechCorp",
      "tone": "PROFESSIONAL",
      "content": "Dear Hiring Manager,\n\nI am writing to express...",
      "jobMatchId": "clx...",
      "createdAt": "2026-07-01T12:00:00Z"
    }
  ],
  "meta": { "page": 0, "limit": 20, "total": 2, "totalPages": 1 }
}
```

---

### POST `/api/cover-letters`

**Auth:** Required

**Description:** Generate a new AI cover letter.

**Request:**
```json
{
  "resumeId": "clx...",
  "jobMatchId": "clx...",
  "jobTitle": "Senior Frontend Engineer",
  "company": "TechCorp",
  "jobDescription": "We are looking for...",
  "tone": "PROFESSIONAL"
}
```

**Validation:**
- Either `jobMatchId` OR (`jobDescription` + `resumeId`) required
- `tone`: optional, enum `PROFESSIONAL | ENTHUSIASTIC | CONCISE`, default `PROFESSIONAL`

**Response (201):**
```json
{
  "data": {
    "id": "clx...",
    "jobTitle": "Senior Frontend Engineer",
    "company": "TechCorp",
    "tone": "PROFESSIONAL",
    "content": "Dear Hiring Manager,\n\nI am writing to express my strong interest in the Senior Frontend Engineer position at TechCorp...",
    "jobMatchId": "clx...",
    "createdAt": "2026-07-01T12:00:00Z"
  }
}
```

**Side effects:** Creates Activity record (`COVER_LETTER_GENERATED`)

---

### GET `/api/cover-letters/[id]`

**Auth:** Required (must own letter)

**Response:** Full cover letter object.

---

### PATCH `/api/cover-letters/[id]`

**Auth:** Required (must own letter)

**Description:** Update cover letter content (user edits).

**Request:**
```json
{
  "content": "Updated cover letter text..."
}
```

**Response:** Updated cover letter object.

---

### DELETE `/api/cover-letters/[id]`

**Auth:** Required (must own letter)

**Response:**
```json
{ "data": { "deleted": true } }
```

---

## 8. Interviews

### GET `/api/interviews`

**Auth:** Required

**Description:** List interview sessions.

**Query params:** `?page=0&limit=20&status=COMPLETED`

**Response:**
```json
{
  "data": [
    {
      "id": "clx...",
      "title": "Frontend Engineer Interview",
      "role": "Senior Frontend Engineer",
      "difficulty": "MEDIUM",
      "status": "COMPLETED",
      "overallScore": 78,
      "duration": 1200,
      "messageCount": 12,
      "createdAt": "2026-07-01T12:00:00Z",
      "completedAt": "2026-07-01T12:20:00Z"
    }
  ],
  "meta": { "page": 0, "limit": 20, "total": 5, "totalPages": 1 }
}
```

---

### POST `/api/interviews`

**Auth:** Required

**Description:** Create a new interview session.

**Request:**
```json
{
  "title": "Frontend Engineer Interview",
  "role": "Senior Frontend Engineer",
  "difficulty": "MEDIUM",
  "questionTypes": ["behavioral", "technical", "situational"]
}
```

**Validation:**
- `role`: required, max 200 chars
- `difficulty`: enum `EASY | MEDIUM | HARD`
- `questionTypes`: array of strings, min 1, values: `behavioral`, `technical`, `situational`

**Response (201):**
```json
{
  "data": {
    "id": "clx...",
    "title": "Frontend Engineer Interview",
    "role": "Senior Frontend Engineer",
    "difficulty": "MEDIUM",
    "questionTypes": ["behavioral", "technical", "situational"],
    "status": "ACTIVE",
    "messages": [
      {
        "id": "clx...",
        "role": "INTERVIEWER",
        "content": "Hello! Welcome to your mock interview for the Senior Frontend Engineer position. I'll be asking you a mix of behavioral, technical, and situational questions. Let's begin — can you tell me about yourself and your experience with frontend development?",
        "questionType": "behavioral",
        "createdAt": "2026-07-01T12:00:00Z"
      }
    ],
    "createdAt": "2026-07-01T12:00:00Z"
  }
}
```

**Side effects:**
- Creates Activity record (`INTERVIEW_STARTED`)
- Generates first interviewer message via Gemini

---

### GET `/api/interviews/[id]`

**Auth:** Required (must own session)

**Description:** Get interview session with all messages.

**Response:**
```json
{
  "data": {
    "id": "clx...",
    "title": "...",
    "role": "...",
    "difficulty": "MEDIUM",
    "questionTypes": [...],
    "status": "ACTIVE",
    "overallScore": null,
    "categoryScores": null,
    "evaluation": null,
    "duration": null,
    "messages": [
      {
        "id": "clx...",
        "role": "INTERVIEWER",
        "content": "...",
        "questionType": "behavioral",
        "feedback": null,
        "createdAt": "..."
      },
      {
        "id": "clx...",
        "role": "CANDIDATE",
        "content": "...",
        "questionType": null,
        "feedback": null,
        "createdAt": "..."
      }
    ],
    "createdAt": "...",
    "completedAt": null
  }
}
```

---

### DELETE `/api/interviews/[id]`

**Auth:** Required (must own session)

**Response:**
```json
{ "data": { "deleted": true } }
```

---

### POST `/api/interviews/[id]/message`

**Auth:** Required (must own session, session must be ACTIVE)

**Description:** Send a candidate message and receive the next interviewer question.

**Request:**
```json
{
  "content": "I have over 5 years of experience in frontend development, primarily working with React and TypeScript..."
}
```

**Validation:**
- `content`: required, min 10 chars, max 5,000 chars
- Session must be in `ACTIVE` status

**Response:**
```json
{
  "data": {
    "candidateMessage": {
      "id": "clx...",
      "role": "CANDIDATE",
      "content": "I have over 5 years...",
      "createdAt": "2026-07-01T12:05:00Z"
    },
    "interviewerMessage": {
      "id": "clx...",
      "role": "INTERVIEWER",
      "content": "That's great experience. Can you describe a challenging technical problem you solved recently and walk me through your approach?",
      "questionType": "technical",
      "createdAt": "2026-07-01T12:05:01Z"
    }
  }
}
```

---

### POST `/api/interviews/[id]/evaluate`

**Auth:** Required (must own session, session must be ACTIVE)

**Description:** End the interview and generate evaluation.

**Request:** No body required.

**Response:**
```json
{
  "data": {
    "id": "clx...",
    "status": "COMPLETED",
    "overallScore": 78,
    "categoryScores": {
      "clarity": 85,
      "relevance": 78,
      "structure": 90,
      "confidence": 72
    },
    "evaluation": {
      "overallSummary": "Strong performance with room for improvement...",
      "strengths": ["Clear technical explanations", "Good STAR method usage"],
      "weaknesses": ["Behavioral answers lacked specific examples"],
      "recommendations": ["Prepare 3-5 STAR stories", "Practice quantified achievements"],
      "questionFeedback": [
        {
          "questionIndex": 0,
          "question": "Tell me about yourself",
          "score": 85,
          "feedback": "Well-structured answer..."
        }
      ]
    },
    "feedback": "Overall strong interview performance...",
    "duration": 1200,
    "completedAt": "2026-07-01T12:20:00Z"
  }
}
```

**Side effects:**
- Sets session status to `COMPLETED`
- Creates Activity record (`INTERVIEW_COMPLETED`)
- Calculates duration from `createdAt` to now

---

## 9. Roadmaps

### GET `/api/roadmaps`

**Auth:** Required

**Response:**
```json
{
  "data": [
    {
      "id": "clx...",
      "title": "Path to Staff Engineer",
      "targetRole": "Staff Software Engineer",
      "timeline": "18 months",
      "status": "ACTIVE",
      "milestoneCount": 8,
      "completedMilestones": 2,
      "createdAt": "2026-07-01T12:00:00Z"
    }
  ]
}
```

---

### POST `/api/roadmaps`

**Auth:** Required

**Description:** Generate a new AI career roadmap.

**Request:**
```json
{
  "targetRole": "Staff Software Engineer",
  "timeline": "18 months"
}
```

**Response (201):**
```json
{
  "data": {
    "id": "clx...",
    "title": "Path to Staff Engineer",
    "description": "A structured plan to advance from Senior to Staff Engineer...",
    "targetRole": "Staff Software Engineer",
    "timeline": "18 months",
    "status": "ACTIVE",
    "milestones": [
      {
        "id": "clx...",
        "title": "Master System Design",
        "description": "Deep dive into distributed systems...",
        "category": "SKILL",
        "order": 1,
        "status": "PENDING",
        "resources": [
          { "title": "Designing Data-Intensive Applications", "url": "...", "type": "book" }
        ]
      }
    ],
    "createdAt": "2026-07-01T12:00:00Z"
  }
}
```

**Side effects:** Creates Activity record (`ROADMAP_CREATED`)

---

### GET `/api/roadmaps/[id]`

**Auth:** Required (must own roadmap)

**Response:** Full roadmap with all milestones ordered by `order`.

---

### PATCH `/api/roadmaps/[id]/milestones/[milestoneId]`

**Auth:** Required

**Description:** Update milestone status.

**Request:**
```json
{
  "status": "COMPLETED"
}
```

**Response:** Updated milestone object.

**Side effects:** If completed, creates Activity record (`MILESTONE_COMPLETED`)

---

### DELETE `/api/roadmaps/[id]`

**Auth:** Required (must own roadmap)

**Response:**
```json
{ "data": { "deleted": true } }
```

---

## 10. Analytics

### GET `/api/analytics`

**Auth:** Required

**Description:** Get dashboard analytics for the current user.

**Response:**
```json
{
  "data": {
    "overview": {
      "totalResumes": 2,
      "totalAnalyses": 5,
      "averageAtsScore": 78,
      "totalInterviews": 8,
      "averageInterviewScore": 75,
      "totalJobMatches": 4,
      "totalCoverLetters": 3
    },
    "atsScoreTrend": [
      { "date": "2026-06-15", "score": 65 },
      { "date": "2026-06-22", "score": 72 },
      { "date": "2026-07-01", "score": 78 }
    ],
    "interviewPerformance": {
      "clarity": 82,
      "relevance": 75,
      "structure": 88,
      "confidence": 70
    },
    "recentActivity": [
      {
        "id": "clx...",
        "type": "RESUME_ANALYZED",
        "title": "Resume analyzed — ATS score: 78",
        "createdAt": "2026-07-01T12:00:00Z"
      }
    ]
  }
}
```

---

## 11. AI Streaming

### POST `/api/ai/stream`

**Auth:** Required

**Description:** Streaming endpoint for real-time AI responses (cover letter generation, interview messages).

**Request:**
```json
{
  "type": "cover_letter",
  "payload": {
    "resumeId": "clx...",
    "jobDescription": "...",
    "tone": "PROFESSIONAL"
  }
}
```

**Response:** Server-Sent Events (SSE) stream

```
data: {"chunk": "Dear Hiring Manager,"}
data: {"chunk": "\n\nI am writing to express"}
data: {"chunk": " my strong interest..."}
data: {"done": true, "fullContent": "Dear Hiring Manager,\n\n..."}
```

**Supported types:** `cover_letter`, `interview_message`

---

## 12. Rate Limiting

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| AI endpoints (analyze, match, generate, evaluate) | 10 requests | 1 minute |
| Interview messages | 30 requests | 1 minute |
| File uploads | 5 requests | 1 minute |
| General CRUD | 60 requests | 1 minute |

Rate limit headers:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1700000060
```

Exceeded response:
```json
{
  "error": "Rate limit exceeded. Please try again later.",
  "code": "RATE_LIMITED",
  "status": 429,
  "details": { "retryAfter": 45 }
}
```
