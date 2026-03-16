import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertTriangle, Shield, Clock, Globe, Monitor, CheckCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuth } from "@/contexts/AuthContext";

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const IntruderLogs: React.FC = () => {
  const { intruderLogs } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [highlightNewest, setHighlightNewest] = useState(false);

  useEffect(() => {
    if (searchParams.get("highlight") === "newest" && intruderLogs.length > 0) {
      setHighlightNewest(true);
      // Remove query param after highlighting
      const timer = setTimeout(() => {
        setSearchParams({}, { replace: true });
        setTimeout(() => setHighlightNewest(false), 3000);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchParams, intruderLogs.length, setSearchParams]);

  const hasAlerts = intruderLogs.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
          <AlertTriangle className={`w-8 h-8 ${hasAlerts ? "text-warning" : "text-muted-foreground"}`} />
          Intruder Logs
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor unauthorized access attempts to your vault
        </p>
      </div>

      {/* Security Status */}
      <GlassCard className={hasAlerts ? "border-warning/30 bg-warning/5" : ""}>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
            hasAlerts ? "bg-warning/10" : "bg-success/10"
          }`}>
            {hasAlerts ? (
              <AlertTriangle className="w-7 h-7 text-warning" />
            ) : (
              <Shield className="w-7 h-7 text-success" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {hasAlerts
                ? `${intruderLogs.length} Security Alert${intruderLogs.length > 1 ? "s" : ""}`
                : "No Security Alerts"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {hasAlerts
                ? "Review the failed login attempts below"
                : "Your vault has no recorded unauthorized access attempts"}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Logs List */}
      {hasAlerts ? (
        <div className="space-y-4">
          {intruderLogs.map((log, index) => (
            <GlassCard
              key={log.id}
              className={`animate-slide-up border-l-4 border-l-warning ${
                highlightNewest && index === 0 ? "ring-2 ring-warning ring-offset-2 ring-offset-background" : ""
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Alert Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                  </div>
                  <span className="font-semibold">Failed Login Attempt</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-warning/10 text-warning text-xs font-medium">
                  Warning
                </span>
              </div>

              {/* Log Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Email Attempted
                      </p>
                      <p className="font-medium break-all">{log.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Timestamp
                      </p>
                      <p className="font-medium">{formatDate(log.timestamp)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        IP Address
                      </p>
                      <p className="font-medium font-mono">{log.ip}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Monitor className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Reason
                      </p>
                      <p className="font-medium text-destructive">{log.reason}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Agent */}
              <div className="mt-4 p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  User Agent
                </p>
                <p className="text-xs font-mono text-muted-foreground break-all line-clamp-2">
                  {log.userAgent}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h3 className="text-xl font-semibold mb-2">All Clear</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            No unauthorized access attempts have been detected. Your vault remains secure
            with AES-256 encryption and real-time intrusion monitoring.
          </p>
        </GlassCard>
      )}

      {/* Security Info */}
      <GlassCard>
        <h3 className="font-semibold mb-4">About Intruder Detection</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="font-medium">What we monitor:</p>
            <ul className="text-muted-foreground space-y-1">
              <li>• Failed login attempts</li>
              <li>• Invalid credentials usage</li>
              <li>• Suspicious IP addresses</li>
            </ul>
          </div>
          <div className="space-y-1">
            <p className="font-medium">What we log:</p>
            <ul className="text-muted-foreground space-y-1">
              <li>• Timestamp of attempt</li>
              <li>• IP address</li>
              <li>• Browser/device information</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default IntruderLogs;
