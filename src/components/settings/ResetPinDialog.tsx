import React, { useState } from "react";
import { Lock, Eye, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ResetPinDialogProps {
  onResetPin: (
    currentPin: string,
    newPin: string
  ) => Promise<{ success: boolean; error?: string }>;
  hasPin: boolean;
}

export const ResetPinDialog: React.FC<ResetPinDialogProps> = ({
  onResetPin,
  hasPin,
}) => {
  const [open, setOpen] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePin = (value: string): boolean => {
    return /^\d{4,6}$/.test(value);
  };

  const handlePinChange = (value: string, setter: (v: string) => void) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 6);
    setter(digitsOnly);
    setError("");
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validatePin(currentPin)) {
      setError("Current PIN must be 4-6 digits");
      return;
    }

    if (!validatePin(newPin)) {
      setError("New PIN must be 4-6 digits");
      return;
    }

    if (newPin !== confirmNewPin) {
      setError("New PINs do not match");
      return;
    }

    if (currentPin === newPin) {
      setError("New PIN must be different from current PIN");
      return;
    }

    setIsSubmitting(true);
    const result = await onResetPin(currentPin, newPin);
    setIsSubmitting(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        resetForm();
      }, 1500);
    } else {
      setError(result.error || "Failed to reset PIN");
    }
  };

  const resetForm = () => {
    setCurrentPin("");
    setNewPin("");
    setConfirmNewPin("");
    setError("");
    setSuccess(false);
    setShowCurrentPin(false);
    setShowNewPin(false);
    setShowConfirmPin(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={!hasPin}>
          Reset PIN
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md glass-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Reset Encryption PIN
          </DialogTitle>
          <DialogDescription>
            Enter your current PIN and set a new one.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <p className="font-semibold text-lg">PIN Updated Successfully!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your encryption PIN has been changed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Current PIN */}
            <div className="space-y-2">
              <Label htmlFor="currentPin">Current PIN</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="currentPin"
                  type={showCurrentPin ? "text" : "password"}
                  inputMode="numeric"
                  pattern="\d*"
                  value={currentPin}
                  onChange={(e) => handlePinChange(e.target.value, setCurrentPin)}
                  placeholder="••••••"
                  className="pl-10 pr-10 h-11 text-center tracking-widest"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPin(!showCurrentPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPin ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New PIN */}
            <div className="space-y-2">
              <Label htmlFor="newPin">New PIN (4-6 digits)</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="newPin"
                  type={showNewPin ? "text" : "password"}
                  inputMode="numeric"
                  pattern="\d*"
                  value={newPin}
                  onChange={(e) => handlePinChange(e.target.value, setNewPin)}
                  placeholder="••••••"
                  className="pl-10 pr-10 h-11 text-center tracking-widest"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPin(!showNewPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPin ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm New PIN */}
            <div className="space-y-2">
              <Label htmlFor="confirmNewPin">Confirm New PIN</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmNewPin"
                  type={showConfirmPin ? "text" : "password"}
                  inputMode="numeric"
                  pattern="\d*"
                  value={confirmNewPin}
                  onChange={(e) =>
                    handlePinChange(e.target.value, setConfirmNewPin)
                  }
                  placeholder="••••••"
                  className="pl-10 pr-10 h-11 text-center tracking-widest"
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
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <XCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11"
              disabled={isSubmitting || !currentPin || !newPin || !confirmNewPin}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating PIN...
                </>
              ) : (
                "Update PIN"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ResetPinDialog;
