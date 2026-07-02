# API Reference Guide

All backend endpoints are built using **Next.js Route Handlers** (App Router).

## Base URL
*   **Local development**: `http://localhost:3000/api`
*   **Production**: `https://<your-domain>.vercel.app/api`

---

## Conventions

### Authentication
All routes except `/api/webhooks/clerk` require a valid Clerk session. The session is validated via middleware. Unauthenticated requests will return:
```json
{
  "error": "Unauthorized"
}
```

### Standard Response Format

**Success:**
Returns a JSON object representing the resource(s). For collection endpoints, lists are returned directly or wrapped as arrays.

**Error:**
```json
{
  "error": "Human-readable error description"
}
```

---

## Webhooks Endpoint

### POST `/api/webhooks/clerk`
*   **Auth Required**: No (Verified via Clerk webhook signing secret)
*   **Description**: Receives sync payloads from Clerk on user events.
*   **Events Handled**:
    *   `user.created`: Inserts a new record in the `users` table.
    *   `user.updated`: Updates the avatar, name, and email fields.
    *   `user.deleted`: Deletes the user profile and cascades related tables.
*   **Response**:
    ```json
    { "success": true }
    ```

---

## File Upload Endpoint

### POST `/api/uploadthing`
*   **Auth Required**: Yes
*   **Description**: Handles secure streaming upload of PDF/DOCX resumes (Max 10MB).
*   **Client usage**: Managed via UploadThing React Hooks (`useUploadThing`).

---

## User Profile Endpoint

### GET `/api/user`
*   **Auth Required**: Yes
*   **Description**: Retrieve the current authenticated user's profile and preferences.
*   **Response**:
    ```json
    {
      "id": "usr_23kd98sfh...",
      "clerkId": "user_21x...",
      "email": "candidate@example.com",
      "firstName": "Alex",
      "lastName": "Developer",
      "imageUrl": "https://img.clerk.com/...",
      "bio": "Full-stack engineer focusing on React and Node.js.",
      "location": "New York, NY",
      "linkedinUrl": "https://linkedin.com/in/alexdev",
      "targetRole": "Software Engineer",
      "targetIndustry": "Technology",
      "experienceLevel": "MID",
      "careerGoals": "To transition into Technical Lead roles",
      "onboardingComplete": true,
      "theme": "DARK",
      "createdAt": "2026-07-01T12:00:00.000Z",
      "updatedAt": "2026-07-02T13:00:00.000Z"
    }
    ```

### POST `/api/user`
*   **Auth Required**: Yes
*   **Description**: Update the user's profile settings and preferences.
*   **Request Body**:
    ```json
    {
      "bio": "Updated professional bio",
      "location": "Boston, MA",
      "linkedinUrl": "https://linkedin.com/in/alexdev",
      "targetRole": "Senior Software Engineer",
      "targetIndustry": "Technology",
      "experienceLevel": "SENIOR",
      "careerGoals": "Lead a team of engineers",
      "theme": "SYSTEM"
    }
    ```
*   **Response**: The updated user object.

---

## Notifications Endpoints

### GET `/api/notifications`
*   **Auth Required**: Yes
*   **Description**: Fetch recent user notifications.
*   **Response**: Array of notification objects.

---

## Resumes Endpoints

### GET `/api/resumes`
*   **Auth Required**: Yes
*   **Description**: Retrieve all uploaded resumes for the current user.
*   **Response**:
    ```json
    [
      {
        "id": "res_87d9wuf...",
        "fileName": "Alex_Resume_2026.pdf",
        "fileUrl": "https://utfs.io/f/...",
        "fileType": "PDF",
        "fileSize": 142050,
        "status": "ANALYZED",
        "isPrimary": true,
        "createdAt": "2026-07-02T10:00:00.000Z"
      }
    ]
    ```

### POST `/api/resumes`
*   **Auth Required**: Yes
*   **Description**: Save metadata for an uploaded resume file.
*   **Request Body**:
    ```json
    {
      "fileName": "Alex_Resume_2026.pdf",
      "fileUrl": "https://utfs.io/f/...",
      "fileType": "PDF",
      "fileSize": 142050
    }
    ```
*   **Response**: The created resume database record.

### GET `/api/resumes/[id]`
*   **Auth Required**: Yes
*   **Description**: Fetch detailed resume info including `parsedData` and `analysis` (if complete).

### PATCH `/api/resumes/[id]`
*   **Auth Required**: Yes
*   **Description**: Update resume flags (e.g. setting as primary).
*   **Request Body**:
    ```json
    {
      "isPrimary": true
    }
    ```

### DELETE `/api/resumes/[id]`
*   **Auth Required**: Yes
*   **Description**: Remove a resume record and associated analysis from the database.

### POST `/api/resumes/[id]/parse`
*   **Auth Required**: Yes
*   **Description**: Extract raw text content from the uploaded file and update status to `PARSED`.

### POST `/api/resumes/[id]/analyze`
*   **Auth Required**: Yes
*   **Description**: Query Gemini AI to analyze parsed resume text, output scores (ATS, grammar, etc.) and save to `resume_analyses`.

### POST `/api/resumes/[id]/duplicate`
*   **Auth Required**: Yes
*   **Description**: Clone the selected resume record under a new version.

---

## Job Matching Endpoints

### GET `/api/job-matches`
*   **Auth Required**: Yes
*   **Description**: List past job description comparison matches.

### POST `/api/job-matches`
*   **Auth Required**: Yes
*   **Description**: Compare a resume against a newly pasted job description using Gemini AI.
*   **Request Body**:
    ```json
    {
      "resumeId": "res_87d9wuf...",
      "jobDescription": "Full job description text...",
      "title": "Senior React Engineer",
      "company": "Google"
    }
    ```
*   **Response**: Match metrics object including `matchScore`, `matchedSkills`, `missingSkills`, `suggestions`, and `summary`.

---

## Interview Endpoints

### GET `/api/interviews`
*   **Auth Required**: Yes
*   **Description**: Fetch all mock interview sessions.

### POST `/api/interviews`
*   **Auth Required**: Yes
*   **Description**: Generate a new mock interview session based on user parameters.
*   **Request Body**:
    ```json
    {
      "role": "Frontend Developer",
      "difficulty": "MEDIUM",
      "questionTypes": ["TECHNICAL", "BEHAVIORAL"]
    }
    ```
*   **Response**: Created session record along with generated questions.

### POST `/api/interviews/[id]/answer`
*   **Auth Required**: Yes
*   **Description**: Submit answer to a specific interview question.
*   **Request Body**:
    ```json
    {
      "questionId": "qst_1982sd...",
      "answer": "My response to the mock question..."
    }
    ```
*   **Response**: Evaluation score, critique, and ideal sample answer.

### POST `/api/interviews/[id]/complete`
*   **Auth Required**: Yes
*   **Description**: Finalize the session, aggregate category scores, and get a comprehensive evaluation report.
