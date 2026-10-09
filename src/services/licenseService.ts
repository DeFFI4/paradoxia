import { License, LicenseStatus, ServiceStatusConfig, AuditLog, HWIDBlacklistEntry, CheckResult, BulkAction } from '../types/license';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  LICENSES: 'paradoxia_licenses',
  SETTINGS: 'paradoxia_settings',
  AUDIT: 'paradoxia_audit_logs',
  HWID_BLACKLIST: 'paradoxia_hwid_blacklist',
};

// Key generation helper: PDX-XXXX-XXXX-XXXX
function generateKeyString(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const chunk = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `PDX-${chunk()}-${chunk()}-${chunk()}`;
}

// Initial seed dataset
const SEED_LICENSES: License[] = [
  {
    id: 'lic-101',
    key: 'PDX-9K2M-4L8P-7W1Q',
    product_name: 'Paradoxia',
    duration_days: 9999,
    status: 'active',
    hwid: 'HWID-88E2-99FA-10CC-44BA',
    note: 'VIP Бессрочный доступ (Партнёр)',
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    activated_at: new Date(Date.now() - 40 * 86400000).toISOString(),
    expires_at: null,
  },
  {
    id: 'lic-102',
    key: 'PDX-3B7X-9R2M-5T6Y',
    product_name: 'Paradoxia',
    duration_days: 30,
    status: 'active',
    hwid: 'HWID-12A4-77D9-32E1-90FF',
    note: 'Покупка через Telegram (@cyber_ghost)',
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    activated_at: new Date(Date.now() - 11 * 86400000).toISOString(),
    expires_at: new Date(Date.now() + 19 * 86400000).toISOString(),
  },
  {
    id: 'lic-103',
    key: 'PDX-7E4A-2W9Q-8N1K',
    product_name: 'Paradoxia',
    duration_days: 7,
    status: 'active',
    hwid: 'HWID-55C1-28B0-44AA-87EE',
    note: 'Недельный абонемент',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    activated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    expires_at: new Date(Date.now() + 4 * 86400000).toISOString(),
  },
  {
    id: 'lic-104',
    key: 'PDX-1F8M-6D3Z-4C9L',
    product_name: 'Paradoxia',
    duration_days: 1,
    status: 'expired',
    hwid: 'HWID-67E9-44F0-1922-33D1',
    note: 'Тестовый доступ на 24 часа',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    activated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    expires_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'lic-105',
    key: 'PDX-8H3K-5Y2W-9P7N',
    product_name: 'Paradoxia',
    duration_days: 30,
    status: 'unused',
    hwid: null,
    note: 'Партия реселлера #4',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    activated_at: null,
    expires_at: null,
  },
  {
    id: 'lic-106',
    key: 'PDX-4V9L-1M8Q-3X6B',
    product_name: 'Paradoxia',
    duration_days: 30,
    status: 'unused',
    hwid: null,
    note: 'Партия реселлера #4',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    activated_at: null,
    expires_at: null,
  },
  {
    id: 'lic-107',
    key: 'PDX-2T6Y-8N4K-7W1M',
    product_name: 'Paradoxia',
    duration_days: 7,
    status: 'frozen',
    hwid: 'HWID-99B1-33C4-77E8-11A0',
    note: 'Заморожено по запросу пользователя (отпуск)',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    activated_at: new Date(Date.now() - 18 * 86400000).toISOString(),
    expires_at: new Date(Date.now() + 5 * 86400000).toISOString(),
  },
  {
    id: 'lic-108',
    key: 'PDX-6C9P-3D7X-1F4A',
    product_name: 'Paradoxia',
    duration_days: 9999,
    status: 'banned',
    hwid: 'HWID-6666-DEAD-BEEF-0000',
    note: 'Попытка отладки и дампа памяти (Blacklisted)',
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    activated_at: new Date(Date.now() - 58 * 86400000).toISOString(),
    expires_at: null,
  },
  {
    id: 'lic-109',
    key: 'PDX-5M2Q-7W8P-4L1K',
    product_name: 'Paradoxia',
    duration_days: 7,
    status: 'unused',
    hwid: null,
    note: 'Розыгрыш в Discord сообществе',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    activated_at: null,
    expires_at: null,
  },
  {
    id: 'lic-110',
    key: 'PDX-3X8N-9K4L-2T7W',
    product_name: 'Paradoxia',
    duration_days: 30,
    status: 'active',
    hwid: 'HWID-4190-DE21-8819-BBA1',
    note: 'Клиент #3301',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    activated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    expires_at: new Date(Date.now() + 20 * 86400000).toISOString(),
  },
  {
    id: 'lic-111',
    key: 'PDX-7B2K-1M9Q-8F4A',
    product_name: 'Paradoxia',
    duration_days: 1,
    status: 'unused',
    hwid: null,
    note: 'Суточный промокод',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    activated_at: null,
    expires_at: null,
  },
  {
    id: 'lic-112',
    key: 'PDX-9W4P-6D8X-3T2M',
    product_name: 'Paradoxia',
    duration_days: 9999,
    status: 'active',
    hwid: 'HWID-009A-88EF-7721-BC40',
    note: 'Владелец сервера / Стример',
    created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
    activated_at: new Date(Date.now() - 34 * 86400000).toISOString(),
    expires_at: null,
  },
  {
    id: 'lic-113',
    key: 'PDX-4L7Y-5N1K-2W9Q',
    product_name: 'Paradoxia',
    duration_days: 30,
    status: 'active',
    hwid: 'HWID-9921-BA40-5510-77DC',
    note: 'Премиум-пользователь',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    activated_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    expires_at: new Date(Date.now() + 16 * 86400000).toISOString(),
  },
  {
    id: 'lic-114',
    key: 'PDX-8T3M-4C9L-6Y2W',
    product_name: 'Paradoxia',
    duration_days: 7,
    status: 'unused',
    hwid: null,
    note: 'Резервный пул ключей',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    activated_at: null,
    expires_at: null,
  },
  {
    id: 'lic-115',
    key: 'PDX-1K9F-7B3A-8N5P',
    product_name: 'Paradoxia',
    duration_days: 1,
    status: 'active',
    hwid: 'HWID-3371-88EE-091A-22B4',
    note: 'Активирован сегодня',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    activated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    expires_at: new Date(Date.now() + 22 * 3600000).toISOString(),
  },
];

const DEFAULT_SETTINGS: ServiceStatusConfig = {
  status: 'UNDETECTED',
  version: 'v3.4.2-STABLE',
  broadcast_message: 'Все модули обхода античита работают в штатном режиме. Системы защиты стабильны.',
  banner_active: true,
  last_updated: new Date().toISOString(),
};

const SEED_AUDIT: AuditLog[] = [
  {
    id: 'log-1',
    action: 'status_change',
    details: { from: 'TESTING', to: 'UNDETECTED', version: 'v3.4.2-STABLE' },
    ip_or_source: 'Панель администратора',
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'log-2',
    action: 'generate',
    details: { count: 5, duration_days: 30, note: 'Партия реселлера #4' },
    ip_or_source: 'Панель администратора',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'log-3',
    action: 'ban',
    details: { key: 'PDX-6C9P-3D7X-1F4A', reason: 'Попытка анализа памяти' },
    ip_or_source: 'Античит-монитор',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

const SEED_HWID_BLACKLIST: HWIDBlacklistEntry[] = [
  {
    id: 'hwid-bl-1',
    hwid: 'HWID-6666-DEAD-BEEF-0000',
    reason: 'Аппаратная блокировка: реверс-инжиниринг драйвера',
    banned_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

class LicenseService {
  private initStore() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(STORAGE_KEYS.LICENSES)) {
      localStorage.setItem(STORAGE_KEYS.LICENSES, JSON.stringify(SEED_LICENSES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT)) {
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(SEED_AUDIT));
    }
    if (!localStorage.getItem(STORAGE_KEYS.HWID_BLACKLIST)) {
      localStorage.setItem(STORAGE_KEYS.HWID_BLACKLIST, JSON.stringify(SEED_HWID_BLACKLIST));
    }
  }

  constructor() {
    this.initStore();
  }

  // --- LICENSES ---
  async getLicenses(): Promise<License[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('licenses').select('*').order('created_at', { ascending: false });
        if (!error && data) return data as License[];
      } catch (err) {
        console.warn('Supabase getLicenses failed, falling back to local storage', err);
      }
    }
    this.initStore();
    const raw = localStorage.getItem(STORAGE_KEYS.LICENSES);
    return raw ? JSON.parse(raw) : SEED_LICENSES;
  }

  async checkLicense(key: string): Promise<CheckResult> {
    const formattedKey = key.trim().toUpperCase();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.rpc('check_license', { p_key: formattedKey });
        if (!error && data) return data as CheckResult;
      } catch (err) {
        console.warn('Supabase RPC check_license failed, using local check', err);
      }
    }

    const licenses = await this.getLicenses();
    const blacklist = await this.getHWIDBlacklist();

    const license = licenses.find((l) => l.key.toUpperCase() === formattedKey);

    if (!license) {
      return {
        valid: false,
        message: 'Лицензионный ключ не найден. Проверьте правильность ввода формата PDX-XXXX-XXXX-XXXX.',
      };
    }

    // Check HWID blacklist
    if (license.hwid && blacklist.some((b) => b.hwid === license.hwid)) {
      return {
        valid: false,
        status: 'banned',
        key: license.key,
        message: 'Аппаратный идентификатор (HWID), связанный с данным ключом, заблокирован в системе защиты.',
      };
    }

    // Auto check expiration for active keys
    if (license.status === 'active' && license.expires_at) {
      if (new Date(license.expires_at).getTime() < Date.now()) {
        license.status = 'expired';
        await this.updateLicense(license.id, { status: 'expired' });
      }
    }

    return {
      valid: true,
      key: license.key,
      product_name: license.product_name,
      status: license.status,
      duration_days: license.duration_days,
      hwid_bound: Boolean(license.hwid),
      created_at: license.created_at,
      activated_at: license.activated_at,
      expires_at: license.expires_at,
    };
  }

  async activateLicense(key: string, hwid: string, ip?: string): Promise<{ success: boolean; message?: string; key?: string }> {
    const formattedKey = key.trim().toUpperCase();
    const sanitizedHWID = hwid.trim();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.rpc('activate_license', {
          p_key: formattedKey,
          p_hwid: sanitizedHWID,
          p_ip: ip || null
        });
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase RPC activate_license failed, using local fallback', err);
      }
    }

    const licenses = await this.getLicenses();
    const blacklist = await this.getHWIDBlacklist();

    if (blacklist.some((b) => b.hwid === sanitizedHWID)) {
      return { success: false, message: 'Данное устройство заблокировано в системе защиты' };
    }

    const license = licenses.find((l) => l.key.toUpperCase() === formattedKey);
    if (!license) {
      return { success: false, message: 'Лицензионный ключ не найден' };
    }

    if (license.status === 'banned') return { success: false, message: 'Лицензия заблокирована' };
    if (license.status === 'frozen') return { success: false, message: 'Лицензия временно заморожена' };

    if (license.status === 'active') {
      if (license.hwid === sanitizedHWID) {
        return { success: true, message: 'Сессия подтверждена (устройство уже активировано)', key: license.key };
      }
      return { success: false, message: 'Ключ уже привязан к другому устройству' };
    }

    const now = new Date();
    const expiresAt = license.duration_days >= 9999 ? null : new Date(now.getTime() + license.duration_days * 86400000).toISOString();

    license.status = 'active';
    license.hwid = sanitizedHWID;
    license.activated_at = now.toISOString();
    license.expires_at = expiresAt;

    await this.updateLicense(license.id, license);
    await this.logAudit('activate', {
      license_id: license.id,
      key: license.key,
      hwid: sanitizedHWID,
      duration_days: license.duration_days,
      expires_at: expiresAt,
    });

    return { success: true, message: 'Лицензия успешно активирована!', key: license.key };
  }

  async generateLicenses(durationDays: number, count: number, note: string): Promise<License[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.rpc('admin_generate_licenses', {
          p_count: count,
          p_duration_days: durationDays,
          p_note: note || `Генерация администратором (${count} шт.)`,
          p_product: 'Paradoxia'
        });
        if (!error && data?.success) {
          return await this.getLicenses();
        }
      } catch (err) {
        console.warn('Supabase admin_generate_licenses failed, fallback to local', err);
      }
    }

    const newLicenses: License[] = [];
    const now = new Date().toISOString();

    for (let i = 0; i < count; i++) {
      newLicenses.push({
        id: `lic-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        key: generateKeyString(),
        product_name: 'Paradoxia',
        duration_days: durationDays,
        status: 'unused',
        hwid: null,
        note: note || `Генерация администратором (${count} шт.)`,
        created_at: now,
        activated_at: null,
        expires_at: null,
      });
    }

    const all = await this.getLicenses();
    const updated = [...newLicenses, ...all];
    localStorage.setItem(STORAGE_KEYS.LICENSES, JSON.stringify(updated));

    await this.logAudit('generate', {
      count,
      duration_days: durationDays,
      note,
      generated_keys: newLicenses.map((l) => l.key),
    });

    return newLicenses;
  }

  async updateLicense(id: string, updates: Partial<License>): Promise<License> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('licenses')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data as License;
      } catch (err) {
        console.warn('Supabase updateLicense failed, fallback to local', err);
      }
    }

    const all = await this.getLicenses();
    const idx = all.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error('Лицензия не найдена');

    const updatedLic = { ...all[idx], ...updates };
    all[idx] = updatedLic;
    localStorage.setItem(STORAGE_KEYS.LICENSES, JSON.stringify(all));

    return updatedLic;
  }

  async bulkUpdateLicenses(ids: string[], action: BulkAction): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.rpc('admin_bulk_action', {
          p_license_ids: ids,
          p_action: action,
          p_reason: 'Массовое действие в админ-панели'
        });
        if (!error && data?.success) {
          return;
        }
      } catch (err) {
        console.warn('Supabase admin_bulk_action failed, fallback to local', err);
      }
    }

    const all = await this.getLicenses();
    const set = new Set(ids);

    all.forEach((lic) => {
      if (set.has(lic.id)) {
        if (action === 'freeze' && lic.status === 'active') {
          lic.status = 'frozen';
        } else if (action === 'unfreeze' && lic.status === 'frozen') {
          lic.status = 'active';
        } else if (action === 'ban') {
          lic.status = 'banned';
        } else if (action === 'reset_hwid') {
          lic.hwid = null;
        } else if (action === 'extend_7d' && lic.expires_at) {
          lic.expires_at = new Date(new Date(lic.expires_at).getTime() + 7 * 86400000).toISOString();
        } else if (action === 'extend_30d' && lic.expires_at) {
          lic.expires_at = new Date(new Date(lic.expires_at).getTime() + 30 * 86400000).toISOString();
        }
      }
    });

    let finalLicenses = all;
    if (action === 'delete') {
      finalLicenses = all.filter((l) => !set.has(l.id));
    }

    localStorage.setItem(STORAGE_KEYS.LICENSES, JSON.stringify(finalLicenses));
    await this.logAudit(action === 'delete' ? 'delete' : 'status_change', {
      action,
      affected_count: ids.length,
      license_ids: ids,
    });
  }

  async deleteLicense(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('licenses').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteLicense failed, fallback to local', err);
      }
    }

    const all = await this.getLicenses();
    const target = all.find((l) => l.id === id);
    const filtered = all.filter((l) => l.id !== id);
    localStorage.setItem(STORAGE_KEYS.LICENSES, JSON.stringify(filtered));

    if (target) {
      await this.logAudit('delete', { id, key: target.key });
    }
  }

  async resetHWID(id: string): Promise<License> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.rpc('admin_reset_hwid', {
          p_license_id: id,
          p_reason: 'Сброс HWID администратором'
        });
        if (!error && data?.success) {
          const updated = await this.getLicenses();
          const target = updated.find(l => l.id === id);
          if (target) return target;
        }
      } catch (err) {
        console.warn('Supabase admin_reset_hwid failed, fallback to local', err);
      }
    }

    const lic = await this.updateLicense(id, { hwid: null });
    await this.logAudit('reset_hwid', { id, key: lic.key });
    return lic;
  }

  async heartbeat(key: string, hwid: string): Promise<{ alive: boolean; signature?: string }> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.rpc('heartbeat_license', {
          p_key: key,
          p_hwid: hwid
        });
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase heartbeat failed', err);
      }
    }
    return { alive: true };
  }

  // --- SERVICE STATUS & SETTINGS ---
  async getServiceStatus(): Promise<ServiceStatusConfig> {
    this.initStore();
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
  }

  async updateServiceStatus(updates: Partial<ServiceStatusConfig>): Promise<ServiceStatusConfig> {
    const current = await this.getServiceStatus();
    const next: ServiceStatusConfig = {
      ...current,
      ...updates,
      last_updated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(next));

    await this.logAudit('status_change', {
      previous: current.status,
      current: next.status,
      version: next.version,
      message: next.broadcast_message,
    });

    return next;
  }

  // --- AUDIT LOGS ---
  async getAuditLogs(): Promise<AuditLog[]> {
    this.initStore();
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT);
    return raw ? JSON.parse(raw) : SEED_AUDIT;
  }

  private async logAudit(action: AuditLog['action'], details: Record<string, unknown>): Promise<void> {
    const current = await this.getAuditLogs();
    const newEntry: AuditLog = {
      id: `log-${Date.now()}`,
      action,
      details,
      ip_or_source: 'Панель управления Paradoxia',
      created_at: new Date().toISOString(),
    };
    const updated = [newEntry, ...current].slice(0, 50); // keep last 50
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(updated));
  }

  // --- HWID BLACKLIST ---
  async getHWIDBlacklist(): Promise<HWIDBlacklistEntry[]> {
    this.initStore();
    const raw = localStorage.getItem(STORAGE_KEYS.HWID_BLACKLIST);
    return raw ? JSON.parse(raw) : SEED_HWID_BLACKLIST;
  }

  async toggleHWIDBlacklist(hwid: string, reason?: string): Promise<void> {
    const current = await this.getHWIDBlacklist();
    const existingIdx = current.findIndex((b) => b.hwid === hwid);

    if (existingIdx !== -1) {
      // Remove from blacklist
      current.splice(existingIdx, 1);
    } else {
      // Add to blacklist
      current.unshift({
        id: `hwid-bl-${Date.now()}`,
        hwid,
        reason: reason || 'Блокировка администратором системы',
        banned_at: new Date().toISOString(),
      });
    }

    localStorage.setItem(STORAGE_KEYS.HWID_BLACKLIST, JSON.stringify(current));
    await this.logAudit('hwid_blacklist', { hwid, action: existingIdx !== -1 ? 'unbanned' : 'banned', reason });
  }
}

export const licenseService = new LicenseService();
