import React, { useState, useEffect, useRef } from "react";
import { Shield, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppLockPin } from "@/hooks/useAppLockPin";

interface AppLockScreenProps {
  onUnlocked: () => void;
}

export const AppLockScreen: React.FC<AppLockScreenProps> = ({ onUnlocked }) => {
  const { verifyPin } = useAppLockPin();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!lockoutUntil) return;
    const interval = setInterval(() => {
      if (Date.now() >= lockoutUntil) {
        setLockoutUntil(null);
        setAttempts(0);
        setError("");
        setPin("");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const remainingSeconds = lockoutUntil
    ? Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000))
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutUntil || isVerifying || pin.length < 4) return;

    setIsVerifying(true);
    setError("");

    const valid = await verifyPin(pin);
    setIsVerifying(false);

    if (valid) {
      sessionStorage.setItem("securevault_applock_unlocked", "true");
      onUnlocked();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPin("");
      if (newAttempts >= 3) {
        setLockoutUntil(Date.now() + 30_000);
        setError("Too many failed attempts. Locked for 30 seconds.");
      } else {
        setError(`Incorrect PIN. ${3 - newAttempts} attempt(s) remaining.`);
      }
    }
  };

  const handlePinChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setPin(digits);
    if (error && !lockoutUntil) setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm text-center animate-fade-in space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">SecureVault Locked</h1>
            <p className="text-muted-foreground mt-1">Enter your App Lock PIN to continue</p>
          </div>
        </div>

        {/* Lock Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
            <Lock className="w-10 h-10 text-primary" />
          </div>
        </div>

        {/* PIN Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => handlePinChange(e.target.value)}
            className="text-center text-2xl tracking-[0.5em] h-14"
            maxLength={6}
            disabled={!!lockoutUntil}
            autoComplete="off"
          />

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm justify-center">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {lockoutUntil ? `Locked. Try again in ${remainingSeconds}s` : error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12"
            disabled={pin.length < 4 || !!lockoutUntil || isVerifying}
          >
            {isVerifying ? "Verifying..." : "Unlock"}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground">
          App Lock PIN protects your session
        </p>
      </div>
    </div>
  );
};
