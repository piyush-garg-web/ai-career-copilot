"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PremiumBadge } from "@/components/shared/PremiumBadge";
import { CheckCircle2, Zap, ShieldCheck, Globe, Mic, Video, Download, Mail, ArrowLeft, X, Calendar, CreditCard, History } from "lucide-react";
import { toast } from "sonner";

const premiumFeatures = [
  { icon: Mic, title: "Voice AI Interviews", description: "Practice with realistic voice AI interviews with speech recognition and detailed feedback" },
  { icon: Video, title: "Video AI Interviews", description: "Practice with video AI interviews with visual analytics on your body language and presentation" },
  { icon: Globe, title: "Multilingual Support", description: "Access the platform and practice interviews in multiple languages" },
  { icon: ShieldCheck, title: "Priority Support", description: "Get fast responses from our support team for any questions or issues" },
];

export function PremiumMembershipClient({ user, transactions }) {
  const router = useRouter();
  const [downloadingReceipt, setDownloadingReceipt] = useState(null);

  const handleDownloadReceipt = async (transaction) => {
    setDownloadingReceipt(transaction.id);
    try {
      // In a real app, you would generate and download a PDF receipt
      // For now, we'll just show a toast
      toast.success("Receipt download initiated!");
      await new Promise((r) => setTimeout(r, 1000));
    } catch (error) {
      console.error("Failed to download receipt:", error);
      toast.error("Failed to download receipt");
    } finally {
      setDownloadingReceipt(null);
    }
  };

  const handleContactSupport = () => {
    // In a real app, you might open a mailto link or support chat
    window.location.href = "mailto:support@careercopilot.com";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPlanName = (planType) => {
    switch (planType) {
      case "MONTHLY":
        return "Monthly Premium";
      case "YEARLY":
        return "Yearly Premium";
      default:
        return "Free";
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "FAILED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "REFUNDED":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const calculateDaysRemaining = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining(user.expiryDate);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
          <PremiumBadge size="md" />
        </div>

        {/* Premium Header Card */}
        <Card className="overflow-hidden border-2 border-yellow-500/50 shadow-xl shadow-yellow-500/10">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-8 text-white">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Zap className="w-8 h-8 fill-yellow-200" />
                  <h1 className="text-3xl font-extrabold">Premium Membership</h1>
                </div>
                <p className="text-yellow-100 text-lg">
                  Unlock all premium features and accelerate your career growth
                </p>
              </div>
            </div>
          </div>
          <CardContent className="pt-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <p className="text-2xl font-bold">{getPlanName(user.planType)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="flex items-center gap-2">
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                    user.subscriptionStatus === "ACTIVE"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  }`}>
                    <CheckCircle2 className="w-4 h-4" />
                    {user.subscriptionStatus === "ACTIVE" ? "Active" : user.subscriptionStatus}
                  </div>
                </div>
              </div>
              {daysRemaining !== null && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Expires On</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <p className="text-lg font-semibold">
                      {formatDate(user.expiryDate)}
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining)
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Features Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Premium Features
              </CardTitle>
              <CardDescription>All features included in your premium membership</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {premiumFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-yellow-50/50 dark:bg-yellow-900/10">
                    <div className="mt-1 p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                      <Icon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Details
              </CardTitle>
              <CardDescription>Your payment and membership information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.purchaseDate && (
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Purchase Date</span>
                  <span className="font-medium">{formatDate(user.purchaseDate)}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-bold text-lg">
                  {user.currency || "INR"} {user.amountPaid || "0"}
                </span>
              </div>
              {user.paymentProvider && (
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Payment Provider</span>
                  <span className="font-medium capitalize">{user.paymentProvider}</span>
                </div>
              )}
              {user.paymentId && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Payment ID</span>
                  <span className="font-mono text-sm">{user.paymentId}</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleContactSupport}
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                onClick={() => router.push("/upgrade")}
              >
                Manage Plan
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Transaction History
            </CardTitle>
            <CardDescription>Your complete payment transaction history</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No transactions found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{getPlanName(transaction.planType)}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClass(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Order ID: {transaction.orderId}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold">
                        {transaction.currency} {transaction.amount}
                      </span>
                      {transaction.status === "COMPLETED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReceipt(transaction)}
                          disabled={downloadingReceipt === transaction.id}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {downloadingReceipt === transaction.id ? "Downloading..." : "Receipt"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
