import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "subtle";
  padding?: "none" | "sm" | "md" | "lg";
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  variant = "default",
  padding = "md",
  ...props
}) => {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const variantClasses = {
    default: "glass-card",
    elevated: "glass-card shadow-xl",
    subtle: "glass-card opacity-80",
  };

  return (
    <div
      className={cn(
        variantClasses[variant],
        paddingClasses[padding],
        "transition-all duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
