export type LicenseStatus = 'unused' | 'active' | 'frozen' | 'expired' | 'banned';

export type ServiceStatus = 'UNDETECTED' | 'TESTING' | 'UPDATING' | 'MAINTENANCE';

export interface License {
  id: string;
  key: string;
  product_name: string;
  duration_days: number; // 1, 7, 30, 9999 (Lifetime)
  status: LicenseStatus;
  hwid: string | null;
  note: string | null;
  created_at: string;
  activated_at: string | null;
  expires_at: string | null;
  last_seen_at?: string | null;
  last_ip?: string | null;
  hwid_reset_count?: number;
}

export interface ServiceStatusConfig {
  status: ServiceStatus;
  version: string;
  broadcast_message: string;
  banner_active: boolean;
  last_updated: string;
}

export interface AuditLog {
  id: string;
  action: 'generate' | 'activate' | 'reset_hwid' | 'ban' | 'freeze' | 'unfreeze' | 'delete' | 'status_change' | 'hwid_blacklist';
  details: Record<string, unknown>;
  ip_or_source?: string;
  created_at: string;
}

export interface HWIDBlacklistEntry {
  id: string;
  hwid: string;
  reason: string;
  banned_at: string;
}

export interface CheckResult {
  valid: boolean;
  message?: string;
  key?: string;
  product_name?: string;
  status?: LicenseStatus;
  duration_days?: number;
  hwid_bound?: boolean;
  created_at?: string;
  activated_at?: string | null;
  expires_at?: string | null;
  last_seen_at?: string | null;
  signature?: string;
  response_signature?: string;
}

export type BulkAction = 'freeze' | 'unfreeze' | 'ban' | 'reset_hwid' | 'extend_7d' | 'extend_30d' | 'delete';
