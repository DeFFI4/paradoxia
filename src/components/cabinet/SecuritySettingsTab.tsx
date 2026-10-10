import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  Send,
  Smartphone,
  KeyRound,
  Globe,
  LogOut,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Terminal,
  Activity,
  Laptop,
} from 'lucide-react';
import { UserProfile, UserSession, LoginAuditRecord } from '../../types/user';
import { userService } from '../../services/userService';
import { soundService } from '../../services/soundService';

interface SecuritySettingsTabProps {
  user: UserProfile;
  sessions: UserSession[];
  auditLogs: LoginAuditRecord[];
  onRefresh: () => void;
}

export const SecuritySettingsTab: React.FC<SecuritySettingsTabProps> = ({
  user,
  sessions,
  auditLogs,
  onRefresh,
}) => {
  const [newEmail, setNewEmail] = useState('');
  const [telegramInput, setTelegramInput] = useState(user.telegram_username || '');
  const [ipListInput, setIpListInput] = useState(user.whitelisted_ips?.join(', ') || '');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<{ success: boolean; message: string } | null>(null);

  const triggerSecurityAction = async (
    actionType: any,
    payload: Record<string, any>,
    actionKey: string,
    successText: string
  ) => {
    setIsLoading(actionKey);
    soundService.playTone('click');
    try {
      await userService.requestSecurityAction(user.id, actionType, payload);
      soundService.playTone('success');
      setActionNotice({
        success: true,
        message: `${successText} Проверьте симулятор почты или входящие сообщения.`,
      });
    } catch (err: any) {
      soundService.playTone('alert');
      setActionNotice({
        success: false,
        message: err?.message || 'Ошибка инициализации операции безопасности',
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleCopyCodes = () => {
    if (!user.backup_codes) return;
    soundService.playTone('copy');
    navigator.clipboard.writeText(user.backup_codes.join('\n'));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const handleRevokeSingleSession = async (sessionId: string) => {
    soundService.playTone('click');
    await userService.revokeSession(user.id, sessionId);
    soundService.playTone('success');
    onRefresh();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Notice Message if an action was dispatched */}
      {actionNotice && (
        <div
          className={`p-4 rounded-xl border font-mono text-xs flex items-center justify-between gap-3 ${
            actionNotice.success
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.success ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-cyan-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-white/40 hover:text-white text-xs px-2 py-1"
          >
            Закрыть
          </button>
        </div>
      )}

      {/* 1. Panic Freeze Banner */}
      {user.is_frozen ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/40 relative overflow-hidden shadow-[0_0_30px_rgba(244,63,94,0.2)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-rose-400 tracking-wide">
                    РЕЖИМ PANIC FREEZE АКТИВЕН
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    АККАУНТ ЗАБЛОКИРОВАН
                  </span>
                </div>
                <p className="text-xs text-white/70 max-w-2xl leading-relaxed">
                  Все финансовые операции, сбросы HWID и авторизации с других устройств заблокированы. Для снятия
                  блокировки подтвердите запрос через криптографическую ссылку на вашей почте.
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                triggerSecurityAction(
                  'unfreeze_account',
                  {},
                  'unfreeze',
                  'Письмо для разморозки аккаунта отправлено на почту!'
                )
              }
              disabled={isLoading === 'unfreeze'}
              className="py-3 px-5 rounded-xl font-medium text-xs text-black bg-white hover:bg-white/90 transition-colors flex items-center justify-center gap-2 shrink-0 shadow-lg"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Разморозить через почту</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-[#0d0f19] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Экстренная заморозка (Panic Freeze)</div>
              <div className="text-xs text-white/50">
                При подозрении на взлом моментально заморозьте все операции по профилю.
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              triggerSecurityAction(
                'panic_freeze_account',
                {},
                'panic_freeze',
                'Ссылка подтверждения Panic Freeze отправлена на вашу почту.'
              )
            }
            disabled={isLoading === 'panic_freeze'}
            className="py-2.5 px-4 rounded-xl font-medium text-xs text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Активировать Panic Freeze</span>
          </button>
        </div>
      )}

      {/* 2. Grid: Email & Password & Telegram & 2FA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email & Password Block */}
        <div className="rounded-2xl bg-[#090c16] border border-white/10 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
            <Mail className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">Основной Email и пароль</h3>
          </div>

          {/* Change Email */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-white/50 block">
              Текущая почта: <span className="text-cyan-300 font-semibold">{user.email}</span>
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Новый email адрес"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
              <button
                onClick={() => {
                  if (!newEmail.trim()) return;
                  triggerSecurityAction(
                    'change_email',
                    { new_email: newEmail.trim() },
                    'change_email',
                    'Запрос смены почты отправлен на ваш текущий адрес!'
                  );
                }}
                disabled={isLoading === 'change_email' || !newEmail.trim()}
                className="py-2.5 px-4 rounded-xl text-xs font-medium text-black bg-cyan-400 hover:bg-cyan-300 transition-colors disabled:opacity-40"
              >
                Сменить
              </button>
            </div>
            <p className="text-[11px] text-white/40">
              Ссылка подтверждения будет отправлена на текущий ящик {user.email}.
            </p>
          </div>

          {/* Change Password */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-white">Мастер-пароль учетной записи</div>
              <div className="text-[11px] text-white/40">Изменение через криптографическую ссылку на почту</div>
            </div>
            <button
              onClick={() =>
                triggerSecurityAction(
                  'change_password',
                  {},
                  'change_password',
                  'Ссылка для изменения пароля направлена на вашу почту!'
                )
              }
              disabled={isLoading === 'change_password'}
              className="py-2 px-3.5 rounded-xl text-xs font-medium text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              Сменить пароль
            </button>
          </div>

          {/* 2FA Toggle */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-white">Двухфакторная защита (2FA)</span>
                <span
                  className={`px-1.5 py-0.5 text-[9px] font-mono rounded ${
                    user.two_factor_enabled
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {user.two_factor_enabled ? 'АКТИВНА' : 'ВЫКЛ'}
                </span>
              </div>
              <div className="text-[11px] text-white/40">Требовать подтверждение при каждом новом входе</div>
            </div>
            <button
              onClick={() =>
                triggerSecurityAction(
                  'toggle_2fa',
                  {},
                  'toggle_2fa',
                  'Ссылка для переключения 2FA отправлена на почту!'
                )
              }
              disabled={isLoading === 'toggle_2fa'}
              className="py-2 px-3.5 rounded-xl text-xs font-medium text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              {user.two_factor_enabled ? 'Отключить 2FA' : 'Включить 2FA'}
            </button>
          </div>
        </div>

        {/* Telegram & Backup Codes Block */}
        <div className="rounded-2xl bg-[#090c16] border border-white/10 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
            <Smartphone className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">Telegram и Резервные коды</h3>
          </div>

          {/* Telegram Binding */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-white/50">
                Привязка Telegram
              </label>
              {user.telegram_username && (
                <span className="text-[11px] font-mono text-emerald-400">
                  {user.telegram_username} (Привязан)
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={telegramInput}
                onChange={(e) => setTelegramInput(e.target.value)}
                placeholder="@username"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
              <button
                onClick={() => {
                  if (!telegramInput.trim()) return;
                  triggerSecurityAction(
                    'bind_telegram',
                    { telegram_username: telegramInput.trim() },
                    'bind_tg',
                    'Ссылка верификации привязки Telegram отправлена на почту!'
                  );
                }}
                disabled={isLoading === 'bind_tg' || !telegramInput.trim()}
                className="py-2.5 px-4 rounded-xl text-xs font-medium text-black bg-cyan-400 hover:bg-cyan-300 transition-colors disabled:opacity-40"
              >
                Привязать
              </button>
              {user.telegram_username && (
                <button
                  onClick={() =>
                    triggerSecurityAction(
                      'unbind_telegram',
                      {},
                      'unbind_tg',
                      'Ссылка отвязки Telegram направлена на почту!'
                    )
                  }
                  disabled={isLoading === 'unbind_tg'}
                  className="py-2.5 px-3 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
                  title="Отвязать Telegram"
                >
                  Отвязать
                </button>
              )}
            </div>
            <p className="text-[11px] text-white/40">
              Бот Paradoxia Security будет присылать оповещения о входе и сбросах HWID.
            </p>
          </div>

          {/* Backup Codes */}
          <div className="pt-3 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-white">Резервные коды восстановления</div>
                <div className="text-[11px] text-white/40">8 одноразовых кодов для доступа без почты/2FA</div>
              </div>
              <button
                onClick={() =>
                  triggerSecurityAction(
                    'generate_backup_codes',
                    {},
                    'backup_codes',
                    'Ссылка подтверждения генерации резервных кодов отправлена на почту!'
                  )
                }
                disabled={isLoading === 'backup_codes'}
                className="py-2 px-3 rounded-xl text-xs font-medium text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-colors"
              >
                Сгенерировать
              </button>
            </div>

            {user.backup_codes && user.backup_codes.length > 0 && (
              <div className="p-3 rounded-xl bg-black/60 border border-white/5 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-white/50 text-[11px]">
                  <span>СОХРАНЕННЫЕ КОДЫ:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowBackupCodes(!showBackupCodes)}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      {showBackupCodes ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showBackupCodes ? 'Скрыть' : 'Показать'}</span>
                    </button>
                    <button
                      onClick={handleCopyCodes}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      {copiedCodes ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Копировать</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                  {user.backup_codes.map((code, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 rounded bg-white/[0.03] text-center text-[11px] text-white/80 border border-white/5"
                    >
                      {showBackupCodes ? code : '••••-••••'}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. IP Whitelist Management */}
      <div className="rounded-2xl bg-[#090c16] border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Белый список доверенных IP (IP Whitelist)</h3>
              <p className="text-xs text-white/50">Вход в Личный Кабинет будет разрешен только с этих IP-адресов</p>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 text-[10px] font-mono rounded ${
              user.ip_whitelist_enabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/50'
            }`}
          >
            {user.ip_whitelist_enabled ? 'АКТИВЕН' : 'ОТКЛЮЧЕН'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={ipListInput}
            onChange={(e) => setIpListInput(e.target.value)}
            placeholder="178.62.204.18, 95.173.136.42"
            className="flex-1 px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
          />
          <button
            onClick={() => {
              const ips = ipListInput
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
              triggerSecurityAction(
                'update_ip_whitelist',
                { ips, enabled: ips.length > 0 },
                'ip_whitelist',
                'Ссылка для сохранения белого списка IP направлена на почту!'
              );
            }}
            disabled={isLoading === 'ip_whitelist'}
            className="py-2.5 px-5 rounded-xl text-xs font-medium text-black bg-cyan-400 hover:bg-cyan-300 transition-colors disabled:opacity-40"
          >
            Сохранить через почту
          </button>
        </div>
        <p className="text-[11px] text-white/40 font-mono">
          Текущий ваш IP: <span className="text-cyan-300">{user.last_login_ip || '178.62.204.18'}</span>
        </p>
      </div>

      {/* 4. Active Sessions Table with Terminate All */}
      <div className="rounded-2xl bg-[#090c16] border border-white/10 overflow-hidden space-y-4">
        <div className="p-6 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Активные сессии и устройства</h3>
            <p className="text-xs text-white/50">Список текущих авторизованных клиентов Paradoxia OS</p>
          </div>

          <button
            onClick={() =>
              triggerSecurityAction(
                'revoke_all_sessions',
                {},
                'revoke_all',
                'Ссылка для экстренного сброса всех сессий отправлена на почту!'
              )
            }
            disabled={isLoading === 'revoke_all'}
            className="py-2.5 px-4 rounded-xl text-xs font-medium text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Завершить все сессии через почту</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/40 text-white/40 font-mono text-[11px] uppercase border-y border-white/5">
              <tr>
                <th className="px-6 py-3">Устройство</th>
                <th className="px-6 py-3">Браузер / Клиент</th>
                <th className="px-6 py-3">IP-адрес</th>
                <th className="px-6 py-3">Геолокация</th>
                <th className="px-6 py-3">Активность</th>
                <th className="px-6 py-3 text-right">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {sessions.map((sess) => (
                <tr key={sess.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-sans text-white flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-cyan-400" />
                    <span>{sess.device}</span>
                  </td>
                  <td className="px-6 py-4 text-white/70">{sess.browser}</td>
                  <td className="px-6 py-4 text-cyan-300">{sess.ip}</td>
                  <td className="px-6 py-4 text-white/60 font-sans">{sess.location}</td>
                  <td className="px-6 py-4">
                    {sess.is_current ? (
                      <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Текущая сессия
                      </span>
                    ) : (
                      <span className="text-white/40 text-[11px]">{sess.last_active}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!sess.is_current && (
                      <button
                        onClick={() => handleRevokeSingleSession(sess.id)}
                        className="text-xs text-rose-400 hover:text-rose-300 font-sans underline"
                      >
                        Завершить
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Login Security Audit Table */}
      <div className="rounded-2xl bg-[#090c16] border border-white/10 overflow-hidden space-y-4">
        <div className="p-6 pb-2">
          <h3 className="text-sm font-bold text-white tracking-wide">Журнал аудита авторизаций</h3>
          <p className="text-xs text-white/50">История последних попыток входа с фиксацией IP и статуса</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/40 text-white/40 font-mono text-[11px] uppercase border-y border-white/5">
              <tr>
                <th className="px-6 py-3">Время (UTC)</th>
                <th className="px-6 py-3">IP-адрес</th>
                <th className="px-6 py-3">Устройство</th>
                <th className="px-6 py-3">Локация</th>
                <th className="px-6 py-3 text-right">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-3.5 text-white/60">
                    {new Date(log.timestamp).toLocaleString('ru-RU')}
                  </td>
                  <td className="px-6 py-3.5 text-cyan-300">{log.ip}</td>
                  <td className="px-6 py-3.5 font-sans text-white/80">
                    {log.device} ({log.browser})
                  </td>
                  <td className="px-6 py-3.5 font-sans text-white/50">{log.location}</td>
                  <td className="px-6 py-3.5 text-right">
                    <span
                      className={`px-2 py-0.5 text-[10px] rounded border ${
                        log.status === 'success'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {log.status === 'success'
                        ? 'Успешно'
                        : log.status === 'blocked_ip'
                        ? 'Блок IP'
                        : log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Danger Zone: Delete Account */}
      <div className="p-6 rounded-2xl bg-rose-500/[0.03] border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-sm font-bold text-rose-400">Опасная зона: Удаление профиля</div>
          <div className="text-xs text-white/50">
            Безвозвратное удаление учетной записи, всех подписок и баланса (строго по ссылке на почту).
          </div>
        </div>

        <button
          onClick={() =>
            triggerSecurityAction(
              'delete_account',
              {},
              'delete_acc',
              'Ссылка подтверждения удаления аккаунта направлена на вашу почту.'
            )
          }
          disabled={isLoading === 'delete_acc'}
          className="py-2.5 px-4 rounded-xl text-xs font-medium text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors flex items-center justify-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          <span>Удалить аккаунт</span>
        </button>
      </div>
    </div>
  );
};
