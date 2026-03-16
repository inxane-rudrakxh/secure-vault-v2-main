import React, { useState } from "react";
import { Lock, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface VerifyPinModalProps {
  open: boolean;
  onVerify: (pin: string) => Promise<boolean>;
  onCancel: () => void;
}

export const VerifyPinModal: React.FC<VerifyPinModalProps> = ({
  open,
  onVerify,
  onCancel,
}) => {
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePinChange = (value: string) => {
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, "").slice(0, 6);
    setPin(digitsOnly);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (pin.length < 4 || pin.length > 6) {
      setError("PIN must be 4-6 digits");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onVerify(pin);
      if (!success) {
        setError("Incorrect PIN. Please try again.");
        setPin("");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setPin("");
    setError("");
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">Enter Encryption PIN</DialogTitle>
          <DialogDescription>
            Enter your 4-6 digit PIN to access your encrypted files.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="verify-pin">Encryption PIN</Label>
            <div className="relative">
              <Input
                id="verify-pin"
                type={showPin ? "text" : "password"}
                placeholder="Enter your PIN"
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                className="pr-10 text-center text-lg tracking-widest"
                maxLength={6}
                autoComplete="off"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Go Back
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || pin.length < 4}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Unlock Vault"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
