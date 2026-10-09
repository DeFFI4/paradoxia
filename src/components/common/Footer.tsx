import React from 'react';
import { Shield, Lock, Terminal, Cpu, Heart, Scale, FileText, AlertTriangle, RefreshCcw } from 'lucide-react';
import { soundService } from '../../services/soundService';
import { LegalTab } from './LegalModal';

interface FooterProps {
  onNavigateAdmin: () => void;
  onOpenKeyChecker: () => void;
  onOpenLegal?: (tab: LegalTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onNavigateAdmin, 
  onOpenKeyChecker,
  onOpenLegal 
}) => {
  const handleLegalClick = (tab: LegalTab) => {
    soundService.playTone('click');
    if (onOpenLegal) {
      onOpenLegal(tab);
    }
  };

  return (
    <footer className="relative mt-28 border-t border-white/[0.08] bg-cosmic-950/80 backdrop-blur-2xl overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyber-cyan/50 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-cyber-cyan/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyber-cyan/15 border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan font-bold font-sans">
                PX
              </div>
              <span className="font-bold text-lg tracking-wider text-white">
                PARADOXIA<span className="text-cyber-cyan">.</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Высокотехнологичный комплекс внешней и внутренней защиты, эмуляции драйверов Ring0 и тонкой кастомизации игрового процесса.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Kernel Level Security v2.6.4</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Навигация
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a
                  href="#features"
                  onClick={() => soundService.playTone('click')}
                  className="hover:text-cyber-cyan transition-colors"
                >
                  Модули и функции
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  onClick={() => soundService.playTone('click')}
                  className="hover:text-cyber-cyan transition-colors"
                >
                  Тарифы и подписки
                </a>
              </li>
              <li>
                <button
                  onClick={() => {
                    soundService.playTone('click');
                    onOpenKeyChecker();
                  }}
                  className="hover:text-cyber-cyan transition-colors text-left"
                >
                  Проверка лицензии
                </button>
              </li>
              <li>
                <a
                  href="#security"
                  onClick={() => soundService.playTone('click')}
                  className="hover:text-cyber-cyan transition-colors"
                >
                  Архитектура защиты
                </a>
              </li>
            </ul>
          </div>

          {/* Legal and Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-cyber-cyan" />
              Правила и документы
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => handleLegalClick('terms')}
                  className="hover:text-cyber-cyan transition-colors text-left flex items-center gap-1.5"
                >
                  <FileText className="w-3 h-3 text-slate-500" />
                  <span>Пользовательское соглашение</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLegalClick('privacy')}
                  className="hover:text-cyber-cyan transition-colors text-left flex items-center gap-1.5"
                >
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span>Политика конфиденциальности</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLegalClick('eula')}
                  className="hover:text-cyber-cyan transition-colors text-left flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3 h-3 text-slate-500" />
                  <span>Отказ от ответственности (EULA)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLegalClick('refund')}
                  className="hover:text-cyber-cyan transition-colors text-left flex items-center gap-1.5"
                >
                  <RefreshCcw className="w-3 h-3 text-slate-500" />
                  <span>Условия возврата средств</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Management & Admin Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Служебный вход
            </h4>
            <p className="text-xs text-slate-400">
              Доступ к панели управления лицензиями, аудиту и управлению статусом системы.
            </p>
            <button
              onClick={() => {
                soundService.playTone('click');
                onNavigateAdmin();
              }}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-2"
            >
              <Terminal className="w-3.5 h-3.5 text-cyber-cyan" />
              <span>Консоль администратора</span>
            </button>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <span>© 2026 Paradoxia Systems. Оплата через Platega.io. Разработано с</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline mx-0.5" />
            <span>в киберпространстве.</span>
          </div>
          <div className="text-center sm:text-right text-slate-500 max-w-md">
            Все материалы и программное обеспечение представлены исключительно в исследовательских и образовательных целях.
          </div>
        </div>
      </div>
    </footer>
  );
};
