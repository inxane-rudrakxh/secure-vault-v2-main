import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Cloud, Shield, Headphones } from "lucide-react";

interface SubscriptionComingSoonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const upcomingFeatures = [
  { icon: Cloud, label: "Extended cloud storage" },
  { icon: Shield, label: "Advanced encryption features" },
  { icon: Headphones, label: "Priority support" },
];

export const SubscriptionComingSoonModal: React.FC<SubscriptionComingSoonModalProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Subscriptions – Coming Soon</DialogTitle>
          <DialogDescription>
            Premium plans and advanced features will be available in a future update.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {upcomingFeatures.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => onOpenChange(false)}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
