"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Zap, Star } from "lucide-react";
import { usePremium } from "@/hooks/use-premium";
import { PremiumBadge } from "@/components/shared/PremiumBadge";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

const features = [
  { name: "Resume Analysis", free: true },
  { name: "Interview Coach", free: true },
  { name: "ATS Optimization", free: true },
  { name: "Job Matching", free: true },
  { name: "AI Voice Mock Interview", free: false },
  { name: "AI Video Mock Interview", free: false },
  { name: "Multilingual Support", free: false },
  { name: "Priority AI Processing", free: false },
  { name: "Early Access Features", free: false },
];

// Function to load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PricingCard = ({ plan, recommended = false, onUpgrade, user }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (plan.price === 0) return;
    setLoading(true);
    try {
      // Step 1: Create order
      const response = await fetch("/api/premium/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType: plan.type }),
      });

      if (!response.ok) throw new Error("Failed to create order");
      const data = await response.json();

      // Step 2: Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Failed to load Razorpay script");

      // Step 3: Check if Razorpay is available
      if (!window.Razorpay) {
        // Fallback to mock mode if Razorpay isn't available
        toast.success("Order created! Simulating payment...");
        await new Promise((r) => setTimeout(r, 1500));
        const verifyRes = await fetch("/api/premium/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: data.order.orderId,
            razorpayOrderId: data.order.id,
            razorpayPaymentId: "pay_demo_123",
            razorpaySignature: "demo_signature",
            planType: plan.type,
          }),
        });
        if (verifyRes.ok) {
          toast.success("Welcome to Premium! 🎉");
          onUpgrade();
        }
        return;
      }

      // Step 4: Open Razorpay Checkout
      const options = {
        key: data.order.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "CareerCopilot",
        description: `${plan.name} Plan`,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            // Verify payment
            const verifyRes = await fetch("/api/premium/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: data.order.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                planType: plan.type,
              }),
            });
            if (verifyRes.ok) {
              toast.success("Welcome to Premium! 🎉");
              onUpgrade();
            } else {
              toast.error("Payment verification failed");
            }
          } catch (error) {
            console.error(error);
            toast.error("Failed to verify payment");
          }
        },
        prefill: {
          name: user?.fullName || "",
          email: user?.primaryEmailAddress?.emailAddress || "",
          contact: "",
        },
        theme: {
          color: "#f59e0b", // orange/yellow gradient
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", (response) => {
        toast.error("Payment failed. Please try again.");
        console.error(response.error);
      });
      paymentObject.open();
    } catch (error) {
      console.error(error);
      toast.error("Failed to process upgrade");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 ${
        recommended ? "border-2 border-yellow-500 shadow-xl shadow-yellow-500/20 scale-105" : "border-border"
      }`}
    >
      {recommended && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-yellow-500 to-orange-600 text-white text-center py-1 text-xs font-bold">
          Most Popular
        </div>
      )}
      <CardHeader className={recommended ? "pt-12" : ""}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
          {recommended && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
        </div>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <span className="text-5xl font-extrabold">₹{plan.price}</span>
          {plan.period && <span className="text-muted-foreground ml-2">/{plan.period}</span>}
        </div>

        <div className="space-y-3">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-foreground">{feature.name}</span>
              {feature.free || !plan.isFree ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={plan.isFree ? "ghost" : recommended ? "default" : "secondary"}
          disabled={plan.isFree || loading}
          onClick={handleClick}
        >
          {plan.isFree
            ? "Current Plan"
            : loading
            ? "Processing..."
            : plan.isPremium
            ? "Renew Plan"
            : `Upgrade to ${plan.name}`}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function UpgradePage() {
  const router = useRouter();
  const { isPremium, refresh } = usePremium();
  const { user } = useUser();

  const plans = [
    {
      type: "FREE",
      name: "Free",
      description: "Perfect for getting started",
      price: 0,
      isFree: true,
      isPremium: false,
    },
    {
      type: "MONTHLY",
      name: "Monthly",
      description: "Great for short-term prep",
      price: 299,
      period: "month",
      isFree: false,
      isPremium: true,
    },
    {
      type: "YEARLY",
      name: "Yearly",
      description: "Best value for serious candidates",
      price: 2999,
      period: "year",
      isFree: false,
      isPremium: true,
    },
  ];

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-700 dark:text-yellow-300 font-bold mb-4">
            <Zap className="w-4 h-4" />
            Unlock Your Full Potential
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Upgrade to <span className="bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent">Premium</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Take your career preparation to the next level with AI-powered voice and video mock interviews, multilingual support, and more.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid gap-8 md:grid-cols-3 items-start">
          {plans.map((plan, i) => (
            <PricingCard
              key={plan.type}
              plan={plan}
              recommended={i === 1}
              onUpgrade={() => refresh()}
              user={user}
            />
          ))}
        </div>

        {/* FAQ / Info */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Ace Your Next Interview?</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of users who have transformed their interview preparation with CareerCopilot Premium.
          </p>
        </div>
      </div>
    </div>
  );
}
