# Paradoxia: Personal User Cabinet & Wallet Architecture Spec

## 1. Executive Summary & Goals
The objective is to introduce a high-end, cyberpunk-themed **Personal User Cabinet (`UserDashboard`)** for Paradoxia customers.
The personal cabinet enables users to:
1. View and manage their active subscription(s) with real-time countdown, status badge, and freeze/extend capabilities.
2. View and reset their Hardware ID (HWID) binding with transparent cooldown and reset limits.
3. Manage their internal balance/wallet ("балик") in RUB (₽), top up funds via simulated or Platega gateway, and spend balance directly on subscription renewals.
4. Download the authenticated loader binary (`ParadoxiaLoader_v2.4.exe`) and review step-by-step launch instructions.
5. Review financial transactions and account activity audit trail.
6. Seamlessly authenticate via Email/Password, direct License Key verification, or 1-click Demo credentials.

---

## 2. Visual & Interaction Standards
- **Strict Vector Icons**: Exclusive use of `lucide-react` icons (`User`, `Wallet`, `KeyRound`, `Cpu`, `Clock`, `ShieldCheck`, `Download`, `RefreshCw`, `ArrowUpRight`, `Lock`, `Snowflake`, `PlusCircle`, `LogOut`, etc.). Strictly **zero emojis**.
- **Aesthetic**:
  - Deep Cosmic Obsidian background (`#060609` / `bg-cosmic-950`).
  - Frosted liquid glass card modules (`backdrop-blur-2xl`, `bg-white/[0.03]`, `border border-white/10`).
  - Neon accents in Cyber Cyan (`#06b6d4`) and Cyber Violet (`#8b5cf6`).
  - Audio-tactile feedback integrated with existing `soundService`.

---

## 3. Data Models & State Architecture

### 3.1 Data Types (`src/types/user.ts`)
```typescript
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  balance: number; // in RUB (e.g. 1450)
  role: 'user' | 'vip' | 'reseller' | 'admin';
  created_at: string;
  avatar_url?: string;
}

export type TransactionType = 'topup' | 'purchase' | 'extend' | 'hwid_reset_fee';

export interface WalletTransaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  created_at: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface UserSubscription {
  license_id: string;
  key: string;
  product_name: string;
  duration_days: number;
  status: 'active' | 'frozen' | 'expired';
  activated_at: string;
  expires_at: string;
  hwid: string | null;
  hwid_reset_count: number;
  last_hwid_reset_at?: string | null;
  can_reset_hwid: boolean;
  hwid_cooldown_hours_left: number;
}
```

### 3.2 Service Layer (`src/services/userService.ts`)
- `getCurrentUser(): UserProfile | null`
- `loginWithEmail(email: string, pass: string): Promise<UserProfile>`
- `loginWithKey(key: string): Promise<UserProfile>`
- `demoLogin(): Promise<UserProfile>`
- `logout(): void`
- `getUserSubscriptions(userId: string): Promise<UserSubscription[]>`
- `topUpBalance(userId: string, amount: number, method: string): Promise<WalletTransaction>`
- `renewSubscription(userId: string, licenseId: string, days: number, cost: number): Promise<boolean>`
- `freezeSubscription(userId: string, licenseId: string): Promise<boolean>`
- `resetHwid(userId: string, licenseId: string): Promise<{ success: boolean; message: string }>`
- `getTransactionHistory(userId: string): Promise<WalletTransaction[]>`

Persistence combines:
1. Supabase tables `user_profiles` and `user_transactions` when Supabase credentials are configured.
2. Robust `localStorage` fallback (`pdx_user_profiles`, `pdx_user_session`, `pdx_user_transactions`) with realistic pre-populated demo data so it works seamlessly offline and online.

---

## 4. UI Architecture & Components

```
src/components/cabinet/
├── UserCabinetView.tsx       # Main container view with navigation tabs
├── CabinetNavbar.tsx         # Dedicated cabinet top bar with balance chip & user menu
├── OverviewTab.tsx           # Dashboard summary: active sub, quick stats, download CTA
├── SubscriptionsTab.tsx      # Subscriptions list, extend, freeze, copy key
├── HwidManagerTab.tsx        # HWID details, reset cooldown timer, guidelines
├── WalletTab.tsx             # Balance management, TopUp modal trigger, transaction history
├── TopUpModal.tsx            # Payment modal (Presets: 250, 500, 1000, 2500, custom)
└── AuthModal.tsx             # Tabbed login (Email / Direct Key / 1-Click Demo)
```

### 4.1 Integration Points
- **`App.tsx`**: Add `'cabinet'` to `currentView` state (`'storefront' | 'cabinet' | 'admin'`).
- **`Navbar.tsx`**: 
  - If user logged in: display interactive balance pill (`1,450 ₽`) + User profile avatar button.
  - If user not logged in: display "Личный кабинет" CTA button that triggers `AuthModal`.
- **`StorefrontView.tsx`**: Seamless routing to cabinet when user clicks their account.

---

## 5. Testing & Verification Plan
1. **Auth Verification**: Login via Demo, login via Key, logout, session persistence across page reload.
2. **Balance & Wallet Verification**: Top up balance with presets and custom amount, check transaction history update, verify math.
3. **Subscription Actions**: Renew subscription using balance funds, verify balance deduction and extended `expires_at`. Test freezing and unfreezing.
4. **HWID Management**: Perform HWID reset, check cooldown calculation, verify reset counter.
5. **Loader Download**: Click download loader, check simulated secure token generation and download feedback toast.
