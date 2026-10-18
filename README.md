# My Pocket Tracker - 100% Free Unified Personal & Business Finance Platform

My Pocket Tracker is a completely free, open-source financial platform built to manage personal wealth and multiple company accounts under a single workspace with zero fees, no subscription walls, and no advertisements.

---

## 🚀 Key Modules

1. **Unified Dashboard**: Real-time metrics for Cashflow, Income, Expenses, and Net Worth with high-contrast data visualization.
2. **Direct Workspace Access**:
   - Root route (`/`) serves the branded landing page with quick login and offline instant access.
   - Dedicated direct route (`/workspace`) provides immediate access to the full application workspace during development.
3. **Offline-First Progressive Web App (PWA)**:
   - Full offline capabilities with Service Worker (`public/sw.js`) precaching and navigation fallback (`/offline`).
   - Dual-layer persistence: Structured IndexedDB (`MyPocketTrackerDB` v1) synced with `MockDB` (LocalStorage) with duplicate prevention.
   - PWA manifests (`manifest.webmanifest` & `manifest.json`) with `display: standalone`, high-res icons (192x192, 512x512, maskable, apple-touch), and theme color `#0b0f17`.
   - Real-time synchronization and network status indicators (`Online`, `Offline`, `Saved Locally`, `Syncing`, `Update Available`).
   - Smart **Install App** button that displays in the header and automatically unmounts/disappears once the PWA is installed.
4. **Ecosystem Workspace Switcher**: Seamlessly toggle between personal budgeting ("Home") and individual corporate accounts.
5. **Business Settings & Workspace Deletion**: Dedicated business management tab for the currently active company, including:
   - Company identity, sector category, workspace email, and description configuration.
   - **Delete Selected Business**: Irreversible deletion option located in the *Business Parameters* header and the dedicated *Danger Zone*. Safely deletes **only** the selected business and its associated ledger transactions, leaving personal finances and other business workspaces completely untouched. Includes a confirmation modal to prevent accidental clicks.
6. **Savings Tracker**: Set financial targets, monitor goals progress, and log milestone achievements (personal workspace).
7. **100% Free Forever**: All features unlocked with unlimited businesses, no pro mode, and no payment requirements.
8. **Invoice Generator**: Custom client receipt designer and branded invoice generation with PDF export.
9. **TRACKO AI Financial Advisor**: Tailormade insights evaluating burn rate, profit margins, anomalies, and predictive month-end forecasts with strict workspace isolation.
10. **Zero Advertisements**: Clean, distraction-free interface across all views.
11. **Multi-Currency Support**: Real-time foreign exchange rate conversion.
12. **Mobile Portability**: Ready-to-run React Native + Expo structure inside the `/mobile` directory plus mobile-optimized PWA safe-area viewport support.

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
│   ├── api/tracko/route.ts   # TRACKO AI financial engine backend endpoint
│   ├── globals.css           # Styling theme config, glassmorphism, safe-area utilities
│   ├── layout.tsx            # Global metadata, viewport, PWA manifests & SW registrar
│   ├── offline/page.tsx      # Branded custom offline fallback screen
│   ├── workspace/page.tsx    # Direct development route to AppWorkspace (/workspace)
│   └── page.tsx              # Landing page, authentication views, and onboarding router
├── components/               # UI components
│   ├── AdBanner.tsx          # Ad frame (permanently bypassed for ad-free experience)
│   ├── AppWorkspace.tsx      # Main application dashboard, charts, transactions, and modals
│   ├── LandingPage.tsx       # Marketing landing page with Install App triggers
│   ├── PWAInstallModal.tsx   # Platform-aware PWA installation modal (iOS/Android/Desktop)
│   ├── PWAStatusBanner.tsx   # Compact status indicator and offline banner
│   ├── TrackoChat.tsx        # TRACKO AI interactive financial chat drawer
│   ├── TrackoFloatingWidget.tsx # Floating trigger for TRACKO assistant
│   ├── TrackoMascot.tsx      # Animated mascot with emotion states and accessibility support
│   └── UpgradeModal.tsx      # Neutralized checkout drawer (100% free mode)
├── lib/                      # Core shared business logic
│   ├── AppContext.tsx        # React state provider with PWA lifecycle & workspace state
│   ├── ads-manager.ts        # Ads controller (bypassed, zero ads)
│   ├── mock-db.ts            # Stateful LocalStorage mock database with cascade deletion
│   ├── offline-storage.ts    # IndexedDB offline engine (`MyPocketTrackerDB` v1)
│   ├── payments.ts           # Payment adapters (neutralized for free tier)
│   ├── tests.ts              # Automated assertions verification suite (67 tests)
│   └── tracko-engine.ts      # Deterministic financial analysis, forecasting & anomaly engine
├── public/                   # Static PWA assets & service worker
│   ├── favicon.ico           # Browser tab favicon
│   ├── favicon.png           # High-res favicon
│   ├── icon.png              # Master high-res app icon
│   ├── logo.png              # Official 3D wallet brand logo
│   ├── manifest.json         # Fallback manifest for Chromium compatibility
│   ├── manifest.webmanifest  # Standard PWA Web App Manifest
│   ├── sw.js                 # Service Worker (precache, runtime cache, offline fallback)
│   └── icons/                # High-res PWA icons (192x192, 512x512, maskable, apple-touch)
├── mobile/                   # Shared React Native Expo mobile app
│   ├── assets/               # Mobile icons (icon.png, splash-icon.png, foreground)
│   ├── App.js                # Core Expo mobile app structure
│   └── package.json          # React Native & Expo dependencies
├── scripts/                  # Project utility scripts
│   └── generate-icons.js     # Icon generator utility
├── supabase/                 # Database migrations and policies
│   └── schema.sql            # Core database schema with ON DELETE CASCADE constraints
└── package.json              # Project scripts & dependencies (Next.js 15, Recharts, Lucide, Framer Motion)
```

---

## 📱 PWA & Offline-First Architecture

### 1. Web App Manifest
- Registered in `app/layout.tsx` pointing to `/manifest.webmanifest`.
- Configured with `display: "standalone"`, `theme_color: "#0b0f17"`, and high-resolution icons (192×192, 512×512, maskable, and Apple touch icon).
- Provides app shortcuts directly to Dashboard, Analytics, and Invoices.

### 2. Service Worker (`public/sw.js`)
- **Precaching**: Static core shell assets cached on install (`/`, `/offline`, `/manifest.webmanifest`, icons).
- **Navigation Requests**: Network-first strategy with immediate offline fallback to `/offline` if the network fails.
- **Static Assets**: Stale-while-revalidate strategy for CSS, JS chunks, images, and fonts with automated cache versioning (`pocket-tracker-v1.0.1`).
- **Cache Invalidation & Cleanup**: Outdated caches are purged automatically on activation.
- **Security & Privacy**: Authenticated endpoints (`/api/auth`, `/auth/`, `/supabase/`) bypass cache to prevent sensitive credential leaks.

### 3. Dual-Layer Offline Data Persistence
- **IndexedDB (`MyPocketTrackerDB` v1)**: Dedicated object stores for `transactions`, `businesses`, `goals`, `profile`, `sync_queue`, and `meta`.
- **LocalStorage (`MockDB`)**: Mirrored dual-write ensures backwards compatibility and fast synchronous UI reads.
- **Deduplication**: Transactions maintain cryptographic/UUID keys preventing duplicates during sync reconciliation.
- **Discreet Status Indicators**: Real-time badges for `Online`, `Offline`, `Saved Locally`, `Syncing`, and `Update Available`.

### 4. Install / Launch App Mechanics
- **Landing Page & Workspace Header**: Prominent **"Install App"** buttons styled with warm gold (`#F0C965`) and crisp dark borders.
- Intercepts `beforeinstallprompt` on Android and Chromium browsers.
- Automatically removes the Install button once the application is installed.
- If native prompt is unavailable (or on iOS Safari), opens a guided modal explaining:
  - **Android/Chrome**: Browser menu -> *Install app* / *Add to Home screen*.
  - **iOS Safari**: Share button -> *Add to Home Screen*.
  - **Desktop**: Address bar install icon or keyboard shortcut.

---

## 🎨 Brand Design & Visual System

- **Official 3D Brand Logo**: Custom 3D yellow wallet with an Indian Rupee (₹) coin, credit card, and GPS tracking navigation path (`/logo.png`, `/icon.png`).
- **Universal Background**: PANTONE® 13-5412 TCX Aquatic Green (`#96DFCE`, RGB: `150, 223, 206`).
- **Primary Interactive Highlights**: PANTONE® 12-0727 TCX Sunshine Yellow (`#FADE85`) and rich warm gold (`#F0C965`).
  - Applied to CTA buttons, submit actions, active navigation states, badges, and quick-start actions with subtle `border-black/20` borders.
- **Financial Status Colors**:
  - **Income / Positive Cashflow**: Crisp Emerald Green (`#10b981`), applied across Income metrics, bar chart fills, area gradients, and legend swatches.
  - **Expense / Outflow**: Rose Red (`#f43f5e`).
  - **Accumulated Balance**: High-contrast pure black stroke (`#000000`) with bold black legend text and dark-to-transparent area fill.
- **Modal Dialogs**: Styled in cohesive Aqua Green (`#96DFCE`) with frosted glass highlights, deep shadow elevation (`shadow-2xl`), high-contrast bold black labels, and clean white input containers (`bg-white/80`).
- **Typography**:
  - High-contrast pure black text (`#000000`) throughout all metric figures, titles, tables, forms, and cards.
  - **Plus Jakarta Sans**: Applied to all brand titles, headers (`h1`–`h6`), metrics, numbers, and interactive buttons.
  - **Inter**: Applied to body copy, ledger descriptions, tables, inputs, and form controls.

---

## ⚙️ Installation & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Web Development Server
```bash
npm run dev
```
- Open [http://localhost:3000](http://localhost:3000) for the main Landing Page.
- Open [http://localhost:3000/workspace](http://localhost:3000/workspace) to open the **App Workspace Dashboard** directly.

> [!TIP]
> **PWA Cache Notice**: If `localhost:3000` serves a previously cached project from your browser's service worker, perform a hard refresh (`Ctrl + Shift + R`) or open Chrome DevTools (`F12`) -> **Application** -> **Service Workers** -> click **Unregister** and **Clear site data**.

### 3. Run Automated Validation Test Suite
Run the 67-point automated test suite (covering financial calculations, TRACKO AI 20-point acceptance criteria, IndexedDB, PWA manifests, icons, and workspace isolation):
```bash
npm test
```
*Or directly via:*
```bash
npx --yes tsx -e "import { runValidationSuite } from './lib/tests'; runValidationSuite();"
```

### 4. Build for Production
```bash
npm run build
npm start
```

### 5. Run Mobile App (React Native + Expo)
```bash
cd mobile
npm install
npm start
```

### 6. Testing Offline Mode in Chrome DevTools
1. Open Chrome DevTools (`F12`).
2. Go to the **Application** tab -> **Service Workers** (verify `sw.js` is active).
3. Check **Manifest** (verify icons, standalone display mode, theme colors).
4. Go to the **Network** tab, change throttling to **Offline**, and refresh: the app shell and cached financial records remain accessible.
