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
    default: "TradeTracker Pro",
    template: "%s",
  },
  description: "The best free trade journal and strategy backtesting software. TradeTracker Pro helps forex, gold, stock, and crypto traders log trades, track metrics, and boost profitability.",
  keywords: [
    "free trade journal",
    "trade journal",
    "trade journaling",
    "best trading journal software",
    "forex trading journal",
    "gold trading log",
    "online trade journal",
    "trading journal excel alternative",
    "TradeZella alternative",
    "TraderSync alternative",
    "TradeTracker Pro",
    "trades backtester",
    "backtesting platform",
    "crypto journal",
  ],
  authors: [{ name: "TradeTracker Pro Team" }],
  creator: "TradeTracker Pro",
  publisher: "TradeTracker Pro",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/icon", type: "image/png", sizes: "512x512" },
    ],
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
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" forceTheme="dark" enableSystem={false}>
            <Suspense fallback={null}>{children}</Suspense>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://www.tradetrackerpro.in/#organization",
                  "name": "TradeTracker Pro",
                  "url": "https://www.tradetrackerpro.in",
                  "logo": "https://www.tradetrackerpro.in/logo.png",
                  "sameAs": []
                },
                {
                  "@type": "WebSite",
                  "@id": "https://www.tradetrackerpro.in/#website",
                  "url": "https://www.tradetrackerpro.in",
                  "name": "TradeTracker Pro",
                  "description": "The best free trade journal and strategy backtesting software.",
                  "publisher": {
                    "@id": "https://www.tradetrackerpro.in/#organization"
                  }
                },
                {
                  "@type": "ItemList",
                  "@id": "https://www.tradetrackerpro.in/#sitelinks",
                  "name": "Site Navigation",
                  "itemListElement": [
                    {
                      "@type": "SiteNavigationElement",
                      "position": 1,
                      "name": "Login / Sign In",
                      "url": "https://www.tradetrackerpro.in/auth/login"
                    },
                    {
                      "@type": "SiteNavigationElement",
                      "position": 2,
                      "name": "Sign Up Free",
                      "url": "https://www.tradetrackerpro.in/auth/sign-up"
                    },
                    {
                      "@type": "SiteNavigationElement",
                      "position": 3,
                      "name": "TradeZella Alternative",
                      "url": "https://www.tradetrackerpro.in/compare/tradezella"
                    },
                    {
                      "@type": "SiteNavigationElement",
                      "position": 4,
                      "name": "TraderSync Alternative",
                      "url": "https://www.tradetrackerpro.in/compare/tradersync"
                    },
                    {
                      "@type": "SiteNavigationElement",
                      "position": 5,
                      "name": "Excel Trade Journal",
                      "url": "https://www.tradetrackerpro.in/compare/excel"
                    }
                  ]
                }
              ]
            })
          }}
        />
      </body>
    </html>
  );
}
