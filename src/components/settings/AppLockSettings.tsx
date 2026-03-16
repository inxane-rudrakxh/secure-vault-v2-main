import React, { useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppLockPin } from "@/hooks/useAppLockPin";
import { useAuth } from "@/contexts/AuthContext";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "@/integrations/firebase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const AppLockSettings: React.FC = () => {
  const { hasPin, isLoading, createPin, removePin, updatePin } = useAppLockPin();
  const { user } = useAuth();

  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [enableError, setEnableError] = useState("");
  const [isEnabling, setIsEnabling] = useState(false);
  const [showEnableForm, setShowEnableForm] = useState(false);

  const [password, setPassword] = useState("");
  const [isDisabling, setIsDisabling] = useState(false);

  const [resetCurrentPin, setResetCurrentPin] = useState("");
  const [resetNewPin, setResetNewPin] = useState("");
  const [resetConfirmPin, setResetConfirmPin] = useState("");
  const [resetError, setResetError] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            <Lock className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">App Lock PIN</p>
            <p className="text-sm text-muted-foreground">Checking...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleEnable = async () => {
    setEnableError("");
    if (newPin.length < 4 || newPin.length > 6) {
      setEnableError("PIN must be 4-6 digits");
      return;
    }
    if (newPin !== confirmPin) {
      setEnableError("PINs do not match");
      return;
    }

    setIsEnabling(true);
    const ok = await createPin(newPin);
    setIsEnabling(false);

    if (ok) {
      toast.success("App Lock PIN enabled");
      setShowEnableForm(false);
      setNewPin("");
      setConfirmPin("");
    } else {
      setEnableError("Failed to set PIN. Try again.");
    }
  };

  const handleDisable = async () => {
    if (!user?.email || !password || !auth.currentUser) return;

    setIsDisabling(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(auth.currentUser, credential);
    } catch {
      toast.error("Incorrect password");
      setIsDisabling(false);
      return;
    }

    const ok = await removePin();
    setIsDisabling(false);
    setPassword("");

    if (ok) {
      toast.success("App Lock PIN disabled");
    } else {
      toast.error("Failed to disable App Lock PIN");
    }
  };

  const handleReset = async () => {
    setResetError("");
    if (resetNewPin.length < 4 || resetNewPin.length > 6) {
      setResetError("New PIN must be 4-6 digits");
      return;
    }
    if (resetNewPin !== resetConfirmPin) {
      setResetError("New PINs do not match");
      return;
    }

    setIsResetting(true);
    const result = await updatePin(resetCurrentPin, resetNewPin);
    setIsResetting(false);

    if (result.success) {
      toast.success("App Lock PIN updated");
      setShowResetForm(false);
      setResetCurrentPin("");
      setResetNewPin("");
      setResetConfirmPin("");
    } else {
      setResetError(result.error || "Failed to update PIN");
    }
  };

  if (!hasPin) {
    return (
      <div className="p-4 rounded-xl bg-muted/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <Lock className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">App Lock PIN</p>
              <p className="text-sm text-muted-foreground">Protect dashboard access with a PIN</p>
            </div>
          </div>
          {!showEnableForm && (
            <Button variant="outline" size="sm" onClick={() => setShowEnableForm(true)}>
              Enable
            </Button>
          )}
        </div>

        {showEnableForm && (
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="space-y-2">
              <Label>New PIN (4-6 digits)</Label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={newPin}
                onChange={(event) => setNewPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter PIN"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm PIN</Label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={confirmPin}
                onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Confirm PIN"
              />
            </div>
            {enableError && <p className="text-sm text-destructive">{enableError}</p>}
            <div className="flex gap-2">
              <Button size="sm" onClick={handleEnable} disabled={isEnabling}>
                {isEnabling ? "Setting..." : "Set PIN"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowEnableForm(false);
                  setNewPin("");
                  setConfirmPin("");
                  setEnableError("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-muted/30 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="font-medium">App Lock PIN</p>
            <p className="text-sm text-muted-foreground">Enabled - dashboard is protected</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!showResetForm && (
            <Button variant="outline" size="sm" onClick={() => setShowResetForm(true)}>
              Reset
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">Disable</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Disable App Lock PIN</AlertDialogTitle>
                <AlertDialogDescription>
                  Enter your account password to confirm disabling the App Lock PIN.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-2 py-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setPassword("")}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDisable} disabled={!password || isDisabling}>
                  {isDisabling ? "Disabling..." : "Disable"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {showResetForm && (
        <div className="space-y-3 pt-2 border-t border-border">
          <div className="space-y-2">
            <Label>Current PIN</Label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={resetCurrentPin}
              onChange={(event) => setResetCurrentPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Current PIN"
            />
          </div>
          <div className="space-y-2">
            <Label>New PIN (4-6 digits)</Label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={resetNewPin}
              onChange={(event) => setResetNewPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="New PIN"
            />
          </div>
          <div className="space-y-2">
            <Label>Confirm New PIN</Label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={resetConfirmPin}
              onChange={(event) => setResetConfirmPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Confirm New PIN"
            />
          </div>
          {resetError && <p className="text-sm text-destructive">{resetError}</p>}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleReset} disabled={isResetting}>
              {isResetting ? "Updating..." : "Update PIN"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowResetForm(false);
                setResetCurrentPin("");
                setResetNewPin("");
                setResetConfirmPin("");
                setResetError("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
