import React from "react";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { ResumeListView } from "@/components/resume/resume-list-view";

export const metadata = {
  title: "My Resumes | AI Career Copilot",
  description: "Manage and upload your resumes in PDF or Word formats.",
};

export default async function ResumesPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    redirect("/sign-in");
  }

  let dbUser = await db.user.findUnique({
    where: { clerkId },
  });

  if (!dbUser) {
    const user = await currentUser();
    if (user) {
      const email = user.emailAddresses?.[0]?.email_address;
      if (email) {
        dbUser = await db.user.create({
          data: {
            clerkId,
            email,
            firstName: user.firstName || null,
            lastName: user.lastName || null,
            imageUrl: user.imageUrl || null,
          },
        });
      }
    }
  }

  let resumes = [];
  if (dbUser) {
    resumes = await db.resume.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
    });
  }

  return <ResumeListView initialResumes={resumes} />;
}
