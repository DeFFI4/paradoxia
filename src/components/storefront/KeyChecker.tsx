import React, { useState } from 'react';
import { 
  KeyRound, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Cpu, 
  ShieldAlert, 
  Sparkles, 
  Copy, 
  Check,
  RefreshCw,
  Zap
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { licenseService } from '../../services/licenseService';
import { soundService } from '../../services/soundService';
import { CheckResult, LicenseStatus } from '../../types/license';
import { useToast } from '../common/Toast';

interface KeyCheckerProps {
  initialKey?: string;
}

export const KeyChecker: React.FC<KeyCheckerProps> = ({ initialKey = '' }) => {
  const toast = useToast();
  const [keyInput, setKeyInput] = useState(initialKey);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [activating, setActivating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto format key as typing: PDX-XXXX-XXXX-XXXX
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    
    // Auto-dash insertion
    val = val.replace(/-/g, '');
    if (val.length > 3) {
      val = val.slice(0, 3) + '-' + val.slice(3);
    }
    if (val.length > 8) {
      val = val.slice(0, 8) + '-' + val.slice(8);
    }
    if (val.length > 13) {
      val = val.slice(0, 13) + '-' + val.slice(13);
    }
    if (val.length > 18) {
      val = val.slice(0, 18);
    }

    setKeyInput(val);
  };

  const handlePaste = async () => {
    soundService.playTone('click');
    try {
      const text = await navigator.clipboard.readText();
      const cleaned = text.trim().toUpperCase();
      setKeyInput(cleaned);
      toast.info('Ключ вставлен из буфера', 'Вставка');
    } catch {
      toast.error('Не удалось прочитать буфер обмена');
    }
  };

  const handleCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanKey = keyInput.trim().toUpperCase();
    if (!cleanKey) {
      toast.warning('Введите лицензионный ключ для проверки');
      return;
    }

    setLoading(true);
    soundService.playTone('burst');

    try {
      const res = await licenseService.checkLicense(cleanKey);
      setResult(res);
      if (res.valid) {
        soundService.playTone('success');
        toast.success(`Ключ найден: статус [${res.status?.toUpperCase()}]`, 'Проверка успешна');
      } else {
        soundService.playTone('alert');
        toast.error(res.message || 'Ключ не найден в базе данных', 'Ошибка проверки');
      }
    } catch (err) {
      soundService.playTone('alert');
      toast.error('Ошибка соединения с базой данных');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoActivate = async () => {
    if (!result?.key) return;
    setActivating(true);
    soundService.playTone('burst');

    try {
      const randomHWID = `HWID-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const activationRes = await licenseService.activateLicense(result.key, randomHWID);
      
      if (activationRes.success) {
        soundService.playTone('success');
        toast.success(`Ключ активирован! Привязан к ${randomHWID}`, 'Успешная активация');
        // Refresh check
        await handleCheck();
      } else {
        soundService.playTone('alert');
        toast.error(activationRes.message || 'Не удалось активировать ключ');
      }
    } catch {
      toast.error('Ошибка активации');
    } finally {
      setActivating(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    soundService.playTone('copy');
    setCopied(true);
    toast.success('Ключ скопирован в буфер');
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleKeys = [
    { label: 'Lifetime VIP', key: 'PDX-9K2M-4L8P-7W1Q' },
    { label: '30 Дней Активен', key: 'PDX-3B7X-9R2M-5T6Y' },
    { label: 'Неактивированный', key: 'PDX-8H3K-5Y2W-9P7N' },
    { label: 'Заморожен', key: 'PDX-2T6Y-8N4K-7W1M' },
  ];

  const getStatusBadge = (status?: LicenseStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            АКТИВЕН
          </span>
        );
      case 'unused':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 shadow-glow-cyan">
            <Sparkles className="w-3.5 h-3.5" />
            НЕ АКТИВИРОВАН
          </span>
        );
      case 'frozen':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <AlertTriangle className="w-3.5 h-3.5" />
            ЗАМОРОЖЕН
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-slate-500/20 text-slate-400 border border-slate-500/30">
            <Clock className="w-3.5 h-3.5" />
            ИСТЁК
          </span>
        );
      case 'banned':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-glow-crimson">
            <ShieldAlert className="w-3.5 h-3.5" />
            ЗАБЛОКИРОВАН
          </span>
        );
      default:
        return null;
    }
  };

  const calculateRemainingDays = (expiresAt?: string | null) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <section id="check-key" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background radial ambient lights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-cyber-cyan/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
            <KeyRound className="w-4 h-4 text-cyber-cyan" />
            <span className="text-xs uppercase font-mono tracking-widest text-slate-300">Валидатор ключей</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Проверка статуса{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyber-cyan via-white to-cyber-violet">
              лицензии
            </span>
          </h2>

          <p className="text-slate-400 text-sm">
            Введите ключ формата <span className="font-mono text-cyber-cyan">PDX-XXXX-XXXX-XXXX</span> для получения сведений о статусе, сроке действия и привязке к оборудованию.
          </p>
        </div>

        {/* Checker Card */}
        <GlassCard className="p-6 sm:p-8 bg-cosmic-850/80 border-white/15 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
          <form onSubmit={handleCheck} className="space-y-6">
            <div className="relative">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                Лицензионный ключ
              </label>
              
              <div className="relative flex items-center">
                <div className="absolute left-4 text-slate-500 pointer-events-none">
                  <KeyRound className="w-5 h-5 text-cyber-cyan/70" />
                </div>
                
                <input
                  type="text"
                  value={keyInput}
                  onChange={handleInputChange}
                  placeholder="PDX-XXXX-XXXX-XXXX"
                  maxLength={19}
                  className="w-full pl-12 pr-28 py-3.5 rounded-xl bg-cosmic-950/80 border border-white/10 focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan text-white font-mono text-base tracking-wider placeholder-slate-600 outline-none transition-all"
                />

                <div className="absolute right-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                  >
                    Вставить
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Sample Key Pickers */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-500 font-mono">Примеры:</span>
              {sampleKeys.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    soundService.playTone('click');
                    setKeyInput(s.key);
                  }}
                  className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-cyber-cyan border border-white/5 transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyber-cyan via-white to-cyber-violet text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition-all shadow-glow-cyan disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  Запрос к шлюзу...
                </span>
              ) : (
                <>
                  <Search className="w-4 h-4 text-black" />
                  <span>Проверить ключ</span>
                </>
              )}
            </button>
          </form>

          {/* Validation Result Box */}
          {result && (
            <div className="mt-8 pt-8 border-t border-white/10 animate-in fade-in duration-300">
              {result.valid ? (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-mono">Статус валидации</div>
                        <div className="text-white font-bold text-sm">Подлинный ключ Paradoxia</div>
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(result.status)}
                    </div>
                  </div>

                  {/* License Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-cosmic-900/60 border border-white/5">
                      <div className="flex items-center gap-2 text-slate-400 text-xs mb-1 font-mono">
                        <Clock className="w-4 h-4 text-cyber-violet" />
                        <span>Срок тарифа</span>
                      </div>
                      <div className="text-base font-bold text-white font-mono">
                        {result.duration_days === 9999 ? 'Бессрочный (Lifetime)' : `${result.duration_days} дней`}
                      </div>
                      {result.status === 'active' && result.expires_at && (
                        <div className="text-[11px] text-emerald-400 font-mono mt-1">
                          Осталось: ~{calculateRemainingDays(result.expires_at)} дн.
                        </div>
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-cosmic-900/60 border border-white/5">
                      <div className="flex items-center gap-2 text-slate-400 text-xs mb-1 font-mono">
                        <Cpu className="w-4 h-4 text-cyber-cyan" />
                        <span>Привязка к ПК (HWID)</span>
                      </div>
                      <div className="text-base font-bold text-white font-mono">
                        {result.hwid_bound ? (
                          <span className="text-emerald-400">Привязан</span>
                        ) : (
                          <span className="text-slate-400">Свободен</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-1">
                        {result.hwid_bound ? 'Зафиксирован за устройством' : 'Привяжется при первом входе'}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-cosmic-900/60 border border-white/5 sm:col-span-2 md:col-span-1">
                      <div className="flex items-center gap-2 text-slate-400 text-xs mb-1 font-mono">
                        <Sparkles className="w-4 h-4 text-cyber-amber" />
                        <span>Продукт</span>
                      </div>
                      <div className="text-base font-bold text-white font-mono">
                        {result.product_name || 'Paradoxia Cyber'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-1">
                        Полный пакет модулей
                      </div>
                    </div>
                  </div>

                  {/* Extra Action if Unused: Test Activation */}
                  {result.status === 'unused' && (
                    <div className="p-4 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-bold text-white">Ключ еще не активирован!</div>
                        <div className="text-xs text-slate-300">Вы можете симулировать активацию прямо сейчас для проверки привязки к оборудованию.</div>
                      </div>
                      <button
                        onClick={handleDemoActivate}
                        disabled={activating}
                        className="px-4 py-2 rounded-xl bg-cyber-cyan text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:brightness-110 transition-all flex-shrink-0"
                      >
                        <Zap className="w-4 h-4" />
                        <span>{activating ? 'Активация...' : 'Активировать (Тест)'}</span>
                      </button>
                    </div>
                  )}

                  {/* Copy Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleCopyKey(result.key || keyInput)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Скопировано' : 'Скопировать ключ'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">Недействительный ключ</div>
                    <div className="text-xs text-slate-300 mt-0.5">
                      {result.message || 'Ключ не найден в реестре или имеет некорректный формат.'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </GlassCard>
      </div>
    </section>
  );
};
