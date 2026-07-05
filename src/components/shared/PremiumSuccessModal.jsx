"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function PremiumSuccessModal({ isOpen, onClose }) {
  const router = useRouter();

  const handleGoToDashboard = () => {
    onClose();
    router.push("/dashboard");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-gradient-to-r from-green-400 to-emerald-600 p-4">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center">
              🎉 Congratulations!
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              Welcome to CareerCopilot Premium!
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl p-4 border border-green-200 dark:border-green-800">
            <h3 className="font-bold text-green-800 dark:text-green-200 mb-3 text-center">
              You now have access to:
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Voice AI Mock Interviews</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Video AI Mock Interviews</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">🌍 Multilingual AI Experience</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Future Premium Features</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-6 text-lg"
            onClick={handleGoToDashboard}
          >
            Go to Dashboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
