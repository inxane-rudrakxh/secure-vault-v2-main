import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useAppLockPin } from "@/hooks/useAppLockPin";
import { AppLockScreen } from "@/components/auth/AppLockScreen";
import { CameraConsentModal } from "@/components/auth/CameraConsentModal";

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasPin, isLoading: isCheckingPin } = useAppLockPin();
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("securevault_applock_unlocked") === "true") {
      setIsUnlocked(true);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isCheckingPin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (hasPin && !isUnlocked) {
    return <AppLockScreen onUnlocked={() => setIsUnlocked(true)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Outlet />
      </main>
      <CameraConsentModal />
    </div>
  );
};
