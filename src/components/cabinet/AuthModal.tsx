import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  User,
  Send,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { userService } from '../../services/userService';
import { soundService } from '../../services/soundService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialAction?: 'login' | 'register';
}

type AuthAction = 'login' | 'register';
type LoginMode = 'demo' | 'key' | 'email';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialAction = 'login',
}) => {
  const [action, setAction] = useState<AuthAction>(initialAction);
  const [loginMode, setLoginMode] = useState<LoginMode>('demo');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [licenseKey, setLicenseKey] = useState('');

  // Register form state
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regTelegram, setRegTelegram] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAction(initialAction);
      setError(null);
    }
  }, [isOpen, initialAction]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundService.playTone('click');
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

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
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Заполните адрес электронной почты и пароль');
      soundService.playTone('alert');
      return;
    }
    setIsLoading(true);
    setError(null);
    soundService.playTone('click');
    try {
      await userService.loginWithEmail(loginEmail, loginPassword);
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailTrimmed = regEmail.trim();
    const userTrimmed = regUsername.trim();

    if (!emailTrimmed) {
      setError('Укажите адрес электронной почты');
      soundService.playTone('alert');
      return;
    }
    if (!userTrimmed) {
      setError('Укажите желаемый никнейм');
      soundService.playTone('alert');
      return;
    }
    if (!regPassword) {
      setError('Придумайте надёжный пароль');
      soundService.playTone('alert');
      return;
    }
    if (regPassword.length < 6) {
      setError('Минимальная длина пароля — 6 символов');
      soundService.playTone('alert');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Пароли не совпадают. Проверьте правильность ввода');
      soundService.playTone('alert');
      return;
    }

    setIsLoading(true);
    soundService.playTone('click');

    try {
      await userService.register({
        email: emailTrimmed,
        username: userTrimmed,
        password: regPassword,
        telegram_username: regTelegram.trim() || undefined,
      });

      soundService.playTone('success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      soundService.playTone('alert');
      setError(err?.message || 'Не удалось завершить регистрацию');
    } finally {
      setIsLoading(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={() => {
        soundService.playTone('click');
        onClose();
      }}
    >
      <div
        className="relative w-full max-w-md my-auto overflow-hidden rounded-2xl bg-gradient-to-b from-[#0f121d] to-[#07090f] border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Neon Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-violet-500 to-cyan-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white tracking-wide">
                {action === 'login' ? 'Вход в Личный Кабинет' : 'Регистрация в Paradoxia'}
              </h2>
              <p className="text-xs text-white/50">
                {action === 'login'
                  ? 'Авторизация пользователя Paradoxia OS'
                  : 'Создание нового защищённого профиля'}
              </p>
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

        {/* Main Action Switcher: Вход / Регистрация */}
        <div className="grid grid-cols-2 gap-1 p-1.5 mx-6 mt-4 rounded-xl bg-black/50 border border-white/10">
          <button
            type="button"
            onClick={() => {
              soundService.playTone('click');
              setAction('login');
              setError(null);
            }}
            className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              action === 'login'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Вход</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundService.playTone('click');
              setAction('register');
              setError(null);
            }}
            className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              action === 'register'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Регистрация</span>
          </button>
        </div>

        {/* Modal Body / Scrollable Area */}
        <div className="p-6 pt-3 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ===================== РЕЖИМ 1: ВХОД ===================== */}
          {action === 'login' && (
            <div className="space-y-4">
              {/* Login Sub-Tabs */}
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-black/40 border border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    soundService.playTone('click');
                    setLoginMode('demo');
                    setError(null);
                  }}
                  className={`py-1.5 px-2 text-[11px] font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    loginMode === 'demo'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>1-Клик Demo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundService.playTone('click');
                    setLoginMode('key');
                    setError(null);
                  }}
                  className={`py-1.5 px-2 text-[11px] font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    loginMode === 'key'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Ключ PDX</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundService.playTone('click');
                    setLoginMode('email');
                    setError(null);
                  }}
                  className={`py-1.5 px-2 text-[11px] font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    loginMode === 'email'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <Mail className="w-3 h-3" />
                  <span>Почта</span>
                </button>
              </div>

              {/* Demo Login Tab */}
              {loginMode === 'demo' && (
                <div className="space-y-4 py-1">
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
                    type="button"
                    onClick={handleDemoLogin}
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-xl font-medium text-sm text-black bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.35)] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <span>{isLoading ? 'Инициализация профиля...' : 'Войти в Demo-кабинет'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* License Key Tab */}
              {loginMode === 'key' && (
                <form onSubmit={handleKeyLogin} className="space-y-4 py-1">
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

              {/* Email / Password Tab */}
              {loginMode === 'email' && (
                <form onSubmit={handleEmailLogin} className="space-y-3.5 py-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-white/60">Электронная почта</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
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
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
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

              {/* Bottom switch to Register */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    soundService.playTone('click');
                    setAction('register');
                    setError(null);
                  }}
                  className="text-xs text-white/50 hover:text-cyan-300 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Впервые в Paradoxia?</span>
                  <span className="text-cyan-400 font-semibold underline underline-offset-2">Создать аккаунт</span>
                </button>
              </div>
            </div>
          )}

          {/* ===================== РЕЖИМ 2: РЕГИСТРАЦИЯ ===================== */}
          {action === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5 py-1">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-white/60">
                  Электронная почта <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="user@paradoxia.space"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs placeholder:text-white/20 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-white/60">
                    Никнейм <span className="text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="CyberPilot"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs placeholder:text-white/20 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-white/60">
                    Telegram <span className="text-white/30 text-[10px] lowercase">(опционально)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                      <Send className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      value={regTelegram}
                      onChange={(e) => setRegTelegram(e.target.value)}
                      placeholder="@username"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs placeholder:text-white/20 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-white/60">
                  Пароль <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Минимум 6 символов"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs placeholder:text-white/20 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-white/60">
                  Подтверждение пароля <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Повторите пароль"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs placeholder:text-white/20 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl font-medium text-sm text-black bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.35)] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <span>{isLoading ? 'Создание учетной записи...' : 'Зарегистрироваться в Paradoxia'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Bottom switch to Login */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    soundService.playTone('click');
                    setAction('login');
                    setError(null);
                  }}
                  className="text-xs text-white/50 hover:text-cyan-300 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Уже есть аккаунт?</span>
                  <span className="text-cyan-400 font-semibold underline underline-offset-2">Войти в кабинет</span>
                </button>
              </div>
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

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
};
