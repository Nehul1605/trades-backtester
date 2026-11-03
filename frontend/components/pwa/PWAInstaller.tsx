"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Download, Share2, Check, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PWAContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  installApp: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType>({
  isInstallable: false,
  isInstalled: false,
  isIOS: false,
  installApp: async () => {},
});

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {
          // Service worker registered
        })
        .catch((err) => {
          console.warn("PWA ServiceWorker registration failed:", err);
        });
    }

    // 2. Detect already installed / standalone mode
    if (typeof window !== "undefined") {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      if (isStandalone) {
        setIsInstalled(true);
      }

      // Check iOS
      const ua = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(ua);
      setIsIOS(isIosDevice);
    }

    // 3. Listen for Chrome / Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      toast.success("TradeTracker Pro installed successfully!");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        toast.success("Installing TradeTracker Pro...");
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      setIsInstallable(false);
    } else if (isIOS) {
      toast("To install on iPhone/iPad:", {
        description: "Tap the Share button (square with arrow) at the bottom, then choose 'Add to Home Screen'.",
        duration: 7000,
      });
    } else {
      toast.info("Open Chrome menu (⋮) and tap 'Install app' or 'Add to Home screen'.");
    }
  };

  return (
    <PWAContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isIOS,
        installApp,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
}

export function usePWAInstall() {
  return useContext(PWAContext);
}

export function InstallAppButton({
  className = "",
  size = "sm",
  variant = "outline",
}: {
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "ghost";
}) {
  const { isInstallable, isInstalled, isIOS, installApp } = usePWAInstall();

  // If already installed, don't show prompt
  if (isInstalled) return null;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={installApp}
      className={`rounded-full gap-1.5 font-bold uppercase tracking-wider text-xs shadow-sm transition-all ${className}`}
      title="Install TradeTracker App on Phone / Chrome"
    >
      {isIOS ? (
        <Share2 className="w-3.5 h-3.5 text-primary" />
      ) : (
        <Download className="w-3.5 h-3.5 text-primary" />
      )}
      <span>Install App</span>
    </Button>
  );
}

