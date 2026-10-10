import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  Wrench, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  ExternalLink, 
  Menu, 
  X, 
  KeyRound, 
  Layers,
  User,
  Wallet
} from 'lucide-react';
import { ServiceStatusConfig } from '../../types/license';
import { UserProfile } from '../../types/user';
import { soundService } from '../../services/soundService';
import { userService } from '../../services/userService';
import { AuthModal } from '../cabinet/AuthModal';

interface NavbarProps {
  statusConfig: ServiceStatusConfig | null;
  currentView: 'storefront' | 'admin' | 'cabinet';
  onNavigate: (view: 'storefront' | 'admin' | 'cabinet') => void;
  onOpenKeyChecker?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  statusConfig,
  currentView,
  onNavigate,
  onOpenKeyChecker,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundActive, setSoundActive] = useState(soundService.isEnabled());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(userService.getCurrentUser());
  const [authModalOpen, setAuthModalOpen] = useState(false);

  React.useEffect(() => {
    return userService.subscribe((u) => {
      setCurrentUser(u);
    });
  }, []);

  const handleToggleSound = () => {
    const nextState = soundService.toggleSound();
    setSoundActive(nextState);
    if (nextState) {
      soundService.playTone('click');
    }
  };

  const getStatusBadge = () => {
    if (!statusConfig) return null;
    switch (statusConfig.status) {
      case 'UNDETECTED':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>UNDETECTED</span>
          </div>
        );
      case 'TESTING':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
            <AlertTriangle className="w-3 h-3" />
            <span>TESTING</span>
          </div>
        );
      case 'UPDATING':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>UPDATING</span>
          </div>
        );
      case 'MAINTENANCE':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.25)]">
            <Wrench className="w-3 h-3" />
            <span>MAINTENANCE</span>
          </div>
        );
    }
  };

  const scrollToSection = (id: string) => {
    soundService.playTone('click');
    if (currentView !== 'storefront') {
      onNavigate('storefront');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-cosmic-950/75 border-b border-white/[0.08] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                soundService.playTone('click');
                onNavigate('storefront');
              }}
              className="flex items-center gap-3 group text-left focus:outline-none"
            >
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-cyan/20 via-cyber-violet/20 to-transparent p-0.5 border border-white/10 group-hover:border-cyber-cyan/50 transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.15)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.35)]">
                <div className="w-full h-full rounded-[10px] bg-cosmic-900/90 flex items-center justify-center">
                  <span className="font-sans font-black text-lg bg-clip-text text-transparent bg-gradient-to-r from-cyber-cyan via-white to-cyber-violet tracking-tighter">
                    PX
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-wider text-white font-sans group-hover:text-cyber-cyan transition-colors">
                  PARADOXIA<span className="text-cyber-cyan">.</span>
                </span>
                <span className="text-[10px] tracking-widest uppercase font-mono text-slate-400">
                  NEXT-GEN BYPASS
                </span>
              </div>
            </button>

            {/* Live Status indicator */}
            <div className="hidden md:flex items-center">
              {getStatusBadge()}
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 font-medium text-sm text-slate-300">
            <button
              onClick={() => scrollToSection('features')}
              className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              Модули
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              Тарифы
            </button>
            <button
              onClick={() => {
                if (onOpenKeyChecker) {
                  soundService.playTone('click');
                  onOpenKeyChecker();
                } else {
                  scrollToSection('key-checker');
                }
              }}
              className="px-3.5 py-2 rounded-lg hover:text-cyber-cyan hover:bg-cyber-cyan/10 transition-colors flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Проверка ключа
            </button>
            <button
              onClick={() => scrollToSection('security')}
              className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              Безопасность
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              FAQ
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              onClick={handleToggleSound}
              title={soundActive ? 'Выключить звуковые эффекты' : 'Включить звуковые эффекты'}
              className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white transition-all"
            >
              {soundActive ? <Volume2 className="w-4 h-4 text-cyber-cyan" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Telegram Community */}
            <a
              href="https://t.me/paradoxia_cyber"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundService.playTone('click')}
              className="px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 group"
            >
              <span>Telegram</span>
              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-cyber-cyan transition-colors" />
            </a>

            {/* User Cabinet / Auth CTA */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                {/* Wallet Balance Badge */}
                <button
                  onClick={() => {
                    soundService.playTone('click');
                    onNavigate('cabinet');
                  }}
                  className="px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-mono font-semibold text-cyan-300 transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                  title="Баланс кошелька - перейти в Личный Кабинет"
                >
                  <Wallet className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{currentUser.balance.toLocaleString('ru-RU')} ₽</span>
                </button>

                {/* Profile Button */}
                <button
                  onClick={() => {
                    soundService.playTone('click');
                    onNavigate('cabinet');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                    currentView === 'cabinet'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-200 hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="max-w-[100px] truncate">{currentUser.username}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  soundService.playTone('click');
                  setAuthModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Личный кабинет</span>
              </button>
            )}

            {/* Admin Switcher */}
            {currentView === 'storefront' ? (
              <button
                onClick={() => {
                  soundService.playTone('click');
                  onNavigate('admin');
                }}
                className="relative group px-4 py-2 rounded-xl text-xs font-semibold overflow-hidden transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyber-cyan/20 to-cyber-violet/20 border border-white/10 group-hover:border-cyber-cyan/50 rounded-xl transition-all" />
                <div className="relative flex items-center gap-1.5 text-slate-200 group-hover:text-white">
                  <ShieldAlert className="w-3.5 h-3.5 text-cyber-cyan" />
                  <span>Панель админа</span>
                </div>
              </button>
            ) : currentView === 'admin' ? (
              <button
                onClick={() => {
                  soundService.playTone('click');
                  onNavigate('storefront');
                }}
                className="px-4 py-2 rounded-xl bg-cyber-cyan/15 border border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/25 text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>На главную</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  soundService.playTone('click');
                  onNavigate('storefront');
                }}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>На главную</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={handleToggleSound}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300"
            >
              {soundActive ? <Volume2 className="w-4 h-4 text-cyber-cyan" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-white/10 bg-cosmic-950/95 backdrop-blur-3xl px-4 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="pb-3 border-b border-white/5 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Статус системы:</span>
            {getStatusBadge()}
          </div>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => scrollToSection('features')}
              className="text-left px-3 py-2 text-sm text-slate-200 hover:text-white hover:bg-white/5 rounded-lg"
            >
              Модули & Функции
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="text-left px-3 py-2 text-sm text-slate-200 hover:text-white hover:bg-white/5 rounded-lg"
            >
              Тарифные планы
            </button>
            <button
              onClick={() => scrollToSection('key-checker')}
              className="text-left px-3 py-2 text-sm text-cyber-cyan hover:bg-cyber-cyan/10 rounded-lg flex items-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              Проверить лицензионный ключ
            </button>
            <button
              onClick={() => scrollToSection('security')}
              className="text-left px-3 py-2 text-sm text-slate-200 hover:text-white hover:bg-white/5 rounded-lg"
            >
              Безопасность ядра
            </button>
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            {currentUser ? (
              <button
                onClick={() => {
                  soundService.playTone('click');
                  setMobileMenuOpen(false);
                  onNavigate('cabinet');
                }}
                className="w-full py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-center text-xs font-semibold text-cyan-300 flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4 text-cyan-400" />
                <span>Личный кабинет ({currentUser.balance.toLocaleString('ru-RU')} ₽)</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  soundService.playTone('click');
                  setMobileMenuOpen(false);
                  setAuthModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-white/10 border border-white/20 text-center text-xs font-semibold text-white flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4 text-cyan-400" />
                <span>Войти в Личный кабинет</span>
              </button>
            )}

            {currentView === 'storefront' ? (
              <button
                onClick={() => {
                  soundService.playTone('click');
                  setMobileMenuOpen(false);
                  onNavigate('admin');
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyber-cyan/20 to-cyber-violet/20 border border-cyber-cyan/40 text-center text-xs font-semibold text-white flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 text-cyber-cyan" />
                <span>Вход в Панель управления</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  soundService.playTone('click');
                  setMobileMenuOpen(false);
                  onNavigate('storefront');
                }}
                className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-center text-xs font-semibold text-slate-200 flex items-center justify-center gap-2"
              >
                <Layers className="w-4 h-4 text-cyber-cyan" />
                <span>Вернуться на витрину</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal for Guests */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => onNavigate('cabinet')}
      />
    </header>
  );
};
