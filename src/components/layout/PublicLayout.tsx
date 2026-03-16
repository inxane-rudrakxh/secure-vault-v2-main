import React, { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { useAuth } from "@/contexts/AuthContext";

export const PublicLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect authenticated users away from public pages to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Don't redirect if already navigating or on a path that handles its own redirect
      if (location.pathname === "/" || location.pathname === "/login" || location.pathname === "/register") {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname]);

  // Show loading spinner while checking auth state (prevents flash of public content)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};
