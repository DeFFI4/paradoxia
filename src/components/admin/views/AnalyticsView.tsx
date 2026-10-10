import React from 'react';
import { BarChart3, TrendingUp, PieChart, DollarSign, Users, Award } from 'lucide-react';
import { License } from '../../../types/license';
import { AnalyticsSection } from '../AnalyticsSection';
import { GlassCard } from '../../common/GlassCard';

interface AnalyticsViewProps {
  licenses: License[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ licenses }) => {
  // Plan counts
  const plan1d = licenses.filter((l) => l.duration_days === 1).length;
  const plan7d = licenses.filter((l) => l.duration_days === 7).length;
  const plan30d = licenses.filter((l) => l.duration_days === 30).length;
  const planLt = licenses.filter((l) => l.duration_days >= 9999).length;

  const total = licenses.length || 1;
  const pct1d = Math.round((plan1d / total) * 100);
  const pct7d = Math.round((plan7d / total) * 100);
  const pct30d = Math.round((plan30d / total) * 100);
  const pctLt = Math.round((planLt / total) * 100);

  // Revenue estimation
  const estRevenue =
    plan1d * 499 +
    plan7d * 1499 +
    plan30d * 3499 +
    planLt * 9999;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyber-violet/10 border border-cyber-violet/20 text-cyber-violet">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-white tracking-wide">
              Аналитика и финансовые метрики
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Конверсия тарифов, прогноз выручки, распределение активных ключей и динамика
            </p>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 font-mono text-xs text-slate-300 flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Оценочная выручка:</span>
          <span className="font-bold text-emerald-400">
            {estRevenue.toLocaleString('ru-RU')} ₽
          </span>
        </div>
      </div>

      {/* Main KPI Analytics Section */}
      <AnalyticsSection licenses={licenses} />

      {/* Plan Distribution Deep Dive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6 border-white/10 bg-cosmic-900/60">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyber-cyan" />
              <span>Распределение по тарифным планам</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Всего: {licenses.length}</span>
          </div>

          <div className="space-y-4">
            {/* 1 Day */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300">24 Часа (1 день)</span>
                <span className="text-white font-bold">{plan1d} шт. ({pct1d}%)</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${pct1d}%` }}
                />
              </div>
            </div>

            {/* 7 Days */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300">7 Дней (Неделя)</span>
                <span className="text-white font-bold">{plan7d} шт. ({pct7d}%)</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyber-cyan rounded-full transition-all duration-500"
                  style={{ width: `${pct7d}%` }}
                />
              </div>
            </div>

            {/* 30 Days */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300">30 Дней (Месяц)</span>
                <span className="text-white font-bold">{plan30d} шт. ({pct30d}%)</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyber-violet rounded-full transition-all duration-500"
                  style={{ width: `${pct30d}%` }}
                />
              </div>
            </div>

            {/* Lifetime */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300">Lifetime (Бессрочный)</span>
                <span className="text-white font-bold">{planLt} шт. ({pctLt}%)</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${pctLt}%` }}
                />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Business Insights */}
        <GlassCard className="p-6 border-white/10 bg-cosmic-900/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-cyber-violet" />
                <span>Коммерческие показатели</span>
              </h3>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyber-violet/10 text-cyber-violet border border-cyber-violet/20 font-bold">
                PRO METRICS
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="text-[11px] text-slate-400">Средняя продолжительность</div>
                <div className="text-base font-bold text-white font-mono mt-1">
                  {Math.round(
                    licenses.reduce((acc, l) => acc + (l.duration_days >= 9999 ? 365 : l.duration_days), 0) /
                      (licenses.length || 1)
                  )}{' '}
                  дн.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="text-[11px] text-slate-400">Доля активных пользователей</div>
                <div className="text-base font-bold text-cyber-cyan font-mono mt-1">
                  {Math.round(
                    (licenses.filter((l) => l.status === 'active').length / (licenses.length || 1)) * 100
                  )}
                  %
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Все расчеты обновляются динамически в реальном времени при генерации новых партий, сбросах HWID и продлении подписок клиентами.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Канал дистрибуции:</span>
            <span className="font-mono text-slate-200">Прямые продажи + Реселлеры</span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
