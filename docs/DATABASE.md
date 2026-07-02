# Database Schema Reference

This project uses **PostgreSQL** hosted on **Neon DB**, structured and queried using **Prisma ORM**.

---

## 1. Entity-Relationship Diagram (ERD)

The diagram below outlines the core tables and relationships:

```
    ┌──────────┐ 1      * ┌──────────┐ 1      1 ┌────────────────┐
    │   User   ├─────────►│  Resume  ├─────────►│ ResumeAnalysis │
    └──┬────┬──┘          └────┬─────┘          └────────────────┘
       │    │                  │ 1
       │    │                  │
       │    │ 1                │ *
       │    └─────────────┐    ├──────────────┐
       │                  │    │              │
       │                  ▼    ▼              ▼
       │ 1              ┌──────────┐ *      * ┌──────────┐
       ├───────────────►│ JobMatch │◄─────────┤ JobDesc  │
       │                └──────────┘          └──────────┘
       │
       │ 1            * ┌──────────┐ 1      * ┌──────────┐ 1      1 ┌──────────┐
       └───────────────►│ IntvSess ├─────────►│ IntvQuest├─────────►│ IntvAns  │
                        └──────────┘          └──────────┘          └──────────┘
```

---

## 2. Models Specification

### User (`users`)
Represents registered candidates synchronized from Clerk Authentication.

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id`, `@default(cuid())` | Unique user identifier |
| `clerkId` | `String` | `@unique` | Reference ID mapped from Clerk identity provider |
| `email` | `String` | `@unique` | User primary email address |
| `firstName` | `String?` | | User first name |
| `lastName` | `String?` | | User last name |
| `imageUrl` | `String?` | | Avatar image URL |
| `bio` | `String?` | `@db.Text` | Short bio / professional summary |
| `location` | `String?` | | Country / city location |
| `linkedinUrl` | `String?` | | LinkedIn profile link |
| `targetRole` | `String?` | | Target career role |
| `targetIndustry`| `String?` | | Target business domain/industry |
| `experienceLevel`| `ExperienceLevel?`| | Enum representing user seniority |
| `careerGoals` | `String?` | `@db.Text` | Detailed long-term career goals |
| `onboardingComplete`| `Boolean`| `@default(false)` | Flag identifying onboarding status |
| `theme` | `Theme` | `@default(SYSTEM)` | System aesthetic interface theme preference |
| `createdAt` | `DateTime` | `@default(now())` | Creation date |
| `updatedAt` | `DateTime` | `@updatedAt` | Auto-updating modification timestamp |

---

### Resume (`resumes`)
Represents uploaded candidate resumes.

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id`, `@default(cuid())` | Unique resume identifier |
| `userId` | `String` | | Relational pointer to owner User |
| `fileName` | `String` | | Uploaded document filename |
| `fileUrl` | `String` | | Secure URL hosted on UploadThing storage |
| `fileType` | `FileType` | | Enum type: `PDF` or `DOCX` |
| `fileSize` | `Int` | | Document file size in bytes |
| `status` | `ResumeStatus` | `@default(UPLOADED)` | Document parsing and analysis state |
| `version` | `Int` | `@default(1)` | Document revision version index |
| `parsedData` | `Json?` | | Structured extracted JSON information |
| `rawText` | `String?` | `@db.Text` | Extracted raw text content |
| `parsingError`| `String?` | `@db.Text` | Error summary if parsing fails |
| `isPrimary` | `Boolean` | `@default(false)` | Identifies default primary resume |
| `createdAt` | `DateTime` | `@default(now())` | Upload timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Auto-updating modification timestamp |

---

### Resume Analysis (`resume_analyses`)
AI evaluation records mapped to individual resumes.

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id`, `@default(cuid())` | Unique analysis identifier |
| `resumeId` | `String` | `@unique` | Relational pointer to analyzed Resume |
| `overallScore`| `Int` | | Synthesized aggregate resume rating (0-100) |
| `atsScore` | `Int` | | Estimated ATS compliance score (0-100) |
| `skillsScore` | `Int` | | Skill formatting evaluation rating (0-100) |
| `experienceScore`| `Int` | | Professional achievements rating (0-100) |
| `educationScore`| `Int` | | Academic section evaluation score (0-100) |
| `projectsScore`| `Int` | | Project listing evaluation score (0-100) |
| `grammarScore`| `Int` | | Language correctness and formatting score (0-100) |
| `scoreBreakdown`| `Json?` | | Granular breakdown metrics for scores |
| `suggestions` | `Json?` | | Actionable improvement suggestions |
| `keywords` | `Json?` | | Missing domain/skill keywords suggested by AI |
| `summary` | `String?` | `@db.Text` | Brief overall text assessment summary |
| `createdAt` | `DateTime` | `@default(now())` | Evaluation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Modification timestamp |

---

### Job Description (`job_descriptions`)
Pastes of target role job descriptions.

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id`, `@default(cuid())` | Unique job description identifier |
| `userId` | `String` | | Relational pointer to user |
| `title` | `String?` | | Job title |
| `company` | `String?` | | Name of hiring company |
| `content` | `String` | `@db.Text` | Raw pasted job description content |
| `source` | `String?` | | Link source or source reference |
| `createdAt` | `DateTime` | `@default(now())` | Pasted timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Modification timestamp |

---

### Job Match (`job_matches`)
Comparison results between a Resume and a Job Description.

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id`, `@default(cuid())` | Unique job match identifier |
| `userId` | `String` | | Relational pointer to user |
| `resumeId` | `String` | | Relational pointer to compared Resume |
| `jobDescriptionId`| `String`| | Relational pointer to JobDescription |
| `matchScore` | `Int` | | Overlapping score rating (0-100%) |
| `matchedSkills`| `Json` | | List of matching skills detected |
| `missingSkills`| `Json` | | List of missing skills detected |
| `matchedKeywords`| `Json` | | List of matching keywords |
| `missingKeywords`| `Json` | | List of missing keywords |
| `suggestions` | `Json` | | Steps to align resume to job description |
| `analysis` | `Json?` | | Deep review structure provided by AI |
| `summary` | `String?` | `@db.Text` | Short textual summary overview |
| `createdAt` | `DateTime` | `@default(now())` | Matching execution timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Modification timestamp |

---

### Interview Session (`interview_sessions`)
Dynamic mock interviews.

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id`, `@default(cuid())` | Unique session identifier |
| `userId` | `String` | | Relational pointer to candidate User |
| `title` | `String` | | Title (e.g. "Senior React Engineer Mock") |
| `role` | `String` | | Interview target role |
| `difficulty` | `Difficulty` | | Difficulty: `EASY`, `MEDIUM`, `HARD` |
| `questionTypes`| `Json` | | Array of chosen question types |
| `status` | `InterviewStatus`| `@default(ACTIVE)` | Session status: `ACTIVE`, `COMPLETED`, `ABANDONED` |
| `overallScore`| `Int?` | | Aggregate final evaluation score (0-100) |
| `categoryScores`| `Json?` | | Score breakdown by categories |
| `evaluation` | `Json?` | | Structured performance summary provided by AI |
| `feedback` | `String?` | `@db.Text` | Final overall critique text |
| `duration` | `Int?` | | Interview duration in seconds |
| `createdAt` | `DateTime` | `@default(now())` | Creation date |
| `updatedAt` | `DateTime` | `@updatedAt` | Modification timestamp |
| `completedAt` | `DateTime?` | | Completion timestamp |

---

### Interview Question (`interview_questions`)
Individual generated questions belonging to a session.

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id`, `@default(cuid())` | Unique question identifier |
| `sessionId` | `String` | | Relational pointer to InterviewSession |
| `content` | `String` | `@db.Text` | Text of the generated question |
| `questionType`| `QuestionType` | | Type: `BEHAVIORAL`, `TECHNICAL`, `SITUATIONAL` |
| `order` | `Int` | | Sequencing index for session flow |
| `createdAt` | `DateTime` | `@default(now())` | Creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Modification timestamp |

---

### Interview Answer (`interview_answers`)
Candidate responses mapped to specific questions.

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id`, `@default(cuid())` | Unique answer identifier |
| `questionId` | `String` | `@unique` | Relational pointer to InterviewQuestion |
| `content` | `String` | `@db.Text` | Candidate's text answer response |
| `score` | `Int?` | | Score given to this answer (0-100) |
| `feedback` | `String?` | `@db.Text` | Review feedback from AI Coach |
| `improvedAnswer`| `String?`| `@db.Text` | Model ideal answer generated by AI |
| `analysis` | `Json?` | | Structured response metrics |
| `createdAt` | `DateTime` | `@default(now())` | Submission timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Modification timestamp |

---

## 3. Enumerations

### `ExperienceLevel`
*   `ENTRY`: 0-2 years experience
*   `MID`: 3-5 years experience
*   `SENIOR`: 6-10 years experience
*   `EXECUTIVE`: 10+ years experience / management

### `Theme`
*   `LIGHT`: Clean light mode styling
*   `DARK`: Midnight dark mode UI
*   `SYSTEM`: Defaults to user client preferences

### `FileType`
*   `PDF`: Portable Document Format
*   `DOCX`: Microsoft Word document

### `ResumeStatus`
*   `UPLOADED`: Stored in repository database
*   `PARSING`: Running local parser extract text
*   `PARSED`: Raw text stored in model metadata
*   `ANALYZING`: Waiting for AI analysis payload
*   `ANALYZED`: Metric results ready for user display
*   `ERROR`: Encountered file reading or API parsing failure

### `Difficulty`
*   `EASY`: Basic behavioral and conversational prompts
*   `MEDIUM`: Industry-standard engineering and scenario review
*   `HARD`: Stress test engineering, architecture, and advanced STAR questions

### `InterviewStatus`
*   `ACTIVE`: Session in progress / awaiting answers
*   `COMPLETED`: Session submitted and fully compiled by AI
*   `ABANDONED`: Cancelled by user before completion

### `QuestionType`
*   `BEHAVIORAL`: Examines teamwork, conflict resolution, past experience (STAR)
*   `TECHNICAL`: Evaluates coding concepts, system design, domain knowledge
*   `SITUATIONAL`: Simulates workplace problems and reactions
