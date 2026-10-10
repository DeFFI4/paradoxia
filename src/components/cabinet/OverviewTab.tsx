import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Wallet,
  Download,
  KeyRound,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Cpu,
  Layers,
  Terminal,
  Activity,
} from 'lucide-react';
import { UserProfile, UserSubscription } from '../../types/user';
import { soundService } from '../../services/soundService';

interface OverviewTabProps {
  user: UserProfile;
  subscriptions: UserSubscription[];
  onOpenTopUp: () => void;
  onNavigateTab: (tab: string) => void;
  onRefresh: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  user,
  subscriptions,
  onOpenTopUp,
  onNavigateTab,
}) => {
  const [downloadToken, setDownloadToken] = useState<string>('PDX-BOOT-' + Math.random().toString(36).substring(2, 9).toUpperCase());
  const [copiedToken, setCopiedToken] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const primarySub = subscriptions.find((s) => s.status === 'active') || subscriptions[0];

  // Calculate Security Score (0 - 100)
  let securityScore = 30; // base email registered
  if (user.email_verified) securityScore += 20;
  if (user.two_factor_enabled) securityScore += 25;
  if (user.telegram_username) securityScore += 15;
  if (user.backup_codes && user.backup_codes.length > 0) securityScore += 10;

  const handleCopyToken = () => {
    soundService.playTone('copy');
    navigator.clipboard.writeText(downloadToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleDownloadLoader = () => {
    soundService.playTone('click');
    setIsDownloading(true);

    // Simulate loader binary download trigger
    setTimeout(() => {
      soundService.playTone('success');
      setIsDownloading(false);
      const element = document.createElement('a');
      const file = new Blob([`Paradoxia OS Loader Boot Token: ${downloadToken}\nGenerated for: ${user.email}`], {
        type: 'text/plain',
      });
      element.href = URL.createObjectURL(file);
      element.download = 'ParadoxiaLoader_v2.4.exe';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 1200);
  };

  const calculateDaysLeft = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Grid: Main Subscription Banner + Balance Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Subscription Banner (2 cols) */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0e1322] via-[#090b14] to-[#060810] border border-cyan-500/20 p-6 shadow-[0_0_40px_rgba(6,182,212,0.1)]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                    Активная конфигурация
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-wide">
                    {primarySub ? primarySub.product_name : 'Нет активных подписок'}
                  </h3>
                </div>
              </div>

              {primarySub && (
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 text-xs font-mono uppercase rounded-full border ${
                      primarySub.status === 'active'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : primarySub.status === 'frozen'
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {primarySub.status === 'active'
                      ? 'Активна'
                      : primarySub.status === 'frozen'
                      ? 'Заморожена'
                      : 'Истекла'}
                  </span>
                </div>
              )}
            </div>

            {primarySub ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <div className="text-xs text-white/50 flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>ОСТАЛОСЬ ВРЕМЕНИ</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {calculateDaysLeft(primarySub.expires_at)}{' '}
                    <span className="text-sm font-normal text-white/60">дней</span>
                  </div>
                  <div className="text-[11px] text-white/40 truncate">
                    До {new Date(primarySub.expires_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <div className="text-xs text-white/50 flex items-center gap-1.5 font-mono">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                    <span>ЛИЦЕНЗИОННЫЙ КЛЮЧ</span>
                  </div>
                  <div className="text-xs font-mono font-semibold text-cyan-300 truncate">
                    {primarySub.key}
                  </div>
                  <div className="text-[11px] text-white/40">
                    {primarySub.auto_renew ? 'Автопродление ВКЛ' : 'Ручное продление'}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <div className="text-xs text-white/50 flex items-center gap-1.5 font-mono">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    <span>СТАТУС HWID</span>
                  </div>
                  <div className="text-xs font-mono font-semibold text-emerald-400">
                    {primarySub.hwid ? 'Привязано к ПК' : 'Ожидает привязки'}
                  </div>
                  <div className="text-[11px] text-white/40">
                    Сбросов: {primarySub.hwid_reset_count}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-sm text-white/60">
                У вас пока нет активных лицензий. Перейдите в каталог продуктов для оформления.
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigateTab('subscriptions')}
                className="py-2.5 px-4 rounded-xl font-medium text-xs text-black bg-cyan-400 hover:bg-cyan-300 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                <span>Управление всеми подписками</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigateTab('hwid')}
                className="py-2.5 px-4 rounded-xl font-medium text-xs text-white/80 hover:text-white bg-white/[0.05] hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-2"
              >
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Менеджер HWID</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Balance Card (1 col) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#111422] to-[#080a11] border border-white/10 p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-1 text-[11px] font-mono rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                RUB WALLET
              </span>
            </div>

            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-white/50">Баланс кошелька</div>
              <div className="text-3xl font-extrabold font-mono text-white tracking-tight mt-1">
                {user.balance.toLocaleString('ru-RU')}{' '}
                <span className="text-cyan-400 font-semibold text-xl">₽</span>
              </div>
            </div>

            <p className="text-xs text-white/50 leading-relaxed">
              Средства используются для мгновенного продления подписок со скидкой и активации дополнительных модулей.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                soundService.playTone('click');
                onOpenTopUp();
              }}
              className="w-full py-3 px-4 rounded-xl font-medium text-xs text-black bg-gradient-to-r from-emerald-400 to-cyan-300 hover:from-emerald-300 hover:to-cyan-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Пополнить баланс</span>
            </button>

            <button
              onClick={() => onNavigateTab('wallet')}
              className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 transition-colors flex items-center justify-center gap-2"
            >
              <span>История и промокоды</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Second Row: Loader Download Widget & Security Score Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Loader Download Widget (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-[#090b13] border border-white/10 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-white">Клиент запуска Paradoxia Loader</h4>
                <p className="text-xs text-white/50">Версия v2.4 (x64 Windows 10/11) • Ring-0 Security Bypass</p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-[11px] font-mono rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
              BUILD 2026.10
            </span>
          </div>

          <div className="p-4 rounded-xl bg-black/50 border border-white/5 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-white/40">ОДНОРАЗОВЫЙ СЕССИОННЫЙ ТОКЕН ЗАПУСКА:</span>
              <button
                onClick={() => {
                  soundService.playTone('click');
                  setDownloadToken('PDX-BOOT-' + Math.random().toString(36).substring(2, 9).toUpperCase());
                }}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Обновить</span>
              </button>
            </div>
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/10">
              <span className="text-white font-semibold tracking-wider select-all">{downloadToken}</span>
              <button
                onClick={handleCopyToken}
                className="p-1 rounded text-white/50 hover:text-white transition-colors"
                title="Копировать токен"
              >
                {copiedToken ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-white/50 leading-relaxed">
              Инструкция: Запустите лоадер от имени Администратора, вставьте полученный токен или ключ подписки и выберите игру.
            </div>

            <button
              onClick={handleDownloadLoader}
              disabled={isDownloading}
              className="w-full sm:w-auto py-3 px-6 rounded-xl font-medium text-xs text-black bg-gradient-to-r from-violet-400 to-cyan-300 hover:from-violet-300 hover:to-cyan-200 shadow-[0_0_20px_rgba(139,92,246,0.35)] flex items-center justify-center gap-2 shrink-0 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Формирование пакета...' : 'Скачать ParadoxiaLoader.exe'}</span>
            </button>
          </div>
        </div>

        {/* Security Score Gauge (1 col) */}
        <div className="rounded-2xl bg-[#090b13] border border-white/10 p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl border ${
                    securityScore >= 80
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  }`}
                >
                  {securityScore >= 80 ? (
                    <ShieldCheck className="w-5 h-5" />
                  ) : (
                    <ShieldAlert className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Security Score</h4>
                  <p className="text-[11px] text-white/40">Уровень защиты аккаунта</p>
                </div>
              </div>
              <div
                className={`text-xl font-extrabold font-mono ${
                  securityScore >= 80 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {securityScore}%
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${
                  securityScore >= 80
                    ? 'bg-gradient-to-r from-cyan-400 to-emerald-400'
                    : 'bg-gradient-to-r from-amber-400 to-orange-400'
                }`}
                style={{ width: `${securityScore}%` }}
              />
            </div>

            {/* Security Checklist */}
            <div className="space-y-2 pt-2 text-xs font-mono">
              <div className="flex items-center justify-between text-white/70">
                <span>Основная почта:</span>
                <span className="text-emerald-400">Подтверждена</span>
              </div>
              <div className="flex items-center justify-between text-white/70">
                <span>Двухфакторная 2FA:</span>
                <span className={user.two_factor_enabled ? 'text-emerald-400' : 'text-rose-400'}>
                  {user.two_factor_enabled ? 'Включена' : 'Отключена'}
                </span>
              </div>
              <div className="flex items-center justify-between text-white/70">
                <span>Telegram привязка:</span>
                <span className={user.telegram_username ? 'text-emerald-400' : 'text-white/40'}>
                  {user.telegram_username ? 'Привязан' : 'Не привязан'}
                </span>
              </div>
              <div className="flex items-center justify-between text-white/70">
                <span>Резервные коды:</span>
                <span className={user.backup_codes?.length ? 'text-emerald-400' : 'text-white/40'}>
                  {user.backup_codes?.length ? `${user.backup_codes.length} кодов` : 'Не созданы'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('security')}
            className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-white/80 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 transition-colors flex items-center justify-center gap-2"
          >
            <span>Настройки безопасности</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
