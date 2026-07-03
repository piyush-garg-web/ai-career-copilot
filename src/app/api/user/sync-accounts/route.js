import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

function extractGithubUsername(url) {
  try {
    const u = new URL(url);
    return u.pathname.replace(/^\//, '').split('/')[0];
  } catch (e) {
    // fallback: regex
    const m = url && url.match(/github\.com\/(?:.+\/)?([^\/\?]+)/i);
    return m ? m[1] : null;
  }
}

function extractLinkedInHandle(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    // look for 'in' segment
    const idx = parts.indexOf('in');
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    return parts[0] || null;
  } catch (e) {
    const m = url && url.match(/linkedin\.com\/in\/([^\/\?]+)/i);
    return m ? m[1] : null;
  }
}

export async function POST() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const connected = user.connectedAccounts || {};
    const githubUrl = user.githubUrl;
    const linkedinUrl = user.linkedinUrl;

    const now = new Date().toISOString();

    const next = { ...connected };

    if (githubUrl) {
      const ghUser = extractGithubUsername(githubUrl);
      next.github = { connected: true, username: ghUser || githubUrl, lastSynced: now };
    } else {
      next.github = { connected: false, username: '', lastSynced: null };
    }

    if (linkedinUrl) {
      const liUser = extractLinkedInHandle(linkedinUrl);
      next.linkedin = { connected: true, username: liUser || linkedinUrl, lastSynced: now };
    } else {
      next.linkedin = { connected: false, username: '', lastSynced: null };
    }

    await db.user.update({ where: { id: user.id }, data: { connectedAccounts: next } });

    return NextResponse.json({ success: true, connectedAccounts: next });
  } catch (err) {
    console.error('[SYNC_ACCOUNTS_ERROR]:', err);
    return NextResponse.json({ error: 'Failed to sync accounts' }, { status: 500 });
  }
}
