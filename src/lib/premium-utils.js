import { db } from "./db";

export async function getUserPremiumStatus(userId) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      isPremium: true,
      planType: true,
      subscriptionStatus: true,
      expiryDate: true,
    },
  });

  if (!user) return { isPremium: false };

  // If user is marked as premium but subscription expired, update it
  if (user.isPremium && user.expiryDate && new Date(user.expiryDate) < new Date()) {
    await db.user.update({
      where: { id: userId },
      data: {
        isPremium: false,
        subscriptionStatus: "EXPIRED",
      },
    });
    return { isPremium: false };
  }

  return user;
}

export async function checkUserPremium(userId) {
  const status = await getUserPremiumStatus(userId);
  return status.isPremium;
}
