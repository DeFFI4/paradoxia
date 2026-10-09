import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, RefreshCw, Wrench, Megaphone, Save, Check } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { ServiceStatus, ServiceStatusConfig } from '../../types/license';
import { licenseService } from '../../services/licenseService';
import { soundService } from '../../services/soundService';
import { useToast } from '../common/Toast';

interface ServiceStatusControllerProps {
  config: ServiceStatusConfig;
  onUpdated: (newConfig: ServiceStatusConfig) => void;
}

export const ServiceStatusController: React.FC<ServiceStatusControllerProps> = ({
  config,
  onUpdated,
}) => {
  const toast = useToast();
  const [status, setStatus] = useState<ServiceStatus>(config.status);
  const [version, setVersion] = useState(config.version);
  const [broadcastMessage, setBroadcastMessage] = useState(config.broadcast_message);
  const [bannerActive, setBannerActive] = useState(config.banner_active);
  const [saving, setSaving] = useState(false);

  const statuses: { id: ServiceStatus; label: string; desc: string; color: string; icon: React.ReactNode }[] = [
    {
      id: 'UNDETECTED',
      label: 'Undetected',
      desc: 'ПО полностью безопасно и готово к работе',
      color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 'TESTING',
      label: 'Testing',
      desc: 'Тестирование обновлений античита',
      color: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'UPDATING',
      label: 'Updating',
      desc: 'Драйверы на техническом обновлении',
      color: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400',
      icon: <RefreshCw className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: 'MAINTENANCE',
      label: 'Maintenance',
      desc: 'Серверное обслуживание и калибровка',
      color: 'border-rose-500/50 bg-rose-500/10 text-rose-400',
      icon: <Wrench className="w-4 h-4 text-rose-400" />,
    },
  ];

  const handleSave = async () => {
    setSaving(true);
    soundService.playTone('burst');

    try {
      const updated = await licenseService.updateServiceStatus({
        status,
        version,
        broadcast_message: broadcastMessage,
        banner_active: bannerActive,
      });

      onUpdated(updated);
      toast.success('Статус системы и оповещение обновлены', 'Успешно сохранено');
    } catch {
      toast.error('Не удалось обновить статус системы', 'Ошибка');
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassCard className="p-6 border-white/10 bg-cosmic-900/60">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-white/10 gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Управление глобальным статусом сервиса</span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/10 text-slate-300">
              Live Gateway
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Переключайте видимый статус продукта и текст верхней строки оповещений
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-cyber-cyan hover:bg-cyan-400 text-cosmic-950 font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <span className="animate-spin">●</span> : <Save className="w-3.5 h-3.5" />}
          <span>Применить изменения</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status choices */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2.5 uppercase tracking-wider">
            Текущий статус античита:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {statuses.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  soundService.playTone('click');
                  setStatus(item.id);
                }}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  status === item.id
                    ? `${item.color} shadow-[0_0_15px_rgba(0,0,0,0.5)]`
                    : 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {item.icon}
                  <span className="text-xs font-bold font-mono uppercase">{item.label}</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">{item.desc}</p>
                {status === item.id && (
                  <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                )}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Версия ядра / Build:
            </label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-xs focus:border-cyber-cyan focus:outline-none"
            />
          </div>
        </div>

        {/* Broadcast banner message */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-cyber-violet" />
              <span>Оповещение в шапке сайта:</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={bannerActive}
                onChange={(e) => setBannerActive(e.target.checked)}
                className="rounded border-white/20 text-cyber-violet focus:ring-0"
              />
              <span className="text-xs text-slate-400 font-mono">
                {bannerActive ? 'Активно' : 'Скрыто'}
              </span>
            </label>
          </div>

          <textarea
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            rows={3}
            placeholder="Текст срочного оповещения для пользователей..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-cyber-violet focus:outline-none transition-all resize-none"
          />

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300">Предпросмотр:</span>
            <div className="p-2 rounded bg-cyber-violet/10 border border-cyber-violet/20 text-cyber-violet font-mono text-[11px]">
              {broadcastMessage || 'Сообщение отсутствует'}
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
