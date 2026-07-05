import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { PremiumMembershipClient } from "@/components/shared/PremiumMembershipClient";

export const metadata = {
  title: "Premium Membership | AI Career Copilot",
  description: "Manage your premium membership, view payment details, and access transaction history.",
};

export default async function PremiumMembershipPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    redirect("/sign-in");
  }

  // Fetch user record
  const dbUser = await db.user.findUnique({
    where: { clerkId },
  });

  if (!dbUser) {
    redirect("/dashboard");
  }

  // Redirect free users to upgrade page
  if (!dbUser.isPremium) {
    redirect("/upgrade");
  }

  // Fetch user's transactions
  const transactions = await db.transaction.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PremiumMembershipClient
      user={dbUser}
      transactions={transactions}
    />
  );
}
