import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { parseResumeText, parseStructuredResume } from "@/lib/parsers";

export async function POST(req, { params }) {
  try {
    // Resolve dynamic params asynchronously as required by Next.js 15
    const resolvedParams = await params;
    const resumeId = resolvedParams.id;

    if (!resumeId) {
      return NextResponse.json({ error: "Missing resume identifier." }, { status: 400 });
    }

    // Authenticate user via Clerk
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized - Session not found." }, { status: 401 });
    }

    // Fetch matching DB User
    const dbUser = await db.user.findUnique({
      where: { clerkId },
    });
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized - User record not found." }, { status: 401 });
    }

    // Fetch the target resume and ensure it belongs to the authenticated user
    const resume = await db.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume document not found." }, { status: 404 });
    }

    if (resume.userId !== dbUser.id) {
      return NextResponse.json({ error: "Forbidden - Access denied." }, { status: 403 });
    }

    // Set status to PARSING in the database
    await db.resume.update({
      where: { id: resume.id },
      data: { status: "PARSING", parsingError: null },
    });

    // Download the uploaded file from the storage URL (UploadThing)
    const fileResponse = await fetch(resume.fileUrl);
    if (!fileResponse.ok) {
      throw new Error(`Failed to download uploaded document: ${fileResponse.statusText}`);
    }

    const arrayBuffer = await fileResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      throw new Error("Uploaded document file contains no data (empty file).");
    }

    // Process the buffer through our parsing service
    const extractedText = await parseResumeText(buffer, resume.fileType);

    // Parse the extracted raw text into structured JSON format
    const parsedDataJson = parseStructuredResume(extractedText);

    // Save plain text and parsed JSON, updating status to PARSED
    const updatedResume = await db.resume.update({
      where: { id: resume.id },
      data: {
        rawText: extractedText,
        parsedData: parsedDataJson,
        status: "PARSED",
        parsingError: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Document parsed and saved successfully.",
      resumeId: updatedResume.id,
      textLength: extractedText.length,
    });
  } catch (error) {
    console.error("[RESUME PARSING EXCEPTION]:", error);

    // Catch parsing errors and record them to the database
    try {
      const resolvedParams = await params;
      const resumeId = resolvedParams.id;
      if (resumeId) {
        await db.resume.update({
          where: { id: resumeId },
          data: {
            status: "ERROR",
            parsingError: error.message || "Failed to extract text from document.",
          },
        });
      }
    } catch (dbError) {
      console.error("Failed to write parsing error to database:", dbError);
    }

    return NextResponse.json(
      { error: error.message || "Failed to parse document text." },
      { status: 500 }
    );
  }
}
