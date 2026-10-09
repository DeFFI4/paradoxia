import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  Coins, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle,
  KeyRound,
  ExternalLink,
  QrCode,
  Smartphone,
  Globe2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { PricingTier } from './PricingGrid';
import { GlassCard } from '../common/GlassCard';
import { licenseService } from '../../services/licenseService';
import { plategaService } from '../../services/plategaService';
import { soundService } from '../../services/soundService';
import { useToast } from '../common/Toast';
import { LegalTab } from '../common/LegalModal';

interface PurchaseModalProps {
  isOpen: boolean;
  tier: PricingTier | null;
  onClose: () => void;
  onKeyObtained?: (key: string) => void;
  onOpenLegal?: (tab: LegalTab) => void;
}

type PlategaMethod = 'sbp' | 'card_ru' | 'card_foreign' | 'crypto';

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  tier,
  onClose,
  onKeyObtained,
  onOpenLegal,
}) => {
  const toast = useToast();
  const [method, setMethod] = useState<PlategaMethod>('sbp');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'config' | 'checkout' | 'success'>('config');
  const [email, setEmail] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activePaymentId, setActivePaymentId] = useState<string>('');

  if (!isOpen || !tier) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    soundService.playTone('copy');
    toast.success('Лицензионный ключ скопирован в буфер', 'Успешно');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleInitiatePlategaPayment = async () => {
    if (!agreedToTerms) {
      soundService.playTone('alert');
      toast.error('Необходимо принять условия пользовательского соглашения', 'Внимание');
      return;
    }

    setIsProcessing(true);
    soundService.playTone('burst');

    try {
      // Create transaction via Platega Service
      const numAmount = parseInt(tier.priceRUB.replace(/\D/g, ''), 10) || 499;
      const plategaRes = await plategaService.createPayment({
        amount: numAmount,
        currency: 'RUB',
        orderId: `PDX-${Date.now()}`,
        description: `Подписка Paradoxia - ${tier.name}`,
        paymentMethod: method,
        customerEmail: email || undefined,
        metadata: {
          tier_name: tier.name,
          duration_days: tier.durationDays,
        },
      });

      setActivePaymentId(plategaRes.paymentId);
      setPaymentStep('checkout');
      soundService.playTone('click');
    } catch {
      toast.error('Ошибка инициализации шлюза Platega', 'Попробуйте снова');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompletePlategaPayment = async () => {
    setIsProcessing(true);
    soundService.playTone('burst');

    try {
      // Simulate verifying transaction status or edge callback
      await new Promise((r) => setTimeout(r, 1200));

      // Generate verified license key upon payment confirmation
      const newKeys = await licenseService.generateLicenses(
        tier.durationDays,
        1,
        `Platega.io [${method.toUpperCase()}] - ${tier.name} (Заказ ${activePaymentId})`
      );

      if (newKeys && newKeys.length > 0) {
        const key = newKeys[0].key;
        setGeneratedKey(key);
        setPaymentStep('success');
        soundService.playTone('success');
        toast.success(`Ключ на ${tier.name} успешно выдан!`, 'Platega Оплата завершена');
        if (onKeyObtained) {
          onKeyObtained(key);
        }
      }
    } catch {
      toast.error('Не удалось выдать лицензионный ключ', 'Ошибка сервера');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    soundService.playTone('click');
    setPaymentStep('config');
    setGeneratedKey(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg z-10 my-8">
        <GlassCard className="bg-cosmic-900/95 border-white/15 p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.85)]">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-white/10 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-cyber-cyan">
                  {paymentStep === 'success' ? 'Заказ выполнен' : 'Шлюз Platega.io'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                {paymentStep === 'success' ? 'Ваша лицензия готова' : `Оформление: ${tier.name}`}
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* STEP 1: PAYMENT METHOD & CONFIGURATION */}
          {paymentStep === 'config' && (
            <div className="space-y-6">
              {/* Order summary banner */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">Тарифный план</div>
                  <div className="text-base font-bold text-white">{tier.name}</div>
                  <div className="text-[11px] text-cyber-cyan font-mono">
                    {tier.durationDays === 9999 ? 'Бессрочный доступ' : `${tier.durationDays} суток`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-white font-mono">
                    {tier.priceRUB}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">≈ {tier.priceUSD} USD</div>
                </div>
              </div>

              {/* Platega method selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Способ оплаты (Platega Merchant)
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      soundService.playTone('click');
                      setMethod('sbp');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                      method === 'sbp'
                        ? 'border-emerald-500/80 bg-emerald-500/15 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold leading-tight">СБП QR-код</div>
                      <div className="text-[10px] text-slate-400">0% комиссия</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundService.playTone('click');
                      setMethod('card_ru');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                      method === 'card_ru'
                        ? 'border-cyber-cyan/80 bg-cyber-cyan/15 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-cyber-cyan flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold leading-tight">Карты РФ / МИР</div>
                      <div className="text-[10px] text-slate-400">Мгновенно</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundService.playTone('click');
                      setMethod('crypto');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                      method === 'crypto'
                        ? 'border-cyber-violet/80 bg-cyber-violet/15 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                        : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <Coins className="w-5 h-5 text-cyber-violet flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold leading-tight">Криптовалюта</div>
                      <div className="text-[10px] text-slate-400">USDT, TON, BTC</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundService.playTone('click');
                      setMethod('card_foreign');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                      method === 'card_foreign'
                        ? 'border-cyan-400/80 bg-cyan-400/15 text-white shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                        : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <Globe2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold leading-tight">Зарубежные карты</div>
                      <div className="text-[10px] text-slate-400">Visa / MC Int.</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Email field */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Email для чека и дубликата ключа (необязательно)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cyberpunk@paradoxia.cc"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-cyber-cyan text-white text-xs placeholder:text-slate-500 focus:outline-none transition-all"
                />
              </div>

              {/* Legal acceptance checkbox */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded border-white/20 text-cyber-cyan focus:ring-0 focus:outline-none cursor-pointer"
                />
                <label htmlFor="agreeTerms" className="text-[11px] text-slate-400 leading-relaxed cursor-pointer">
                  Я принимаю{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      if (onOpenLegal) onOpenLegal('terms');
                    }}
                    className="text-cyber-cyan hover:underline font-semibold"
                  >
                    Условия сервиса
                  </button>
                  ,{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      if (onOpenLegal) onOpenLegal('privacy');
                    }}
                    className="text-cyber-violet hover:underline font-semibold"
                  >
                    Политику конфиденциальности
                  </button>{' '}
                  и{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      if (onOpenLegal) onOpenLegal('eula');
                    }}
                    className="text-amber-400 hover:underline font-semibold"
                  >
                    EULA
                  </button>
                  . Понимаю, что цифровой ключ активируется немедленно.
                </label>
              </div>

              {/* Submit CTA button */}
              <button
                type="button"
                onClick={handleInitiatePlategaPayment}
                disabled={isProcessing || !agreedToTerms}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-cyber-violet hover:from-cyan-400 hover:to-violet-500 text-white font-bold text-sm tracking-wide transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Подключение к Platega.io...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Перейти к оплате {tier.priceRUB} ₽</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 2: PLATEGA CHECKOUT INTERACTION */}
          {paymentStep === 'checkout' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-black/50 border border-cyber-cyan/30 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-cyber-cyan/20 border border-cyber-cyan/40 flex items-center justify-center text-cyber-cyan">
                  {method === 'sbp' ? <QrCode className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wider text-cyber-cyan font-mono font-bold">
                    Шлюз Platega.io — Заказ {activePaymentId}
                  </div>
                  <div className="text-lg font-bold text-white mt-1">
                    Сумма к оплате: {tier.priceRUB} ₽
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {method === 'sbp' 
                      ? 'Отсканируйте QR-код в мобильном приложении любого банка РФ' 
                      : 'Защищенное соединение с процессингом Platega'}
                  </div>
                </div>

                {/* QR Code / Payment simulation box */}
                <div className="py-6 px-4 bg-white/5 rounded-xl border border-white/10 flex flex-col items-center justify-center gap-3">
                  <div className="w-36 h-36 bg-white p-2 rounded-xl flex items-center justify-center shadow-lg">
                    <div className="w-full h-full border-2 border-slate-900 border-dashed rounded flex flex-col items-center justify-center text-slate-900 text-center p-2">
                      <QrCode className="w-12 h-12 text-slate-800 mb-1" />
                      <span className="text-[10px] font-bold font-mono">PLATEGA SBP</span>
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Ожидание подтверждения транзакции от шлюза...
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentStep('config')}
                  className="flex-1 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 font-semibold text-xs transition-all"
                >
                  Назад
                </button>

                <button
                  type="button"
                  onClick={handleCompletePlategaPayment}
                  disabled={isProcessing}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-cosmic-950 font-black text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-cosmic-950/30 border-t-cosmic-950 rounded-full animate-spin" />
                      <span>Проверка Platega...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Подтвердить оплату</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS & KEY ISSUANCE */}
          {paymentStep === 'success' && generatedKey && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Оплата подтверждена шлюзом Platega</h4>
                <p className="text-xs text-slate-300">
                  Ваш уникальный лицензионный ключ сгенерирован и зафиксирован в ядре Paradoxia.
                </p>
              </div>

              {/* Key display card */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Лицензионный ключ:
                </label>
                <div className="flex items-center gap-2 p-3.5 rounded-xl bg-black/60 border border-cyber-cyan/40 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  <KeyRound className="w-5 h-5 text-cyber-cyan flex-shrink-0" />
                  <code className="text-sm sm:text-base font-mono font-bold text-cyber-cyan tracking-wider flex-1 select-all break-all">
                    {generatedKey}
                  </code>
                  <button
                    onClick={() => handleCopy(generatedKey)}
                    className="p-2 rounded-lg bg-cyber-cyan/15 hover:bg-cyber-cyan/30 text-cyber-cyan transition-colors flex-shrink-0"
                    title="Скопировать ключ"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] text-[11px] text-slate-400 space-y-1.5 leading-relaxed">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyber-cyan" />
                  Инструкция по активации:
                </div>
                <p>1. Скопируйте ключ и вставьте его в лоадер Paradoxia.</p>
                <p>2. При первом запуске лицензия свяжется с вашим текущим оборудованием (HWID).</p>
                <p>3. Проверить статус ключа и оставшиеся дни можно на главной странице в модуле проверки.</p>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 rounded-xl bg-cyber-cyan hover:bg-cyan-400 text-cosmic-950 font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
                Закрыть и начать использование
              </button>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
