import React from "react";
import { Link } from "react-router-dom";
import {
  FolderLock,
  AlertTriangle,
  Cloud,
  Settings,
  Shield,
  HardDrive,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useVault } from "@/contexts/VaultContext";

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export const Dashboard: React.FC = () => {
  const { user, intruderLogs } = useAuth();
  const { files, storageUsed, storageLimit } = useVault();

  const storagePercentage = (storageUsed / storageLimit) * 100;
  const recentIntruderLogs = intruderLogs.slice(0, 3);
  const hasSecurityAlerts = intruderLogs.length > 0;

  const quickActions = [
    {
      icon: FolderLock,
      title: "My Files",
      description: `${files.length} encrypted files`,
      href: "/files",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: AlertTriangle,
      title: "Intruder Logs",
      description: hasSecurityAlerts ? `${intruderLogs.length} alerts` : "No alerts",
      href: "/intruder-logs",
      color: hasSecurityAlerts ? "text-warning" : "text-muted-foreground",
      bgColor: hasSecurityAlerts ? "bg-warning/10" : "bg-muted",
    },
    {
      icon: Cloud,
      title: "Cloud Storage",
      description: `${formatBytes(storageUsed)} used`,
      href: "/files",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Settings,
      title: "Settings",
      description: "Account & Security",
      href: "/settings",
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            Your vault is secure and protected.
          </p>
        </div>
        <Link to="/files">
          <Button>
            <FolderLock className="w-4 h-4 mr-2" />
            Open Vault
          </Button>
        </Link>
      </div>

      {/* Security Status Card */}
      <GlassCard className="relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-success" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Vault Status</h2>
                <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
                  Secure
                </span>
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                All systems operational • AES-256 encryption active
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Storage Card */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Storage</h3>
              <p className="text-sm text-muted-foreground">
                {formatBytes(storageUsed)} of {formatBytes(storageLimit)}
              </p>
            </div>
          </div>
          <span className="text-sm font-medium">{storagePercentage.toFixed(1)}%</span>
        </div>

        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${Math.min(storagePercentage, 100)}%` }}
          />
        </div>

        {storagePercentage > 80 && (
          <div className="mt-4 flex items-center gap-2 text-warning text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Storage almost full. Consider upgrading your plan.</span>
          </div>
        )}
      </GlassCard>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link key={action.title} to={action.href}>
            <GlassCard className="h-full hover:scale-[1.02] transition-transform duration-200 cursor-pointer">
              <div className={`w-12 h-12 rounded-xl ${action.bgColor} flex items-center justify-center mb-4`}>
                <action.icon className={`w-6 h-6 ${action.color}`} />
              </div>
              <h3 className="font-semibold mb-1">{action.title}</h3>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </GlassCard>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      {hasSecurityAlerts && (
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Security Alerts</h3>
            <Link to="/intruder-logs">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {recentIntruderLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-warning/5 border border-warning/10"
              >
                <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    Failed attempt: {log.type === "pin_failed" ? "PIN Validation" : "System Access"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

    </div>
  );
};

export default Dashboard;
