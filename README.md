# TradeTracker Pro 📈

> **Master Your Trading Strategy**  
> A professional backtesting and trading journal platform to track, analyze, and optimize your trading performance.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## 🚀 Overview

**TradeTracker Pro** is a comprehensive trading journal and backtesting tool designed for traders who want to take their improved performance seriously. By logging trades, strategies, and outcomes, users can visualize their progress through advanced analytics and real-time P&L calculations.

### ✨ Key Features

- **📊 Advanced Analytics**: Detailed performance charts, P&L tracking, and win-rate statistics.
- **📝 Trading Journal**: Log trades with entry/exit prices, symbols, quantities, and strategy notes.
- **🧪 Backtesting**: Test strategies against historical data (status: `open` or `closed` trades).
- **🔐 Secure Authentication**: Powered by Supabase Auth for secure user management.
- **🎨 Modern UI**: Built with Next.js and Tailwind CSS, featuring a beautiful dark mode interface.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
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
├── lib/                  # Utilities and Supabase client
└── scripts/              # Database migration SQL scripts
```

---

## ⚡ Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v18+)
- pnpm (recommended) or npm
- A Supabase account

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

    Create a `.env` file in the root directory and add your Supabase credentials:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Database Setup:**

    Run the SQL scripts located in the `scripts/` folder in your Supabase SQL Editor to set up the tables and policies.
    - `001_create_trades_table.sql`
    - `002_create_profiles_table.sql`
    - (Run others in sequence)

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
