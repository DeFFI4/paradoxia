import React from 'react';
import { 
  TrendingUp, 
  KeyRound, 
  CheckCircle2, 
  Clock, 
  Ban, 
  Cpu, 
  DollarSign,
  PieChart,
  BarChart3
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { License } from '../../types/license';

interface AnalyticsSectionProps {
  licenses: License[];
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ licenses }) => {
  const total = licenses.length;
  const active = licenses.filter((l) => l.status === 'active').length;
  const unused = licenses.filter((l) => l.status === 'unused').length;
  const banned = licenses.filter((l) => l.status === 'banned').length;
  const hwidBound = licenses.filter((l) => Boolean(l.hwid)).length;

  // Tier distributions
  const tier1D = licenses.filter((l) => l.duration_days === 1).length;
  const tier7D = licenses.filter((l) => l.duration_days === 7).length;
  const tier30D = licenses.filter((l) => l.duration_days === 30).length;
  const tierLife = licenses.filter((l) => l.duration_days >= 365).length;

  // Mock revenue estimate: (1D * 399 + 7D * 1290 + 30D * 2990 + Life * 7990)
  const estimatedRevenue = (tier1D * 399) + (tier7D * 1290) + (tier30D * 2990) + (tierLife * 7990);

  const stats = [
    {
      label: 'Всего ключей',
      value: total,
      sub: 'В базе данных',
      icon: <KeyRound className="w-4 h-4 text-cyber-cyan" />,
      color: 'border-cyber-cyan/30 bg-cyber-cyan/10',
    },
    {
      label: 'Активные лицензии',
      value: active,
      sub: `${total > 0 ? Math.round((active / total) * 100) : 0}% от общего числа`,
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      color: 'border-emerald-500/30 bg-emerald-500/10',
    },
    {
      label: 'Неактивированные',
      value: unused,
      sub: 'Готовы к выдаче',
      icon: <Clock className="w-4 h-4 text-amber-400" />,
      color: 'border-amber-500/30 bg-amber-500/10',
    },
    {
      label: 'Привязано HWID',
      value: hwidBound,
      sub: 'Уникальных машин',
      icon: <Cpu className="w-4 h-4 text-cyber-violet" />,
      color: 'border-cyber-violet/30 bg-cyber-violet/10',
    },
    {
      label: 'Заблокировано',
      value: banned,
      sub: 'Нарушения / Blacklist',
      icon: <Ban className="w-4 h-4 text-rose-400" />,
      color: 'border-rose-500/30 bg-rose-500/10',
    },
    {
      label: 'Расчетный оборот',
      value: `${estimatedRevenue.toLocaleString()} ₽`,
      sub: 'Platega Merchant',
      icon: <DollarSign className="w-4 h-4 text-cyan-400" />,
      color: 'border-cyan-400/30 bg-cyan-400/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 6 High-tech metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {stats.map((s, idx) => (
          <GlassCard key={idx} className="p-4 border-white/10 bg-cosmic-900/70 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider leading-tight">
                {s.label}
              </span>
              <div className={`p-1.5 rounded-lg border ${s.color}`}>
                {s.icon}
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                {s.value}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                {s.sub}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Visual neon charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Neon Activity Sparkline */}
        <GlassCard className="p-5 border-white/10 bg-cosmic-900/60 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyber-cyan" />
                <span>Динамика активаций и валидаций ключей</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Активность авторизации в ядре за последние 7 дней (Kernel Telemetry)
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              +28.4% рост
            </span>
          </div>

          {/* SVG Canvas Area Wave */}
          <div className="relative h-44 w-full flex items-end">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="0" y1="60" x2="500" y2="60" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

              {/* Area fill */}
              <path
                d="M 0 100 Q 80 40, 160 70 T 320 30 T 420 50 T 500 15 L 500 120 L 0 120 Z"
                fill="url(#neonGradient)"
              />
              {/* Glowing stroke */}
              <path
                d="M 0 100 Q 80 40, 160 70 T 320 30 T 420 50 T 500 15"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="filter drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
              />
              {/* Nodes */}
              <circle cx="160" cy="70" r="4" fill="#06b6d4" className="animate-ping" />
              <circle cx="320" cy="30" r="4" fill="#22d3ee" />
              <circle cx="500" cy="15" r="5" fill="#10b981" />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-3 border-t border-white/[0.06] mt-2">
            <span>Пн</span>
            <span>Вт</span>
            <span>Ср</span>
            <span>Чт</span>
            <span>Пт</span>
            <span>Сб</span>
            <span className="text-cyber-cyan font-bold">Сегодня</span>
          </div>
        </GlassCard>

        {/* Plan Breakdown Progress Bars */}
        <GlassCard className="p-5 border-white/10 bg-cosmic-900/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-cyber-violet" />
                <span>Распределение тарифов</span>
              </h4>
              <span className="text-[10px] font-mono text-slate-400">Срез базы</span>
            </div>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">1 День</span>
                  <span className="text-white font-mono">{tier1D} ({total > 0 ? Math.round((tier1D / total) * 100) : 0}%)</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full bg-slate-400 rounded-full"
                    style={{ width: `${total > 0 ? (tier1D / total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">7 Дней</span>
                  <span className="text-cyber-cyan font-medium font-mono">{tier7D} ({total > 0 ? Math.round((tier7D / total) * 100) : 0}%)</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full bg-cyber-cyan rounded-full shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                    style={{ width: `${total > 0 ? (tier7D / total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">30 Дней (Популярный)</span>
                  <span className="text-cyber-violet font-medium font-mono">{tier30D} ({total > 0 ? Math.round((tier30D / total) * 100) : 0}%)</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full bg-cyber-violet rounded-full shadow-[0_0_8px_rgba(139,92,246,0.6)]"
                    style={{ width: `${total > 0 ? (tier30D / total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Lifetime (Навсегда)</span>
                  <span className="text-amber-400 font-medium font-mono">{tierLife} ({total > 0 ? Math.round((tierLife / total) * 100) : 0}%)</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-rose-400 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                    style={{ width: `${total > 0 ? (tierLife / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
            <span>Шлюз Platega:</span>
            <span className="text-emerald-400 font-mono font-semibold">100% автовыдача</span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
