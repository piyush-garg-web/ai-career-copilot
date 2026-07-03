// src/app/api/user/route.js

import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

/**
 * GET /api/user
 * Fetches the authenticated user's profile, settings, and all related portfolio models.
 */
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user = await db.user.findUnique({
      where: { clerkId },
      include: {
        education: { orderBy: { startYear: "asc" } },
        experience: { orderBy: { startDate: "asc" } },
        projects: { orderBy: { createdAt: "desc" } },
        certifications: { orderBy: { issueDate: "desc" } },
        languages: { orderBy: { language: "asc" } },
        achievements: { orderBy: { createdAt: "desc" } },
      },
    });

    try {
      // Query Clerk user object to fill/refresh missing name or email fields
      const clerkUser = await currentUser();
      if (clerkUser) {
        const email = clerkUser.emailAddresses?.[0]?.emailAddress || (user ? user.email : `user_${clerkId}@clerk.local`);
        const firstName = clerkUser.firstName || (user ? user.firstName : null);
        const lastName = clerkUser.lastName || (user ? user.lastName : null);
        const imageUrl = clerkUser.imageUrl || (user ? user.imageUrl : null);

        if (
          !user ||
          user.email !== email ||
          user.firstName !== firstName ||
          user.lastName !== lastName ||
          user.imageUrl !== imageUrl
        ) {
          // Upsert/Update the user record to match Clerk
          user = await db.user.upsert({
            where: { clerkId },
            update: {
              email,
              firstName,
              lastName,
              imageUrl,
            },
            create: {
              clerkId,
              email,
              firstName,
              lastName,
              imageUrl,
            },
            include: {
              education: { orderBy: { startYear: "asc" } },
              experience: { orderBy: { startDate: "asc" } },
              projects: { orderBy: { createdAt: "desc" } },
              certifications: { orderBy: { issueDate: "desc" } },
              languages: { orderBy: { language: "asc" } },
              achievements: { orderBy: { createdAt: "desc" } },
            },
          });
        }
      }
    } catch (clerkErr) {
      console.warn("[GET_USER_CLERK_SYNC_WARN]:", clerkErr);
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("[GET_USER_ERROR]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/user
 * Updates the user's core profile and synchronizes related list records transactionally.
 */
export async function POST(req) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      bio,
      location,
      linkedinUrl,
      targetRole,
      targetIndustry,
      experienceLevel,
      careerGoals,
      theme,
      phone,
      country,
      timezone,
      githubUrl,
      portfolioUrl,
      leetcodeUrl,
      hackerrankUrl,
      codeforcesUrl,
      twitterUrl,
      mediumUrl,
      behanceUrl,
      dribbbleUrl,
      dob,
      preferredContact,
      dreamCompany,
      employmentType,
      expectedSalary,
      prefWorkLocation,
      openToRelocation,
      yearsOfExperience,
      noticePeriod,
      currentStatus,
      skills,
      aiPreferences,
      notificationSettings,
      privacySettings,
      careerGoalsTimeline,
      securitySettings,
      connectedAccounts,
      resumePreferences,
      jobPreferences,
      accessibilitySettings,
      appearanceSettings,
      education,
      experience,
      projects,
      certifications,
      languages,
      achievements,
    } = body;

    // Validate experience level if provided
    const validExpLevels = ["ENTRY", "MID", "SENIOR", "EXECUTIVE"];
    if (experienceLevel && !validExpLevels.includes(experienceLevel)) {
      return NextResponse.json({ error: "Invalid experience level" }, { status: 400 });
    }

    // Validate theme if provided
    const validThemes = ["LIGHT", "DARK", "SYSTEM"];
    if (theme && !validThemes.includes(theme)) {
      return NextResponse.json({ error: "Invalid theme type" }, { status: 400 });
    }

    // 1. Update Core User Details
    const user = await db.user.update({
      where: { clerkId },
      data: {
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
        ...(linkedinUrl !== undefined && { linkedinUrl }),
        ...(targetRole !== undefined && { targetRole }),
        ...(targetIndustry !== undefined && { targetIndustry }),
        ...(experienceLevel !== undefined && { experienceLevel }),
        ...(careerGoals !== undefined && { careerGoals }),
        ...(theme !== undefined && { theme }),
        ...(phone !== undefined && { phone }),
        ...(country !== undefined && { country }),
        ...(timezone !== undefined && { timezone }),
        ...(githubUrl !== undefined && { githubUrl }),
        ...(portfolioUrl !== undefined && { portfolioUrl }),
        ...(leetcodeUrl !== undefined && { leetcodeUrl }),
        ...(hackerrankUrl !== undefined && { hackerrankUrl }),
        ...(codeforcesUrl !== undefined && { codeforcesUrl }),
        ...(twitterUrl !== undefined && { twitterUrl }),
        ...(mediumUrl !== undefined && { mediumUrl }),
        ...(behanceUrl !== undefined && { behanceUrl }),
        ...(dribbbleUrl !== undefined && { dribbbleUrl }),
        ...(dob !== undefined && { dob }),
        ...(preferredContact !== undefined && { preferredContact }),
        ...(dreamCompany !== undefined && { dreamCompany }),
        ...(employmentType !== undefined && { employmentType }),
        ...(expectedSalary !== undefined && { expectedSalary }),
        ...(prefWorkLocation !== undefined && { prefWorkLocation }),
        ...(openToRelocation !== undefined && { openToRelocation }),
        ...(yearsOfExperience !== undefined && { 
          yearsOfExperience: yearsOfExperience === null || yearsOfExperience === "" ? null : parseFloat(yearsOfExperience) 
        }),
        ...(noticePeriod !== undefined && { noticePeriod }),
        ...(currentStatus !== undefined && { currentStatus }),
        ...(skills !== undefined && { skills }),
        ...(aiPreferences !== undefined && { aiPreferences }),
        ...(notificationSettings !== undefined && { notificationSettings }),
        ...(privacySettings !== undefined && { privacySettings }),
        ...(careerGoalsTimeline !== undefined && { careerGoalsTimeline }),
        ...(securitySettings !== undefined && { securitySettings }),
        ...(connectedAccounts !== undefined && { connectedAccounts }),
        ...(resumePreferences !== undefined && { resumePreferences }),
        ...(jobPreferences !== undefined && { jobPreferences }),
        ...(accessibilitySettings !== undefined && { accessibilitySettings }),
        ...(appearanceSettings !== undefined && { appearanceSettings }),
      },
    });

    const userId = user.id;

    // 2. Sync Education
    if (education !== undefined && Array.isArray(education)) {
      await db.education.deleteMany({ where: { userId } });
      if (education.length > 0) {
        await db.education.createMany({
          data: education.map((edu) => ({
            userId,
            college: edu.college || "",
            degree: edu.degree || "",
            branch: edu.branch || "",
            cgpa: edu.cgpa || "",
            startYear: String(edu.startYear || ""),
            endYear: String(edu.endYear || ""),
            achievements: edu.achievements || "",
          })),
        });
      }
    }

    // 3. Sync Work Experience
    if (experience !== undefined && Array.isArray(experience)) {
      await db.workExperience.deleteMany({ where: { userId } });
      if (experience.length > 0) {
        await db.workExperience.createMany({
          data: experience.map((exp) => ({
            userId,
            company: exp.company || "",
            role: exp.role || "",
            employmentType: exp.employmentType || "",
            startDate: String(exp.startDate || ""),
            endDate: exp.currentJob ? null : String(exp.endDate || ""),
            currentJob: !!exp.currentJob,
            responsibilities: exp.responsibilities || "",
            achievements: exp.achievements || "",
            technologies: exp.technologies || [],
          })),
        });
      }
    }

    // 4. Sync Projects
    if (projects !== undefined && Array.isArray(projects)) {
      await db.project.deleteMany({ where: { userId } });
      if (projects.length > 0) {
        await db.project.createMany({
          data: projects.map((proj) => ({
            userId,
            name: proj.name || "",
            description: proj.description || "",
            techStack: proj.techStack || [],
            githubLink: proj.githubLink || "",
            liveDemo: proj.liveDemo || "",
            role: proj.role || "",
            duration: proj.duration || "",
            achievements: proj.achievements || "",
            highlighted: !!proj.highlighted,
          })),
        });
      }
    }

    // 5. Sync Certifications
    if (certifications !== undefined && Array.isArray(certifications)) {
      await db.certification.deleteMany({ where: { userId } });
      if (certifications.length > 0) {
        await db.certification.createMany({
          data: certifications.map((cert) => ({
            userId,
            name: cert.name || "",
            issuer: cert.issuer || "",
            issueDate: String(cert.issueDate || ""),
            credentialUrl: cert.credentialUrl || "",
            expiry: cert.expiry || "",
          })),
        });
      }
    }

    // 6. Sync Languages
    if (languages !== undefined && Array.isArray(languages)) {
      await db.languageProficiency.deleteMany({ where: { userId } });
      if (languages.length > 0) {
        await db.languageProficiency.createMany({
          data: languages.map((lang) => ({
            userId,
            language: lang.language || "",
            proficiency: lang.proficiency || "Intermediate",
          })),
        });
      }
    }

    // 7. Sync Achievements
    if (achievements !== undefined && Array.isArray(achievements)) {
      await db.achievement.deleteMany({ where: { userId } });
      if (achievements.length > 0) {
        await db.achievement.createMany({
          data: achievements.map((ach) => ({
            userId,
            title: ach.title || "",
            category: ach.category || "Hackathons",
            description: ach.description || "",
            date: ach.date || "",
          })),
        });
      }
    }

    // Retrieve full updated record to respond back
    const updatedUser = await db.user.findUnique({
      where: { id: userId },
      include: {
        education: { orderBy: { startYear: "asc" } },
        experience: { orderBy: { startDate: "asc" } },
        projects: { orderBy: { createdAt: "desc" } },
        certifications: { orderBy: { issueDate: "desc" } },
        languages: { orderBy: { language: "asc" } },
        achievements: { orderBy: { createdAt: "desc" } },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[POST_USER_ERROR]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/user
 * Deletes the authenticated user's account and all cascade dependencies.
 */
export async function DELETE() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user.id;

    // Delete related entities sequentially
    await db.education.deleteMany({ where: { userId } });
    await db.workExperience.deleteMany({ where: { userId } });
    await db.project.deleteMany({ where: { userId } });
    await db.certification.deleteMany({ where: { userId } });
    await db.languageProficiency.deleteMany({ where: { userId } });
    await db.achievement.deleteMany({ where: { userId } });
    
    // Resume and sub-analyses
    const userResumes = await db.resume.findMany({ where: { userId } });
    for (const res of userResumes) {
      await db.resumeAnalysis.deleteMany({ where: { resumeId: res.id } });
    }
    await db.resume.deleteMany({ where: { userId } });

    // Job matches and descriptions
    const userJobDescriptions = await db.jobDescription.findMany({ where: { userId } });
    for (const jd of userJobDescriptions) {
      await db.jobMatch.deleteMany({ where: { jobDescriptionId: jd.id } });
    }
    await db.jobDescription.deleteMany({ where: { userId } });
    await db.jobMatch.deleteMany({ where: { userId } });

    // Interviews and feedback
    await db.interviewSession.deleteMany({ where: { userId } });
    await db.review.deleteMany({ where: { userId } });

    // Delete primary user record
    await db.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true, message: "Account and dependencies deleted successfully." });
  } catch (error) {
    console.error("[DELETE_USER_ERROR]:", error);
    return NextResponse.json({ error: "Failed to delete account." }, { status: 500 });
  }
}
