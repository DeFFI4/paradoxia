export interface UserProfile {
  id: string;
  email: string;
  username: string;
  balance: number; // in RUB
  role: 'user' | 'vip' | 'reseller' | 'admin';
  telegram_username?: string | null;
  telegram_id?: string | null;
  two_factor_enabled: boolean;
  email_verified: boolean;
  is_frozen: boolean; // Panic Freeze state
  ip_whitelist_enabled: boolean;
  whitelisted_ips: string[];
  backup_codes?: string[];
  created_at: string;
  avatar_url?: string;
  last_login_ip?: string;
  last_login_at?: string;
}

export type TransactionType = 'topup' | 'purchase' | 'extend' | 'hwid_reset_fee' | 'voucher_redeem';

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
  auto_renew: boolean; // Auto-renewal from wallet balance
  activated_at: string;
  expires_at: string;
  hwid: string | null;
  hwid_reset_count: number;
  last_hwid_reset_at?: string | null;
  can_reset_hwid: boolean;
  hwid_cooldown_hours_left: number;
}

export interface UserSession {
  id: string;
  user_id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  last_active: string;
  is_current: boolean;
}

export interface LoginAuditRecord {
  id: string;
  user_id: string;
  ip: string;
  device: string;
  browser: string;
  location: string;
  status: 'success' | 'blocked_ip' | 'failed_2fa' | 'frozen_account';
  timestamp: string;
}

export type SecurityActionType =
  | 'change_email'
  | 'change_password'
  | 'bind_telegram'
  | 'unbind_telegram'
  | 'revoke_all_sessions'
  | 'panic_freeze_account'
  | 'unfreeze_account'
  | 'generate_backup_codes'
  | 'update_ip_whitelist'
  | 'emergency_hwid_reset'
  | 'toggle_2fa'
  | 'delete_account';

export interface SecurityActionRequest {
  id: string;
  user_id: string;
  action_type: SecurityActionType;
  payload: Record<string, any>;
  token: string;
  target_email: string;
  created_at: string;
  expires_at: string; // 15 mins TTL
  confirmed: boolean;
}
