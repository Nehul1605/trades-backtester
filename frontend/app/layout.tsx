import type React from "react";
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import AuthProvider from "@/components/auth-provider";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { PWAProvider } from "@/components/pwa/PWAInstaller";

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tradetrackerpro.in"),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TradeTracker Pro",
  },
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
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased min-h-screen w-full max-w-full overflow-x-hidden`}
      >
        <AuthProvider>
          <ThemeProvider>
            <PWAProvider>
              <Suspense fallback={null}>{children}</Suspense>
              <Toaster />
            </PWAProvider>
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
                  "@type": "SoftwareApplication",
                  "@id": "https://www.tradetrackerpro.in/#software",
                  "name": "TradeTracker Pro",
                  "url": "https://www.tradetrackerpro.in",
                  "operatingSystem": "Web, iOS, Android, Windows, macOS",
                  "applicationCategory": "FinanceApplication",
                  "offers": {
                    "@type": "Offer",
                    "price": "0.00",
                    "priceCurrency": "USD"
                  },
                  "description": "The best free trade journal and strategy backtesting software. TradeTracker Pro helps forex, gold, stock, and crypto traders log trades, track metrics, and boost profitability.",
                  "provider": {
                    "@id": "https://www.tradetrackerpro.in/#organization"
                  },
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.9",
                    "reviewCount": "154",
                    "bestRating": "5",
                    "worstRating": "1"
                  },
                  "review": [
                    {
                      "@type": "Review",
                      "author": {
                        "@type": "Person",
                        "name": "Rahul S."
                      },
                      "reviewRating": {
                        "@type": "Rating",
                        "ratingValue": "5",
                        "bestRating": "5",
                        "worstRating": "1"
                      },
                      "reviewBody": "Finally a journal that doesn't feel like a spreadsheet. The calendar heatmap alone changed how I review my trading weeks."
                    },
                    {
                      "@type": "Review",
                      "author": {
                        "@type": "Person",
                        "name": "Priya K."
                      },
                      "reviewRating": {
                        "@type": "Rating",
                        "ratingValue": "5",
                        "bestRating": "5",
                        "worstRating": "1"
                      },
                      "reviewBody": "Being able to attach screenshots to each trade and see my day-wise equity curve keeps me disciplined. No other free tool does this."
                    },
                    {
                      "@type": "Review",
                      "author": {
                        "@type": "Person",
                        "name": "Arjun M."
                      },
                      "reviewRating": {
                        "@type": "Rating",
                        "ratingValue": "5",
                        "bestRating": "5",
                        "worstRating": "1"
                      },
                      "reviewBody": "Managing 3 different MT5 accounts in separate workspaces is a game changer. Each has its own stats, calendar, and trade log."
                    }
                  ]
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
                },
                {
                  "@type": "FAQPage",
                  "@id": "https://www.tradetrackerpro.in/#faq",
                  "mainEntity": [
                    {
                      "@type": "Question",
                      "name": "What is a trade journal and how does trade journaling help?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "A trade journal (also known as a trading log or tracker) is a comprehensive record of all your executed trades. Trade journaling is the practice of logging details like entry/exit prices, strategies, risk levels, and visual charts. By consistently keeping a trade journal, you can analyze your trading behaviors, refine your strategies, and eliminate bad trading habits, which is the fastest way to build long-term profitability."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "Is TradeTracker Pro a free trade journal?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes! TradeTracker Pro is a 100% free trade journal. We believe professional-grade trading logs, strategy backtesting software, and calendar analytics should be accessible to every disciplined trader. You can create multiple workspaces for different broker accounts, track unlimited trades, and upload chart screenshots without paying monthly subscriptions."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "How does TradeTracker Pro compare to TradeZella or Excel?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Unlike traditional Excel/Spreadsheet trading logs, TradeTracker Pro offers automated calculations, beautiful day-wise equity curves, and dynamic calendar heatmaps without requiring complex formulas or manual data setups. Compared to expensive alternatives like TradeZella or TraderSync (which can cost $30–$50/month), TradeTracker Pro provides a cleaner, ultra-responsive developer-grade workspace, multiple sub-account tracking, and client-side compressed screenshot hosting completely free of charge."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "What assets and markets can I track?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Our trading journal is designed to support a wide range of asset classes. You can easily track and backtest strategies for Forex currency pairs (such as EURUSD, GBPJPY), Gold (XAUUSD) and commodity instruments, major global Indices (like US30, NAS100), Cryptocurrencies, and stocks."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "How long does it take to start tracking?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Signing up takes less than 3 minutes. Simply create an account, verify your setup through our partner broker options to unlock full platform features, build your first trading workspace, and begin journaling. No credit card is ever required."
                      }
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
