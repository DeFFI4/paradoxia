import React, { useState } from 'react';
import { 
  Check, 
  Zap, 
  Crown, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Flame
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { soundService } from '../../services/soundService';

export interface PricingTier {
  id: string;
  name: string;
  durationDays: number;
  priceUSD: string;
  priceRUB: string;
  periodLabel: string;
  popular?: boolean;
  tag?: string;
  features: string[];
  glow: 'cyan' | 'violet' | 'emerald' | 'amber';
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: '1day',
    name: 'Day Pass',
    durationDays: 1,
    priceUSD: '$4.99',
    priceRUB: '499 ₽',
    periodLabel: '/ 24 часа',
    tag: 'Быстрый старт',
    glow: 'cyan',
    features: [
      'Полный доступ ко всем модулям',
      'Ring0 Hypervisor защита',
      'Streamproof обход OBS/Discord',
      'Мгновенная активация ключа',
      'Базовая поддержка 24/7'
    ]
  },
  {
    id: '7days',
    name: 'Tactical Week',
    durationDays: 7,
    priceUSD: '$17.99',
    priceRUB: '1 490 ₽',
    periodLabel: '/ 7 дней',
    tag: 'Оптимально',
    glow: 'emerald',
    features: [
      'Полный доступ ко всем модулям',
      'Приоритетные обновления баз',
      'Встроенный HWID Spoofer',
      'Сохранение облачных конфигов',
      'Streamproof OBS & Discord',
      'VIP чат пользователей'
    ]
  },
  {
    id: '30days',
    name: 'Elite Month',
    durationDays: 30,
    priceUSD: '$44.99',
    priceRUB: '3 490 ₽',
    periodLabel: '/ 30 дней',
    popular: true,
    tag: 'Самый популярный',
    glow: 'violet',
    features: [
      'Максимальный пакет функций',
      'Персональная калибровка конфига',
      'HWID Spoofer + Cleaners включены',
      'Приоритетный доступ к бета-билдам',
      'Защита от заморозки аккаунта',
      'Персональный саппорт 24/7'
    ]
  },
  {
    id: 'lifetime',
    name: 'Cyber Lifetime',
    durationDays: 9999,
    priceUSD: '$129.99',
    priceRUB: '8 990 ₽',
    periodLabel: '/ Навсегда',
    tag: 'Вечный доступ',
    glow: 'amber',
    features: [
      'Бессрочные обновления навсегда',
      'Неограниченные сбросы HWID',
      'Доступ ко всем будущим продуктам',
      'Закрытый Discord совет разработчиков',
      'Прямой контакт с ведущим кодером',
      'Эксклюзивные приватные билды'
    ]
  }
];

interface PricingGridProps {
  onSelectTier: (tier: PricingTier) => void;
}

export const PricingGrid: React.FC<PricingGridProps> = ({ onSelectTier }) => {
  const [currency, setCurrency] = useState<'RUB' | 'USD'>('RUB');

  const handleCurrencyToggle = (cur: 'RUB' | 'USD') => {
    soundService.playTone('click');
    setCurrency(cur);
  };

  const handleChoose = (tier: PricingTier) => {
    soundService.playTone('burst');
    onSelectTier(tier);
  };

  return (
    <section id="pricing" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background radial gradient lights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-cyber-violet/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-10 w-[500px] h-[300px] bg-cyber-cyan/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-cyber-violet" />
            <span className="text-xs uppercase font-mono tracking-widest text-slate-300">Тарифные планы</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Инвестируй в абсолютное{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyber-cyan via-white to-cyber-violet">
              превосходство
            </span>
          </h2>
          
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Мгновенная выдача лицензионного ключа сразу после оплаты. Полная гарантия совместимости и безопасность вашей системы.
          </p>

          {/* Currency Switcher */}
          <div className="pt-4 flex justify-center">
            <div className="inline-flex items-center p-1 rounded-xl bg-cosmic-900 border border-white/10 backdrop-blur-xl">
              <button
                onClick={() => handleCurrencyToggle('RUB')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all duration-200 ${
                  currency === 'RUB'
                    ? 'bg-cyber-violet text-white shadow-glow-violet'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                RUB (₽)
              </button>
              <button
                onClick={() => handleCurrencyToggle('USD')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all duration-200 ${
                  currency === 'USD'
                    ? 'bg-cyber-cyan text-white shadow-glow-cyan'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                USD ($)
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {PRICING_TIERS.map((tier) => {
            const isPopular = tier.popular;

            return (
              <div 
                key={tier.id}
                className={`relative group rounded-2xl transition-all duration-300 ${
                  isPopular ? 'scale-[1.02] z-10' : 'hover:-translate-y-1'
                }`}
              >
                {/* Glow backlight for popular card */}
                {isPopular && (
                  <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-b from-cyber-violet via-cyber-cyan to-transparent opacity-75 blur-md group-hover:opacity-100 transition duration-500 animate-pulse-glow" />
                )}

                <GlassCard
                  className={`h-full flex flex-col justify-between p-6 sm:p-7 relative ${
                    isPopular 
                      ? 'bg-cosmic-800/90 border-cyber-violet/50 shadow-[0_0_35px_rgba(139,92,246,0.25)]' 
                      : 'bg-cosmic-850/70 border-white/10 hover:border-white/20'
                  }`}
                  glow={tier.glow}
                >
                  <div>
                    {/* Top Tag */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full font-bold ${
                        isPopular
                          ? 'bg-cyber-violet/20 text-cyber-violet border border-cyber-violet/30'
                          : 'bg-white/5 text-slate-400 border border-white/5'
                      }`}>
                        {tier.tag}
                      </span>
                      {isPopular && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 font-mono">
                          <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-bounce" />
                          ТОП
                        </span>
                      )}
                    </div>

                    {/* Tier Name */}
                    <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>

                    {/* Price Display */}
                    <div className="flex items-baseline gap-1.5 mb-6">
                      <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                        {currency === 'RUB' ? tier.priceRUB : tier.priceUSD}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {tier.periodLabel}
                      </span>
                    </div>

                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

                    {/* Features List */}
                    <ul className="space-y-3 mb-8">
                      {tier.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <div className={`mt-0.5 rounded-full p-0.5 flex-shrink-0 ${
                            isPopular 
                              ? 'bg-cyber-violet/20 text-cyber-violet' 
                              : 'bg-cyber-cyan/15 text-cyber-cyan'
                          }`}>
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Buy Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleChoose(tier)}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ${
                        isPopular
                          ? 'bg-gradient-to-r from-cyber-violet to-cyber-cyan text-white shadow-glow-violet hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] hover:brightness-110 active:scale-[0.98]'
                          : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 active:scale-[0.98]'
                      }`}
                    >
                      <span>Получить доступ</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                    
                    <div className="text-[10px] text-center text-slate-500 font-mono mt-2">
                      Мгновенный ключ после проверки
                    </div>
                  </div>
                </GlassCard>
              </div>
            );
          })}
        </div>

        {/* Security / Quality Assurance Badges */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
            <ShieldCheck className="w-5 h-5 text-cyber-emerald flex-shrink-0" />
            <div className="text-left">
              <div className="text-xs font-semibold text-white">Hypervisor Protection</div>
              <div className="text-[10px] text-slate-400">0 детектов с 2024 года</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
            <Zap className="w-5 h-5 text-cyber-cyan flex-shrink-0" />
            <div className="text-left">
              <div className="text-xs font-semibold text-white">Instant Delivery</div>
              <div className="text-[10px] text-slate-400">Автовыдача в 1 клик</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
            <Clock className="w-5 h-5 text-cyber-violet flex-shrink-0" />
            <div className="text-left">
              <div className="text-xs font-semibold text-white">Заморозка времени</div>
              <div className="text-[10px] text-slate-400">Пауза при техработах</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
            <Crown className="w-5 h-5 text-cyber-amber flex-shrink-0" />
            <div className="text-left">
              <div className="text-xs font-semibold text-white">Премиум саппорт</div>
              <div className="text-[10px] text-slate-400">Помощь с настройкой</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
