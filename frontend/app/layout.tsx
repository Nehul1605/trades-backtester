import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import AuthProvider from "@/components/auth-provider";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tradetrackerpro.in"),
  title: {
    default: "TradeTracker Pro | Ultimate Trading Journal & Strategy Backtester",
    template: "%s | TradeTracker Pro",
  },
  description: "Optimize your trading with TradeTracker Pro. The professional trading journal, strategy backtester, and portfolio tracker designed to improve your profitability.",
  keywords: [
    "TradeTracker",
    "TradeTracker Pro",
    "trades backtester",
    "trading journal",
    "portfolio tracker",
    "backtesting platform",
    "trading log",
    "trade tracker",
    "stock backtester",
    "forex backtester",
    "crypto journal",
  ],
  authors: [{ name: "TradeTracker Pro Team" }],
  creator: "TradeTracker Pro",
  publisher: "TradeTracker Pro",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.tradetrackerpro.in",
    title: "TradeTracker Pro | Ultimate Trading Journal & Strategy Backtester",
    description: "Optimize your trading with TradeTracker Pro. The professional trading journal, strategy backtester, and portfolio tracker designed to improve your profitability.",
    siteName: "TradeTracker Pro",
  },
  twitter: {
    card: "summary_large_image",
    title: "TradeTracker Pro | Ultimate Trading Journal & Strategy Backtester",
    description: "Optimize your trading with TradeTracker Pro. The professional trading journal, strategy backtester, and portfolio tracker designed to improve your profitability.",
  },
};

export default async function RootLayout({
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
          <ThemeProvider attribute="class" defaultTheme="dark" forceTheme="dark" enableSystem={false}>
            <Suspense fallback={null}>{children}</Suspense>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
