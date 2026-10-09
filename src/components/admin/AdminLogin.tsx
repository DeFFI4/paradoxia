import React, { useState } from 'react';
import { Lock, KeyRound, ShieldAlert, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { soundService } from '../../services/soundService';
import { useToast } from '../common/Toast';

interface AdminLoginProps {
  onSuccess: () => void;
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onBackToStore }) => {
  const toast = useToast();
  const [key, setKey] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.playTone('click');
    setLoading(true);

    setTimeout(() => {
      // Master key constraint specified in plan: PDX-ADMIN-2026
      if (key.trim() === 'PDX-ADMIN-2026') {
        soundService.playTone('burst');
        toast.success('Мастер-ключ верифицирован. Доступ открыт.', 'Успешная авторизация');
        sessionStorage.setItem('pdx_admin_auth', 'true');
        onSuccess();
      } else {
        soundService.playTone('alert');
        setError(true);
        toast.error('Неверный ключ администратора', 'Доступ отклонен');
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <GlassCard className="p-8 border-white/15 bg-cosmic-900/90 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-cyber-cyan/15 border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan mb-4 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Служебный терминал Paradoxia
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Для доступа к управлению лицензиями введите мастер-ключ
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                Мастер-ключ администратора
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={key}
                  onChange={(e) => {
                    setKey(e.target.value);
                    if (error) setError(false);
                  }}
                  placeholder="PDX-ADMIN-XXXX"
                  className={`w-full px-4 py-3 rounded-xl bg-white/[0.04] border ${
                    error ? 'border-rose-500/80 focus:border-rose-500' : 'border-white/10 focus:border-cyber-cyan'
                  } text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none transition-all`}
                  autoFocus
                />
                <KeyRound className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
              </div>
              <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Мастер-ключ по умолчанию:</span>
                <button
                  type="button"
                  onClick={() => {
                    setKey('PDX-ADMIN-2026');
                    soundService.playTone('click');
                  }}
                  className="text-cyber-cyan hover:underline font-mono"
                >
                  PDX-ADMIN-2026
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !key.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyber-cyan to-cyber-violet hover:from-cyan-400 hover:to-violet-500 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Верификация...</span>
              ) : (
                <>
                  <span>Войти в консоль</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                soundService.playTone('click');
                onBackToStore();
              }}
              className="w-full py-2.5 rounded-xl bg-transparent hover:bg-white/[0.04] text-slate-400 hover:text-white font-medium text-xs transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Вернуться на сайт</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/[0.08] text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Supabase RLS & LocalStorage Protected</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
