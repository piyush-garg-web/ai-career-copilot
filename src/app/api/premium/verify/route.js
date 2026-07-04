import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import crypto from "crypto";

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, orderId, planType } = body;

    // Verify signature (only if real keys are present, else simulate success for testing)
    let isVerified = true;
    if (RAZORPAY_KEY_SECRET) {
      const generatedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      isVerified = generatedSignature === razorpaySignature;
    }

    if (!isVerified) {
      // Update transaction to failed
      await db.transaction.updateMany({
        where: { orderId },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    // Calculate expiry date
    const purchaseDate = new Date();
    let expiryDate;
    if (planType === "MONTHLY") {
      expiryDate = new Date(purchaseDate);
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (planType === "YEARLY") {
      expiryDate = new Date(purchaseDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    // Update transaction to completed
    const transaction = await db.transaction.updateMany({
      where: { orderId },
      data: {
        status: "COMPLETED",
        razorpayPaymentId,
        razorpaySignature,
      },
    });

    // Update user to premium
    await db.user.update({
      where: { id: dbUser.id },
      data: {
        isPremium: true,
        planType,
        subscriptionStatus: "ACTIVE",
        paymentId: razorpayPaymentId,
        paymentProvider: "RAZORPAY",
        purchaseDate,
        expiryDate,
        amountPaid: planType === "MONTHLY" ? 299 : 2999,
        currency: "INR",
        transactionStatus: "COMPLETED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully! Welcome to Premium!",
    });
  } catch (error) {
    console.error("[VERIFY_PREMIUM_PAYMENT_ERROR]:", error);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
