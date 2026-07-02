import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import LandingPageClient from "@/components/landing/LandingPageClient";

export const metadata = {
  title: "AI Career Copilot",
  description: "Optimize your resume, evaluate ATS compliance scores, discover key skill gaps, and practice behavioral and technical mock interviews with Generative AI feedback.",
  icons: {
    icon: "/icon.jpg",
    shortcut: "/icon.jpg",
    apple: "/icon.jpg",
  },
  keywords: [
    "AI Career Coach",
    "Resume Analyzer",
    "ATS Optimization",
    "Mock Interviews",
    "STAR Method Practice",
    "Job Alignment Match",
  ],
  openGraph: {
    title: "AI Career Copilot - Optimize Resumes & Ace Mocks",
    description: "Evaluate your ATS compliance, find keyword alignment with target jobs, and conduct interactive AI-driven interview coach sessions.",
    url: "https://ai-career-copilot-ehmy.vercel.app",
    siteName: "AI Career Copilot",
    images: [
      {
        url: "/screenshots/dashboard.png",
        width: 1200,
        height: 630,
        alt: "AI Career Copilot Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Career Copilot - Optimize Resumes & Ace Mocks",
    description: "Generative AI resume audits, ATS score checkers, and conversational interview coach panels to accelerate your hiring search.",
    images: ["/screenshots/dashboard.png"],
  },
};

export default async function Home() {
  const { userId } = await auth();
  let dbUser = null;
  let userReview = null;

  if (userId) {
    redirect("/dashboard");
  }

  // Fetch initial reviews (page 1, limit 10, newest first)
  const [initialReviews, totalReviews, ratingAggregate] = await Promise.all([
    db.review.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            imageUrl: true,
            targetRole: true,
          },
        },
      },
    }),
    db.review.count(),
    db.review.aggregate({
      _avg: {
        rating: true,
      },
    }),
  ]);

  const initialAverageRating = ratingAggregate._avg.rating
    ? parseFloat(ratingAggregate._avg.rating.toFixed(1))
    : 0;

  const initialHasMore = totalReviews > 10;

  return (
    <LandingPageClient
      initialReviews={initialReviews}
      initialTotal={totalReviews}
      initialAverage={initialAverageRating}
      initialHasMore={initialHasMore}
      isAuthenticated={!!userId}
      currentUserReview={userReview}
    />
  );
}
