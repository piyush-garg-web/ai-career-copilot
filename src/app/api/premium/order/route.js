import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import crypto from "crypto";

// Razorpay configuration
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Pricing (in INR paise)
const PRICING = {
  MONTHLY: 29900, // ₹299/month
  YEARLY: 299900, // ₹2999/year (17% discount)
};

// Import Razorpay dynamically if keys are available
let Razorpay;
if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  try {
    Razorpay = (await import("razorpay")).default;
  } catch (e) {
    console.warn("Razorpay package not installed or keys missing", e);
  }
}

export async function POST(req) {
  try {
    const { userId: clerkId } = await auth();
    const user = await currentUser();
    if (!clerkId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId },
    });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { planType } = body;

    if (!planType || !["MONTHLY", "YEARLY"].includes(planType)) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
    }

    // Check if user already has active premium
    if (dbUser.isPremium && dbUser.subscriptionStatus === "ACTIVE") {
      return NextResponse.json({ error: "User already has an active subscription" }, { status: 400 });
    }

    // Generate unique order ID
    const orderId = `order_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
    const amount = PRICING[planType];

    // Create transaction record in DB first
    const transaction = await db.transaction.create({
      data: {
        userId: dbUser.id,
        orderId,
        razorpayOrderId: orderId, // We'll update this after Razorpay order creation
        amount: amount / 100, // Convert paise to INR
        currency: "INR",
        planType,
        status: "PENDING",
      },
    });

    let razorpayOrder;

    // Use real Razorpay if available, else mock
    if (Razorpay && RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
      const razorpayInstance = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
      });
      razorpayOrder = await razorpayInstance.orders.create({
        amount,
        currency: "INR",
        receipt: orderId,
        notes: {
          planType,
          userId: dbUser.id,
        },
      });
    } else {
      // Mock Razorpay not available, use mock order
      razorpayOrder = {
        id: orderId,
        amount,
        currency: "INR",
        receipt: orderId,
      };
    }

    // Update transaction with real Razorpay order ID
    await db.transaction.update({
      where: { id: transaction.id },
      data: { razorpayOrderId: razorpayOrder.id },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: RAZORPAY_KEY_ID || "mock_key",
        orderId: transaction.orderId,
      },
    });
  } catch (error) {
    console.error("[CREATE_PREMIUM_ORDER_ERROR]:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
