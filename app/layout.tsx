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
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "TradeTracker Pro - Strategy Backtesting Platform",
  description: "Professional trading journal and strategy backtesting platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            {session ? (
              <SidebarProvider>
                <div className="flex min-h-screen w-full">
                  <AppSidebar />
                  <div className="flex-1 flex flex-col pt-14 md:pt-0">
                    <Suspense fallback={null}>{children}</Suspense>
                  </div>
                </div>
              </SidebarProvider>
            ) : (
              <div className="flex min-h-screen w-full flex-col">
                <Suspense fallback={null}>{children}</Suspense>
              </div>
            )}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
