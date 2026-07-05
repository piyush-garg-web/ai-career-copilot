"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PremiumBadge } from "@/components/shared/PremiumBadge";
import { GoBackButton } from "@/components/shared/GoBackButton";
import { CheckCircle2, Zap, ShieldCheck, Globe, Mic, Video, Download, Mail, ArrowLeft, ArrowRight, Calendar, CreditCard, History, Crown, Clock, Award, Check, FileText, Home, X, Sparkles, Lock, Database, TrendingUp, MessageSquare, Brain } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

const premiumFeatures = [
  { icon: Mic, title: "AI Voice Mock Interview", description: "Practice with realistic voice AI interviews with speech recognition and detailed feedback" },
  { icon: Video, title: "AI Video Mock Interview", description: "Practice with video AI interviews with visual analytics on your body language and presentation" },
  { icon: Globe, title: "🌍 Multilingual AI Experience", description: "Experience CareerCopilot in your preferred language. Premium members can use Resume Analysis, ATS Analysis, Interview Coach, AI Mock Interview, Dashboard, Profile, Settings, and future AI features in multiple supported languages." },
  { icon: Sparkles, title: "Future Premium Features", description: "Get automatic access to all new premium features as they're released" },
  { icon: Award, title: "Priority Feature Access", description: "Be the first to access new features and improvements" },
  { icon: Crown, title: "Premium Experience", description: "Enjoy an enhanced, ad-free experience with premium support" },
];

export function PremiumMembershipClient({ user, transactions }) {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const [downloadingReceipt, setDownloadingReceipt] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleDownloadReceipt = async () => {
    setDownloadingReceipt(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Header
      doc.setFillColor(249, 115, 22);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('CareerCopilot', pageWidth / 2, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Payment Receipt', pageWidth / 2, 30, { align: 'center' });
      
      // Invoice Number
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Invoice Number: INV-${Date.now()}`, 15, 55);
      
      // Customer Details
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Customer Details', 15, 70);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${clerkUser?.fullName || 'N/A'}`, 15, 80);
      doc.text(`Email: ${clerkUser?.primaryEmailAddress?.emailAddress || 'N/A'}`, 15, 88);
      
      // Payment Details
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Payment Details', 15, 105);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Payment ID: ${user.paymentId || 'N/A'}`, 15, 115);
      doc.text(`Order ID: ${transactions[0]?.orderId || 'N/A'}`, 15, 123);
      doc.text(`Plan Name: Premium Lifetime`, 15, 131);
      doc.text(`Amount Paid: ${user.currency || 'INR'} ${user.amountPaid || '0'}`, 15, 139);
      doc.text(`Payment Provider: ${user.paymentProvider || 'Razorpay'}`, 15, 147);
      doc.text(`Purchase Date: ${formatDate(user.purchaseDate)}`, 15, 155);
      doc.text(`Transaction Status: ${user.transactionStatus || 'Verified'}`, 15, 163);
      
      // Lifetime Badge
      doc.setFillColor(234, 179, 8);
      doc.roundedRect(15, 175, 80, 20, 3, 3, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Lifetime Premium', 55, 188, { align: 'center' });
      
      // Thank You
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Thank You!', pageWidth / 2, 220, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Thank you for supporting CareerCopilot.', pageWidth / 2, 230, { align: 'center' });
      doc.text('Enjoy all premium features!', pageWidth / 2, 238, { align: 'center' });
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('This is a computer-generated receipt. No signature required.', pageWidth / 2, pageHeight - 20, { align: 'center' });
      
      doc.save(`CareerCopilot-Receipt-${Date.now()}.pdf`);
      toast.success("Receipt downloaded successfully!");
    } catch (error) {
      console.error("Failed to download receipt:", error);
      toast.error("Failed to download receipt");
    } finally {
      setDownloadingReceipt(false);
    }
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent("Premium Membership Support");
    const body = encodeURIComponent(`Hello CareerCopilot Team,

I need assistance regarding my Premium Membership.

Payment ID: ${user.paymentId || 'N/A'}
Order ID: ${transactions[0]?.orderId || 'N/A'}

Thank you.`);
    window.location.href = `mailto:support@careercopilot.com?subject=${subject}&body=${body}`;
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
      case "LIFETIME":
        return "Premium Lifetime";
      default:
        return "Premium Lifetime";
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
  const premiumSince = user.purchaseDate ? formatDate(user.purchaseDate) : 'N/A';
  
  const getSubscriptionDuration = (planType) => {
    switch (planType) {
      case "MONTHLY":
        return "Monthly";
      case "YEARLY":
        return "Annual";
      case "LIFETIME":
        return "Lifetime";
      default:
        return "Lifetime";
    }
  };
  
  const subscriptionDuration = getSubscriptionDuration(user.planType);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
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
                  <Crown className="w-8 h-8 fill-yellow-200" />
                  <h1 className="text-3xl font-extrabold">👑 Premium Membership</h1>
                </div>
                <p className="text-yellow-100 text-lg">
                  Thank you for supporting CareerCopilot.
                </p>
                <p className="text-yellow-100 text-base">
                  Enjoy all Premium AI features.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* AI Mock Interview Hero Section - Flagship Feature */}
        <Card className="overflow-hidden border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 via-orange-500/5 to-amber-500/5 shadow-xl shadow-yellow-500/5">
          <div className="relative">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-amber-500/10 animate-pulse" />
            
            <CardContent className="relative p-8 md:p-10">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Left: Illustration/Icon */}
                <div className="flex-shrink-0">
                  <div className="relative w-32 h-32 md:w-40 md:h-40">
                    {/* Animated circles */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 animate-pulse" />
                    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-yellow-500/30 to-orange-500/30 animate-ping" style={{ animationDuration: '2s' }} />
                    
                    {/* Central icon */}
                    <div className="absolute inset-4 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-2xl">
                      <div className="flex items-center gap-2 text-white">
                        <Mic className="w-8 h-8 md:w-10 md:h-10" />
                        <Video className="w-8 h-8 md:w-10 md:h-10" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Content */}
                <div className="flex-1 space-y-4 text-center lg:text-left">
                  <div className="flex items-center gap-3 justify-center lg:justify-start">
                    <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500/20" />
                    <h2 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                      🎤 AI Mock Interview
                    </h2>
                    <PremiumBadge size="md" />
                  </div>
                  
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                    Practice realistic AI-powered mock interviews using voice and optional webcam. Receive intelligent AI feedback, communication analysis, confidence insights, and personalized improvement suggestions.
                  </p>

                  {/* Feature highlights */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Mic className="w-4 h-4 text-yellow-500" />
                      <span>Voice AI Interview</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Video className="w-4 h-4 text-orange-500" />
                      <span>Video AI Interview</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Brain className="w-4 h-4 text-purple-500" />
                      <span>Real-time AI Feedback</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                      <span>Communication Analysis</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span>Confidence Score</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>Answer Evaluation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Sparkles className="w-4 h-4 text-pink-500" />
                      <span>Performance Analytics</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Zap className="w-4 h-4 text-cyan-500" />
                      <span>Smart Suggestions</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-4">
                    <Button
                      onClick={() => router.push("/voice-mock-interview")}
                      className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 transition-all duration-300"
                    >
                      <Mic className="w-5 h-5 mr-2" />
                      Start AI Mock Interview
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Premium Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border border-border/40 bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-xs font-semibold text-muted-foreground uppercase">Premium Since</span>
              </div>
              <p className="text-lg font-bold">{premiumSince}</p>
            </CardContent>
          </Card>
          <Card className="border border-border/40 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-green-500" />
                <span className="text-xs font-semibold text-muted-foreground uppercase">Subscription Type</span>
              </div>
              <p className="text-lg font-bold">{subscriptionDuration}</p>
            </CardContent>
          </Card>
          <Card className="border border-border/40 bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-semibold text-muted-foreground uppercase">Features Unlocked</span>
              </div>
              <p className="text-lg font-bold">6+</p>
            </CardContent>
          </Card>
          <Card className="border border-border/40 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-semibold text-muted-foreground uppercase">Membership Status</span>
              </div>
              <p className="text-lg font-bold text-green-500">Active</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Current Membership Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                Current Membership
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50/50 dark:bg-yellow-900/10">
                <span className="text-sm text-muted-foreground">👑 Current Plan</span>
                <span className="font-bold">{getPlanName(user.planType)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50/50 dark:bg-green-900/10">
                <span className="text-sm text-muted-foreground">🟢 Status</span>
                <span className="font-bold text-green-600 dark:text-green-400">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/10">
                <span className="text-sm text-muted-foreground">📅 Purchase Date</span>
                <span className="font-semibold">{formatDate(user.purchaseDate)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50/50 dark:bg-purple-900/10">
                <span className="text-sm text-muted-foreground">🛡 Payment Status</span>
                <span className="font-semibold">Verified & Successful</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50/50 dark:bg-orange-900/10">
                <span className="text-sm text-muted-foreground">💳 Payment Provider</span>
                <span className="font-semibold capitalize">{user.paymentProvider || 'Razorpay'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-pink-50/50 dark:bg-pink-900/10">
                <span className="text-sm text-muted-foreground">🆔 Payment ID</span>
                <span className="font-mono text-xs">{user.paymentId || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-teal-50/50 dark:bg-teal-900/10">
                <span className="text-sm text-muted-foreground">📄 Transaction Status</span>
                <span className="font-semibold">Verified</span>
              </div>
            </CardContent>
          </Card>

          {/* Features Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Unlocked Features
              </CardTitle>
              <CardDescription>All features included in your premium membership</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {premiumFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50/50 dark:bg-yellow-900/10">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <h4 className="font-semibold text-sm">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
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
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-bold text-lg">
                  {user.currency || "INR"} {user.amountPaid || "0"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Currency</span>
                <span className="font-medium">{user.currency || "INR"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Purchase Time</span>
                <span className="font-medium">{user.purchaseDate ? new Date(user.purchaseDate).toLocaleTimeString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono text-sm">{user.paymentId || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono text-sm">{transactions[0]?.orderId || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium capitalize">{user.paymentProvider || 'Razorpay'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Future Benefits Card */}
          <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Future Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                As a Premium member, every new Premium feature released in CareerCopilot will automatically become available to you at no additional cost.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Account Status Card */}
        <Card className="border border-border/40 bg-gradient-to-r from-green-500/5 to-emerald-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50/50 dark:bg-green-900/10">
                <Clock className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Premium Since</p>
                  <p className="text-sm font-semibold">{premiumSince}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/10">
                <Award className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Lifetime Membership</p>
                  <p className="text-sm font-semibold">Active</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-50/50 dark:bg-purple-900/10">
                <Lock className="w-4 h-4 text-purple-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Secure Payment</p>
                  <p className="text-sm font-semibold">Verified</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50/50 dark:bg-yellow-900/10">
                <Database className="w-4 h-4 text-yellow-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Database Synced</p>
                  <p className="text-sm font-semibold">Yes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Payment History
            </CardTitle>
            <CardDescription>Your complete payment transaction history</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>You currently have one successful Premium purchase.</p>
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Action Buttons */}
        <Card className="border-2 border-yellow-500/30 bg-gradient-to-r from-yellow-500/5 to-orange-500/5">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleDownloadReceipt}
                disabled={downloadingReceipt}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                {downloadingReceipt ? "Generating..." : "📄 Download Receipt"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleContactSupport}
              >
                <Mail className="w-4 h-4 mr-2" />
                💬 Contact Support
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => router.push("/dashboard")}
              >
                <Home className="w-4 h-4 mr-2" />
                🏠 Go To Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
