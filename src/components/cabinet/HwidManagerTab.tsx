import React, { useState } from 'react';
import {
  Cpu,
  RefreshCw,
  Clock,
  AlertTriangle,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Info,
} from 'lucide-react';
import { UserSubscription, UserProfile } from '../../types/user';
import { userService } from '../../services/userService';
import { soundService } from '../../services/soundService';

interface HwidManagerTabProps {
  user: UserProfile;
  subscriptions: UserSubscription[];
  onRefresh: () => void;
}

export const HwidManagerTab: React.FC<HwidManagerTabProps> = ({
  user,
  subscriptions,
  onRefresh,
}) => {
  const [selectedLicenseId, setSelectedLicenseId] = useState<string>(
    subscriptions[0]?.license_id || ''
  );
  const [copiedHwid, setCopiedHwid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ success: boolean; message: string } | null>(null);

  const currentSub = subscriptions.find((s) => s.license_id === selectedLicenseId) || subscriptions[0];

  const handleCopyHwid = (hwid: string) => {
    soundService.playTone('copy');
    navigator.clipboard.writeText(hwid);
    setCopiedHwid(true);
    setTimeout(() => setCopiedHwid(false), 2000);
  };

  const handleStandardReset = async () => {
    if (!currentSub) return;
    setIsLoading(true);
    soundService.playTone('click');
    try {
      const res = await userService.resetHwid(user.id, currentSub.license_id);
      if (res.success) {
        soundService.playTone('success');
        setStatusMessage({ success: true, message: res.message });
        onRefresh();
      } else {
        soundService.playTone('alert');
        setStatusMessage({ success: false, message: res.message });
      }
    } catch (err: any) {
      soundService.playTone('alert');
      setStatusMessage({ success: false, message: err?.message || 'Ошибка сброса HWID' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencyReset = async () => {
    if (!currentSub) return;
    setIsLoading(true);
    soundService.playTone('click');
    try {
      await userService.requestSecurityAction(user.id, 'emergency_hwid_reset', {
        license_id: currentSub.license_id,
        product_name: currentSub.product_name,
      });
      soundService.playTone('success');
      setStatusMessage({
        success: true,
        message: 'Письмо с защитной ссылкой для экстренного сброса HWID отправлено на вашу почту!',
      });
    } catch (err: any) {
      soundService.playTone('alert');
      setStatusMessage({ success: false, message: err?.message || 'Ошибка запроса экстренного сброса' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#090b14] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">Менеджер привязки оборудования (HWID)</h3>
            <p className="text-xs text-white/50">
              Аппаратная защита привязывает вашу лицензию к уникальной конфигурации ПК (CPU, Motherboard, GPU, BIOS).
            </p>
          </div>
        </div>

        {subscriptions.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">Подписка:</span>
            <select
              value={selectedLicenseId}
              onChange={(e) => setSelectedLicenseId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
            >
              {subscriptions.map((s) => (
                <option key={s.license_id} value={s.license_id}>
                  {s.product_name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl border font-mono text-xs flex items-center gap-3 ${
            statusMessage.success
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {statusMessage.success ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <span>{statusMessage.message}</span>
        </div>
      )}

      {/* Main HWID Status Dashboard */}
      {currentSub ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fingerprint Card (2 cols) */}
          <div className="lg:col-span-2 rounded-2xl bg-[#0c0e17] border border-white/10 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-white/50">
                Текущий аппаратный отпечаток
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-mono rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                HARDWARE HASH
              </span>
            </div>

            <div className="p-4 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between gap-4 font-mono text-sm">
              <div className="truncate text-white font-semibold tracking-wider">
                {currentSub.hwid ? currentSub.hwid : 'Привязка отсутствует (Сброшен)'}
              </div>
              {currentSub.hwid && (
                <button
                  onClick={() => handleCopyHwid(currentSub.hwid || '')}
                  className="p-2 rounded-lg text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-colors shrink-0"
                  title="Копировать HWID"
                >
                  {copiedHwid ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[11px] font-mono text-white/40 block">ВСЕГО СБРОСОВ</span>
                <span className="text-base font-bold font-mono text-white">{currentSub.hwid_reset_count}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[11px] font-mono text-white/40 block">ПОСЛЕДНИЙ СБРОС</span>
                <span className="text-xs font-mono text-white/70">
                  {currentSub.last_hwid_reset_at
                    ? new Date(currentSub.last_hwid_reset_at).toLocaleDateString()
                    : 'Не сбрасывался'}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[11px] font-mono text-white/40 block">КУЛДАУН СБРОСА</span>
                <span
                  className={`text-xs font-mono font-semibold ${
                    currentSub.hwid_cooldown_hours_left > 0 ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {currentSub.hwid_cooldown_hours_left > 0
                    ? `${currentSub.hwid_cooldown_hours_left} ч.`
                    : 'Доступен'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3 text-xs text-white/50 leading-relaxed">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Привязка фиксируется автоматически при первом запуске лоадера на вашем компьютере. При смене
                комплектующих (материнской платы, процессора) выполните сброс перед повторным запуском.
              </span>
            </div>
          </div>

          {/* Reset Actions Card (1 col) */}
          <div className="rounded-2xl bg-[#0c0e17] border border-white/10 p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                <span>Операции со сбросом</span>
              </div>

              {/* Standard Reset */}
              <div className="space-y-2">
                <button
                  onClick={handleStandardReset}
                  disabled={isLoading || (!currentSub.can_reset_hwid && currentSub.hwid_cooldown_hours_left > 0)}
                  className="w-full py-3 px-4 rounded-xl font-medium text-xs text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RefreshCw className="w-4 h-4 text-cyan-400" />
                  <span>Стандартный сброс (1 раз в 7 дней)</span>
                </button>
                <p className="text-[11px] text-white/40 leading-relaxed">
                  Доступен бесплатно раз в 7 дней при отсутствии активного кулдауна.
                </p>
              </div>

              {/* Emergency Reset via Email */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Внеочередной сброс</span>
                </div>
                <button
                  onClick={handleEmergencyReset}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl font-medium text-xs text-black bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                >
                  <Mail className="w-4 h-4" />
                  <span>Экстренный сброс через почту</span>
                </button>
                <p className="text-[11px] text-white/40 leading-relaxed">
                  Позволяет моментально сбросить привязку в обход 7-дневного кулдауна через криптографическую ссылку
                  на почту.
                </p>
              </div>
            </div>

            <div className="text-[11px] text-white/30 font-mono text-center">
              Защита от передачи аккаунта третьим лицам активна
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-white/50">Нет доступных лицензий для управления HWID</div>
      )}
    </div>
  );
};
