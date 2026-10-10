# Modular Admin Panel & Supabase Schema Sync Implementation Plan

- **Goal:** Refactor the monolithic `AdminDashboard.tsx` into 5 isolated views connected via an SVG-driven sidebar navigation (`AdminSidebar.tsx`), and synchronize `licenseService.ts` and `SETUP_SUPABASE_DIRECT.sql` with the exact Supabase database schema (`licenses`, `app_settings`, `hwid_blacklist`, `audit_logs`, `rate_limits`).
- **Architecture:** Modular Component Hierarchy (`AdminDashboard` -> `AdminSidebar` + isolated `views/`), Dual-mode Storage Adapter (`licenseService` -> Supabase + `localStorage` fallback), Strict SVG Design Standards (zero emojis, `lucide-react` icons, dark cosmic glass aesthetics).
- **Tech Stack:** React 18, TypeScript, Tailwind CSS, Lucide React, Supabase JS Client, Vite.

---

## File Structure Map

```
c:\Users\vrako\.gemini\antigravity-ide\scratch\paradoxia\
├── supabase/
│   └── SETUP_SUPABASE_DIRECT.sql              # Synchronized schema script with RLS disabled and GRANT ALL
├── src/
│   ├── types/
│   │   └── license.ts                         # Validated TypeScript interfaces for all tables
│   ├── services/
│   │   └── licenseService.ts                  # Enhanced Supabase queries with localStorage fallback
│   └── components/
│       └── admin/
│           ├── AdminSidebar.tsx               # Dedicated navigation sidebar (SVG icons, counts, logout)
│           ├── AdminDashboard.tsx             # Master view router with activeTab state
│           └── views/
│               ├── LicensesView.tsx           # License table, batch generator, filters, bulk actions
│               ├── SystemStatusView.tsx       # Cheat status controller, version, banner, ping
│               ├── AnalyticsView.tsx          # Revenue and plan distribution metrics
│               ├── HwidBlacklistView.tsx      # HWID ban manager with add modal and 1-click unban
│               └── AuditLogsView.tsx          # Chronological activity log feed with type filters
```

---

## Tasks Breakdown

### Task 1: Supabase Schema Synchronization Script
- **File**: `supabase/SETUP_SUPABASE_DIRECT.sql`
- **Actions**:
  1. Define `licenses` table structure with all columns (`id`, `key`, `product_name`, `duration_days`, `status`, `hwid`, `note`, `created_at`, `activated_at`, `expires_at`, `last_seen_at`, `last_ip`, `hwid_reset_count`).
  2. Define `app_settings` with `key TEXT PRIMARY KEY`, `value JSONB NOT NULL`, `updated_at TIMESTAMPTZ`.
  3. Define `hwid_blacklist` with `id UUID PRIMARY KEY`, `hwid TEXT UNIQUE NOT NULL`, `reason TEXT`, `banned_at TIMESTAMPTZ`.
  4. Define `audit_logs` with `id UUID PRIMARY KEY`, `action TEXT NOT NULL`, `details JSONB`, `ip_or_source TEXT`, `created_at TIMESTAMPTZ`.
  5. Define `rate_limits` with `id UUID PRIMARY KEY`, `ip TEXT NOT NULL`, `failed_attempts INTEGER`, `locked_until TIMESTAMPTZ`, `last_attempt_at TIMESTAMPTZ`.
  6. Add statements disabling RLS and granting permissions:
     ```sql
     ALTER TABLE public.licenses DISABLE ROW LEVEL SECURITY;
     ALTER TABLE public.app_settings DISABLE ROW LEVEL SECURITY;
     ALTER TABLE public.hwid_blacklist DISABLE ROW LEVEL SECURITY;
     ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;
     ALTER TABLE public.rate_limits DISABLE ROW LEVEL SECURITY;
     GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
     GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
     ```
- **Verification**: Syntax check, verify column names match user specification.

---

### Task 2: Service Layer (`licenseService.ts`) Supabase Integration
- **File**: `src/services/licenseService.ts`
- **Actions**:
  1. **`app_settings` synchronization**:
     - `getServiceStatus()`: Query `supabase.from('app_settings').select('value').eq('key', 'global_status').maybeSingle()`. If present, return `data.value`. Fall back to `localStorage`.
     - `updateServiceStatus(updates)`: Upsert into `app_settings` `{ key: 'global_status', value: nextConfig, updated_at: new Date().toISOString() }`. Fall back to `localStorage`.
  2. **`hwid_blacklist` synchronization**:
     - `getHWIDBlacklist()`: Query `supabase.from('hwid_blacklist').select('*').order('banned_at', { ascending: false })`. Fall back to `localStorage`.
     - `addToBlacklist(hwid, reason)`: Insert into `hwid_blacklist`, log in `audit_logs`.
     - `removeFromBlacklist(hwid)`: Delete from `hwid_blacklist`, log in `audit_logs`.
     - Check blacklist in `checkLicense` to deny validation if HWID is blacklisted.
  3. **`audit_logs` synchronization**:
     - `getAuditLogs()`: Query `supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100)`. Fall back to `localStorage`.
     - `logAudit(action, details, ip_or_source)`: Insert row into `audit_logs` with `{ action, details, ip_or_source, created_at: new Date().toISOString() }`.
- **Verification**: Run TypeScript build to confirm types and methods compile without errors.

---

### Task 3: Create `AdminSidebar.tsx` Navigation Component
- **File**: `src/components/admin/AdminSidebar.tsx`
- **Actions**:
  1. Implement left dock navigation with collapsible/responsive support.
  2. Tabs:
     - `licenses`: `KeyRound` SVG icon, label «Лицензии и ключи», badge with total key count.
     - `status`: `ShieldCheck` SVG icon, label «Статус системы», badge with current status indicator (UNDETECTED/UPDATING).
     - `analytics`: `BarChart3` SVG icon, label «Аналитика», badge with active keys count.
     - `blacklist`: `Ban` SVG icon, label «Черный список HWID», badge with banned HWID count.
     - `audit`: `ScrollText` SVG icon, label «Журнал аудита», badge with recent logs count.
  3. Bottom controls:
     - Supabase connection status pill with live indicator dot.
     - «Вернуться на сайт» (`ArrowLeft` SVG icon).
     - «Выйти» (`LogOut` SVG icon).
  4. Design: `bg-cosmic-950/90`, `border-r border-white/10`, `backdrop-blur-2xl`. No emojis.
- **Verification**: Test rendering and active tab change handlers.

---

### Task 4: Modular View Components Implementation
- **Files**:
  - `src/components/admin/views/LicensesView.tsx`
  - `src/components/admin/views/SystemStatusView.tsx`
  - `src/components/admin/views/AnalyticsView.tsx`
  - `src/components/admin/views/HwidBlacklistView.tsx`
  - `src/components/admin/views/AuditLogsView.tsx`
- **Actions**:
  1. **`LicensesView.tsx`**:
     - Mounts `LicenseTable`, export button, generator button, `BulkActionBar`, and handles all key edit/extend/reset workflows.
     - Zero charts or server banners to ensure ultra-fast, clean key management.
  2. **`SystemStatusView.tsx`**:
     - Wraps `ServiceStatusController` in a dedicated view with latency ping tool and quick cheat status selector.
  3. **`AnalyticsView.tsx`**:
     - Dedicated page wrapping `AnalyticsSection` with expanded breakdowns by tariff (1 day, 7 days, 30 days, Lifetime) and conversion ratios.
  4. **`HwidBlacklistView.tsx`**:
     - List banned hardware IDs with date, reason, and one-click unban button.
     - Modal for adding a new HWID to blacklist with reason validation.
     - Search filter by HWID string.
  5. **`AuditLogsView.tsx`**:
     - Filterable audit feed (all, generate, reset_hwid, ban, freeze, status_change, hwid_blacklist).
     - Clear formatting for timestamps, action types with colored SVG status icons, and expandable JSON details.
- **Verification**: Verify all 5 views import without error and satisfy UI standards.

---

### Task 5: Master `AdminDashboard.tsx` Refactoring
- **File**: `src/components/admin/AdminDashboard.tsx`
- **Actions**:
  1. Replace current stacked single-page layout with a 2-column workspace layout:
     - Left: `<AdminSidebar activeTab={activeTab} onSelectTab={setActiveTab} ... />`
     - Right: Main scrollable container rendering the selected view with smooth transition:
       - `{activeTab === 'licenses' && <LicensesView ... />}`
       - `{activeTab === 'status' && <SystemStatusView ... />}`
       - `{activeTab === 'analytics' && <AnalyticsView ... />}`
       - `{activeTab === 'blacklist' && <HwidBlacklistView ... />}`
       - `{activeTab === 'audit' && <AuditLogsView ... />}`
  2. Modals (`KeyGeneratorModal`, `ExportModal`, `EditLicenseModal`) kept at top level and accessible seamlessly from `LicensesView`.
- **Verification**: Run `npm run build` / Vite build to ensure zero type or bundling errors.

---

## Verification Plan

### Automated Tests
1. Run `npm run build` in powershell to ensure complete TypeScript typing compliance and error-free bundling.

### Manual Verification
1. Launch or verify application state in browser:
   - Navigate to Admin Console (`/admin` or login button).
   - Click each of the 5 sidebar tabs and ensure fast, smooth tab switching.
   - Verify zero emojis in buttons, badges, tables, or alerts.
   - Check HWID Blacklist view: Add a test HWID, verify it appears, remove it.
   - Check Audit Log view: Verify logged events appear with timestamps and action tags.
   - Check Licenses view: Verify filtering, key generation modal, export modal, and editing work as expected.
