# Paradoxia: Cyber Web Application & License Management Architecture Spec

## 1. Project Overview & Aesthetic Goals
**Paradoxia** is a high-end, cyber-themed web application and storefront inspired by the UI/UX of *mrph.cc*. It showcases product modules (Aimbot, Visuals/ESP, Misc, Security), offers a live status badge system with broadcast banners, an instant public license key checker, and provides an enterprise-grade administrative management panel for license keys, live status control, reseller operations, analytics, and HWID management.

### Visual Design System ("Liquid Glass" / Cyber Dark)
- **Palette**:
  - Cosmic Obsidian Background: `#060609` / `#0a0a0f`
  - Neon Cyan Accent: `#06b6d4` / `#22d3ee` (Glow: `rgba(6, 182, 212, 0.4)`)
  - Electric Violet Accent: `#8b5cf6` / `#a855f7` (Glow: `rgba(139, 92, 246, 0.4)`)
  - Emerald Green Status: `#10b981` (Glow: `rgba(16, 185, 129, 0.5)`)
  - Warning Amber: `#f59e0b`
  - Crimson Alert: `#f43f5e`
  - Translucent Glass Surfaces: `rgba(255, 255, 255, 0.03)` to `rgba(255, 255, 255, 0.08)` with fine `border border-white/10`.
- **Glassmorphism**:
  - Multi-layer `backdrop-blur-2xl` with subtle neon gradient borders.
  - Interactive mouse-following radial lighting mesh (`CursorGlow`).
  - Hover reflections, liquid ripple pill effects, and smooth cubic-bezier micro-animations.
- **Audio Feedback**:
  - Subtle synthesizer micro-tones via browser Web Audio API for key copying, generator bursts, and action confirmations.

---

## 2. Technical Stack
- **Framework**: React 18 + TypeScript + Vite.
- **Styling**: Tailwind CSS with custom Liquid Glass design tokens & CSS variables.
- **Icons**: Lucide Icons & Tabler Icons SVG set.
- **State Management & Persistence**:
  - Dual-mode `LicenseService`: Supabase Client (`@supabase/supabase-js`) + Reactive `localStorage` mock store for instant offline functionality.
- **Backend / Database**: Supabase PostgreSQL + Row Level Security (RLS) + Stored Procedures (RPC).

---

## 3. Database Schema (Supabase PostgreSQL)

### 3.1 Tables
```sql
-- Licenses Table
CREATE TABLE public.licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    product_name TEXT NOT NULL DEFAULT 'Paradoxia',
    duration_days INTEGER NOT NULL, -- 9999 for Lifetime
    status TEXT NOT NULL CHECK (status IN ('unused', 'active', 'frozen', 'expired', 'banned')) DEFAULT 'unused',
    hwid TEXT NULL,
    note TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    activated_at TIMESTAMPTZ NULL,
    expires_at TIMESTAMPTZ NULL
);

-- App Settings & Global Service Status Table
CREATE TABLE public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit / Activity Log Table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL, -- 'generate', 'activate', 'reset_hwid', 'ban', 'status_change', etc.
    details JSONB NOT NULL,
    ip_or_source TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- HWID Blacklist Table
CREATE TABLE public.hwid_blacklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hwid TEXT UNIQUE NOT NULL,
    reason TEXT NULL,
    banned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_licenses_key ON public.licenses(key);
CREATE INDEX idx_licenses_status ON public.licenses(status);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);
```

### 3.2 Security (RLS) & RPC Functions
- Direct public table SELECT/INSERT/UPDATE is disabled via RLS.
- `public.check_license(p_key TEXT)`:
  - Accessible anonymously.
  - Returns sanitized info: `{ valid: boolean, status: text, duration_days: int, activated_at: timestamptz, expires_at: timestamptz, hwid_bound: boolean }`.
- `public.generate_licenses(p_duration_days INT, p_count INT, p_note TEXT, p_admin_secret TEXT)`:
  - Generates `p_count` keys in format `PDX-[4_ALPHANUM]-[4_ALPHANUM]-[4_ALPHANUM]`.
- `public.admin_update_license(...)`, `public.admin_delete_license(...)`, `public.admin_bulk_action(...)`.

---

## 4. Application Architecture & Modules

### 4.1 Storefront (Public Landing Page)
1. **Header / Navigation**:
   - Liquid brand logo "Paradoxia".
   - Status badge linked to Live Service Controller (`● UNDETECTED`, `▲ TESTING`, `■ UPDATING`, `✖ MAINTENANCE`).
   - Quick navigation: Features, Showcase, Pricing, Status, Key Checker.
   - Actions: Discord / Telegram buttons + "Admin Console" link.
2. **Hero Section**:
   - High-impact headline: "Dominate the Game with Paradoxia".
   - Subtitle: "External & Internal next-generation enhancements. Zero detection records."
   - Feature highlight pills: EAC Ready, BattlEye Bypassed, Streamproof, Kernel Protection.
   - Dual Call-to-Action: "Get Instant Access" and "Check License Key".
3. **Product Showcase & Feature Matrix**:
   - Interactive tabs:
     - **Aimbot**: Silent Aim, FOV Slider, Smooth Target Lock, Prediction.
     - **Visuals / ESP**: 2D/3D Box, Bone Skeleton, Health & Armor bars, Loot filtering.
     - **Misc**: Recoil Compensation, Bunnyhop, Custom Crosshair, Config Presets.
     - **Security**: Ring0 Driver, Dynamic Obfuscation, HWID Spoofer.
4. **Subscription Pricing Grid**:
   - 1 Day ($4.99), 7 Days ($19.99), 30 Days ($49.99), Lifetime ($129.99).
   - "Popular" highlighted card with violet liquid glow.
   - Interactive Purchase Modal with Crypto, Card, and Discord agent options.
5. **Public Key Checker Tool**:
   - Instant glass input validator for `PDX-XXXX-XXXX-XXXX`.
   - Real-time status display (Active, Unused, Expired, Banned), expiration countdown, and HWID binding state.

---

### 4.2 Advanced Admin Management Dashboard (`/admin`)
1. **Authentication Gate**:
   - Secure glass modal requesting Master Key (`PDX-ADMIN-2026`) or Supabase session.
2. **Metrics Bar**:
   - Real-time stat cards: Total Keys, Active Keys, Unused Keys, Banned Keys, HWID-bound Keys, Total Revenue (mock/calculated).
3. **Global Service Status Controller**:
   - Switch status in 1 click: Undetected, Testing, Updating, Maintenance.
   - Broadcast banner editor: updates a glowing announcement bar on the storefront in real time.
4. **Interactive Analytics & Visual Graphs**:
   - SVG / Canvas Neon Activation Activity trend (daily/weekly).
   - Donut Chart breakdown of tiers (1D vs 7D vs 30D vs Lifetime).
   - Reseller / Note distribution overview.
5. **Key Generator Modal & Burst Generator**:
   - Single & Bulk generation modes (1 to 50 keys at once).
   - Duration selector (1 Day, 7 Days, 30 Days, Lifetime).
   - Custom tag/reseller note (e.g. "Discord Giveaway", "Reseller #01").
   - Instant 1-click batch copy in format: plain text list or formatted cards.
6. **Licenses Data Table (with Multi-Select & Bulk Actions)**:
   - Checkboxes for selecting multiple or all keys.
   - **Bulk Actions Bar**: Bulk Extend (+1, +7, +30 days), Bulk Freeze/Unfreeze, Bulk Ban, Bulk HWID Reset, Bulk Delete.
   - Search by key or note, filter dropdown by status, pagination.
   - One-click copy with toast notification and audio feedback.
   - Individual Actions: Edit duration, Freeze/Unfreeze, Ban, Reset HWID, Delete.
7. **Export & Reseller Tools**:
   - Export filtered or all licenses to **CSV**, **JSON**, or clean **TXT** list.
8. **Audit & Activity Feed**:
   - Timeline log of all recent operations (keys generated, activations, HWID resets, bans).
9. **HWID Blacklist & Hardware Inspector**:
   - Table of banned HWID identifiers with reasons, ban dates, and 1-click unban/blacklist actions.

---

## 5. Offline & Reactive Mock Mode
- `LicenseService` detects if Supabase credentials (`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`) are present in `.env`.
- If absent, it automatically seeds 15+ realistic sample keys, audit logs, and settings into `localStorage` and provides full CRUD functionality with zero configuration needed.
- Users can input their Supabase keys anytime via an in-app database config drawer or `.env`.
