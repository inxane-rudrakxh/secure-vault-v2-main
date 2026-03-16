import React, { useState } from "react";
import { Shield, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { verifyTotpCode } from "@/integrations/firebase/totp";

interface TwoFactorVerifyProps {
  onVerified: () => void;
  onCancel: () => void;
}

export const TwoFactorVerify: React.FC<TwoFactorVerifyProps> = ({ onVerified, onCancel }) => {
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6 || !user?.id) return;

    setError("");
    setIsLoading(true);

    try {
      const totpRef = doc(db, "users", user.id, "security", "totp");
      const snapshot = await getDoc(totpRef);
      const data = snapshot.data();

      if (!snapshot.exists() || !data?.isEnabled || !data?.secret) {
        setError("Two-factor authentication is not enabled for this account.");
        return;
      }

      const isValid = await verifyTotpCode(data.secret, code);
      if (!isValid) {
        setError("Invalid code. Please try again.");
        setCode("");
        return;
      }

      onVerified();
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && code.length === 6) handleVerify();
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold mt-4">Two-Factor Authentication</h1>
          <p className="text-muted-foreground mt-1">Enter the 6-digit code from your authenticator app</p>
        </div>

        <GlassCard variant="elevated">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="totp-code">Verification Code</Label>
              <Input
                id="totp-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={handleKeyDown}
                className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button onClick={handleVerify} className="w-full h-12" disabled={code.length !== 6 || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>

            <Button variant="ghost" onClick={onCancel} className="w-full">
              Sign out
            </Button>
          </div>
        </GlassCard>

        <p className="text-center text-xs text-muted-foreground mt-6">Open your authenticator app to get the code</p>
      </div>
    </div>
  );
};
