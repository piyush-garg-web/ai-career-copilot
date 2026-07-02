import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

/**
 * GET /api/reviews
 * Fetches paginated reviews from the database.
 * Query Parameters:
 * - page: number (default 1)
 * - limit: number (default 10)
 * - sort: "newest" | "highest" | "lowest" (default "newest")
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "10", 10)));
    const sort = searchParams.get("sort") || "newest";

    const skip = (page - 1) * limit;

    // Determine sorting criteria
    let orderBy = { createdAt: "desc" };
    if (sort === "highest") {
      orderBy = { rating: "desc" };
    } else if (sort === "lowest") {
      orderBy = { rating: "asc" };
    }

    // Fetch total count and average rating
    const [total, aggregateResult] = await Promise.all([
      db.review.count(),
      db.review.aggregate({
        _avg: {
          rating: true,
        },
      }),
    ]);

    const averageRating = aggregateResult._avg.rating
      ? parseFloat(aggregateResult._avg.rating.toFixed(1))
      : 0;

    // Fetch paginated reviews with user profile mappings
    const reviews = await db.review.findMany({
      skip,
      take: limit,
      orderBy,
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
    });

    const hasMore = total > page * limit;

    return NextResponse.json({
      reviews,
      total,
      averageRating,
      hasMore,
    });
  } catch (error) {
    console.error("[GET_REVIEWS_ERROR]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/reviews
 * Submits a new review for the authenticated user.
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
      return NextResponse.json({ error: "User profile not found in database" }, { status: 404 });
    }

    // Check if user already has a review (One review per user rule)
    const existingReview = await db.review.findFirst({
      where: { userId: dbUser.id },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "Duplicate review. You have already submitted a review." },
        { status: 400 }
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

    const newReview = await db.review.create({
      data: {
        userId: dbUser.id,
        rating: numRating,
        title: title.trim(),
        review: review.trim(),
      },
    });

    return NextResponse.json({ success: true, review: newReview });
  } catch (error) {
    console.error("[POST_REVIEWS_ERROR]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
