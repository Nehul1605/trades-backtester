import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import AuthProvider from "@/components/auth-provider";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "TradeTracker Pro - Strategy Backtesting Platform",
  description: "Professional trading journal and strategy backtesting platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <SidebarProvider>
              <div className="flex min-h-screen w-full">
                <AppSidebar />
                <div className="flex-1 flex flex-col">
                  <Suspense fallback={null}>{children}</Suspense>
                </div>
              </div>
            </SidebarProvider>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
