# My Pocket Tracker - 100% Free Unified Personal & Business Finance Platform

My Pocket Tracker is a completely free, open financial platform built to manage personal wealth and multiple company accounts under a single workspace with zero fees, no subscription walls, and no advertisements.

---

## 🚀 Key Modules

1. **Unified Dashboard**: Real-time metrics for Cashflow, Income, Expenses, and Net Worth.
2. **Ecosystem Workspace Switcher**: Seamlessly toggle between personal budgeting ("Home") and individual corporate accounts.
3. **Business Settings & Workspace Deletion**: Dedicated business management tab for the currently active company, including:
   - Company identity, sector category, workspace email, and description configuration.
   - **Delete Selected Business**: Irreversible deletion option located in the *Business Parameters* header and the dedicated *Danger Zone*. Safely deletes **only** the selected business and its associated ledger transactions, leaving personal finances and other business workspaces completely untouched. Includes a confirmation modal to prevent accidental clicks.
4. **Savings Tracker**: Set financial targets, monitor goals progress, and log milestone achievements (personal workspace).
5. **100% Free Forever**: All features unlocked with unlimited businesses, no pro mode, and no payment requirements.
6. **Invoice Generator**: Custom client receipt designer and branded invoice generation with PDF export.
7. **AI Financial Advisor**: Tailormade insights evaluating burn rate, profit margins, and savings pace.
8. **Zero Advertisements**: Clean, distraction-free interface for all users.
9. **Multi-Currency Support**: Real-time foreign exchange rate conversion.
10. **Mobile Portability**: Ready-to-run React Native + Expo structure inside the `/mobile` directory.

---

## 🏢 Business Workspace & Deletion Guide

My Pocket Tracker supports managing an unlimited number of businesses alongside your personal finances:

### Switching Workspaces
- Click the workspace dropdown in the header or sidebar (defaults to **Personal Workspace / Home**).
- Select any registered business (e.g., *Apex Consulting*, *Zenith Logistics*) to switch your entire ledger, analytics, and settings to that specific company.

### Deleting a Selected Business
To delete a business workspace that you no longer need:
1. **Select the target business** using the workspace switcher dropdown in the header or sidebar.
2. Click the **Business** tab in the navigation menu (or navigate to **Settings & Profile**).
3. Click the red **Delete Business** button in the *Business Parameters* header or scroll down to the **Danger Zone — Delete Business Workspace** card and click **Delete This Business**.
4. A safety confirmation modal will open, displaying the business name, sector category, and total transaction records that will be removed.
5. Click **Yes, Delete Business** to confirm.
6. **Result**:
   - Only the selected business is removed from the system.
   - All transactions associated with that business ID are deleted.
   - Personal finances and other businesses remain completely unaffected.
   - The workspace immediately resets to your **Personal / Home Workspace** and navigates to the Dashboard.

---

## 🛠️ Folder Structure

```
/
├── app/                      # Next.js 15 pages and route controllers
│   ├── globals.css           # Styling theme config (dark/light themes)
│   ├── layout.tsx            # Global providers context loader
│   └── page.tsx              # Auth views, onboarding, and main entry router
├── components/               # UI components
│   ├── AdBanner.tsx          # Ad frame (permanently bypassed for ad-free experience)
│   ├── AppWorkspace.tsx      # Main application panels, Danger Zone, modals, and charts
│   ├── LandingPage.tsx       # Marketing landing page
│   └── UpgradeModal.tsx      # Neutralized checkout drawer (100% free mode)
├── lib/                      # Core shared business logic
│   ├── AppContext.tsx        # React state provider with deleteBusiness & workspace state
│   ├── mock-db.ts            # Stateful LocalStorage mock database with cascade deletion
│   ├── payments.ts           # Payment adapters (neutralized for free tier)
│   ├── ads-manager.ts        # Ads controller (bypassed, zero ads)
│   └── tests.ts              # Automated assertions verification suite (15 checks)
├── mobile/                   # Shared React Native Expo setup
│   └── App.js                # Core Expo mobile app structure
├── supabase/                 # Database migrations and policies
│   └── schema.sql            # Core database schema with ON DELETE CASCADE constraints
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
   Open [http://localhost:3000](http://localhost:3000) (or the assigned port) in your browser.

3. **Supabase Connection (Optional)**:
   Copy the content of `supabase/schema.sql` into your Supabase SQL Editor to create tables, indexes, and RLS policies. Add variables to a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   *Note: If no environment keys are supplied, My Pocket Tracker automatically activates the stateful Local Storage mock database.*

4. **Running Automated Tests**:
   Run the test validation suite in the CLI via `tsx`:
   ```bash
   npx --yes tsx -e "import { runValidationSuite } from './lib/tests'; runValidationSuite();"
   ```
   Or open the browser developer console when loading the dashboard to view automated validation checks covering financial metrics, ad elimination, savings goals, and business deletion integrity.
