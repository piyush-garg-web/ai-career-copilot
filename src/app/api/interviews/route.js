import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { generateInterviewQuestions } from "@/lib/ai/services/interview";

/**
 * POST /api/interviews
 * Initializes a new interview session and generates questions upfront in the DB.
 */
export async function POST(req) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId },
    });
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized - User record not found" }, { status: 401 });
    }

    // Parse options
    const { resumeId, jobDescriptionId, type, difficulty, count } = await req.json();

    if (!resumeId) {
      return NextResponse.json({ error: "Missing resume selection." }, { status: 400 });
    }

    const questionCount = parseInt(count, 10) || 5;

    // Fetch and verify resume
    const resume = await db.resume.findUnique({
      where: { id: resumeId },
      include: { analysis: true },
    });

    if (!resume || resume.userId !== dbUser.id) {
      return NextResponse.json({ error: "Resume not found or access denied." }, { status: 404 });
    }

    // Fetch and verify job description if selected
    let jobDescription = null;
    if (jobDescriptionId) {
      jobDescription = await db.jobDescription.findUnique({
        where: { id: jobDescriptionId },
      });
      if (!jobDescription || jobDescription.userId !== dbUser.id) {
        return NextResponse.json({ error: "Job description not found or access denied." }, { status: 404 });
      }
    }

    console.log(`[INTERVIEW API]: Setup requested for Resume: ${resume.fileName}, Type: ${type}, Difficulty: ${difficulty}, Count: ${questionCount}`);

    // Call AI questions generator service
    const aiQuestionsData = await generateInterviewQuestions({
      rawText: resume.rawText,
      parsedData: resume.parsedData || {},
      analysis: resume.analysis || {},
      jobDescription,
      type,
      difficulty,
      count: questionCount,
    });

    const parsedQuestions = aiQuestionsData.questions || [];
    if (parsedQuestions.length === 0) {
      throw new Error("AI failed to output any interview questions.");
    }

    // Extract role/title for the session
    const roleTitle = jobDescription?.title || resume.parsedData?.personalInfo?.title || "Professional Role";
    const sessionTitle = `${difficulty.toLowerCase().replace(/^\w/, (c) => c.toUpperCase())} ${type} Mock Interview for ${roleTitle}`;

    // Map difficulty enum
    let difficultyEnum = "MEDIUM";
    if (difficulty === "easy" || difficulty === "EASY") difficultyEnum = "EASY";
    if (difficulty === "hard" || difficulty === "HARD") difficultyEnum = "HARD";

    // Create session in database
    const session = await db.interviewSession.create({
      data: {
        userId: dbUser.id,
        title: sessionTitle,
        role: roleTitle,
        difficulty: difficultyEnum,
        questionTypes: [type],
        status: "ACTIVE",
      },
    });

    // Create questions in database
    const questionCreates = parsedQuestions.map((q, idx) => {
      // Map questionType enum
      let qType = "TECHNICAL";
      if (q.type === "BEHAVIORAL") qType = "BEHAVIORAL";
      if (q.type === "SITUATIONAL") qType = "SITUATIONAL";

      return db.interviewQuestion.create({
        data: {
          sessionId: session.id,
          content: q.content,
          questionType: qType,
          order: idx + 1,
        },
      });
    });

    await Promise.all(questionCreates);

    console.log(`[INTERVIEW API SUCCESS]: Created session ${session.id} with ${parsedQuestions.length} questions.`);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("[INTERVIEW ROUTE EXCEPTION]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize interview session." },
      { status: 500 }
    );
  }
}
