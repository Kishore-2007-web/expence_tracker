# My Pocket Tracker - 100% Free Unified Personal & Business Finance Platform

My Pocket Tracker is a completely free, open financial platform built to manage personal wealth and multiple company accounts under a single workspace with zero fees, no subscription walls, and no advertisements.

---

## 🚀 Key Modules

1. **Unified Dashboard**: Real-time metrics for Cashflow, Income, Expenses, and Net Worth.
2. **Offline-First Progressive Web App (PWA)**:
   - Full offline capabilities with Service Worker (`public/sw.js`) precaching and navigation fallback (`/offline`).
   - Dual-layer persistence: Structured IndexedDB (`MyPocketTrackerDB` v1) synced with `MockDB` (LocalStorage) with duplicate prevention.
   - PWA manifests (`manifest.webmanifest` & `manifest.json`) with `display: standalone`, high-res icons (192x192, 512x512, maskable, apple-touch), and theme color `#0b0f17`.
   - Real-time synchronization and network status indicators (`Online`, `Offline`, `Saved Locally`, `Syncing`, `Update Available`).
   - Prominent **Install App / Launch App** buttons with platform-specific instructions for Android Chrome, iOS Safari, and Desktop.
3. **Ecosystem Workspace Switcher**: Seamlessly toggle between personal budgeting ("Home") and individual corporate accounts.
4. **Business Settings & Workspace Deletion**: Dedicated business management tab for the currently active company, including:
   - Company identity, sector category, workspace email, and description configuration.
   - **Delete Selected Business**: Irreversible deletion option located in the *Business Parameters* header and the dedicated *Danger Zone*. Safely deletes **only** the selected business and its associated ledger transactions, leaving personal finances and other business workspaces completely untouched. Includes a confirmation modal to prevent accidental clicks.
5. **Savings Tracker**: Set financial targets, monitor goals progress, and log milestone achievements (personal workspace).
6. **100% Free Forever**: All features unlocked with unlimited businesses, no pro mode, and no payment requirements.
7. **Invoice Generator**: Custom client receipt designer and branded invoice generation with PDF export.
8. **AI Financial Advisor**: Tailormade insights evaluating burn rate, profit margins, and savings pace.
9. **Zero Advertisements**: Clean, distraction-free interface for all users.
10. **Multi-Currency Support**: Real-time foreign exchange rate conversion.
11. **Mobile Portability**: Ready-to-run React Native + Expo structure inside the `/mobile` directory plus mobile-optimized PWA safe-area viewport support.

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
│   ├── globals.css           # Styling theme config, safe-area utilities
│   ├── layout.tsx            # Global metadata, viewport, PWA manifests & SW registrar
│   ├── offline/page.tsx      # Branded custom offline fallback screen
│   └── page.tsx              # Auth views, onboarding, and main entry router
├── components/               # UI components
│   ├── AdBanner.tsx          # Ad frame (permanently bypassed for ad-free experience)
│   ├── AppWorkspace.tsx      # Main application panels, PWA status banner, Danger Zone
│   ├── LandingPage.tsx       # Marketing landing page with Install App triggers
│   ├── PWAInstallModal.tsx   # Platform-aware PWA installation modal (iOS/Android/Desktop)
│   ├── PWAStatusBanner.tsx   # Compact status indicator and offline banner
│   └── UpgradeModal.tsx      # Neutralized checkout drawer (100% free mode)
├── lib/                      # Core shared business logic
│   ├── AppContext.tsx        # React state provider with PWA lifecycle & workspace state
│   ├── offline-storage.ts    # IndexedDB offline engine (`MyPocketTrackerDB` v1)
│   ├── mock-db.ts            # Stateful LocalStorage mock database with cascade deletion
│   ├── payments.ts           # Payment adapters (neutralized for free tier)
│   ├── ads-manager.ts        # Ads controller (bypassed, zero ads)
│   └── tests.ts              # Automated assertions verification suite (26 checks)
├── public/                   # Static PWA assets & service worker
│   ├── sw.js                 # Service Worker (precache, runtime cache, offline fallback)
│   ├── manifest.webmanifest  # Standard PWA Web App Manifest
│   ├── manifest.json         # Fallback manifest for Chromium compatibility
│   └── icons/                # High-res PWA icons (192x192, 512x512, maskable, apple-touch)
├── mobile/                   # Shared React Native Expo setup
│   └── App.js                # Core Expo mobile app structure
├── supabase/                 # Database migrations and policies
│   └── schema.sql            # Core database schema with ON DELETE CASCADE constraints
└── package.json              # Dependencies (Next.js 15, Recharts, Lucide, Framer Motion)
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
- **Dis discreet Status Indicators**: Real-time badges for `Online`, `Offline`, `Saved Locally`, `Syncing`, and `Update Available`.

### 4. Install / Launch App Mechanics
- **Landing Page & Workspace Header**: Prominent **"Install App"** / **"Launch App"** buttons.
- Intercepts `beforeinstallprompt` on Android and Chromium browsers.
- If native prompt is unavailable (or on iOS Safari), opens a guided modal explaining:
  - **Android/Chrome**: Browser menu -> *Install app* / *Add to Home screen*.
  - **iOS Safari**: Share button -> *Add to Home Screen*.
  - **Desktop**: Address bar install icon or keyboard shortcut.
- Automatically switches to **"Open My Pocket Tracker"** when running in standalone mode or already installed.

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

3. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

4. **Running Automated Tests**:
   Run the comprehensive test validation suite (26 assertions covering PWA, IndexedDB, manifest, icons, financial integrity, and workspace isolation):
   ```bash
   npx --yes tsx -e "import { runValidationSuite } from './lib/tests'; runValidationSuite();"
   ```

5. **Testing Offline Mode in DevTools**:
   - Open Chrome DevTools (`F12`).
   - Go to the **Application** tab -> **Service Workers** (verify `sw.js` is active).
   - Check **Manifest** (verify icons, standalone display mode, theme colors).
   - Go to the **Network** tab, change throttling to **Offline**, and refresh: the app shell and cached financial records remain accessible.
