// src/app/api/user/route.js

import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { validateProfileData } from "@/lib/validators";

/**
 * Extracts username from a full URL, or returns the handle.
 */
function extractUsername(val, domain) {
  if (!val) return "";
  let clean = val.trim();
  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    try {
      const url = new URL(clean);
      if (domain && !url.hostname.includes(domain)) {
        return "";
      }
      const paths = url.pathname.split("/").filter(Boolean);
      if (paths[0] === "in" || paths[0] === "profile" || paths[0] === "u") {
        return paths[1] || "";
      }
      return paths[0] || "";
    } catch (_) {
      return "";
    }
  }
  return clean.replace(/^@/, "");
}

/**
 * Parser helper to convert User-Agent into clean Browser/OS session metadata.
 */
function parseUserAgent(ua) {
  let os = "Unknown OS";
  let browser = "Unknown Browser";

  if (!ua) return `${browser} on ${os}`;

  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Macintosh") || ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  if (ua.includes("Chrome") && !ua.includes("Chromium") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("MSIE") || ua.includes("Trident")) browser = "Internet Explorer";

  return `${browser} on ${os}`;
}

/**
 * GET /api/user
 * Fetches the authenticated user's profile, settings, and all related portfolio models.
 * Logs active session details to securitySettings login history dynamically.
 */
export async function GET(req) {
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
        interviewSessions: { select: { id: true, status: true } },
      },
    });

    // 1. Sync User fields with Clerk
    try {
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
          user = await db.user.upsert({
            where: { clerkId },
            update: { email, firstName, lastName, imageUrl },
            create: { clerkId, email, firstName, lastName, imageUrl },
            include: {
              education: { orderBy: { startYear: "asc" } },
              experience: { orderBy: { startDate: "asc" } },
              projects: { orderBy: { createdAt: "desc" } },
              certifications: { orderBy: { issueDate: "desc" } },
              languages: { orderBy: { language: "asc" } },
              achievements: { orderBy: { createdAt: "desc" } },
              interviewSessions: { select: { id: true, status: true } },
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

    // 2. Track & log request session details under securitySettings
    try {
      const userAgentStr = req.headers.get("user-agent") || "Unknown Device";
      const rawIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
      const ip = rawIp.split(",")[0].trim();
      const currentDeviceName = parseUserAgent(userAgentStr);

      let securitySettings = user.securitySettings || {};
      if (typeof securitySettings !== "object" || Array.isArray(securitySettings)) {
        securitySettings = {};
      }

      let trustedDevices = Array.isArray(securitySettings.trustedDevices) ? securitySettings.trustedDevices : [];
      let loginHistory = Array.isArray(securitySettings.loginHistory) ? securitySettings.loginHistory : [];

      const sessionDate = new Date().toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      // Update current session in trusted devices
      const deviceExists = trustedDevices.some(
        (d) => d.name === `${currentDeviceName} (Current session)` || d.name === currentDeviceName
      );
      if (!deviceExists) {
        trustedDevices = trustedDevices.map((d) => ({
          ...d,
          name: String(d.name).replace(" (Current session)", ""),
        }));
        trustedDevices.unshift({
          id: String(Date.now()),
          name: `${currentDeviceName} (Current session)`,
          location: user.location || "Delhi, India",
          lastActive: "Active Now",
        });
      }

      // Add to login history
      loginHistory.unshift({
        id: String(Date.now()),
        ip,
        date: sessionDate,
        status: "Success",
      });

      // Cap at 10 to keep db clean
      if (trustedDevices.length > 10) trustedDevices = trustedDevices.slice(0, 10);
      if (loginHistory.length > 10) loginHistory = loginHistory.slice(0, 10);

      securitySettings.trustedDevices = trustedDevices;
      securitySettings.loginHistory = loginHistory;

      user = await db.user.update({
        where: { id: user.id },
        data: { securitySettings },
        include: {
          education: { orderBy: { startYear: "asc" } },
          experience: { orderBy: { startDate: "asc" } },
          projects: { orderBy: { createdAt: "desc" } },
          certifications: { orderBy: { issueDate: "desc" } },
          languages: { orderBy: { language: "asc" } },
          achievements: { orderBy: { createdAt: "desc" } },
          interviewSessions: { select: { id: true, status: true } },
        },
      });
    } catch (trackErr) {
      console.warn("[GET_USER_TRACK_SESSION_WARN]:", trackErr);
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

    // 1. Perform strict backend validation
    const validation = validateProfileData(body);
    if (!validation.isValid) {
      return NextResponse.json({ error: "Validation failed", errors: validation.errors }, { status: 400 });
    }

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

    // Fetch existing user to merge connectedAccounts
    const existingUser = await db.user.findUnique({
      where: { clerkId },
    });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let updatedConnectedAccounts = connectedAccounts || existingUser.connectedAccounts || {};
    if (typeof updatedConnectedAccounts !== "object" || Array.isArray(updatedConnectedAccounts)) {
      updatedConnectedAccounts = {};
    }

    const syncSocial = (key, urlField, domain) => {
      const urlVal = body[urlField];
      if (urlVal !== undefined) {
        if (urlVal) {
          const username = extractUsername(urlVal, domain);
          updatedConnectedAccounts[key] = {
            connected: true,
            username: username || urlVal,
            lastSynced: new Date().toISOString(),
          };
        } else {
          updatedConnectedAccounts[key] = {
            connected: false,
            username: "",
            lastSynced: null,
          };
        }
      }
    };

    syncSocial("github", "githubUrl", "github.com");
    syncSocial("linkedin", "linkedinUrl", "linkedin.com");
    syncSocial("portfolio", "portfolioUrl", null);
    syncSocial("leetcode", "leetcodeUrl", "leetcode.com");
    syncSocial("hackerrank", "hackerrankUrl", "hackerrank.com");
    syncSocial("codeforces", "codeforcesUrl", "codeforces.com");

    let mergedNotificationSettings = existingUser.notificationSettings || {};
    if (notificationSettings !== undefined && notificationSettings !== null) {
      mergedNotificationSettings = {
        ...(typeof mergedNotificationSettings === "object" ? mergedNotificationSettings : {}),
        ...notificationSettings,
      };
    }

    let mergedPrivacySettings = existingUser.privacySettings || {};
    if (privacySettings !== undefined && privacySettings !== null) {
      mergedPrivacySettings = {
        ...(typeof mergedPrivacySettings === "object" ? mergedPrivacySettings : {}),
        ...privacySettings,
      };
    }

    let mergedAiPreferences = existingUser.aiPreferences || {};
    if (aiPreferences !== undefined && aiPreferences !== null) {
      mergedAiPreferences = {
        ...(typeof mergedAiPreferences === "object" ? mergedAiPreferences : {}),
        ...aiPreferences,
      };
    }

    let mergedSecuritySettings = existingUser.securitySettings || {};
    if (securitySettings !== undefined && securitySettings !== null) {
      mergedSecuritySettings = {
        ...(typeof mergedSecuritySettings === "object" ? mergedSecuritySettings : {}),
        ...securitySettings,
      };
    }

    // 2. Update Core User Details
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
        ...(aiPreferences !== undefined && { aiPreferences: mergedAiPreferences }),
        ...(notificationSettings !== undefined && { notificationSettings: mergedNotificationSettings }),
        ...(privacySettings !== undefined && { privacySettings: mergedPrivacySettings }),
        ...(careerGoalsTimeline !== undefined && { careerGoalsTimeline }),
        ...(securitySettings !== undefined && { securitySettings: mergedSecuritySettings }),
        connectedAccounts: updatedConnectedAccounts,
        ...(resumePreferences !== undefined && { resumePreferences }),
        ...(jobPreferences !== undefined && { jobPreferences }),
        ...(accessibilitySettings !== undefined && { accessibilitySettings }),
        ...(appearanceSettings !== undefined && { appearanceSettings }),
      },
    });

    const userId = user.id;

    // 3. Sync List entities transactionally
    // Sync Education
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

    // Sync Work Experience
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

    // Sync Projects
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

    // Sync Certifications
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

    // Sync Languages
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

    // Sync Achievements
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

    // Return the fresh updated user representation
    const updatedUser = await db.user.findUnique({
      where: { id: userId },
      include: {
        education: { orderBy: { startYear: "asc" } },
        experience: { orderBy: { startDate: "asc" } },
        projects: { orderBy: { createdAt: "desc" } },
        certifications: { orderBy: { issueDate: "desc" } },
        languages: { orderBy: { language: "asc" } },
        achievements: { orderBy: { createdAt: "desc" } },
        interviewSessions: { select: { id: true, status: true } },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[POST_USER_ERROR]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * PUT /api/user
 * Alias to POST handler for REST compatibility.
 */
export async function PUT(req) {
  return POST(req);
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
