# TradeTracker Pro 📈

> **The ultimate professional backtesting and trading journal platform.**  
> Built for traders who demand precision, clarity, and growth.

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Appwrite](https://img.shields.io/badge/Appwrite-Backend-F02E65?style=for-the-badge&logo=appwrite&logoColor=white)](https://appwrite.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Shadcn/UI](https://img.shields.io/badge/Shadcn/UI-Components-black?style=for-the-badge&logo=shadcnui)](https://ui.shadcn.com/)

[**Live Demo**](https://trades-backtester.vercel.app/) • [**Documentation**](#-getting-started) • [**Features**](#-key-features)

</div>

---

## 🚀 Overview

**TradeTracker Pro** is more than just a journal; it's a comprehensive performance suite designed for serious traders. Whether you're backtesting a new strategy or journaling your daily executions, TradeTracker Pro provides the analytical edge you need to master the markets.

### ✨ Key Features

- **📊 Advanced Analytics**: Real-time performance metrics, cumulative P&L growth charts, and strategy-specific breakdown.
- **📔 Professional Journal**: Detailed trade logging with entry/exit prices, SL/TP levels, RR ratios, and strategy tagging.
- **⚡ Broker Integration**: Seamlessly sync and manage broker accounts for unified performance tracking.
- **🌍 Economic Calendar**: Integrated TradingView economic events calendar to stay ahead of high-impact news.
- **🧪 Backtesting Engine**: Test and refine your strategies with historical trade data and visual performance feedback.
- **📸 Visual Evidence**: Attach screenshots to every trade to document chart setups and psychological states.
- **🔐 Enterprise-Grade Security**: Secure authentication and data persistence powered by Appwrite.
- **🎨 Elite Dark UI**: A TradingView-inspired interface optimized for focus and long trading sessions.

---

## 🛠️ Tech Stack

<<<<<<< HEAD
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
=======
### Frontend

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend & Infrastructure

- **BaaS**: [Appwrite](https://appwrite.io/) (Database, Auth, Storage)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) with Appwrite integration
- **Database**: Appwrite Document Store (SQL migrations included)
>>>>>>> main

---

## 📂 Project Structure

```bash
trades-backtester/
<<<<<<< HEAD
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
=======
├── app/                  
│   ├── analytics/        
│   ├── auth/             
│   ├── calendar/         
│   ├── dashboard/        
│   └── integrations/      
├── components/           
│   ├── analytics/        
│   ├── dashboard/        
│   └── ui/               
├── lib/                  
│   ├── appwrite/         
│   └── pnl/              
└── scripts/              
>>>>>>> main
```

---

## ⚡ Getting Started

<<<<<<< HEAD
1. **Clone & Install**
=======
### Prerequisites

- **Node.js**: v18 or higher
- **pnpm**: Recommended for dependency management
- **Appwrite Instance**: Cloud or self-hosted

### Installation

1. **Clone the repository**
>>>>>>> main

   ```bash
   git clone https://github.com/your-username/trades-backtester.git
   cd trades-backtester
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Configure Environment**
   Create a `.env.local` and populate the following:

<<<<<<< HEAD
3. **Environment Config**
   Create `.env.local`:

=======
>>>>>>> main
   ```env
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
   APPWRITE_API_KEY=your_api_key
   APPWRITE_DATABASE_ID=your_database_id
   APPWRITE_TRADES_COLLECTION_ID=your_trades_collection_id
   APPWRITE_BROKER_ACCOUNTS_COLLECTION_ID=your_broker_accounts_collection_id
   APPWRITE_STORAGE_BUCKET_ID=your_bucket_id
   ```

4. **Initialize Database**
   Run the migration scripts found in `/scripts` to set up your Appwrite collections with the required attributes and permissions.

---

## 🛡️ Database Migrations

The project includes built-in SQL migration scripts to ensure your Appwrite setup matches the required schema:

- `001-003`: Core trade and profile schema
- `007`: Adds Stop Loss and Take Profit support
- `008`: Broker integration layer

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

---

<p align="center">
Built with ❤️ for the Trading Community
</p>

    

5.  **Run the development server:**

    ```bash
    pnpm dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
