import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

/**
 * GET /api/interviews/[id]/messages
 * POST /api/interviews/[id]/messages
 */
export async function GET(req, { params }) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: sessionId } = params;
    if (!sessionId) return NextResponse.json({ error: "Missing session id" }, { status: 400 });

    const dbUser = await db.user.findUnique({ where: { clerkId } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 401 });

    const session = await db.interviewSession.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== dbUser.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const messages = await db.interviewMessage.findMany({ where: { sessionId }, orderBy: { createdAt: 'asc' } });
    return NextResponse.json(messages);
  } catch (err) {
    console.error("[MESSAGES_GET_ERROR]:", err);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: sessionId } = params;
    if (!sessionId) return NextResponse.json({ error: "Missing session id" }, { status: 400 });

    const dbUser = await db.user.findUnique({ where: { clerkId } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 401 });

    const session = await db.interviewSession.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== dbUser.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    // Accept either single message or array
    const messages = Array.isArray(body) ? body : [body];

    const created = [];
    for (const m of messages) {
      const { sender, content, metadata } = m;
      if (!sender || !content) continue;
      const rec = await db.interviewMessage.create({ data: { sessionId, sender, content, metadata: metadata || {} } });
      created.push(rec);
    }

    return NextResponse.json({ success: true, created });
  } catch (err) {
    console.error("[MESSAGES_POST_ERROR]:", err);
    return NextResponse.json({ error: err.message || "Failed to save messages" }, { status: 500 });
  }
}
