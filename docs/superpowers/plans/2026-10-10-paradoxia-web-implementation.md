# Paradoxia Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and launch the "Paradoxia" cyber web application featuring a Liquid Glass storefront, a public license key checker, and an advanced Supabase-ready administrative dashboard with mock offline fallback.

**Architecture:** Client-side React 18 SPA with TypeScript and Vite. Uses custom Tailwind CSS utility tokens for deep obsidian (#060609) and liquid glassmorphism. Data access is centralized in `LicenseService`, supporting Supabase DB/RPC while falling back seamlessly to an offline reactive `localStorage` store.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Tabler Icons, Web Audio API, Supabase JS client.

**Spec:** `C:\Users\vrako\.gemini\antigravity-ide\scratch\paradoxia\docs\superpowers\specs\2026-10-10-paradoxia-web-design.md`

## Global Constraints
- Obsidian cosmic background: `#060609` / `#0a0a0f`.
- Color accents: Neon Cyan (`#06b6d4`), Electric Violet (`#8b5cf6`), Emerald Green (`#10b981`), Warning Amber (`#f59e0b`), Crimson (`#f43f5e`).
- Glass tokens: `backdrop-blur-2xl`, translucent white `border border-white/10`, radial cursor glow follower.
- Admin master key: `PDX-ADMIN-2026`.
- Key format: `PDX-XXXX-XXXX-XXXX` (12 alphanumeric characters across 3 chunks).
- Working root directory: `C:\Users\vrako\.gemini\antigravity-ide\scratch\paradoxia`.

---

### Task 1: Project Initialization & Build Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`

**Interfaces:**
- Produces: Runnable Vite + React + TypeScript + Tailwind CSS project skeleton.

- [ ] **Step 1: Create package.json with dependencies**
Create `package.json` with React 18, Vite, TailwindCSS, PostCSS, Autoprefixer, Lucide React, and Supabase client.

- [ ] **Step 2: Configure Vite, TypeScript, and PostCSS**
Setup `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, and `postcss.config.js`.

- [ ] **Step 3: Configure Tailwind CSS tokens**
Configure `tailwind.config.js` with Paradoxia custom colors (cosmic darks, neon cyan, electric violet, emerald pulse, glass borders).

- [ ] **Step 4: Create HTML entry with fonts & meta tags**
Create `index.html` linking Google Fonts (Outfit and Inter), high-end meta tags, title "Paradoxia | Next-Gen Cyber Enhancements".

- [ ] **Step 5: Install dependencies and verify build toolchain**
Run `npm install` and verify `npx vite --version`.

---

### Task 2: Core Design System, CSS Utilities & Audio Feedback

**Files:**
- Create: `src/index.css`
- Create: `src/services/soundService.ts`
- Create: `src/components/common/CursorGlow.tsx`
- Create: `src/components/common/GlassCard.tsx`
- Create: `src/components/common/Toast.tsx`

**Interfaces:**
- Consumes: Tailwind CSS base layer.
- Produces:
  - `soundService.playTone(type: 'click' | 'copy' | 'burst' | 'alert')`
  - `<CursorGlow />`
  - `<GlassCard />`
  - `<ToastContainer />` with `toast.success()`, `toast.error()`, `toast.info()`

- [ ] **Step 1: Implement Liquid Glass CSS in src/index.css**
Define custom scrollbars, animated mesh aurora backgrounds, liquid glow keyframes, and glass border utilities.

- [ ] **Step 2: Create Web Audio feedback service**
Implement `src/services/soundService.ts` synthesizing crisp cyber clicks, success chirps, and copy tones without external audio assets.

- [ ] **Step 3: Create CursorGlow, GlassCard, and Toast notification components**
Implement reactive radial lighting tracking cursor movement, reusable glass card with shine borders, and high-tech toasts.

---

### Task 3: Data Schema, Supabase Migration & Dual-Mode LicenseService

**Files:**
- Create: `supabase/migrations/001_paradoxia_schema.sql`
- Create: `src/types/license.ts`
- Create: `src/services/supabase.ts`
- Create: `src/services/licenseService.ts`

**Interfaces:**
- Produces:
  - Types: `License`, `LicenseStatus`, `ServiceStatus`, `AuditLog`, `HWIDBlacklistEntry`
  - Service methods:
    - `getLicenses(): Promise<License[]>`
    - `checkLicense(key: string): Promise<CheckResult>`
    - `generateLicenses(durationDays: number, count: number, note: string): Promise<License[]>`
    - `updateLicense(id: string, updates: Partial<License>): Promise<License>`
    - `bulkUpdateLicenses(ids: string[], action: BulkAction): Promise<void>`
    - `deleteLicense(id: string): Promise<void>`
    - `getServiceStatus(): Promise<ServiceStatusConfig>`
    - `updateServiceStatus(config: Partial<ServiceStatusConfig>): Promise<void>`
    - `getAuditLogs(): Promise<AuditLog[]>`
    - `getHWIDBlacklist(): Promise<HWIDBlacklistEntry[]>`
    - `toggleHWIDBlacklist(hwid: string, reason?: string): Promise<void>`

- [ ] **Step 1: Write Supabase PostgreSQL migration script**
Write `001_paradoxia_schema.sql` containing tables (`licenses`, `app_settings`, `audit_logs`, `hwid_blacklist`), indexes, RLS policies, and stored procedures.

- [ ] **Step 2: Define TypeScript models in src/types/license.ts**
Define comprehensive interfaces for all license states, tiers, audit logs, and settings.

- [ ] **Step 3: Implement Supabase client & fallback detector**
Create `src/services/supabase.ts` reading env variables or flagging mock fallback mode.

- [ ] **Step 4: Implement reactive LicenseService with seeded mock data**
Seed 15+ realistic licenses with diverse statuses (active, unused, frozen, banned), hardware IDs, audit logs, and status settings stored in `localStorage`.

---

### Task 4: Storefront Components (Hero, Feature Matrix, Pricing, Key Checker)

**Files:**
- Create: `src/components/common/Navbar.tsx`
- Create: `src/components/common/Footer.tsx`
- Create: `src/components/storefront/BroadcastBanner.tsx`
- Create: `src/components/storefront/HeroSection.tsx`
- Create: `src/components/storefront/FeatureMatrix.tsx`
- Create: `src/components/storefront/PricingGrid.tsx`
- Create: `src/components/storefront/PurchaseModal.tsx`
- Create: `src/components/storefront/KeyChecker.tsx`
- Create: `src/components/storefront/StorefrontView.tsx`

**Interfaces:**
- Consumes: `LicenseService`, `soundService`, common components.
- Produces: Complete mrph.cc-inspired cyber storefront with interactive modules and public key validation.

- [ ] **Step 1: Build Navbar & dynamic Broadcast Banner**
Include brand logo, live status indicator (`● UNDETECTED` / `▲ TESTING`), anchor navigation, Discord/Telegram buttons, and Admin link.

- [ ] **Step 2: Build HeroSection with cyber badges & CTAs**
Headline "Dominate the Game with Paradoxia", animated background particles/aurora, anti-cheat readiness badges, dual CTAs.

- [ ] **Step 3: Build FeatureMatrix with interactive tabs**
Tabs for Aimbot, Visuals/ESP, Misc, Security with interactive control previews (FOV slider demo, skeleton toggle, bone selector).

- [ ] **Step 4: Build PricingGrid & PurchaseModal**
Pricing cards (1 Day, 7 Days, 30 Days, Lifetime) with highlighted popular tier, instant purchase modal with payment options.

- [ ] **Step 5: Build KeyChecker**
Input field for `PDX-XXXX-XXXX-XXXX`, status badge, remaining days countdown, and HWID binding status display.

---

### Task 5: Advanced Admin Dashboard (Metrics, Generator, Table, Bulk Actions, Analytics, HWID)

**Files:**
- Create: `src/components/admin/AdminLogin.tsx`
- Create: `src/components/admin/AdminDashboard.tsx`
- Create: `src/components/admin/ServiceStatusController.tsx`
- Create: `src/components/admin/AnalyticsSection.tsx`
- Create: `src/components/admin/KeyGeneratorModal.tsx`
- Create: `src/components/admin/LicenseTable.tsx`
- Create: `src/components/admin/EditLicenseModal.tsx`
- Create: `src/components/admin/BulkActionBar.tsx`
- Create: `src/components/admin/ExportModal.tsx`
- Create: `src/components/admin/AuditLogDrawer.tsx`
- Create: `src/components/admin/HWIDBlacklistDrawer.tsx`

**Interfaces:**
- Consumes: `LicenseService`, `soundService`, common components.
- Produces: Full-featured administrator interface with live controls, export, bulk actions, and telemetry.

- [ ] **Step 1: Build AdminLogin modal & master key protection**
Protected screen accepting `PDX-ADMIN-2026` with session persistence.

- [ ] **Step 2: Build Metrics Bar & ServiceStatusController**
Stat cards (Total, Active, Unused, Banned, HWID-bound) and live status switcher (`UNDETECTED`, `TESTING`, `UPDATING`, `MAINTENANCE`) with broadcast banner editor.

- [ ] **Step 3: Build Neon Analytics visualization**
Interactive activation velocity trend chart (SVG canvas), donut distribution of pricing tiers, and reseller breakdown.

- [ ] **Step 4: Build KeyGeneratorModal with burst copy**
Single/bulk key generator (1 to 50 keys), duration picker, note/tag, and one-click bulk formatted copy.

- [ ] **Step 5: Build LicenseTable with multi-select & BulkActionBar**
Filtering by status, search by key/note, selection checkboxes, bulk extend/freeze/ban/HWID reset/delete actions.

- [ ] **Step 6: Build ExportModal, AuditLogDrawer & HWIDBlacklistDrawer**
Export to CSV, JSON, TXT; live audit event timeline; HWID blacklist manager.

---

### Task 6: Routing, Application Assembly & Dev Server Verification

**Files:**
- Create: `src/App.tsx`
- Create: `src/main.tsx`

**Interfaces:**
- Consumes: `StorefrontView`, `AdminDashboard`, `CursorGlow`, `Toast`.
- Produces: Integrated web application with seamless navigation between Storefront (`/`) and Admin (`/admin`).

- [ ] **Step 1: Assemble App.tsx with view switching & state synchronization**
Integrate navigation state, global toast provider, audio trigger hooks, and responsive layout.

- [ ] **Step 2: Build and run test verification**
Execute `npm run build` to confirm zero TypeScript/CSS errors.

- [ ] **Step 3: Launch dev server and inspect in browser subagent**
Start `npm run dev` and verify visual design, glassmorphism aesthetics, key checker, and admin functionality.
