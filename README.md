# TradeTracker Pro 📈

> **Master Your Trading Strategy**  
> A professional backtesting and trading journal platform to track, analyze, and optimize your trading performance.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Appwrite](https://img.shields.io/badge/Appwrite-Backend-F02E65?style=for-the-badge&logo=appwrite&logoColor=white)](https://appwrite.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## 🚀 Overview

**TradeTracker Pro** is a comprehensive trading journal and backtesting tool designed for traders who want to take their improved performance seriously. By logging trades, strategies, and outcomes, users can visualize their progress through advanced analytics and real-time P&L calculations.

### ✨ Key Features

- **📊 Advanced Analytics**: Detailed performance charts, P&L tracking, and win-rate statistics.
- **📝 Trading Journal**: Log trades with entry/exit prices, symbols, quantities, and strategy notes.
- **🧪 Backtesting**: Test strategies against historical data (status: `open` or `closed` trades).
- **🔐 Secure Authentication**: Powered by Appwrite Auth for secure user management.
- **🎨 Modern UI**: Built with Next.js and Tailwind CSS, featuring a beautiful dark mode interface.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Appwrite (Document DB)
- **Styling**: Tailwind CSS & Shadcn/ui
- **Icons**: Lucide React
- **State Management**: React Hooks

---

## 📂 Project Structure

```bash
trades-backtester/
├── app/                  # Next.js App Router pages
│   ├── analytics/        # Analytics dashboard
│   ├── auth/             # Authentication pages (Login, Sign-up)
│   └── dashboard/        # Main trading journal dashboard
├── components/           # Reusable UI components
│   ├── analytics/        # Charts and stats components
│   ├── dashboard/        # Trade forms and lists
│   └── ui/               # Shadcn/ui primitive components
├── lib/                  # Utilities and Appwrite client
└── scripts/              # Database migration SQL scripts
```

---

## ⚡ Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v18+)
- pnpm (recommended) or npm
- An Appwrite Cloud account (or self-hosted Appwrite instance)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/trades-backtester.git
    cd trades-backtester
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    # or
    npm install
    ```

3.  **Environment Setup:**

    Create a `.env.local` file in the root directory and add your Appwrite credentials:

    ```env
    NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
    NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
    APPWRITE_API_KEY=your_api_key
    APPWRITE_DATABASE_ID=your_database_id
    APPWRITE_TRADES_COLLECTION_ID=your_trades_collection_id
    APPWRITE_BROKER_ACCOUNTS_COLLECTION_ID=your_broker_accounts_collection_id
    APPWRITE_STORAGE_BUCKET_ID=your_bucket_id
    ```

4.  **Appwrite Setup:**

    In the Appwrite Console, create:
    - A **Database** and note its ID
    - A **trades** collection with the required attributes (see `scripts/` for schema reference)
    - A **broker_accounts** collection
    - A **Storage bucket** called `trade-screenshots`
    - An **API Key** with appropriate scopes

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
