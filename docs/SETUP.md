# Setup and Installation Guide

Follow this guide to get **AI Career Copilot** running on your local machine and to deploy it to production.

---

## Prerequisites

Before you begin, ensure you have the following installed:
*   **Node.js**: `v18.x` or higher (tested on `v20+`)
*   **npm** or **yarn** / **pnpm**
*   **Git**

You will also need accounts and credentials for the following services:
1.  **Neon DB (PostgreSQL)**: Or any alternative PostgreSQL instance.
2.  **Clerk**: For user authentication.
3.  **UploadThing**: For secure resume uploads.
4.  **Google Gemini API**: For powering the AI analysis and mock interviews.

---

## Local Setup Steps

### 1. Clone the Repository
```bash
git clone https://github.com/piyushgarg6702-cyber/ai-career-copilot.git
cd ai-career-copilot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a file named `.env` in the root of the project:
```bash
cp .env.example .env
```
Fill in the credentials as explained in the **Environment Variables** section below.

### 4. Database Initialization
This project uses **Prisma** as the ORM. Run the following commands to synchronize the database schema and generate the client:
```bash
# Push the Prisma schema directly to your database instance
npx prisma db push

# Generate the Prisma Client
npx prisma generate
```

### 5. Running the Application
To launch the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

---

## Environment Variables

Here is a list of the environment variables required in `.env`:

| Variable | Description | Example / Format |
| :--- | :--- | :--- |
| **`DATABASE_URL`** | Neon PostgreSQL connection string (Transaction connection pooled) | `postgresql://user:pass@host/db?sslmode=require` |
| **`DIRECT_URL`** | Neon PostgreSQL connection string (Direct connection for migrations) | `postgresql://user:pass@host/db?sslmode=require` |
| **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`** | Clerk Publishable API key | `pk_test_...` |
| **`CLERK_SECRET_KEY`** | Clerk Secret API key | `sk_test_...` |
| **`NEXT_PUBLIC_CLERK_SIGN_IN_URL`** | Custom Sign-In page URL | `/sign-in` |
| **`NEXT_PUBLIC_CLERK_SIGN_UP_URL`** | Custom Sign-Up page URL | `/sign-up` |
| **`NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`**| Page to redirect to after successful sign-in | `/dashboard` |
| **`NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`**| Page to redirect to after successful sign-up | `/dashboard` |
| **`UPLOADTHING_SECRET`** | UploadThing account secret key | `sk_live_...` or `sk_test_...` |
| **`UPLOADTHING_APP_ID`** | UploadThing App ID | Available in UploadThing developer dashboard |
| **`GEMINI_API_KEY`** | Google Gemini API key | Get from Google AI Studio |

---

## Clerk Webhook Setup (Required for Syncing Users)
To sync Clerk identity profiles with the database:
1.  Navigate to your **Clerk Dashboard > Webhooks**.
2.  Add a new endpoint targeting `https://<YOUR_DEPLOYED_URL>/api/webhooks/clerk`.
3.  Subscribe to the following events:
    *   `user.created`
    *   `user.updated`
    *   `user.deleted`
4.  Copy the Webhook Secret key and use it to verify incoming webhooks if needed (configured in Clerk Dashboard).

---

## Production Deployment on Vercel

AI Career Copilot is optimized for deployment on Vercel.

### Steps to Deploy:
1.  **Push to GitHub**: Push your local repository to your GitHub account.
2.  **Import to Vercel**:
    *   Go to [Vercel](https://vercel.com/) and click **Add New > Project**.
    *   Import the `ai-career-copilot` repository.
3.  **Environment Variables**:
    *   In the project settings, navigate to the **Environment Variables** section.
    *   Copy and paste all key-value pairs from your local `.env` file.
4.  **Install & Build Command**:
    *   Vercel will auto-detect Next.js and apply correct settings.
    *   *Note*: Ensure that the Build Command matches `next build`.
5.  **Click Deploy**: Vercel will build the project and launch your deployment.
