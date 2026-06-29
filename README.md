# MoneyFlow Pro - Unified Personal & Business Finance Platform

MoneyFlow Pro is a complete SaaS financial dashboard built to manage personal wealth and multiple company accounts under a single workspace.

## 🚀 Key Modules
1. **Unified Dashboard**: Metrics for Cashflow, Income, Expenses, and Net Worth.
2. **Ecosystem Switcher**: Seamlessly toggle between personal budgeting and corporate accounts.
3. **Savings Tracker**: Set financial targets, monitor goals progress, and log milestone achievements.
4. **Subscription Drawer**: Stripe & Razorpay simulators with coupon discount fields (e.g., `SAVE20`, `WELCOME50`, `FLOWFREE`).
5. **Invoice Generator**: Custom client receipt designer (available to Premium accounts).
6. **AI Financial Advisor**: Insight generator evaluating your burn rate and margins.
7. **Google Ads Placements**: Integrated, closable banner placements only shown to Free users.
8. **Admin Suite**: Real-time subscriber metrics (MRR/ARR/churn) and coupon codes generator.
9. **Mobile Portability**: Ready-to-run React Native + Expo structure inside the `/mobile` directory.

---

## 🛠️ Folder Structure
```
/
├── app/                      # Next.js 15 pages and route controllers
│   ├── globals.css           # Styling theme config (dark/light themes)
│   ├── layout.tsx            # Global providers context loader
│   └── page.tsx              # Auth views and main entry router
├── components/               # UI components
│   ├── AdBanner.tsx          # Google Ads frame
│   ├── AppWorkspace.tsx      # Main dashboard application panels
│   └── UpgradeModal.tsx      # Payments checkout panel drawer
├── lib/                      # Core shared business logic
│   ├── AppContext.tsx        # React state provider
│   ├── mock-db.ts            # Local-storage simulated database
│   ├── payments.ts           # Stripe & Razorpay checkout adapters
│   ├── ads-manager.ts        # Ads frequency controller
│   └── tests.ts              # Automated assertions verification suite
├── mobile/                   # Shared React Native Expo setup
│   └── App.js                # Core Expo mobile app structure
├── supabase/                 # Database migrations and policies
│   └── schema.sql            # Core database schema file
└── package.json              # Dependencies (Next.js 15, Recharts, Framer Motion)
```

---

## ⚙️ Installation & Running

1. **Install web dependencies**:
   ```bash
   npm install
   ```

2. **Run Web Dev Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Supabase Connection (Optional)**:
   Copy the content of `supabase/schema.sql` into your Supabase SQL Editor to create tables, indexes, and RLS policies. Add variables to a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   *Note: If no environment keys are supplied, MoneyFlow Pro automatically activates the stateful Local Storage mock database.*

4. **Running Automated Tests**:
   Open browser dev tools console when loading the dashboard to view automated validation checks for coupon calculations and business limits.
