"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CalendarPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    // TradingView Economic Calendar Widget
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "colorTheme": "dark",
      "isTransparent": false,
      "width": "100%",
      "height": "100%",
      "locale": "en",
      "importanceFilter": "-1,0,1",
      "currencyFilter": "USD,EUR,GBP,JPY,AUD,CAD,CHF"
    });

    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(script);
    }
  }, []);

  if (status !== "authenticated") return null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader />
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Coming Soon</h1>
            <p className="text-muted-foreground text-sm">
              We're building a professional economic calendar integration to help you track market-moving events directly within your journal.
            </p>
          </div>
          <div className="pt-4">
            <Button asChild variant="outline" className="rounded-lg">
              <Link href="/dashboard">Return to Journal</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
