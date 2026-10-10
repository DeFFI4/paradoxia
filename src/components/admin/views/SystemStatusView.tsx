import React, { useState } from 'react';
import { ShieldCheck, Activity, Wifi, Server, CheckCircle2, Clock } from 'lucide-react';
import { ServiceStatusConfig } from '../../../types/license';
import { ServiceStatusController } from '../ServiceStatusController';
import { GlassCard } from '../../common/GlassCard';
import { supabase, isSupabaseConfigured } from '../../../services/supabase';
import { soundService } from '../../../services/soundService';

interface SystemStatusViewProps {
  statusConfig: ServiceStatusConfig | null;
  onUpdateConfig: (newConfig: ServiceStatusConfig) => void;
}

export const SystemStatusView: React.FC<SystemStatusViewProps> = ({
  statusConfig,
  onUpdateConfig,
}) => {
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [pinging, setPinging] = useState(false);

  const handlePingTest = async () => {
    setPinging(true);
    soundService.playTone('click');
    const start = performance.now();
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('app_settings').select('key').limit(1);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 35));
      }
      const duration = Math.round(performance.now() - start);
      setPingLatency(duration);
    } catch {
      setPingLatency(999);
    } finally {
      setPinging(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-white tracking-wide">
              Статус системы и шлюз античита
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Управление глобальным статусом обхода, баннерами оповещений и мониторинг задержки
            </p>
          </div>
        </div>

        {/* Ping tester */}
        <button
          onClick={handlePingTest}
          disabled={pinging}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 transition-colors"
        >
          <Activity className={`w-3.5 h-3.5 text-cyber-cyan ${pinging ? 'animate-spin' : ''}`} />
          <span>Проверить пинг:</span>
          <span className="font-bold text-cyber-cyan">
            {pingLatency !== null ? `${pingLatency} ms` : 'Тест'}
          </span>
        </button>
      </div>

      {/* Live System Diagnostics Quick Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-4 border-white/10 bg-cosmic-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Шлюз обхода EAC/BE</div>
              <div className="text-xs font-bold text-white font-mono">
                {statusConfig?.status || 'UNDETECTED'}
              </div>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
        </GlassCard>

        <GlassCard className="p-4 border-white/10 bg-cosmic-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/20 text-cyber-cyan">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Инфраструктура БД</div>
              <div className="text-xs font-bold text-white font-mono">
                {isSupabaseConfigured ? 'Supabase Postgres' : 'Local Storage Cache'}
              </div>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-cyber-cyan shadow-[0_0_8px_#06b6d4]" />
        </GlassCard>

        <GlassCard className="p-4 border-white/10 bg-cosmic-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyber-violet/10 border border-cyber-violet/20 text-cyber-violet">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Последнее обновление</div>
              <div className="text-xs font-bold text-white font-mono">
                {statusConfig?.last_updated
                  ? new Date(statusConfig.last_updated).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })
                  : 'Синхронизировано'}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Live</span>
        </GlassCard>
      </div>

      {/* Main Status Controller */}
      {statusConfig && (
        <ServiceStatusController
          config={statusConfig}
          onUpdated={onUpdateConfig}
        />
      )}
    </div>
  );
};
