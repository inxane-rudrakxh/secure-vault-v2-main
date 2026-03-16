import React from "react";
import { Link } from "react-router-dom";
import { Shield, Lock, Cloud, Smartphone, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import { TeamSection } from "@/components/landing/TeamSection";

const features = [
  {
    icon: Lock,
    title: "AES-256 Encryption",
    description: "Military-grade encryption protects your files with the industry's strongest standard.",
  },
  {
    icon: Cloud,
    title: "Cloud Storage",
    description: "Access your secure vault from anywhere with encrypted cloud synchronization.",
  },
  {
    icon: Smartphone,
    title: "Multi-Device Support",
    description: "Seamlessly access your vault across all your devices with PWA support.",
  },
  {
    icon: AlertTriangle,
    title: "Intruder Detection",
    description: "Real-time monitoring and logging of unauthorized access attempts.",
  },
];

// Note: Auth redirect logic is handled by PublicLayout wrapper
export const Landing: React.FC = () => {

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Enterprise-Grade Security</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Your Digital Vault,{" "}
              <span className="gradient-text">Secured.</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              SecureVault v2.0 protects your most sensitive files with AES-256 encryption,
              multi-device sync, and real-time intrusion detection.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="min-w-[180px] h-12 text-base">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="min-w-[180px] h-12 text-base">
                  Go to Vault
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-6 mt-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>10GB free storage</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Choose SecureVault?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built with security as the foundation, designed for the modern professional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <GlassCard
                key={feature.title}
                className="text-center hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 sm:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Security That Never Sleeps
              </h2>
              <p className="text-muted-foreground mb-8">
                Our advanced security system monitors your vault 24/7, detecting and logging
                any unauthorized access attempts in real-time.
              </p>
              
              <ul className="space-y-4">
                {[
                  "AES-256 bit encryption for all files",
                  "Real-time intruder detection and logging",
                  "Secure authentication with rate limiting",
                  "End-to-end encrypted file transfers",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-success" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <GlassCard variant="elevated" className="relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-medium">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  Protected
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
                  <Shield className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Vault Status</h3>
                  <p className="text-sm text-muted-foreground">All systems operational</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-background/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Encryption</span>
                    <span className="text-xs text-success">Active</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-full bg-success rounded-full" />
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-background/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Intrusion Detection</span>
                    <span className="text-xs text-success">Monitoring</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-full bg-success rounded-full" />
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <TeamSection />

      {/* CTA Section */}
      <section className="py-20 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <GlassCard variant="elevated" className="py-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Secure Your Files?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Join thousands of professionals who trust SecureVault to protect their
              most sensitive documents.
            </p>
            <Link to="/register">
              <Button size="lg" className="min-w-[200px]">
                Create Your Vault
              </Button>
            </Link>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-semibold">SecureVault v2.0</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 SecureVault. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
