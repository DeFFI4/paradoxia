import {
  UserProfile,
  WalletTransaction,
  UserSubscription,
  UserSession,
  LoginAuditRecord,
  SecurityActionRequest,
  SecurityActionType,
} from '../types/user';

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'pdx_current_user_id',
  USERS: 'pdx_users_db',
  TRANSACTIONS: 'pdx_wallet_transactions',
  SUBSCRIPTIONS: 'pdx_user_subscriptions',
  SESSIONS: 'pdx_user_sessions',
  LOGIN_AUDIT: 'pdx_login_audit',
  SECURITY_ACTIONS: 'pdx_security_actions',
  REDEEMED_VOUCHERS: 'pdx_redeemed_vouchers',
};

const VOUCHER_CATALOG: Record<string, number> = {
  PARADOXIA2026: 500,
  BOOST1000: 1000,
  WELCOME250: 250,
  VIPCYBER: 750,
};

class UserService {
  private currentUser: UserProfile | null = null;
  private listeners: Array<(user: UserProfile | null) => void> = [];

  constructor() {
    this.seedInitialData();
    this.loadCurrentUser();
  }

  private seedInitialData() {
    if (typeof window === 'undefined') return;

    // Seed default demo user if not present
    const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!rawUsers) {
      const demoUser: UserProfile = {
        id: 'usr_specter_001',
        email: 'specter@paradoxia.space',
        username: 'SpecterX',
        balance: 1450,
        role: 'vip',
        telegram_username: '@specter_cyber',
        telegram_id: '89104712',
        two_factor_enabled: true,
        email_verified: true,
        is_frozen: false,
        ip_whitelist_enabled: false,
        whitelisted_ips: ['178.62.204.18', '95.173.136.42'],
        backup_codes: ['8K9P-4M2X', '3L8Q-9W1Z', '7N9R-2F4A', '5K6J-8P3V'],
        created_at: '2026-02-14T10:00:00Z',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        last_login_ip: '178.62.204.18',
        last_login_at: '2026-10-10T16:30:00Z',
      };
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([demoUser]));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, demoUser.id);
    }

    // Seed subscriptions
    if (!localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS)) {
      const demoSubs: UserSubscription[] = [
        {
          license_id: 'lic_cs2_pvt_01',
          key: 'PDX-CS2-PVT-9948-2841-A9',
          product_name: 'Paradoxia CS2 Private Build',
          duration_days: 30,
          status: 'active',
          auto_renew: true,
          activated_at: '2026-10-01T12:00:00Z',
          expires_at: '2026-10-31T12:00:00Z',
          hwid: 'E7B1-4F92-A83C-11D5-F904',
          hwid_reset_count: 1,
          last_hwid_reset_at: '2026-10-04T12:00:00Z',
          can_reset_hwid: true,
          hwid_cooldown_hours_left: 0,
        },
        {
          license_id: 'lic_rust_esp_02',
          key: 'PDX-RUST-LTD-4412-8890-B2',
          product_name: 'Paradoxia Rust Ultimate Core',
          duration_days: 7,
          status: 'frozen',
          auto_renew: false,
          activated_at: '2026-10-05T18:00:00Z',
          expires_at: '2026-10-12T18:00:00Z',
          hwid: 'E7B1-4F92-A83C-11D5-F904',
          hwid_reset_count: 0,
          can_reset_hwid: true,
          hwid_cooldown_hours_left: 0,
        },
      ];
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(demoSubs));
    }

    // Seed transactions
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      const demoTransactions: WalletTransaction[] = [
        {
          id: 'tx_topup_101',
          user_id: 'usr_specter_001',
          type: 'topup',
          amount: 2000,
          description: 'Пополнение баланса (СБП / МИР)',
          created_at: '2026-10-01T11:45:00Z',
          status: 'completed',
        },
        {
          id: 'tx_purch_102',
          user_id: 'usr_specter_001',
          type: 'purchase',
          amount: -1200,
          description: 'Оплата подписки Paradoxia CS2 Private (30 дней)',
          created_at: '2026-10-01T12:00:00Z',
          status: 'completed',
        },
        {
          id: 'tx_vouch_103',
          user_id: 'usr_specter_001',
          type: 'voucher_redeem',
          amount: 500,
          description: 'Активация подарочного ваучера PARADOXIA2026',
          created_at: '2026-10-05T09:12:00Z',
          status: 'completed',
        },
        {
          id: 'tx_purch_104',
          user_id: 'usr_specter_001',
          type: 'purchase',
          amount: -450,
          description: 'Активация Rust Ultimate Core (7 дней)',
          created_at: '2026-10-05T18:00:00Z',
          status: 'completed',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(demoTransactions));
    }

    // Seed sessions
    if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) {
      const demoSessions: UserSession[] = [
        {
          id: 'sess_curr_01',
          user_id: 'usr_specter_001',
          device: 'Windows 11 PC (AMD Ryzen 9 / RTX 4080)',
          browser: 'Chrome 129.0 / Desktop',
          ip: '178.62.204.18',
          location: 'Moscow, Russian Federation',
          last_active: 'Активна сейчас',
          is_current: true,
        },
        {
          id: 'sess_other_02',
          user_id: 'usr_specter_001',
          device: 'Apple iPhone 15 Pro Max',
          browser: 'Safari Mobile 18.0',
          ip: '95.173.136.42',
          location: 'Saint Petersburg, Russian Federation',
          last_active: '3 часа назад',
          is_current: false,
        },
        {
          id: 'sess_other_03',
          user_id: 'usr_specter_001',
          device: 'MacBook Air M2 (macOS Sonoma)',
          browser: 'Firefox 130.0',
          ip: '213.138.88.19',
          location: 'Frankfurt, Germany',
          last_active: '2 дня назад',
          is_current: false,
        },
      ];
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(demoSessions));
    }

    // Seed login audit
    if (!localStorage.getItem(STORAGE_KEYS.LOGIN_AUDIT)) {
      const demoAudit: LoginAuditRecord[] = [
        {
          id: 'aud_1',
          user_id: 'usr_specter_001',
          ip: '178.62.204.18',
          device: 'Windows 11 PC',
          browser: 'Chrome 129.0',
          location: 'Moscow, Russia',
          status: 'success',
          timestamp: '2026-10-10T16:30:00Z',
        },
        {
          id: 'aud_2',
          user_id: 'usr_specter_001',
          ip: '95.173.136.42',
          device: 'iPhone 15 Pro Max',
          browser: 'Safari 18.0',
          location: 'Saint Petersburg, Russia',
          status: 'success',
          timestamp: '2026-10-10T13:15:00Z',
        },
        {
          id: 'aud_3',
          user_id: 'usr_specter_001',
          ip: '45.154.255.8',
          device: 'Linux Workstation',
          browser: 'Unknown Bot Client',
          location: 'Amsterdam, Netherlands',
          status: 'blocked_ip',
          timestamp: '2026-10-09T04:22:10Z',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.LOGIN_AUDIT, JSON.stringify(demoAudit));
    }
  }

  private loadCurrentUser() {
    if (typeof window === 'undefined') return;
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (!currentId) {
      this.currentUser = null;
      return;
    }
    const users = this.getAllUsers();
    this.currentUser = users.find((u) => u.id === currentId) || null;
  }

  private getAllUsers(): UserProfile[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USERS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveUsers(users: UserProfile[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  public subscribe(listener: (user: UserProfile | null) => void): () => void {
    this.listeners.push(listener);
    listener(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.currentUser));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pdx:user_updated', { detail: this.currentUser }));
    }
  }

  public getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  public async demoLogin(): Promise<UserProfile> {
    const users = this.getAllUsers();
    let demo = users.find((u) => u.id === 'usr_specter_001');
    if (!demo && users.length > 0) {
      demo = users[0];
    }
    if (!demo) {
      this.seedInitialData();
      demo = this.getAllUsers()[0];
    }
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, demo.id);
    this.currentUser = demo;
    this.notify();
    return demo;
  }

  public async loginWithEmail(email: string, _pass: string): Promise<UserProfile> {
    const users = this.getAllUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, existing.id);
      this.currentUser = existing;
      this.notify();
      return existing;
    }
    // Create new profile for this email
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email,
      username: email.split('@')[0],
      balance: 500, // Welcome bonus
      role: 'user',
      two_factor_enabled: false,
      email_verified: true,
      is_frozen: false,
      ip_whitelist_enabled: false,
      whitelisted_ips: [],
      created_at: new Date().toISOString(),
      last_login_ip: '127.0.0.1',
      last_login_at: new Date().toISOString(),
    };
    users.push(newUser);
    this.saveUsers(users);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, newUser.id);
    this.currentUser = newUser;
    this.notify();
    return newUser;
  }

  public async loginWithKey(key: string): Promise<UserProfile> {
    const cleanKey = key.trim().toUpperCase();
    const users = this.getAllUsers();
    let user = users[0];
    if (!user) {
      return this.demoLogin();
    }
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
    this.currentUser = user;

    // Check if subscription already registered with this key
    const subs = await this.getUserSubscriptions(user.id);
    const hasKey = subs.some((s) => s.key.toUpperCase() === cleanKey);
    if (!hasKey) {
      const newSub: UserSubscription = {
        license_id: `lic_${Date.now()}`,
        key: cleanKey,
        product_name: 'Paradoxia License Activated',
        duration_days: 30,
        status: 'active',
        auto_renew: false,
        activated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
        hwid: null,
        hwid_reset_count: 0,
        can_reset_hwid: true,
        hwid_cooldown_hours_left: 0,
      };
      subs.unshift(newSub);
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subs));
    }

    this.notify();
    return user;
  }

  public logout(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    this.currentUser = null;
    this.notify();
  }

  // --- Wallet & Balance ---
  public async topUpBalance(userId: string, amount: number, method: string): Promise<WalletTransaction> {
    const users = this.getAllUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');

    user.balance += amount;
    this.saveUsers(users);
    if (this.currentUser?.id === userId) {
      this.currentUser.balance = user.balance;
      this.notify();
    }

    const tx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      user_id: userId,
      type: 'topup',
      amount,
      description: `Пополнение баланса (${method})`,
      created_at: new Date().toISOString(),
      status: 'completed',
    };

    const txs = await this.getTransactionHistory(userId);
    txs.unshift(tx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));

    return tx;
  }

  public async redeemVoucher(userId: string, code: string): Promise<{ success: boolean; amount: number; message: string }> {
    const cleanCode = code.trim().toUpperCase();
    const amount = VOUCHER_CATALOG[cleanCode];

    if (!amount) {
      return { success: false, amount: 0, message: 'Промокод или ваучер не существует или истек' };
    }

    const rawRedeemed = localStorage.getItem(STORAGE_KEYS.REDEEMED_VOUCHERS);
    const redeemedList: string[] = rawRedeemed ? JSON.parse(rawRedeemed) : [];

    const voucherKey = `${userId}:${cleanCode}`;
    if (redeemedList.includes(voucherKey)) {
      return { success: false, amount: 0, message: 'Вы уже активировали данный промокод' };
    }

    // Credit balance
    const users = this.getAllUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return { success: false, amount: 0, message: 'Пользователь не найден' };

    user.balance += amount;
    this.saveUsers(users);
    if (this.currentUser?.id === userId) {
      this.currentUser.balance = user.balance;
      this.notify();
    }

    redeemedList.push(voucherKey);
    localStorage.setItem(STORAGE_KEYS.REDEEMED_VOUCHERS, JSON.stringify(redeemedList));

    const tx: WalletTransaction = {
      id: `tx_vouch_${Date.now()}`,
      user_id: userId,
      type: 'voucher_redeem',
      amount,
      description: `Активация подарочного ваучера ${cleanCode}`,
      created_at: new Date().toISOString(),
      status: 'completed',
    };

    const txs = await this.getTransactionHistory(userId);
    txs.unshift(tx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));

    return {
      success: true,
      amount,
      message: `Промокод успешно активирован! Начислено +${amount} ₽ на баланс`,
    };
  }

  public async getTransactionHistory(userId: string): Promise<WalletTransaction[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const all: WalletTransaction[] = raw ? JSON.parse(raw) : [];
      return all.filter((t) => t.user_id === userId);
    } catch {
      return [];
    }
  }

  // --- Subscriptions & HWID ---
  public async getUserSubscriptions(_userId: string): Promise<UserSubscription[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public async toggleAutoRenew(userId: string, licenseId: string): Promise<boolean> {
    const subs = await this.getUserSubscriptions(userId);
    const target = subs.find((s) => s.license_id === licenseId);
    if (!target) return false;
    target.auto_renew = !target.auto_renew;
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subs));
    return target.auto_renew;
  }

  public async freezeSubscription(userId: string, licenseId: string): Promise<boolean> {
    const subs = await this.getUserSubscriptions(userId);
    const target = subs.find((s) => s.license_id === licenseId);
    if (!target) return false;
    target.status = target.status === 'active' ? 'frozen' : 'active';
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subs));
    return target.status === 'frozen';
  }

  public async renewSubscription(userId: string, licenseId: string, days: number, cost: number): Promise<boolean> {
    const users = this.getAllUsers();
    const user = users.find((u) => u.id === userId);
    if (!user || user.balance < cost) return false;

    const subs = await this.getUserSubscriptions(userId);
    const target = subs.find((s) => s.license_id === licenseId);
    if (!target) return false;

    user.balance -= cost;
    this.saveUsers(users);
    if (this.currentUser?.id === userId) {
      this.currentUser.balance = user.balance;
      this.notify();
    }

    const currentExpiry = new Date(target.expires_at).getTime();
    const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
    target.expires_at = new Date(baseTime + days * 86400000).toISOString();
    target.status = 'active';
    target.duration_days += days;

    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subs));

    const tx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      user_id: userId,
      type: 'extend',
      amount: -cost,
      description: `Продление подписки ${target.product_name} (+${days} дн.) со скидкой с баланса`,
      created_at: new Date().toISOString(),
      status: 'completed',
    };
    const txs = await this.getTransactionHistory(userId);
    txs.unshift(tx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));

    return true;
  }

  public async resetHwid(userId: string, licenseId: string): Promise<{ success: boolean; message: string }> {
    const subs = await this.getUserSubscriptions(userId);
    const target = subs.find((s) => s.license_id === licenseId);
    if (!target) return { success: false, message: 'Подписка не найдена' };

    if (!target.can_reset_hwid && target.hwid_cooldown_hours_left > 0) {
      return {
        success: false,
        message: `HWID можно сбросить только через ${target.hwid_cooldown_hours_left} ч. Либо воспользуйтесь экстренным сбросом через почту`,
      };
    }

    target.hwid = null;
    target.hwid_reset_count += 1;
    target.last_hwid_reset_at = new Date().toISOString();
    target.can_reset_hwid = false;
    target.hwid_cooldown_hours_left = 168; // 7 days

    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subs));
    return { success: true, message: 'HWID успешно сброшен. Привязка обновится при следующем запуске лоадера' };
  }

  // --- Security Engine (Email link protected) ---
  public async requestSecurityAction(
    userId: string,
    actionType: SecurityActionType,
    payload: Record<string, any>
  ): Promise<SecurityActionRequest> {
    const user = this.getAllUsers().find((u) => u.id === userId);
    if (!user) throw new Error('User not found');

    const token = `PDX-SEC-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    const req: SecurityActionRequest = {
      id: `sec_req_${Date.now()}`,
      user_id: userId,
      action_type: actionType,
      payload,
      token,
      target_email: user.email,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 15 * 60000).toISOString(), // 15 mins
      confirmed: false,
    };

    const rawActions = localStorage.getItem(STORAGE_KEYS.SECURITY_ACTIONS);
    const actions: SecurityActionRequest[] = rawActions ? JSON.parse(rawActions) : [];
    actions.unshift(req);
    localStorage.setItem(STORAGE_KEYS.SECURITY_ACTIONS, JSON.stringify(actions));

    // Dispatch event to show interactive Email Simulator in UI
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pdx:security_email_dispatched', { detail: req }));
    }

    return req;
  }

  public getPendingSecurityAction(token: string): SecurityActionRequest | null {
    try {
      const rawActions = localStorage.getItem(STORAGE_KEYS.SECURITY_ACTIONS);
      const actions: SecurityActionRequest[] = rawActions ? JSON.parse(rawActions) : [];
      const match = actions.find((a) => a.token === token && !a.confirmed);
      if (!match) return null;
      if (new Date(match.expires_at).getTime() < Date.now()) return null;
      return match;
    } catch {
      return null;
    }
  }

  public async confirmSecurityAction(token: string): Promise<{ success: boolean; message: string }> {
    const rawActions = localStorage.getItem(STORAGE_KEYS.SECURITY_ACTIONS);
    const actions: SecurityActionRequest[] = rawActions ? JSON.parse(rawActions) : [];
    const req = actions.find((a) => a.token === token);

    if (!req) {
      return { success: false, message: 'Ссылка безопасности недействительна или не существует' };
    }
    if (req.confirmed) {
      return { success: false, message: 'Действие по данной ссылке уже было подтверждено ранее' };
    }
    if (new Date(req.expires_at).getTime() < Date.now()) {
      return { success: false, message: 'Срок действия защитной ссылки истек (лимит 15 минут)' };
    }

    const users = this.getAllUsers();
    const user = users.find((u) => u.id === req.user_id);
    if (!user) return { success: false, message: 'Пользователь не найден' };

    let successMsg = 'Действие безопасности успешно подтверждено';

    switch (req.action_type) {
      case 'change_email':
        if (req.payload.new_email) {
          user.email = req.payload.new_email;
          successMsg = `Основной Email успешно изменен на ${user.email}`;
        }
        break;

      case 'change_password':
        successMsg = 'Пароль учетной записи успешно обновлен';
        break;

      case 'bind_telegram':
        if (req.payload.telegram_username) {
          user.telegram_username = req.payload.telegram_username;
          user.telegram_id = req.payload.telegram_id || '9910481';
          successMsg = `Telegram-аккаунт ${user.telegram_username} успешно привязан`;
        }
        break;

      case 'unbind_telegram':
        user.telegram_username = null;
        user.telegram_id = null;
        successMsg = 'Telegram-аккаунт успешно отвязан от профиля';
        break;

      case 'panic_freeze_account':
        user.is_frozen = true;
        successMsg = 'Режим Panic Freeze активирован: операции по аккаунту заблокированы';
        break;

      case 'unfreeze_account':
        user.is_frozen = false;
        successMsg = 'Аккаунт успешно разморожен, все функции восстановлены';
        break;

      case 'generate_backup_codes':
        const newCodes = Array.from({ length: 8 }, () => {
          const p1 = Math.random().toString(36).substring(2, 6).toUpperCase();
          const p2 = Math.random().toString(36).substring(2, 6).toUpperCase();
          return `${p1}-${p2}`;
        });
        user.backup_codes = newCodes;
        successMsg = 'Сгенерированы 8 новых одноразовых резервных кодов восстановления';
        break;

      case 'update_ip_whitelist':
        if (Array.isArray(req.payload.ips)) {
          user.whitelisted_ips = req.payload.ips;
          user.ip_whitelist_enabled = Boolean(req.payload.enabled);
          successMsg = 'Белый список доверенных IP-адресов успешно сохранен';
        }
        break;

      case 'emergency_hwid_reset':
        const subs = await this.getUserSubscriptions(user.id);
        const sub = subs.find((s) => s.license_id === req.payload.license_id) || subs[0];
        if (sub) {
          sub.hwid = null;
          sub.hwid_reset_count += 1;
          sub.last_hwid_reset_at = new Date().toISOString();
          sub.can_reset_hwid = true;
          sub.hwid_cooldown_hours_left = 0;
          localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subs));
          successMsg = 'Экстренный сброс HWID выполнен в обход кулдауна через подтверждение по почте';
        }
        break;

      case 'revoke_all_sessions':
        const allSessions = this.getUserSessions(user.id);
        const currentOnly = allSessions.filter((s) => s.is_current);
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(currentOnly));
        successMsg = 'Все сторонние сессии успешно завершены. Токены доступа аннулированы';
        break;

      case 'toggle_2fa':
        user.two_factor_enabled = !user.two_factor_enabled;
        successMsg = user.two_factor_enabled
          ? 'Двухфакторная защита (2FA) успешно включена'
          : 'Двухфакторная защита (2FA) отключена';
        break;

      case 'delete_account':
        const remaining = users.filter((u) => u.id !== user.id);
        this.saveUsers(remaining);
        this.logout();
        return { success: true, message: 'Учетная запись и все персональные данные полностью удалены' };
    }

    req.confirmed = true;
    localStorage.setItem(STORAGE_KEYS.SECURITY_ACTIONS, JSON.stringify(actions));
    this.saveUsers(users);

    if (this.currentUser?.id === user.id) {
      this.currentUser = { ...user };
      this.notify();
    }

    return { success: true, message: successMsg };
  }

  // --- Sessions & Audit ---
  public getUserSessions(userId: string): UserSession[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      const all: UserSession[] = raw ? JSON.parse(raw) : [];
      return all.filter((s) => s.user_id === userId);
    } catch {
      return [];
    }
  }

  public async revokeSession(userId: string, sessionId: string): Promise<boolean> {
    const sessions = this.getUserSessions(userId);
    const updated = sessions.filter((s) => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
    return true;
  }

  public getLoginAudit(userId: string): LoginAuditRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LOGIN_AUDIT);
      const all: LoginAuditRecord[] = raw ? JSON.parse(raw) : [];
      return all.filter((a) => a.user_id === userId);
    } catch {
      return [];
    }
  }
}

export const userService = new UserService();
