"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Zap, Star, ShieldCheck, Globe, Mic, Video, Loader2 } from "lucide-react";
import { usePremium } from "@/hooks/use-premium";
import { PremiumBadge } from "@/components/shared/PremiumBadge";
import { PremiumSuccessModal } from "@/components/shared/PremiumSuccessModal";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

import { GoBackButton } from "@/components/shared/GoBackButton";

const features = [
  { name: "Resume Analysis", free: true },
  { name: "Interview Coach", free: true },
  { name: "ATS Optimization", free: true },
  { name: "Job Match", free: true },
  { name: "AI Voice Mock Interview", free: false },
  { name: "AI Video Mock Interview", free: false },
  { name: "🌍 Multilingual AI Experience", free: false },
  { name: "Future Premium Features", free: false },
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
  const { isPremium, loading, refresh } = usePremium();
  const { user } = useUser();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Redirect premium users to membership management page
  useEffect(() => {
    if (!loading && isPremium) {
      router.push("/premium-membership");
    }
  }, [isPremium, loading, router]);

  // Show loading state while checking premium status
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-sm font-semibold text-muted-foreground animate-pulse">Loading...</span>
      </div>
    );
  }

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
      price: 2499,
      period: "year",
      isFree: false,
      isPremium: true,
    },
  ];

  return (
    <>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Go Back navigation */}
          <div className="mb-6">
            <GoBackButton href="/dashboard" />
          </div>
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
              Take your career preparation to the next level with AI-powered voice and video mock interviews, multilingual AI experience, and more.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid gap-8 md:grid-cols-3 items-start">
            {plans.map((plan, i) => (
              <PricingCard
                key={plan.type}
                plan={plan}
                recommended={i === 1}
                onUpgrade={() => {
                  refresh();
                  setShowSuccessModal(true);
                }}
                user={user}
              />
            ))}
          </div>

          {/* Feature Comparison Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-center mb-12">Compare Plans</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-6 font-semibold">Features</th>
                    <th className="text-center py-4 px-6 font-semibold">Free</th>
                    <th className="text-center py-4 px-6 font-semibold bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, i) => (
                    <tr key={i} className="border-b border-border">
                      <td className="py-4 px-6">{feature.name}</td>
                      <td className="text-center py-4 px-6">
                        {feature.free ? <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /> : <XCircle className="w-5 h-5 text-gray-400 mx-auto" />}
                      </td>
                      <td className="text-center py-4 px-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Security Section */}
          <div className="mt-20">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-4 mb-4">
                <ShieldCheck className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                <h2 className="text-2xl font-bold">Secure Payment</h2>
              </div>
              <p className="text-muted-foreground">
                Your payment is processed securely through Razorpay. We use industry-standard encryption to protect your data.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                ⓘ Test Mode: Use Razorpay test card details (e.g., 4111 1111 1111 1111) to complete payment
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="grid gap-6">
              <div className="border border-border rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">What payment methods are supported?</h3>
                <p className="text-muted-foreground">We support all major payment methods including credit/debit cards, UPI, and net banking through Razorpay.</p>
              </div>
              <div className="border border-border rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">Is my payment secure?</h3>
                <p className="text-muted-foreground">Yes! All payments are processed through Razorpay&apos;s secure payment gateway with end-to-end encryption.</p>
              </div>
              <div className="border border-border rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">Can I cancel my subscription?</h3>
                <p className="text-muted-foreground">Yes! You can cancel your subscription at any time. You&apos;ll have access to premium features until your current subscription period ends.</p>
              </div>
            </div>
          </div>

          {/* Premium Benefits Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-center mb-12">Premium Benefits</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="border border-border rounded-xl p-6 text-center">
                <Mic className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Voice AI Interviews</h3>
                <p className="text-muted-foreground">Practice with realistic voice AI interviews with speech recognition and feedback.</p>
              </div>
              <div className="border border-border rounded-xl p-6 text-center">
                <Video className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Video AI Interviews</h3>
                <p className="text-muted-foreground">Practice with video AI interviews with visual analytics on your body language.</p>
              </div>
              <div className="border border-border rounded-xl p-6 text-center">
                <Globe className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">🌍 Multilingual AI Experience</h3>
                <p className="text-muted-foreground">Experience CareerCopilot in your preferred language. Premium members can use Resume Analysis, ATS Analysis, Interview Coach, AI Mock Interview, Dashboard, Profile, Settings, and future AI features in multiple supported languages.</p>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Ace Your Next Interview?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of users who have transformed their interview preparation with CareerCopilot Premium.
            </p>
          </div>
        </div>
      </div>
      <PremiumSuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
    </>
  );
}
