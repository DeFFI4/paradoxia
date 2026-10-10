# Personal User Cabinet & Security Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-grade cyberpunk Personal User Cabinet (`UserDashboard`) featuring wallet balance & voucher redemption, subscription management with auto-renewal, HWID reset & cooldown, email-link-protected security center (email/password change, Telegram binding, backup codes, panic freeze, IP whitelist, session audit), and an interactive cyberpunk email simulation modal.

**Architecture:** Modular component architecture under `src/components/cabinet/`, central user and security state service `src/services/userService.ts` with local storage persistence, strict vector SVG icons from `lucide-react`, sound feedback, and seamless integration with `Navbar.tsx` and `App.tsx`.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Lucide React, Sound Effects via `soundService`.

**Spec:** `docs/superpowers/specs/2026-10-10-user-cabinet-design.md`

## Global Constraints
- Strictly ZERO emojis in any UI component or code; exclusively vector SVG icons from `lucide-react`.
- All destructive or sensitive security modifications (change email, change password, bind/unbind telegram, backup codes, panic freeze, IP whitelist, emergency HWID reset, delete account) MUST require email link verification.
- Interactive `EmailDispatcherModal` to simulate real incoming security emails with 15-min expiring tokens and instant confirmation links.
- Full offline resilience via `localStorage` state persistence and pre-populated demo data so all features work immediately out-of-the-box.
- Support 3 authentication methods: 1-Click Demo, License Key (PDX-...), and Email/Password.

---

## File Structure Map

```
src/
├── types/
│   └── user.ts                             # UserProfile, UserSubscription, WalletTransaction, UserSession, LoginAuditRecord, SecurityActionRequest
├── services/
│   └── userService.ts                      # Authentication, wallet, subscriptions, HWID reset, email tokens, audit log
└── components/
    ├── Navbar.tsx                          # Integration: Wallet badge, Cabinet quick-nav, Auth modal trigger
    ├── App.tsx                             # Integration: View 'cabinet', URL security token interceptor (?security_token=...)
    └── cabinet/
        ├── UserCabinetView.tsx             # Master cabinet shell, tab switcher, user summary hero, freeze banner
        ├── OverviewTab.tsx                 # Subscription countdown card, balance card, security score, loader download
        ├── SubscriptionsTab.tsx            # Active licenses, duration remaining, auto-renew toggle, freeze/unfreeze, extend
        ├── HwidManagerTab.tsx              # HWID hash, 7-day cooldown timer, normal reset, emergency email reset
        ├── WalletTab.tsx                   # Balance display, top-up modal trigger, voucher redemption form, transaction audit
        ├── SecuritySettingsTab.tsx         # Change email, change password, Telegram sync, 2FA, backup codes, panic freeze, IP whitelist, login audit, sessions
        ├── TopUpModal.tsx                  # Balance top-up with presets (250, 500, 1000, 2500) and custom amount
        ├── EmailDispatcherModal.tsx        # Cyberpunk mail simulator displaying token, payload details, and instant confirmation link
        └── AuthModal.tsx                   # Auth dialog with 3 modes: Email/Password, License Key, 1-Click Demo
```

---

## Tasks Breakdown

### Task 1: Type Definitions (`src/types/user.ts`)
- **File**: `src/types/user.ts`
- **Actions**:
  1. Define `UserProfile`: `id`, `email`, `username`, `balance`, `role`, `telegram_username`, `telegram_id`, `two_factor_enabled`, `email_verified`, `is_frozen`, `ip_whitelist_enabled`, `whitelisted_ips`, `backup_codes`, `created_at`, `avatar_url`, `last_login_ip`, `last_login_at`.
  2. Define `UserSubscription`: `license_id`, `key`, `product_name`, `duration_days`, `status`, `auto_renew`, `activated_at`, `expires_at`, `hwid`, `hwid_reset_count`, `last_hwid_reset_at`, `can_reset_hwid`, `hwid_cooldown_hours_left`.
  3. Define `WalletTransaction`: `id`, `user_id`, `type`, `amount`, `description`, `created_at`, `status`.
  4. Define `UserSession`: `id`, `user_id`, `device`, `browser`, `ip`, `location`, `last_active`, `is_current`.
  5. Define `LoginAuditRecord`: `id`, `user_id`, `ip`, `device`, `browser`, `location`, `status`, `timestamp`.
  6. Define `SecurityActionType` union and `SecurityActionRequest`: `id`, `user_id`, `action_type`, `payload`, `token`, `target_email`, `created_at`, `expires_at`, `confirmed`.
- **Verification**: `npx tsc --noEmit` checks clean typing.

---

### Task 2: Service Layer (`src/services/userService.ts`)
- **File**: `src/services/userService.ts`
- **Actions**:
  1. Initialize persistent storage in `localStorage` with demo seed data (Demo user `demo@paradoxia.space`, active 30-day CS2 Private key, 1450₽ balance, mock sessions, mock login audit).
  2. Auth methods: `getCurrentUser()`, `loginWithEmail(email, password)`, `loginWithKey(key)`, `demoLogin()`, `logout()`.
  3. Wallet methods: `topUpBalance(userId, amount, method)`, `redeemVoucher(userId, code)` (support `PARADOXIA2026` +500₽, `BOOST1000` +1000₽, `WELCOME250` +250₽), `getTransactionHistory(userId)`.
  4. Subscription methods: `getUserSubscriptions(userId)`, `renewSubscription(userId, licenseId, days, cost)`, `toggleAutoRenew(userId, licenseId)`, `freezeSubscription(userId, licenseId)`.
  5. HWID methods: `resetHwid(userId, licenseId)` (validates 7-day cooldown), `emergencyResetHwid(userId, licenseId)`.
  6. Email Security token engine: `requestSecurityAction(userId, actionType, payload)`, `getPendingSecurityAction(token)`, `confirmSecurityAction(token)`.
  7. Security & sessions: `getUserSessions(userId)`, `revokeSession(userId, sessionId)`, `revokeAllSessions(userId)`, `getLoginAudit(userId)`.
- **Verification**: Unit verification of state mutations and token confirmation logic.

---

### Task 3: Interactive Security Email Simulator (`src/components/cabinet/EmailDispatcherModal.tsx`)
- **File**: `src/components/cabinet/EmailDispatcherModal.tsx`
- **Actions**:
  1. Cyberpunk frosted glass mail window showing "Incoming Paradoxia Security Dispatch".
  2. Display sender `security@paradoxia.space`, target email (e.g. `u***@p***.space`), subject, and security notice.
  3. Show 15-minute countdown timer and raw cryptographic token hash.
  4. Include "Click to Confirm Action" primary action button that immediately triggers `userService.confirmSecurityAction(token)` with audio chime.
  5. Include "Copy Direct URL Link" button with toast notification.
- **Verification**: Modal opens on security requests, displays correct parameters, and handles confirmation.

---

### Task 4: Auth Modal & TopUp Modal (`AuthModal.tsx` & `TopUpModal.tsx`)
- **Files**:
  - `src/components/cabinet/AuthModal.tsx`
  - `src/components/cabinet/TopUpModal.tsx`
- **Actions**:
  1. `AuthModal`: Tabs for "1-Click Demo Access", "Direct License Key", and "Email & Password". Validation, error handling, sound effects on login.
  2. `TopUpModal`: Presets (250 ₽, 500 ₽, 1000 ₽, 2500 ₽) and custom input. Payment method selector (Bank Card, SBP / Fast Payments, Crypto USDT), dynamic bonus calculation (+5% for 1000₽, +10% for 2500₽), simulation confirmation.
- **Verification**: Successful authentication switches user state; balance top-up immediately adds funds and records transaction.

---

### Task 5: Cabinet Tabs: Overview, Subscriptions & HWID Manager
- **Files**:
  - `src/components/cabinet/OverviewTab.tsx`
  - `src/components/cabinet/SubscriptionsTab.tsx`
  - `src/components/cabinet/HwidManagerTab.tsx`
- **Actions**:
  1. `OverviewTab`:
     - Subscription status hero with live expiry countdown and status badge.
     - Quick wallet balance with 1-click top-up button.
     - Security Score gauge (calculates score based on 2FA, email verification, Telegram, and backup codes).
     - Loader download widget with dynamic launch token generation and instructions.
  2. `SubscriptionsTab`:
     - Detailed cards for each license key.
     - Live days remaining, auto-renew switch, freeze/unfreeze button.
     - Extend subscription button with discount applied from balance.
  3. `HwidManagerTab`:
     - Current hardware fingerprint hash.
     - 7-day cooldown circular progress bar or status badge.
     - Standard reset button (with cooldown check).
     - "Emergency HWID Reset" button (triggers email confirmation request).
- **Verification**: Correct rendering, cooldown logic verification, loader download trigger.

---

### Task 6: Cabinet Tabs: Wallet & Advanced Security Center
- **Files**:
  - `src/components/cabinet/WalletTab.tsx`
  - `src/components/cabinet/SecuritySettingsTab.tsx`
- **Actions**:
  1. `WalletTab`:
     - Big balance card with top-up button.
     - Voucher & Promo code redemption input with instant feedback (`Ticket` icon, +RUB animation).
     - Transaction history table with status tags (`completed`, `pending`), transaction types, and date formatting.
  2. `SecuritySettingsTab`:
     - Panic Freeze banner & toggle: Locks all account actions; unlock requires email confirmation link.
     - Email change: Input new email -> triggers confirmation link to current email.
     - Password change: Trigger reset link to email -> modal to type new password.
     - Telegram sync: Input @username -> trigger verification email.
     - 2FA toggle: Email link verification.
     - Backup Recovery Codes: Generate 8 one-time emergency codes via email confirmation.
     - IP Whitelist: Manage authorized IPs with email link requirement.
     - Active sessions table with IP, browser, geo, and "Terminate All Sessions via Email" button.
     - Login Security Audit table showing recent logins and suspicious flags.
     - Delete account (danger zone) with email verification.
- **Verification**: Every sensitive action dispatches `EmailDispatcherModal`; verifying token updates the user profile.

---

### Task 7: Master Cabinet Shell & Application Integration
- **Files**:
  - `src/components/cabinet/UserCabinetView.tsx`
  - `src/components/Navbar.tsx`
  - `src/App.tsx`
- **Actions**:
  1. `UserCabinetView.tsx`: Main cabinet layout with sidebar/tabs (Overview, Subscriptions, HWID, Wallet, Security), user profile header with status tag and balance, Panic Freeze banner if account is frozen.
  2. `Navbar.tsx`:
     - If authenticated: Display stylish wallet balance pill (`1,450 ₽`) and Profile button directing to `'cabinet'`.
     - If guest: Display "Личный кабинет" button opening `AuthModal`.
  3. `App.tsx`:
     - Add `'cabinet'` to navigation views.
     - Add `useEffect` listening for `?security_token=...` query parameter to auto-confirm security actions from simulated or real email links.
- **Verification**: Complete navigation loop between landing page, catalog, admin panel, and user cabinet.

---

### Task 8: Build & Regression Verification
- **Actions**:
  1. Run `npm run build` or Vite build check to verify zero TypeScript or linting errors.
  2. Verify all interactive flows: Demo login, voucher redemption (`PARADOXIA2026`), top-up, security action email dispatch, instant token verification, HWID reset, and session termination.
  3. Commit all implementation files cleanly to Git.
