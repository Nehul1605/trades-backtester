# TradeTracker Pro 📊

TradeTracker Pro is a premium, developer-grade **Free Online Trading Journal & Backtesting Platform** built to help forex, gold, stock, index, and cryptocurrency traders log execution data, eliminate trading mistakes, analyze strategy expectancy, and construct their professional edge.

Developed with a sleek, glassmorphic dark-mode interface, the platform offers an isolated workspace experience for multiple broker accounts (e.g., MT5, Exness, demo vs. live) entirely free of charge.

---

## 🚀 Key Features

*   **Multi-Account Workspaces**: Create unlimited broker-specific workspaces. Each workspace maintains isolated ledgers, performance statistics, and individual equity growth curves.
*   **Professional Trade Journal**: Detailed journal entry logging with entry/exit prices, Stop-Loss (SL), Take-Profit (TP), lot sizing, strategy tagging, and text notes.
*   **Interactive Calendar Heatmap**: A monthly grid displaying color-coded days (green for profit, red for loss) alongside weekly P&L aggregations to keep you disciplined and accountable.
*   **Day-Wise Equity Curves**: Dynamic line charts plotting your historical balance growth aggregated daily against an initial reference deposit.
*   **Strategy expectancy & Distribution Charts**: Win-rate analysis grouped by strategy tag, BUY vs. SELL metrics, and expectancy breakdowns to find where your edge really lies.
*   **Built-In P&L & Lot Calculator**: Instantly calculate risk-to-reward ratios and payout sizes for forex currency pairs, gold (XAUUSD), and indices.
*   **Auto-Compressed Screenshots**: Attach chart screenshots to any position. Images are automatically resized and compressed to lightweight JPEGs on the client side before upload to save mobile data and bandwidth.
*   **Live Market Streaming & Stage**: Join live collaborative sessions and discuss setups using LiveKit integrations.
*   **Referral Verification Gate**: Unlock premium workspaces by registering accounts via partner broker links, monitored by an administrative approval backend.

---

## 🛠️ Technology Stack

### Frontend
*   **Framework**: Next.js 16 (App Router)
*   **Styling**: TailwindCSS & PostCSS (Custom Glassmorphic Dark UI)
*   **Animations**: Framer Motion & GSAP
*   **UI Components**: Radix UI primitives & Lucide Icons
*   **Charts**: Recharts (Custom responsive balance graphs)
*   **Streaming**: LiveKit Components React

### Backend
*   **Runtime & Server**: Node.js & Express (ES Modules)
*   **Database**: MongoDB & Mongoose ORM
*   **Authentication**: JWT (JSON Web Tokens) & NextAuth.js
*   **Integrations**: Resend (Emails), LiveKit Server SDK (Live stage tokens)
*   **File Uploads**: Multer (Local disk storage path configuration)

---

## 📂 Codebase Directory Structure

```
├── backend/                  # Node.js Express API Server
│   ├── config/               # Database connection scripts
│   ├── middleware/           # Auth and file parser middlewares
│   ├── models/               # MongoDB Mongoose schemas
│   ├── routes/               # Express API endpoints
│   ├── uploads/              # Local storage for trade screenshots
│   ├── server.js             # Main backend API entrypoint
│   └── package.json          # Backend scripts & dependencies
│
└── frontend/                 # Next.js App Router Application
    ├── app/                  # Routing pages (landing, dashboard, auth)
    ├── components/           # Reusable UI elements (dashboard, inputs, landing)
    ├── hooks/                # Custom React hooks
    ├── lib/                  # Helper utilities (auth options, shadcn cn)
    ├── public/               # Static assets (logo.png, placeholders)
    └── package.json          # Frontend scripts & dependencies
```

---

## 🔧 Installation & Setup

### Prerequisites
*   Node.js (v18.x or later recommended)
*   MongoDB Instance (Local or MongoDB Atlas Cluster)

### 1. Backend API Configuration

1.  Navigate into the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file inside the `backend` folder and configure your variables:
    ```env
    PORT=5555
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_signing_key
    REQUIRE_REFERRAL_VERIFICATION=true
    LIVEKIT_URL=your_livekit_connection_url
    LIVEKIT_API_KEY=your_livekit_api_key
    LIVEKIT_API_SECRET=your_livekit_api_secret
    ALLOWED_CORS_ORIGIN=http://localhost:3000
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```

### 2. Frontend Configuration

1.  Navigate to the `frontend` directory:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `frontend` folder:
    ```env
    AUTH_SECRET=your_nextauth_secret_hash
    AUTH_TRUST_HOST=true
    AUTH_GOOGLE_ID=your_google_client_id
    AUTH_GOOGLE_SECRET=your_google_client_secret

    RESEND_API_KEY=your_resend_email_api_key
    SUPPORT_EMAIL=support@tradetrackerpro.in

    NEXT_PUBLIC_BACKEND_URL=http://localhost:5555
    NEXT_PUBLIC_REQUIRE_REFERRAL_VERIFICATION=true
    NEXT_PUBLIC_FJ_API_KEY=your_screenshot_api_key
    NEXT_PUBLIC_LIVEKIT_URL=your_livekit_public_ws_url
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```

The application will now be running at `http://localhost:3000`.

---

## 🛡️ License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.
