import React, { useState, useEffect } from "react";
import { Smartphone, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth, db } from "@/integrations/firebase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { buildOtpAuthUri, generateTotpSecret, verifyTotpCode } from "@/integrations/firebase/totp";

export const TwoFactorSettings: React.FC = () => {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [setupOpen, setSetupOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);

  const [otpauthUri, setOtpauthUri] = useState("");
  const [secret, setSecret] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [setupStep, setSetupStep] = useState<"qr" | "verify">("qr");
  const [setupLoading, setSetupLoading] = useState(false);

  const [disablePassword, setDisablePassword] = useState("");
  const [disableLoading, setDisableLoading] = useState(false);

  const getTotpRef = () => {
    if (!user?.id) return null;
    return doc(db, "users", user.id, "security", "totp");
  };

  const checkStatus = async () => {
    const totpRef = getTotpRef();
    if (!totpRef) {
      setIsEnabled(false);
      setIsLoading(false);
      return;
    }

    try {
      const snapshot = await getDoc(totpRef);
      const data = snapshot.data();
      setIsEnabled(Boolean(snapshot.exists() && data?.isEnabled));
    } catch {
      setIsEnabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [user?.id]);

  const startSetup = async () => {
    if (!user?.id || !user.email) return;

    setSetupLoading(true);
    try {
      const generatedSecret = generateTotpSecret();
      const otpUri = buildOtpAuthUri(generatedSecret, user.email, "SecureVault");
      const totpRef = getTotpRef();
      if (!totpRef) throw new Error("Not authenticated");

      await setDoc(
        totpRef,
        {
          secret: generatedSecret,
          isEnabled: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setOtpauthUri(otpUri);
      setSecret(generatedSecret);
      setSetupStep("qr");
      setVerifyCode("");
      setSetupOpen(true);
    } catch (error: any) {
      toast.error(error?.message || "Failed to start 2FA setup");
    } finally {
      setSetupLoading(false);
    }
  };

  const verifySetup = async () => {
    if (verifyCode.length !== 6) return;

    const totpRef = getTotpRef();
    if (!totpRef) return;

    setSetupLoading(true);
    try {
      const snapshot = await getDoc(totpRef);
      const data = snapshot.data();
      if (!snapshot.exists() || !data?.secret) {
        toast.error("2FA setup expired. Please start again.");
        return;
      }

      const isValid = await verifyTotpCode(data.secret, verifyCode);
      if (!isValid) {
        toast.error("Invalid code");
        return;
      }

      await updateDoc(totpRef, { isEnabled: true, updatedAt: serverTimestamp() });
      toast.success("Two-Factor Authentication enabled!");
      setIsEnabled(true);
      setSetupOpen(false);
    } catch {
      toast.error("Verification failed");
    } finally {
      setSetupLoading(false);
    }
  };

  const disable2FA = async () => {
    if (!disablePassword || !auth.currentUser || !user?.email) return;

    setDisableLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, disablePassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      const totpRef = getTotpRef();
      if (totpRef) {
        await deleteDoc(totpRef);
      }

      toast.success("Two-Factor Authentication disabled");
      setIsEnabled(false);
      setDisableOpen(false);
      setDisablePassword("");
    } catch {
      toast.error("Incorrect password");
    } finally {
      setDisableLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Two-Factor Authentication</p>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEnabled ? "bg-success/10" : "bg-muted"}`}>
            {isEnabled ? (
              <ShieldCheck className="w-5 h-5 text-success" />
            ) : (
              <Smartphone className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="font-medium">Two-Factor Authentication</p>
            <p className="text-sm text-muted-foreground">
              {isEnabled ? "Enabled - authenticator app required at login" : "Add an extra layer of security"}
            </p>
          </div>
        </div>
        {isEnabled ? (
          <Button variant="outline" size="sm" onClick={() => { setDisablePassword(""); setDisableOpen(true); }}>
            Disable
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={startSetup} disabled={setupLoading}>
            {setupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enable"}
          </Button>
        )}
      </div>

      <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              {setupStep === "qr"
                ? "Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)"
                : "Enter the 6-digit code from your authenticator app"}
            </DialogDescription>
          </DialogHeader>

          {setupStep === "qr" ? (
            <div className="space-y-4">
              <div className="flex justify-center p-4 bg-white rounded-xl">
                {otpauthUri && <QRCodeSVG value={otpauthUri} size={200} />}
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Can't scan? Enter this code manually:</Label>
                <code className="block p-3 rounded-lg bg-muted text-xs font-mono break-all select-all">{secret}</code>
              </div>
              <Button className="w-full" onClick={() => setSetupStep("verify")}>I've scanned the code</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verify-code">Verification Code</Label>
                <Input
                  id="verify-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={verifyCode}
                  onChange={(event) => setVerifyCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSetupStep("qr")} className="flex-1">Back</Button>
                <Button
                  onClick={verifySetup}
                  disabled={verifyCode.length !== 6 || setupLoading}
                  className="flex-1"
                >
                  {setupLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Verify & Enable
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={disableOpen} onOpenChange={setDisableOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your password to confirm disabling 2FA. This will reduce your account security.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="disable-password">Password</Label>
              <Input
                id="disable-password"
                type="password"
                placeholder="Enter your password"
                value={disablePassword}
                onChange={(event) => setDisablePassword(event.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button variant="outline" className="flex-1">Cancel</Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={disable2FA}
                disabled={!disablePassword || disableLoading}
                className="flex-1"
              >
                {disableLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Disable 2FA
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
