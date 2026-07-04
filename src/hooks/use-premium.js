import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function usePremium() {
  const { user } = useUser();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [planInfo, setPlanInfo] = useState(null);

  useEffect(() => {
    const checkPremium = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/user");
        if (res.ok) {
          const data = await res.json();
          setIsPremium(data.isPremium || false);
          setPlanInfo({
            planType: data.planType,
            subscriptionStatus: data.subscriptionStatus,
            expiryDate: data.expiryDate,
            purchaseDate: data.purchaseDate,
          });
        }
      } catch (error) {
        console.error("Error checking premium status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkPremium();
  }, [user]);

  return {
    isPremium,
    loading,
    planInfo,
    refresh: async () => {
      if (!user) return;
      try {
        const res = await fetch("/api/user");
        if (res.ok) {
          const data = await res.json();
          setIsPremium(data.isPremium || false);
          setPlanInfo({
            planType: data.planType,
            subscriptionStatus: data.subscriptionStatus,
            expiryDate: data.expiryDate,
            purchaseDate: data.purchaseDate,
          });
        }
      } catch (error) {
        console.error("Error refreshing premium status:", error);
      }
    },
  };
}
