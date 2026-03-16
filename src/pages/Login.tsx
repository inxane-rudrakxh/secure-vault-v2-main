import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { GitHubSignInButton } from "@/components/auth/GitHubSignInButton";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { TwoFactorVerify } from "@/components/auth/TwoFactorVerify";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, logout, failedAttempts, user } = useAuth();
  const { subscribe: subscribePush } = usePushNotifications();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [needs2FA, setNeeds2FA] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        try {
          const currentUid = auth.currentUser?.uid || user?.id || null;
          if (currentUid) {
            const totpSnapshot = await getDoc(doc(db, "users", currentUid, "security", "totp"));
            const totpData = totpSnapshot.data();
            if (totpSnapshot.exists() && totpData?.isEnabled) {
              setNeeds2FA(true);
              setIsLoading(false);
              return;
            }
          }
        } catch {
          // Continue without 2FA if lookup fails.
        }

        subscribePush();
        sessionStorage.removeItem("securevault_pin_verified");
        navigate("/dashboard", { replace: true });
      } else {
        setError(result.error || "Invalid email or password. This attempt has been logged.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FAVerified = () => {
    sessionStorage.setItem("securevault_2fa_verified", "true");
    sessionStorage.removeItem("securevault_pin_verified");
    navigate("/dashboard", { replace: true });
  };

  const handle2FACancel = async () => {
    setNeeds2FA(false);
    await logout();
  };

  if (needs2FA) {
    return <TwoFactorVerify onVerified={handle2FAVerified} onCancel={handle2FACancel} />;
  }

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center transition-transform group-hover:scale-105">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold mt-4">Welcome back</h1>
          <p className="text-muted-foreground mt-1">Sign in to access your vault</p>
        </div>

        <GlassCard variant="elevated">
          {failedAttempts > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-warning/10 border border-warning/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-warning">Security Alert</p>
                  <p className="text-xs text-muted-foreground mt-1">{failedAttempts} failed login attempt(s) detected recently.</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <GoogleSignInButton />
            <GitHubSignInButton />
          </div>

          <AuthDivider />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="pl-11 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pl-11 h-12"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-12" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link to="/register" className="text-primary font-medium hover:underline">
              Create one
            </Link>
          </div>
        </GlassCard>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Protected by AES-256 encryption. All login attempts are monitored.
        </p>
      </div>
    </div>
  );
};

export default Login;
