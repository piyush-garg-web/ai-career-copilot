import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function PremiumRequiredModal({ isOpen, onClose, featureName = "this feature" }) {
  const router = useRouter();

  const features = [
    "AI Voice Mock Interviews",
    "AI Video Mock Interviews",
    "🌍 Multilingual AI Experience",
    "Future Premium Features",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 p-2">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold">Premium Required</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {featureName} is available exclusively for Premium users. Unlock all premium features to take your career prep to the next level!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-3">What you get with Premium:</h3>
            <ul className="space-y-2">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-6 text-lg"
            onClick={() => {
              onClose();
              router.push("/upgrade");
            }}
          >
            Upgrade to Premium
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
