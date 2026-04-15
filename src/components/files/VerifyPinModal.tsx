import React, { useState } from "react";
import { Lock, AlertCircle, Eye, EyeOff, Loader2, Camera } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { IntruderService } from "@/services/intruderService";
import { CameraService } from "@/services/cameraService";

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
  const { user } = useAuth();
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showCaptureWarning, setShowCaptureWarning] = useState(false);

  const handlePinChange = (value: string) => {
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, "").slice(0, 6);
    setPin(digitsOnly);
    setError("");
  };

  const handleIntruderCapture = async (attemptsCount: number) => {
    if (!user) return;
    
    let imageUrl = null;
    
    if (user.cameraConsent && attemptsCount >= 3) {
      setShowCaptureWarning(true);
      setIsCapturing(true);
      
      try {
        const base64Image = await CameraService.captureImage();
        if (base64Image) {
          imageUrl = await IntruderService.uploadIntruderImage(user.id, base64Image);
        }
      } catch (err) {
        console.error("Failed to capture/upload image:", err);
      } finally {
        setShowCaptureWarning(false);
        setIsCapturing(false);
      }
    }
    
    await IntruderService.logIntruderEvent(
      user.id,
      "pin_failed",
      attemptsCount,
      "Encryption PIN verification failed",
      imageUrl
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCapturing) return;
    setError("");

    if (pin.length < 4 || pin.length > 6) {
      setError("PIN must be 4-6 digits");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onVerify(pin);
      if (!success) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setPin("");
        
        if (newAttempts >= 3) {
          setError("Multiple failures. Security event logged.");
          handleIntruderCapture(newAttempts);
        } else {
          setError(`Incorrect PIN. ${3 - newAttempts} attempt(s) remaining before security lockout.`);
        }
      } else {
        setAttempts(0);
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      if (!showCaptureWarning) {
        setIsSubmitting(false);
      }
    }
  };

  // When capturing finishes, unblock submission state
  React.useEffect(() => {
    if (!isCapturing && isSubmitting && attempts > 0) {
       setIsSubmitting(false);
    }
  }, [isCapturing]);

  const handleCancel = () => {
    if (isCapturing) return; // Prevent cancelling while capturing
    setPin("");
    setError("");
    setAttempts(0);
    onCancel();
  };

  return (
    <>
      <Dialog open={open && !showCaptureWarning} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => isCapturing && e.preventDefault()}>
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
                  disabled={isSubmitting || isCapturing}
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
                disabled={isSubmitting || isCapturing}
              >
                Go Back
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || isCapturing || pin.length < 4}
              >
                {isSubmitting || isCapturing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Unlock Vault"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Capture Warning Modal */}
      <Dialog open={showCaptureWarning} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md [&>button]:hidden pointer-events-none">
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-warning/10 flex items-center justify-center mb-4">
              <Camera className="w-8 h-8 text-warning animate-pulse" />
            </div>
            <DialogTitle className="text-xl">Security Alert</DialogTitle>
            <DialogDescription className="pt-2 flex flex-col items-center gap-4">
              <span>Capturing image for unauthorized access protection...</span>
              <Loader2 className="w-6 h-6 animate-spin text-warning" />
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};
