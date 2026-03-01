# TradeTracker Pro 📈

> **The ultimate professional backtesting and trading journal platform.**  
> Built for traders who demand precision, clarity, and exponential growth.

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Appwrite](https://img.shields.io/badge/Appwrite-Backend-F02E65?style=for-the-badge&logo=appwrite&logoColor=white)](https://appwrite.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Shadcn/UI](https://img.shields.io/badge/Shadcn/UI-Components-black?style=for-the-badge&logo=shadcnui)](https://ui.shadcn.com/)

[**Live Demo**](https://trades-backtester.vercel.app/) • [**Getting Started**](#-getting-started) • [**Feature Tour**](#-core-features)

</div>

---

## 🚀 The Vision

**TradeTracker Pro** is an institutional-grade performance suite designed to turn retail traders into professional executors. By combining raw execution data with high-fidelity visual analytics, we provide the "Missing Link" in your trading journey: **Self-Awareness Through Data.**

---

## 💎 Core Features

### 📈 1. High-Fidelity Analytics (Trader's Hub)

- **Professional P&L Calendar**: A massive, interactive heat-map of your monthly performance. Instantly identify your greenest days and largest drawdowns.
- **Real-time Stats Cards**: Track Total P&L, Win Rate (%), Profit Factor, and Average R:R with zero latency.
- **Strategy Breakdown**: Unified table view of all executions with smart P&L calculations (computed automatically if entry/exit prices are provided).

### 📔 2. Professional Journaling

- **Execution Insights**: Log every trade with SL/TP levels, strategy tagging, and custom psychology notes.
- **Screenshot Integration**: Securely upload and store your chart setups via Appwrite Storage to document your technical edge.
- **Symbol Intelligence**: Built-in `SymbolCombobox` supporting major Forex, Crypto, Stocks, and Indices.

### 📅 3. Interactive Economic Calendar

- **Global Macro Events**: A full-screen, integrated TradingView Economic Calendar to keep you ahead of NFP, FOMC, and other high-impact news events.

### 🧪 4. Tools & Intelligence

- **P&L Calculator**: Real-time position size and profit estimator for Long/Short setups.
- **Live Market (Beta)**: Institutional-grade terminal for real-time order flow (Coming Soon/Waitlist Active).
- **AI Insights**: Pattern recognition and psychological edge analysis powered by machine learning (Coming Soon/Waitlist Active).

### 🛠️ 5. Utility & Support

- **Integrated Support Center**: Direct line to the dev team via an in-app ticket system powered by Resend API.
- **Theme Engine**: Full Dark/Light mode support with the sleek "Midnight Blue" institutional palette.

---

## 🛠️ Performance Tech Stack

- **Frontend**: [Next.js 14](https://nextjs.org/) (App Router, Server Components)
- **UI/UX**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/) + [Lucide Icons](https://lucide.dev/)
- **Backend-as-a-Service**: [Appwrite](https://appwrite.io/) (Database, Auth, Storage)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Email/Notifications**: [Resend](https://resend.com/)

---

## 📂 Architecture

```bash
trades-backtester/
├── app/
│   ├── analytics/
│   ├── api/
│   ├── calendar/
│   ├── dashboard/
│   └── integrations/
├── components/
├── hooks/
├── lib/
└── scripts/
```

---

## ⚡ Getting Started

1. **Clone & Install**

   ```bash
   git clone https://github.com/your-username/trades-backtester.git
   pnpm install
   ```

2. **Database Setup**
   Run the SQL-like scripts in `/scripts` to automatically initialize your Appwrite collections for Trades, Profiles, and Broker Integrations.

3. **Environment Config**
   Create `.env.local`:

   ```env
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=...
   APPWRITE_API_KEY=...
   RESEND_API_KEY=...
   NEXTAUTH_SECRET=...
   ```

4. **Launch**
   ```bash
   pnpm dev
   ```

---

<p align="center">
Built by Traders, for Traders. 🔥
</p>
