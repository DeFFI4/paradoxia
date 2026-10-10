# Paradoxia: Modular Admin Panel & Supabase Schema Sync Architecture Spec

## 1. Executive Summary & Goals
The objective is to refactor the monolithic `AdminDashboard.tsx` into an enterprise-grade, modular administration workspace with five dedicated functional views and synchronize it with the exact Supabase database schema:
1. **Licenses & Keys (`LicensesView`)**: Focused key management, batch generation, import/export, editing, HWID reset, and bulk operations without visual clutter.
2. **System & Cheat Status (`SystemStatusView`)**: Global cheat bypass status (`UNDETECTED`, `UPDATING`, `MAINTENANCE`, `TESTING`), build version, public broadcast banner manager, and real-time Supabase latency ping indicator.
3. **Analytics & Metrics (`AnalyticsView`)**: Revenue projection, plan distribution (1d, 7d, 30d, Lifetime), active/frozen/expired/banned license breakdown.
4. **HWID Blacklist (`HwidBlacklistView`)**: Hardware ID ban list, manual HWID ban modal with reason specification, and instant unban action.
5. **Audit Logs (`AuditLogsView`)**: Immutable chronological timeline of admin actions (generation, status changes, HWID resets, bans, deletes) with JSON detail inspector and source tracking.

---

## 2. Visual & Interaction Standards
- **Strict SVG Only**: Exclusive use of `lucide-react` vector icons (`KeyRound`, `ShieldCheck`, `BarChart3`, `Ban`, `ScrollText`, `LogOut`, `ArrowLeft`, `Database`, `Sparkles`, `Download`, etc.). Strictly **zero emojis** in code or button labels.
- **Calm, High-End Aesthetic**:
  - Cosmic Obsidian background (`#060609` / `bg-cosmic-950`).
  - Frosted glass containers (`backdrop-blur-2xl`, `bg-white/[0.03]`, `border-white/10`).
  - Subtle neon cyan (`#06b6d4`) and violet (`#8b5cf6`) accents for active states and highlights.
  - Zero flashing or distracting animations; micro-interactions provide clear visual feedback without fatigue.

---

## 3. Database Schema Alignment (Supabase PostgreSQL)

The database configuration in `supabase/SETUP_SUPABASE_DIRECT.sql` must precisely match the production database structure:

### 3.1 Tables
```sql
-- 1. licenses
CREATE TABLE IF NOT EXISTS public.licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    product_name TEXT NOT NULL DEFAULT 'Paradoxia',
    duration_days INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'unused',
    hwid TEXT NULL,
    note TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    activated_at TIMESTAMPTZ NULL,
    expires_at TIMESTAMPTZ NULL,
    last_seen_at TIMESTAMPTZ NULL,
    last_ip TEXT NULL,
    hwid_reset_count INTEGER NOT NULL DEFAULT 0
);

-- 2. app_settings (key-value JSONB pattern)
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. hwid_blacklist
CREATE TABLE IF NOT EXISTS public.hwid_blacklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hwid TEXT UNIQUE NOT NULL,
    reason TEXT NULL,
    banned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_or_source TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. rate_limits
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip TEXT NOT NULL,
    failed_attempts INTEGER NOT NULL DEFAULT 1,
    locked_until TIMESTAMPTZ NULL,
    last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.2 Security & Permissions
- RLS disabled or open for direct synchronization from frontend client:
  `ALTER TABLE ... DISABLE ROW LEVEL SECURITY;`
- Full privileges granted to `anon`, `authenticated`, `service_role` on all tables and sequences.

---

## 4. Component Architecture & File Layout

```
src/components/admin/
├── AdminDashboard.tsx           # Master view coordinator & layout shell
├── AdminSidebar.tsx             # Left-docked navigation bar with SVG icons & counts
├── views/
│   ├── LicensesView.tsx         # Licenses management table & toolbars
│   ├── SystemStatusView.tsx     # Status & cheat broadcast controller
│   ├── AnalyticsView.tsx        # Financial & license metrics dashboard
│   ├── HwidBlacklistView.tsx    # HWID ban manager & manual ban modal
│   └── AuditLogsView.tsx        # Activity audit log timeline & filter
├── LicenseTable.tsx             # Sub-component for license listings
├── BulkActionBar.tsx            # Sticky selection drawer
├── KeyGeneratorModal.tsx        # Batch key creation modal
├── EditLicenseModal.tsx         # Detailed license property editor
└── ExportModal.tsx              # Export keys to CSV/TXT/JSON
```

---

## 5. Service Layer Enhancements (`licenseService.ts`)
The `LicenseService` will provide unified asynchronous operations with Supabase as primary storage and `localStorage` as fallback:
- **`app_settings`**:
  - `getServiceStatus()`: Queries `supabase.from('app_settings').select('value').eq('key', 'global_status')`.
  - `updateServiceStatus()`: Upserts `{ key: 'global_status', value: config, updated_at: new Date() }`.
- **`hwid_blacklist`**:
  - `getHWIDBlacklist()`: Queries `supabase.from('hwid_blacklist').select('*').order('banned_at', { ascending: false })`.
  - `addHWIDToBlacklist(hwid, reason)`: Inserts row and logs to `audit_logs`.
  - `removeHWIDFromBlacklist(hwid)`: Deletes row and logs to `audit_logs`.
- **`audit_logs`**:
  - `getAuditLogs()`: Queries `supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100)`.
  - `logAudit(action, details, ip_or_source)`: Inserts row to `audit_logs` in Supabase.
