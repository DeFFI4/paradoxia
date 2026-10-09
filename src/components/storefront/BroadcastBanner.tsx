import React from 'react';
import { ShieldCheck, AlertTriangle, RefreshCw, Wrench, X } from 'lucide-react';
import { ServiceStatusConfig } from '../../types/license';

interface BroadcastBannerProps {
  statusConfig: ServiceStatusConfig | null;
  onDismiss?: () => void;
}

export const BroadcastBanner: React.FC<BroadcastBannerProps> = ({ statusConfig, onDismiss }) => {
  if (!statusConfig || !statusConfig.banner_active) return null;

  const getStatusBadge = () => {
    switch (statusConfig.status) {
      case 'UNDETECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            UNDETECTED
          </span>
        );
      case 'TESTING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
            <AlertTriangle className="w-3 h-3" />
            ТЕСТИРОВАНИЕ
          </span>
        );
      case 'UPDATING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <RefreshCw className="w-3 h-3 animate-spin" />
            ОБНОВЛЕНИЕ
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
            <Wrench className="w-3 h-3" />
            ТЕХРАБОТЫ
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative z-40 bg-cosmic-850/90 backdrop-blur-xl border-b border-white/10 px-4 py-2.5 text-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex p-1 rounded-md bg-white/5 border border-white/10 text-cyber-cyan">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {getStatusBadge()}
            <span className="text-xs font-mono text-slate-400 px-1.5 py-0.5 rounded bg-black/30 border border-white/5">
              {statusConfig.version}
            </span>
            <span className="text-slate-200 text-xs sm:text-sm font-medium">
              {statusConfig.broadcast_message}
            </span>
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
            title="Скрыть оповещение"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
