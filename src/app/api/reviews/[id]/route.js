import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

/**
 * PUT /api/reviews/[id]
 * Updates an existing review if the authenticated user owns it.
 */
export async function PUT(req, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user record
    const dbUser = await db.user.findUnique({
      where: { clerkId },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found in database" }, { status: 404 });
    }

    // Fetch target review
    const reviewRecord = await db.review.findUnique({
      where: { id },
    });

    if (!reviewRecord) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Security check: Validate ownership
    if (reviewRecord.userId !== dbUser.id) {
      return NextResponse.json(
        { error: "Forbidden. You do not have permission to edit this review." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { rating, title, review } = body;

    // Validation
    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json({ error: "Rating is required and must be between 1 and 5." }, { status: 400 });
    }

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Review title is required." }, { status: 400 });
    }
    if (title.length > 100) {
      return NextResponse.json({ error: "Title must be under 100 characters." }, { status: 400 });
    }

    if (!review || typeof review !== "string" || review.trim().length === 0) {
      return NextResponse.json({ error: "Review description is required." }, { status: 400 });
    }
    if (review.length > 500) {
      return NextResponse.json({ error: "Review description must be under 500 characters." }, { status: 400 });
    }

    const updatedReview = await db.review.update({
      where: { id },
      data: {
        rating: numRating,
        title: title.trim(),
        review: review.trim(),
      },
    });

    return NextResponse.json({ success: true, review: updatedReview });
  } catch (error) {
    console.error("[PUT_REVIEW_ERROR]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/reviews/[id]
 * Deletes a review if the authenticated user owns it.
 */
export async function DELETE(req, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user record
    const dbUser = await db.user.findUnique({
      where: { clerkId },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found in database" }, { status: 404 });
    }

    // Fetch target review
    const reviewRecord = await db.review.findUnique({
      where: { id },
    });

    if (!reviewRecord) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Security check: Validate ownership
    if (reviewRecord.userId !== dbUser.id) {
      return NextResponse.json(
        { error: "Forbidden. You do not have permission to delete this review." },
        { status: 403 }
      );
    }

    await db.review.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Review deleted successfully." });
  } catch (error) {
    console.error("[DELETE_REVIEW_ERROR]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
