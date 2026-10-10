import React, { useState } from 'react';
import {
  KeyRound,
  Clock,
  Snowflake,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Cpu,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import { UserSubscription, UserProfile } from '../../types/user';
import { userService } from '../../services/userService';
import { soundService } from '../../services/soundService';

interface SubscriptionsTabProps {
  user: UserProfile;
  subscriptions: UserSubscription[];
  onRefresh: () => void;
  onOpenTopUp: () => void;
}

export const SubscriptionsTab: React.FC<SubscriptionsTabProps> = ({
  user,
  subscriptions,
  onRefresh,
  onOpenTopUp,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; success: boolean; message: string } | null>(null);

  const handleCopyKey = (key: string) => {
    soundService.playTone('copy');
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleToggleAutoRenew = async (licenseId: string) => {
    setLoadingAction(`renew_${licenseId}`);
    soundService.playTone('click');
    try {
      const nextState = await userService.toggleAutoRenew(user.id, licenseId);
      soundService.playTone('success');
      setFeedback({
        id: licenseId,
        success: true,
        message: nextState ? 'Автопродление с баланса включено' : 'Автопродление отключено',
      });
      onRefresh();
    } catch {
      soundService.playTone('alert');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleFreezeToggle = async (licenseId: string) => {
    setLoadingAction(`freeze_${licenseId}`);
    soundService.playTone('click');
    try {
      const isFrozen = await userService.freezeSubscription(user.id, licenseId);
      soundService.playTone('success');
      setFeedback({
        id: licenseId,
        success: true,
        message: isFrozen ? 'Подписка заморожена. Время приостановлено' : 'Подписка разморожена',
      });
      onRefresh();
    } catch {
      soundService.playTone('alert');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExtend = async (licenseId: string, days: number, cost: number) => {
    if (user.balance < cost) {
      soundService.playTone('alert');
      setFeedback({
        id: licenseId,
        success: false,
        message: `Недостаточно средств на балансе (${user.balance} ₽ из ${cost} ₽). Пополните кошелек.`,
      });
      return;
    }

    setLoadingAction(`extend_${licenseId}`);
    soundService.playTone('click');
    try {
      const success = await userService.renewSubscription(user.id, licenseId, days, cost);
      if (success) {
        soundService.playTone('success');
        setFeedback({
          id: licenseId,
          success: true,
          message: `Подписка успешно продлена на +${days} дней! Списано ${cost} ₽.`,
        });
        onRefresh();
      } else {
        soundService.playTone('alert');
      }
    } catch {
      soundService.playTone('alert');
    } finally {
      setLoadingAction(null);
    }
  };

  const calculateDaysLeft = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Tab Header Banner */}
      <div className="p-6 rounded-2xl bg-[#090b14] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white tracking-wide">Мои лицензии и подписки</h3>
          <p className="text-xs text-white/50">
            Управляйте активными ключами, продлевайте срок действия с баланса и контролируйте заморозку.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-white/70">
            Баланс: <span className="text-cyan-400 font-bold">{user.balance.toLocaleString('ru-RU')} ₽</span>
          </div>
          <button
            onClick={onOpenTopUp}
            className="py-2.5 px-4 rounded-xl font-medium text-xs text-black bg-cyan-400 hover:bg-cyan-300 transition-colors flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Пополнить</span>
          </button>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="space-y-4">
        {subscriptions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-black/30 border border-white/5 space-y-3">
            <KeyRound className="w-10 h-10 text-white/20 mx-auto" />
            <div className="text-base text-white/60 font-medium">Активных подписок не обнаружено</div>
            <p className="text-xs text-white/40 max-w-sm mx-auto">
              Приобретите ключ в каталоге магазина или активируйте подарочный ваучер в разделе Кошелек.
            </p>
          </div>
        ) : (
          subscriptions.map((sub) => {
            const daysLeft = calculateDaysLeft(sub.expires_at);
            const isActing = loadingAction?.includes(sub.license_id);
            const subFeedback = feedback?.id === sub.license_id ? feedback : null;

            return (
              <div
                key={sub.license_id}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d101a] to-[#07090e] border border-white/10 p-6 space-y-5 shadow-lg transition-all hover:border-cyan-500/30"
              >
                {/* Status indicator line */}
                <div
                  className={`absolute top-0 left-0 bottom-0 w-1 ${
                    sub.status === 'active'
                      ? 'bg-emerald-400'
                      : sub.status === 'frozen'
                      ? 'bg-cyan-400'
                      : 'bg-rose-400'
                  }`}
                />

                {/* Sub Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h4 className="text-base font-bold text-white tracking-wide">{sub.product_name}</h4>
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-mono uppercase rounded-full border ${
                          sub.status === 'active'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : sub.status === 'frozen'
                            ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        }`}
                      >
                        {sub.status === 'active'
                          ? 'Активна'
                          : sub.status === 'frozen'
                          ? 'Заморожена'
                          : 'Истекла'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-white/40">
                      <span>ID: {sub.license_id}</span>
                      <span>•</span>
                      <span>Активирована: {new Date(sub.activated_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Key Display & Copy */}
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-black/60 border border-white/10 font-mono text-xs">
                    <span className="text-cyan-300 font-semibold px-2">{sub.key}</span>
                    <button
                      onClick={() => handleCopyKey(sub.key)}
                      className="p-1.5 rounded-lg text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                      title="Копировать лицензионный ключ"
                    >
                      {copiedKey === sub.key ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1 font-mono">
                    <div className="text-[11px] text-white/50 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>СРОК ДЕЙСТВИЯ</span>
                    </div>
                    <div className="text-xl font-bold text-white">
                      {daysLeft} <span className="text-xs text-white/50 font-normal">дней осталось</span>
                    </div>
                    <div className="text-[10px] text-white/40">
                      Истекает: {new Date(sub.expires_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1 font-mono">
                    <div className="text-[11px] text-white/50 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                      <span>ПРИВЯЗКА К ЖЕЛЕЗУ (HWID)</span>
                    </div>
                    <div className="text-xs font-semibold text-emerald-400 truncate">
                      {sub.hwid ? sub.hwid : 'Не привязано'}
                    </div>
                    <div className="text-[10px] text-white/40">
                      Сбросов выполнено: {sub.hwid_reset_count}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between font-mono">
                    <div className="text-[11px] text-white/50 flex items-center justify-between">
                      <span>АВТОПРОДЛЕНИЕ</span>
                      <span className={sub.auto_renew ? 'text-emerald-400' : 'text-white/40'}>
                        {sub.auto_renew ? 'ВКЛ' : 'ВЫКЛ'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleToggleAutoRenew(sub.license_id)}
                      disabled={isActing}
                      className="mt-2 py-1.5 px-3 rounded-lg text-xs font-sans text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className={`w-3 h-3 ${isActing ? 'animate-spin' : ''}`} />
                      <span>{sub.auto_renew ? 'Отключить автопродление' : 'Включить с баланса'}</span>
                    </button>
                  </div>
                </div>

                {/* Sub Card Feedback Message */}
                {subFeedback && (
                  <div
                    className={`p-3 rounded-xl border font-mono text-xs flex items-center gap-2 ${
                      subFeedback.success
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {subFeedback.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{subFeedback.message}</span>
                  </div>
                )}

                {/* Sub Controls / Extension Buttons */}
                <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleFreezeToggle(sub.license_id)}
                      disabled={isActing}
                      className="py-2 px-3.5 rounded-xl font-medium text-xs text-white/80 hover:text-white bg-white/[0.05] hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-1.5"
                    >
                      <Snowflake className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{sub.status === 'frozen' ? 'Разморозить' : 'Заморозить время'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40 hidden sm:inline">Продлить с баланса:</span>
                    <button
                      onClick={() => handleExtend(sub.license_id, 7, 390)}
                      disabled={isActing}
                      className="py-2 px-3 rounded-xl font-medium text-xs text-white/90 hover:text-white bg-white/[0.05] hover:bg-white/10 border border-white/10 transition-colors"
                      title="Продлить на 7 дней за 390 ₽"
                    >
                      +7 дн. (390 ₽)
                    </button>
                    <button
                      onClick={() => handleExtend(sub.license_id, 30, 1190)}
                      disabled={isActing}
                      className="py-2 px-3.5 rounded-xl font-medium text-xs text-black bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center gap-1"
                    >
                      <span>+30 дн. (1,190 ₽)</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
