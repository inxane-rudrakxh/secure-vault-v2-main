import React, { useState } from "react";
import { Lock, Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SetupPinModalProps {
  open: boolean;
  onPinSet: (pin: string) => Promise<boolean>;
}

export const SetupPinModal: React.FC<SetupPinModalProps> = ({
  open,
  onPinSet,
}) => {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePin = (value: string): boolean => {
    return /^\d{4,6}$/.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validatePin(pin)) {
      setError("PIN must be 4-6 digits");
      return;
    }

    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    setIsSubmitting(true);
    const success = await onPinSet(pin);
    setIsSubmitting(false);

    if (!success) {
      setError("Failed to set PIN. Please try again.");
    }
  };

  const handlePinChange = (value: string, setter: (v: string) => void) => {
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, "").slice(0, 6);
    setter(digitsOnly);
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md glass-card border-border/50"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-xl font-bold">
            Set Encryption PIN
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            This PIN will be required to encrypt and decrypt your files.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* PIN Input */}
          <div className="space-y-2">
            <Label htmlFor="pin">Enter PIN (4-6 digits)</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="pin"
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                pattern="\d*"
                value={pin}
                onChange={(e) => handlePinChange(e.target.value, setPin)}
                placeholder="••••••"
                className="pl-10 pr-10 h-12 text-center text-lg tracking-widest"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPin ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm PIN Input */}
          <div className="space-y-2">
            <Label htmlFor="confirmPin">Confirm PIN</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="confirmPin"
                type={showConfirmPin ? "text" : "password"}
                inputMode="numeric"
                pattern="\d*"
                value={confirmPin}
                onChange={(e) => handlePinChange(e.target.value, setConfirmPin)}
                placeholder="••••••"
                className="pl-10 pr-10 h-12 text-center text-lg tracking-widest"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPin(!showConfirmPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPin ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          {/* Info */}
          <div className="p-4 rounded-xl bg-muted/50 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary flex-shrink-0" />
              Your PIN is securely hashed and never stored in plain text.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12"
            disabled={isSubmitting || !pin || !confirmPin}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Setting PIN...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Set Encryption PIN
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SetupPinModal;
