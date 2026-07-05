# Features Guide

**AI Career Copilot** is designed to streamline your career progression by offering a unified suite of tools for resume analysis, ATS optimization, skill gap alignment, and interactive mock interviews.

---

## 1. Authentication & Onboarding
*   **Clerk Identity Provider**: Secured via industry-standard authentication (OAuth for GitHub/Google, Email/Password, Magic Links).
*   **Protected Access routes**: Unauthorized users are automatically redirected to Clerk's sign-in flow via Next.js Middleware.
*   **User Onboarding Wizard**: A structured onboarding questionnaire collect user background metrics such as:
    *   Target Job Title / Role
    *   Target Industry
    *   Experience Level (Entry, Mid, Senior, Executive)
    *   Career Goals

---

## 2. Resume Management
*   **Secure Multi-Format Uploads**: Leverages **UploadThing** for seamless uploading of PDFs and DOCX files up to 10MB.
*   **Local Document Parsing**:
    *   Uses `pdf-parse` to extract text from PDF files.
    *   Uses `mammoth` to extract structured content from Word Documents (`.docx`).
*   **Primary Resume Assignment**: Users can mark a specific resume version as "Primary" to serve as the default profile for Job Matching and Interviews.
*   **AI-Powered Resume Analysis**: Integrates the **Google Gemini API** to analyze the raw parsed text and evaluate:
    *   **ATS Score**: Industry-standard parser compliance index.
    *   **Section-by-Section Score**: Specific ratings for Experience, Education, Projects, and Grammar.
    *   **Actionable Corrections**: List of spelling fixes, formatting adjustments, and impact verb recommendations.
    *   **Keyword Suggestions**: Recommendations for missing technical skills and domains.

---

## 3. Job Matching
*   **Job Description Analyzer**: Paste any text-based job description into the portal to analyze alignment.
*   **Match Score Calculation**: Compare the user's primary resume with the target job posting to output a percentage score.
*   **Missing Keywords Detection**: Highlight vital technical skills, certifications, or toolkits mentioned in the job description but absent from the user's resume.
*   **AI Recommendations**: Detailed structural tips explaining how the user can rewrite their bullet points or frame their experiences to align with the specific job description requirements.

---

## 4. AI Interview Coach
*   **Tailored Interview Sessions**: Generate mock interview series based on the user's Primary Resume, Target Role, and chosen parameters:
    *   **Difficulty Settings**: Easy, Medium, or Hard.
    *   **Question Categories**: Behavioral (STAR method), Technical (programming/system design), and Situational.
*   **Interactive Chat Session**: A turn-based mock interview interface where the coach presents a question and the candidate submits their text response.
*   **Interactive Evaluation & Scoring**:
    *   Submit answers to receive individual scores and critical feedback.
    *   Generates a model "Ideal Answer" for comparison to highlight areas of improvement.
*   **Comprehensive Performance Summary**: Completing the session triggers a final review containing:
    *   Overall Performance rating.
    *   Category-specific scores.
    *   Detailed feedback summary with strengths, weaknesses, and a full conversation history.

---

## 5. Premium Membership Management
*   **Premium Membership Page**: A dedicated page for premium users to manage their subscription with:
    *   **Premium Header**: Beautiful gradient card with crown icon and thank you message
    *   **Premium Statistics Cards**: Displaying Premium Since, Lifetime Access, Features Unlocked, and Membership Status
    *   **Current Membership Details**: Current plan, status, purchase date, payment status, payment provider, payment ID, and transaction status
    *   **Unlocked Features Checklist**: AI Voice Mock Interview, AI Video Mock Interview, Multilingual Support, Future Premium Features, Priority Feature Access, and Premium Experience
    *   **Payment Details**: Amount paid, currency, purchase time, transaction ID, order ID, and payment method
    *   **Future Benefits Card**: Information about automatic access to all new premium features
    *   **Account Status**: Premium Since, Lifetime Membership, Secure Payment Verified, and Database Synced
    *   **Payment History**: Complete transaction history with status badges
*   **PDF Receipt Generation**: Professional PDF receipt generation including:
    *   CareerCopilot logo and branding
    *   Invoice number
    *   Customer details (name, email)
    *   Payment details (Payment ID, Order ID, Plan Name, Amount, Currency, Payment Provider, Purchase Date, Transaction Status)
    *   Lifetime Premium badge
    *   Thank you message
*   **Contact Support Integration**: Pre-filled email with:
    *   Support email address
    *   Subject: Premium Membership Support
    *   Pre-filled message with Payment ID and Order ID
*   **Smart Redirects**: Premium users are automatically redirected to the membership management page when clicking "Manage Subscription" or accessing /upgrade
*   **Authentication & Database Integration**: All premium information is fetched from authenticated user and database (no localStorage/sessionStorage usage)

---

## 6. Dashboard & Analytics
*   **Performance Metrics Dashboard**: Get a birds-eye view of your application health:
    *   Latest ATS score statistics.
    *   Recent job match results.
    *   Interview history timeline and performance trends.
*   **System Settings**: Toggle system themes (Light, Dark, System) and update profile information at any time.
