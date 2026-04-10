import React from "react";
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Moon,
  Sun,
  Lock,
  Mail,
  Smartphone,
  Cloud,
  CheckCircle,
  Key,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useVault } from "@/contexts/VaultContext";
import { useEncryptionPin } from "@/hooks/useEncryptionPin";
import { ResetPinDialog } from "@/components/settings/ResetPinDialog";
import { AppLockSettings } from "@/components/settings/AppLockSettings";
import { TwoFactorSettings } from "@/components/settings/TwoFactorSettings";
import { SubscriptionComingSoonModal } from "@/components/settings/SubscriptionComingSoonModal";
import { ChangePasswordDialog } from "@/components/settings/ChangePasswordDialog";

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { files, storageUsed, storageLimit } = useVault();
  const { hasPin, updatePin } = useEncryptionPin();
  const [showSubscriptionModal, setShowSubscriptionModal] = React.useState(false);

  const storagePercentage = (storageUsed / storageLimit) * 100;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-muted-foreground" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and security preferences
        </p>
      </div>

      {/* Account Settings */}
      <GlassCard>
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <User className="w-5 h-5" />
          Account Settings
        </h2>

        <div className="space-y-6">
          {/* Profile Info */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
              {(user?.name || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{user?.name || "SecureVault User"}</h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{user?.email || "No email"}</span>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="text-sm font-medium">Account Status</span>
              </div>
              <p className="text-sm text-muted-foreground">Active & Verified</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Cloud className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Plan</span>
              </div>
              <p className="text-sm text-muted-foreground">Free (10GB Storage)</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Security Settings */}
      <GlassCard>
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Security Settings
        </h2>

        <div className="space-y-4">
          {/* Encryption Status */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-success/5 border border-success/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="font-medium">AES-256 Encryption</p>
                <p className="text-sm text-muted-foreground">All files are encrypted</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
              Active
            </span>
          </div>

          {/* Two-Factor Authentication */}
          <TwoFactorSettings />

          {/* Change Password */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-muted-foreground">Change your account password</p>
              </div>
            </div>
            <ChangePasswordDialog />
          </div>

          {/* Reset Encryption PIN */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Key className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">File Encryption PIN</p>
                <p className="text-sm text-muted-foreground">
                  {hasPin ? "PIN is set" : "PIN not configured"}
                </p>
              </div>
            </div>
            <ResetPinDialog onResetPin={updatePin} hasPin={hasPin === true} />
          </div>

          {/* App Lock PIN */}
          <AppLockSettings />
        </div>
      </GlassCard>

      {/* Appearance */}
      <GlassCard>
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          Appearance
        </h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              {theme === "dark" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </div>
            <div>
              <Label htmlFor="theme-toggle" className="font-medium cursor-pointer">
                Dark Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                {theme === "dark" ? "Dark theme is enabled" : "Light theme is enabled"}
              </p>
            </div>
          </div>
          <Switch
            id="theme-toggle"
            checked={theme === "dark"}
            onCheckedChange={toggleTheme}
          />
        </div>
      </GlassCard>

      {/* Storage Usage */}
      <GlassCard>
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          Cloud Storage
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{formatBytes(storageUsed)} used</p>
              <p className="text-sm text-muted-foreground">
                of {formatBytes(storageLimit)} total
              </p>
            </div>
            <span className="text-2xl font-bold text-primary">
              {storagePercentage.toFixed(1)}%
            </span>
          </div>

          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min(storagePercentage, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{files.length} encrypted files</span>
            <Button variant="outline" size="sm" onClick={() => setShowSubscriptionModal(true)}>
              Upgrade Plan
            </Button>
          </div>
        </div>
      </GlassCard>

      <SubscriptionComingSoonModal
        open={showSubscriptionModal}
        onOpenChange={setShowSubscriptionModal}
      />

      {/* Multi-Device Support */}
      <GlassCard>
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Multi-Device Support
        </h2>

        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">PWA Support Active</p>
              <p className="text-sm text-muted-foreground">
                Access your vault from any device
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Install SecureVault on your device for offline access and native-like experience.
            Your files sync automatically across all connected devices.
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default Settings;
