import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  KeyRound,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import { userService } from '../../services/userService';
import { soundService } from '../../services/soundService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type AuthMode = 'demo' | 'key' | 'email';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('demo');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError(null);
    soundService.playTone('click');
    try {
      await userService.demoLogin();
      soundService.playTone('success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      soundService.playTone('alert');
      setError(err?.message || 'Ошибка входа в демо-аккаунт');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) {
      setError('Введите лицензионный ключ формата PDX-...');
      soundService.playTone('alert');
      return;
    }
    setIsLoading(true);
    setError(null);
    soundService.playTone('click');
    try {
      await userService.loginWithKey(licenseKey);
      soundService.playTone('success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      soundService.playTone('alert');
      setError(err?.message || 'Неверный лицензионный ключ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Заполните адрес электронной почты и пароль');
      soundService.playTone('alert');
      return;
    }
    setIsLoading(true);
    setError(null);
    soundService.playTone('click');
    try {
      await userService.loginWithEmail(email, password);
      soundService.playTone('success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      soundService.playTone('alert');
      setError(err?.message || 'Ошибка авторизации по почте');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-b from-[#0f121d] to-[#07090f] border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.15)]">
        {/* Neon Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-violet-500 to-cyan-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white tracking-wide">Вход в Личный Кабинет</h2>
              <p className="text-xs text-white/50">Авторизация пользователя Paradoxia OS</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundService.playTone('click');
              onClose();
            }}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Mode Tabs */}
        <div className="grid grid-cols-3 gap-1 p-2 m-4 mb-2 rounded-xl bg-black/40 border border-white/5">
          <button
            onClick={() => {
              soundService.playTone('click');
              setMode('demo');
              setError(null);
            }}
            className={`py-2 px-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'demo'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-Клик Demo</span>
          </button>

          <button
            onClick={() => {
              soundService.playTone('click');
              setMode('key');
              setError(null);
            }}
            className={`py-2 px-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'key'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Ключ PDX</span>
          </button>

          <button
            onClick={() => {
              soundService.playTone('click');
              setMode('email');
              setError(null);
            }}
            className={`py-2 px-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'email'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </button>
        </div>

        {/* Modal Form Area */}
        <div className="p-6 pt-2 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Mode 1: 1-Click Demo */}
          {mode === 'demo' && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-xl bg-cyan-500/[0.05] border border-cyan-500/20 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-medium">
                  <Terminal className="w-4 h-4" />
                  <span>МГНОВЕННЫЙ ТЕСТОВЫЙ ПРОФИЛЬ</span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  Войдите под профилем <span className="text-white font-mono font-semibold">SpecterX (VIP)</span> с
                  балансом <span className="text-cyan-300 font-semibold">1,450 ₽</span>, активной лицензией CS2 Private,
                  привязанным Telegram и предзаполненным логом безопасности.
                </p>
              </div>

              <button
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl font-medium text-sm text-black bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.35)] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <span>{isLoading ? 'Инициализация профиля...' : 'Войти в Demo-кабинет'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mode 2: License Key */}
          {mode === 'key' && (
            <form onSubmit={handleKeyLogin} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-white/60">
                  Лицензионный ключ Paradoxia
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    placeholder="PDX-CS2-PVT-XXXX-XXXX-XX"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs placeholder:text-white/20 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition-all uppercase"
                  />
                </div>
                <p className="text-[11px] text-white/40">
                  Если вы покупали ключ через бота или реселлера, введите его для доступа к панели.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl font-medium text-sm text-black bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.35)] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <span>{isLoading ? 'Проверка ключа...' : 'Авторизоваться по ключу'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Mode 3: Email / Password */}
          {mode === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-white/60">Электронная почта</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@paradoxia.space"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white text-xs placeholder:text-white/20 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-white/60">Мастер-пароль</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white text-xs placeholder:text-white/20 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl font-medium text-sm text-black bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.35)] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <span>{isLoading ? 'Проверка учетных данных...' : 'Войти в кабинет'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="pt-2 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-white/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Защищенное сквозное TLS 1.3 соединение с узлом Paradoxia</span>
          </div>
        </div>
      </div>
    </div>
  );
};
