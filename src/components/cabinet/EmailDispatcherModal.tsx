import React, { useState, useEffect } from 'react';
import {
  Mail,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ExternalLink,
  Copy,
  Check,
  X,
  KeyRound,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { SecurityActionRequest } from '../../types/user';
import { userService } from '../../services/userService';
import { soundService } from '../../services/soundService';

interface EmailDispatcherModalProps {
  request: SecurityActionRequest | null;
  onClose: () => void;
  onActionConfirmed?: (message: string) => void;
}

const ACTION_DESCRIPTIONS: Record<string, { title: string; subtitle: string; icon: React.ElementType }> = {
  change_email: {
    title: 'Подтверждение изменения основного Email',
    subtitle: 'Запрос на перепривязку учетной записи к новому почтовому ящику',
    icon: Mail,
  },
  change_password: {
    title: 'Подтверждение смены мастер-пароля',
    subtitle: 'Инициирована процедура сброса и обновления пароля доступа',
    icon: KeyRound,
  },
  bind_telegram: {
    title: 'Верификация привязки Telegram-аккаунта',
    subtitle: 'Подключение аккаунта Telegram для мгновенных уведомлений и двухфакторной защиты',
    icon: ShieldCheck,
  },
  unbind_telegram: {
    title: 'Отвязка Telegram-аккаунта',
    subtitle: 'Отключение синхронизации с вашим текущим Telegram ID',
    icon: ShieldAlert,
  },
  panic_freeze_account: {
    title: 'Экстренная заморозка профиля (Panic Freeze)',
    subtitle: 'Немедленная блокировка всех действий по аккаунту при подозрении на несанкционированный доступ',
    icon: Lock,
  },
  unfreeze_account: {
    title: 'Разморозка учетной записи',
    subtitle: 'Снятие ограничений безопасности и восстановление доступа ко всем функциям',
    icon: ShieldCheck,
  },
  generate_backup_codes: {
    title: 'Выпуск 8 одноразовых резервных кодов',
    subtitle: 'Генерация аварийных ключей восстановления доступа к аккаунту',
    icon: KeyRound,
  },
  update_ip_whitelist: {
    title: 'Обновление белого списка IP-адресов',
    subtitle: 'Изменение списка доверенных сетей для входа в Личный Кабинет',
    icon: ShieldCheck,
  },
  emergency_hwid_reset: {
    title: 'Экстренный сброс привязки HWID железа',
    subtitle: 'Внеочередной сброс аппаратного идентификатора в обход 7-дневного ограничения',
    icon: AlertTriangle,
  },
  revoke_all_sessions: {
    title: 'Экстренное завершение всех сессий',
    subtitle: 'Аннулирование авторизационных токенов на всех остальных браузерах и устройствах',
    icon: ShieldAlert,
  },
  toggle_2fa: {
    title: 'Изменение статуса 2FA аутентификации',
    subtitle: 'Переключение двухфакторной защиты личного кабинета',
    icon: ShieldCheck,
  },
  delete_account: {
    title: 'Безвозвратное удаление учетной записи',
    subtitle: 'ВНИМАНИЕ: Все лицензии, баланс и история будут безвозвратно уничтожены',
    icon: ShieldAlert,
  },
};

export const EmailDispatcherModal: React.FC<EmailDispatcherModalProps> = ({
  request,
  onClose,
  onActionConfirmed,
}) => {
  const [copied, setCopied] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(900); // 15 mins default
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (!request) return;

    const expiryTime = new Date(request.expires_at).getTime();
    const updateCountdown = () => {
      const diff = Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
      setSecondsRemaining(diff);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [request]);

  if (!request) return null;

  const actionMeta = ACTION_DESCRIPTIONS[request.action_type] || {
    title: 'Защитное подтверждение операции',
    subtitle: 'Авторизация изменения параметров безопасности',
    icon: ShieldCheck,
  };
  const IconComponent = actionMeta.icon;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timerStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const directUrl = `${window.location.origin}${window.location.pathname}?security_token=${request.token}`;

  const handleCopyLink = () => {
    soundService.playTone('copy');
    navigator.clipboard.writeText(directUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConfirmAction = async () => {
    setIsProcessing(true);
    soundService.playTone('click');
    try {
      const res = await userService.confirmSecurityAction(request.token);
      if (res.success) {
        soundService.playTone('success');
        setFeedback({ success: true, message: res.message });
        if (onActionConfirmed) {
          onActionConfirmed(res.message);
        }
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        soundService.playTone('alert');
        setFeedback({ success: false, message: res.message });
      }
    } catch (err: any) {
      soundService.playTone('alert');
      setFeedback({ success: false, message: err?.message || 'Ошибка валидации токена' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Mask target email for visual realism
  const maskEmail = (email: string) => {
    if (!email) return '***@paradoxia.space';
    const parts = email.split('@');
    if (parts.length < 2) return email;
    const name = parts[0];
    const maskedName = name.length <= 2 ? name + '***' : name[0] + '***' + name[name.length - 1];
    return `${maskedName}@${parts[1]}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-gradient-to-b from-[#0d0f17] to-[#07080c] border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.18)]">
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Paradoxia Security Dispatch</span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  SECURE MAIL SIMULATOR
                </span>
              </div>
              <h3 className="text-sm font-medium text-white/70">Входящее системное уведомление безопасности</h3>
            </div>
          </div>
          <button
            onClick={() => {
              soundService.playTone('click');
              onClose();
            }}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Body Content */}
        <div className="p-6 space-y-6">
          {/* Email Headers Meta */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/40">ОТПРАВИТЕЛЬ:</span>
              <span className="text-cyan-400">security@paradoxia.space [DKIM SIGNED]</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/40">ПОЛУЧАТЕЛЬ:</span>
              <span className="text-white/90">{maskEmail(request.target_email)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/40">ВРЕМЯ ОТПРАВКИ:</span>
              <span className="text-white/60">{new Date(request.created_at).toLocaleTimeString()} (UTC)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/40">ТАЙМАУТ ССЫЛКИ:</span>
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>{timerStr}</span>
              </div>
            </div>
          </div>

          {/* Action Details Card */}
          <div className="p-5 rounded-xl bg-white/[0.03] border border-cyan-500/20 relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
                <IconComponent className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="text-base font-semibold text-white tracking-wide">
                  {actionMeta.title}
                </div>
                <div className="text-sm text-white/60 leading-relaxed">
                  {actionMeta.subtitle}
                </div>

                {/* Additional payload details if any */}
                {request.payload && Object.keys(request.payload).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs font-mono">
                    {request.payload.new_email && (
                      <div>
                        <span className="text-white/40 block">Новый адрес:</span>
                        <span className="text-emerald-400 font-semibold">{request.payload.new_email}</span>
                      </div>
                    )}
                    {request.payload.telegram_username && (
                      <div>
                        <span className="text-white/40 block">Telegram профиль:</span>
                        <span className="text-cyan-400 font-semibold">{request.payload.telegram_username}</span>
                      </div>
                    )}
                    {request.payload.license_id && (
                      <div>
                        <span className="text-white/40 block">Идентификатор подписки:</span>
                        <span className="text-amber-400 font-semibold">{request.payload.license_id}</span>
                      </div>
                    )}
                    {request.payload.ips && (
                      <div className="col-span-2">
                        <span className="text-white/40 block">Доверенные IP:</span>
                        <span className="text-cyan-300 font-semibold">
                          {(request.payload.ips as string[]).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Token Hash Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white/50">КРИПТОГРАФИЧЕСКИЙ ТОКЕН ССЫЛКИ:</span>
              <span className="text-cyan-400/80">SHA256 SIGNATURE VALID</span>
            </div>
            <div className="p-3 rounded-lg bg-black/60 border border-white/10 font-mono text-xs text-white/80 break-all select-all">
              {request.token}
            </div>
          </div>

          {/* Result Alert if attempted */}
          {feedback && (
            <div
              className={`p-4 rounded-xl border font-mono text-xs flex items-center gap-3 ${
                feedback.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              {feedback.success ? <Check className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
              <div>{feedback.message}</div>
            </div>
          )}

          {/* Actions Button Group */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={handleConfirmAction}
              disabled={isProcessing || feedback?.success || secondsRemaining <= 0}
              className="w-full sm:flex-1 py-3 px-5 rounded-xl font-medium text-sm text-black bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>
                {isProcessing
                  ? 'Проверка цифровой подписи...'
                  : feedback?.success
                  ? 'Действие подтверждено'
                  : 'Подтвердить действие в 1 клик'}
              </span>
            </button>

            <button
              onClick={handleCopyLink}
              className="w-full sm:w-auto py-3 px-4 rounded-xl font-mono text-xs text-white/80 hover:text-white bg-white/[0.05] hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 transition-colors"
              title="Скопировать прямую ссылку с токеном (?security_token=...)"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Ссылка скопирована' : 'Скопировать URL ссылку'}</span>
            </button>
          </div>
        </div>

        {/* Security Notice Footer */}
        <div className="px-6 py-3.5 bg-black/60 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
          <span>Если вы не совершали этот запрос, рекомендуем немедленно активировать Panic Freeze.</span>
          <span className="font-mono text-white/30">ID: {request.id}</span>
        </div>
      </div>
    </div>
  );
};
