// src/app/api/user/connected-accounts/route.js

import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { isValidUrl, isValidHandle } from "@/lib/validators";

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
      // For paths like /in/username or /profile/username, return the last non-empty path segment
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
 * GET /api/user/connected-accounts
 * Returns connection statuses for all integrations.
 */
export async function GET() {
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

    // Default template connected state
    const defaultAccounts = {
      github: { connected: false, username: "", lastSynced: null },
      linkedin: { connected: false, username: "", lastSynced: null },
      google: { connected: false, username: "", lastSynced: null },
      microsoft: { connected: false, username: "", lastSynced: null },
      portfolio: { connected: false, username: "", lastSynced: null },
      leetcode: { connected: false, username: "", lastSynced: null },
      hackerrank: { connected: false, username: "", lastSynced: null },
      codeforces: { connected: false, username: "", lastSynced: null },
    };

    const connected = {
      ...defaultAccounts,
      ...(user.connectedAccounts && typeof user.connectedAccounts === "object" ? user.connectedAccounts : {}),
    };

    // Check Google/Microsoft from Clerk
    try {
      const clerkUser = await currentUser();
      if (clerkUser) {
        const hasGoogle = clerkUser.externalAccounts?.some((acc) => acc.provider.includes("google")) || false;
        const googleEmail = clerkUser.externalAccounts?.find((acc) => acc.provider.includes("google"))?.emailAddress || "";
        connected.google = {
          connected: hasGoogle,
          username: googleEmail,
          lastSynced: hasGoogle ? new Date().toISOString() : null,
        };

        const hasMs = clerkUser.externalAccounts?.some((acc) => acc.provider.includes("microsoft")) || false;
        const msEmail = clerkUser.externalAccounts?.find((acc) => acc.provider.includes("microsoft"))?.emailAddress || "";
        connected.microsoft = {
          connected: hasMs,
          username: msEmail,
          lastSynced: hasMs ? new Date().toISOString() : null,
        };

        const githubAcc = clerkUser.externalAccounts?.find((acc) => acc.provider.includes("github"));
        if (githubAcc) {
          connected.github = {
            connected: true,
            username: githubAcc.username || githubAcc.emailAddress || "",
            lastSynced: new Date().toISOString(),
            isOAuth: true,
          };
        }

        const linkedinAcc = clerkUser.externalAccounts?.find((acc) => acc.provider.includes("linkedin"));
        if (linkedinAcc) {
          connected.linkedin = {
            connected: true,
            username: linkedinAcc.username || linkedinAcc.emailAddress || "",
            lastSynced: new Date().toISOString(),
            isOAuth: true,
          };
        }

        // Auto sync Clerk OAuth links to main DB user profile
        let needUserUpdate = false;
        const updateData = {};
        if (githubAcc && githubAcc.username && !user.githubUrl) {
          updateData.githubUrl = `https://github.com/${githubAcc.username}`;
          needUserUpdate = true;
        }
        if (linkedinAcc && !user.linkedinUrl) {
          const lnUser = linkedinAcc.username || linkedinAcc.emailAddress || "";
          if (lnUser) {
            updateData.linkedinUrl = lnUser.startsWith("http") ? lnUser : `https://linkedin.com/in/${lnUser}`;
            needUserUpdate = true;
          }
        }
        if (needUserUpdate) {
          await db.user.update({
            where: { clerkId },
            data: updateData,
          });
        }
      }
    } catch (clerkErr) {
      console.warn("[CONNECTED_ACCOUNTS_CLERK_SYNC_WARN]:", clerkErr);
    }

    // Double check top-level URL fields to sync connection status
    if (user.githubUrl && !connected.github.connected) {
      connected.github = { connected: true, username: extractUsername(user.githubUrl, "github.com"), lastSynced: new Date().toISOString() };
    }
    if (user.linkedinUrl && !connected.linkedin.connected) {
      connected.linkedin = { connected: true, username: extractUsername(user.linkedinUrl, "linkedin.com"), lastSynced: new Date().toISOString() };
    }
    if (user.portfolioUrl && !connected.portfolio.connected) {
      connected.portfolio = { connected: true, username: user.portfolioUrl, lastSynced: new Date().toISOString() };
    }
    if (user.leetcodeUrl && !connected.leetcode.connected) {
      connected.leetcode = { connected: true, username: extractUsername(user.leetcodeUrl, "leetcode.com"), lastSynced: new Date().toISOString() };
    }
    if (user.hackerrankUrl && !connected.hackerrank.connected) {
      connected.hackerrank = { connected: true, username: extractUsername(user.hackerrankUrl, "hackerrank.com"), lastSynced: new Date().toISOString() };
    }
    if (user.codeforcesUrl && !connected.codeforces.connected) {
      connected.codeforces = { connected: true, username: extractUsername(user.codeforcesUrl, "codeforces.com"), lastSynced: new Date().toISOString() };
    }

    return NextResponse.json(connected);
  } catch (error) {
    console.error("[GET_CONNECTED_ACCOUNTS_ERROR]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/user/connected-accounts
 * Live verifies and connects an integration.
 */
export async function POST(req) {
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

    const { provider, value } = await req.json();
    if (!provider || !value) {
      return NextResponse.json({ error: "Provider and value are required parameters." }, { status: 400 });
    }

    let isVerified = false;
    let finalUrlOrUsername = value;
    let extractedUser = value;

    // Trigger validation / pinging based on provider type
    switch (provider) {
      case "github": {
        extractedUser = extractUsername(value, "github.com");
        if (!extractedUser || !isValidHandle(extractedUser)) {
          return NextResponse.json({ error: "Invalid GitHub username or URL format." }, { status: 400 });
        }
        finalUrlOrUsername = `https://github.com/${extractedUser}`;

        try {
          const res = await fetch(`https://api.github.com/users/${extractedUser}`, {
            headers: { "User-Agent": "CareerCopilot-App" },
            signal: AbortSignal.timeout(4000),
          });
          if (res.status === 200) {
            isVerified = true;
          } else if (res.status === 404) {
            return NextResponse.json({ error: "GitHub account does not exist." }, { status: 400 });
          } else {
            throw new Error();
          }
        } catch (e) {
          try {
            const pageRes = await fetch(`https://github.com/${extractedUser}`, {
              method: "GET",
              headers: { "User-Agent": "Mozilla/5.0" },
              signal: AbortSignal.timeout(4000),
            });
            if (pageRes.status === 200) {
              isVerified = true;
            } else if (pageRes.status === 404) {
              return NextResponse.json({ error: "GitHub account does not exist." }, { status: 400 });
            } else {
              return NextResponse.json({ error: "Unable to verify GitHub profile. Please check the username." }, { status: 400 });
            }
          } catch (_) {
            return NextResponse.json({ error: "GitHub verification service timed out. Please try again." }, { status: 503 });
          }
        }
        break;
      }

      case "linkedin": {
        extractedUser = extractUsername(value, "linkedin.com");
        if (!extractedUser || extractedUser.length < 3 || !isValidHandle(extractedUser)) {
          return NextResponse.json({ error: "Invalid LinkedIn username handle format." }, { status: 400 });
        }
        if (!isValidUrl(value) || !value.toLowerCase().includes("linkedin.com/in/")) {
          return NextResponse.json({ error: "LinkedIn URL must be format: https://linkedin.com/in/username" }, { status: 400 });
        }
        isVerified = true; // Assume true since LinkedIn blocks all headless scraping/pings
        break;
      }

      case "portfolio": {
        if (!isValidUrl(value)) {
          return NextResponse.json({ error: "Portfolio must be a valid HTTP/HTTPS URL." }, { status: 400 });
        }
        try {
          const res = await fetch(value, {
            method: "GET",
            headers: { "User-Agent": "Mozilla/5.0" },
            signal: AbortSignal.timeout(4000),
          });
          if (res.status < 400) {
            isVerified = true;
          } else {
            return NextResponse.json({ error: `Portfolio URL returned status ${res.status}.` }, { status: 400 });
          }
        } catch (e) {
          return NextResponse.json({ error: "Failed to connect to the portfolio URL. Please verify it is online." }, { status: 400 });
        }
        break;
      }

      case "leetcode": {
        extractedUser = extractUsername(value, "leetcode.com");
        if (!extractedUser || !isValidHandle(extractedUser)) {
          return NextResponse.json({ error: "Invalid LeetCode username." }, { status: 400 });
        }
        finalUrlOrUsername = `https://leetcode.com/u/${extractedUser}`;
        
        try {
          const res = await fetch(`https://leetcode.com/u/${extractedUser}/`, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
            signal: AbortSignal.timeout(4500),
          });
          if (res.status === 200) {
            isVerified = true;
          } else if (res.status === 404) {
            return NextResponse.json({ error: "LeetCode profile not found." }, { status: 400 });
          } else {
            return NextResponse.json({ error: "LeetCode verification service is currently throttled." }, { status: 400 });
          }
        } catch (e) {
          return NextResponse.json({ error: "LeetCode verification timed out. Please try again." }, { status: 503 });
        }
        break;
      }

      case "codeforces": {
        extractedUser = extractUsername(value, "codeforces.com");
        if (!extractedUser || !isValidHandle(extractedUser)) {
          return NextResponse.json({ error: "Invalid Codeforces handle." }, { status: 400 });
        }
        finalUrlOrUsername = `https://codeforces.com/profile/${extractedUser}`;

        try {
          const res = await fetch(`https://codeforces.com/api/user.info?handles=${extractedUser}`, {
            signal: AbortSignal.timeout(4000),
          });
          const info = await res.json();
          if (info && info.status === "OK") {
            isVerified = true;
          } else {
            return NextResponse.json({ error: "Codeforces handle not found." }, { status: 400 });
          }
        } catch (e) {
          try {
            const pageRes = await fetch(`https://codeforces.com/profile/${extractedUser}`, {
              method: "GET",
              signal: AbortSignal.timeout(4000),
            });
            if (pageRes.status === 200) {
              isVerified = true;
            } else if (pageRes.status === 404) {
              return NextResponse.json({ error: "Codeforces handle not found." }, { status: 400 });
            } else {
              return NextResponse.json({ error: "Codeforces verification failed." }, { status: 400 });
            }
          } catch (_) {
            return NextResponse.json({ error: "Codeforces API is currently offline. Please try again." }, { status: 503 });
          }
        }
        break;
      }

      case "hackerrank": {
        extractedUser = extractUsername(value, "hackerrank.com");
        if (!extractedUser || !isValidHandle(extractedUser)) {
          return NextResponse.json({ error: "Invalid HackerRank username." }, { status: 400 });
        }
        finalUrlOrUsername = `https://hackerrank.com/${extractedUser}`;

        try {
          const res = await fetch(`https://www.hackerrank.com/rest/hackers/${extractedUser}/profile`, {
            headers: { "User-Agent": "Mozilla/5.0" },
            signal: AbortSignal.timeout(4000),
          });
          const profile = await res.json();
          if (profile && profile.model) {
            isVerified = true;
          } else {
            return NextResponse.json({ error: "HackerRank user profile not found." }, { status: 400 });
          }
        } catch (e) {
          try {
            const pageRes = await fetch(`https://www.hackerrank.com/${extractedUser}`, {
              method: "GET",
              headers: { "User-Agent": "Mozilla/5.0" },
              signal: AbortSignal.timeout(4000),
            });
            if (pageRes.status === 200) {
              isVerified = true;
            } else if (pageRes.status === 404) {
              return NextResponse.json({ error: "HackerRank profile not found." }, { status: 400 });
            } else {
              return NextResponse.json({ error: "HackerRank verification failed." }, { status: 400 });
            }
          } catch (_) {
            return NextResponse.json({ error: "HackerRank service timed out. Please try again." }, { status: 503 });
          }
        }
        break;
      }

      case "google":
      case "microsoft": {
        // Managed by Clerk external accounts, check status
        const clerkUser = await currentUser();
        const hasSocial = clerkUser?.externalAccounts?.some((acc) => acc.provider.includes(provider)) || false;
        if (hasSocial) {
          isVerified = true;
          extractedUser = clerkUser.externalAccounts.find((acc) => acc.provider.includes(provider))?.emailAddress || "";
        } else {
          return NextResponse.json({ error: `Please link your ${provider} account via secure login first.` }, { status: 400 });
        }
        break;
      }

      default:
        return NextResponse.json({ error: "Unknown integration provider." }, { status: 400 });
    }

    if (!isVerified) {
      return NextResponse.json({ error: "Account verification failed." }, { status: 400 });
    }

    // Save to database
    let connectedAccounts = user.connectedAccounts && typeof user.connectedAccounts === "object" ? user.connectedAccounts : {};
    connectedAccounts = {
      ...connectedAccounts,
      [provider]: {
        connected: true,
        username: extractedUser,
        lastSynced: new Date().toISOString(),
      },
    };

    // Update corresponding field
    const dbFieldsMap = {
      github: "githubUrl",
      linkedin: "linkedinUrl",
      portfolio: "portfolioUrl",
      leetcode: "leetcodeUrl",
      hackerrank: "hackerrankUrl",
      codeforces: "codeforcesUrl",
    };

    const targetField = dbFieldsMap[provider];

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        connectedAccounts,
        ...(targetField && { [targetField]: finalUrlOrUsername }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `${provider} successfully connected and verified!`,
      connectedAccounts: updatedUser.connectedAccounts,
      url: finalUrlOrUsername,
    });
  } catch (error) {
    console.error("[CONNECT_ACCOUNT_ERROR]:", error);
    return NextResponse.json({ error: "Failed to connect integration." }, { status: 500 });
  }
}

/**
 * DELETE /api/user/connected-accounts
 * Disconnects and resets account integration status.
 */
export async function DELETE(req) {
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

    // Support both query param or json body for provider info
    const url = new URL(req.url);
    let provider = url.searchParams.get("provider");

    if (!provider) {
      try {
        const body = await req.json();
        provider = body.provider;
      } catch (_) {}
    }

    if (!provider) {
      return NextResponse.json({ error: "Provider is required for disconnection." }, { status: 400 });
    }

    let connectedAccounts = user.connectedAccounts && typeof user.connectedAccounts === "object" ? user.connectedAccounts : {};
    connectedAccounts = {
      ...connectedAccounts,
      [provider]: {
        connected: false,
        username: "",
        lastSynced: null,
      },
    };

    const dbFieldsMap = {
      github: "githubUrl",
      linkedin: "linkedinUrl",
      portfolio: "portfolioUrl",
      leetcode: "leetcodeUrl",
      hackerrank: "hackerrankUrl",
      codeforces: "codeforcesUrl",
    };

    const targetField = dbFieldsMap[provider];

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        connectedAccounts,
        ...(targetField && { [targetField]: "" }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `${provider} disconnected successfully.`,
      connectedAccounts: updatedUser.connectedAccounts,
    });
  } catch (error) {
    console.error("[DISCONNECT_ACCOUNT_ERROR]:", error);
    return NextResponse.json({ error: "Failed to disconnect integration." }, { status: 500 });
  }
}
