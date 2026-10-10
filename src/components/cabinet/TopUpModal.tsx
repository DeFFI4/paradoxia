import React, { useState } from 'react';
import {
  X,
  Wallet,
  CreditCard,
  QrCode,
  Coins,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { userService } from '../../services/userService';
import { soundService } from '../../services/soundService';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess?: (amount: number) => void;
}

const PRESETS = [
  { amount: 250, label: '250 ₽', bonus: 0 },
  { amount: 500, label: '500 ₽', bonus: 0 },
  { amount: 1000, label: '1,000 ₽', bonus: 5, badge: '+5% Бонус' },
  { amount: 2500, label: '2,500 ₽', bonus: 10, badge: '+10% Бонус' },
];

const METHODS = [
  { id: 'sbp', name: 'СБП (Система быстрых платежей)', icon: QrCode, desc: 'Без комиссии • 0 сек' },
  { id: 'card', name: 'Банковская карта (МИР, Visa, MC)', icon: CreditCard, desc: 'Российские и зарубежные карты' },
  { id: 'crypto', name: 'Криптовалюта (USDT, TON, BTC)', icon: Coins, desc: 'Автоматический шлюз • 0%' },
];

export const TopUpModal: React.FC<TopUpModalProps> = ({ isOpen, onClose, userId, onSuccess }) => {
  const [selectedPreset, setSelectedPreset] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('sbp');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentAmount = customAmount ? Math.max(0, parseInt(customAmount) || 0) : selectedPreset;
  let bonusPercent = 0;
  if (currentAmount >= 2500) bonusPercent = 10;
  else if (currentAmount >= 1000) bonusPercent = 5;

  const bonusAmount = Math.round((currentAmount * bonusPercent) / 100);
  const totalCredited = currentAmount + bonusAmount;

  const handlePresetSelect = (amt: number) => {
    soundService.playTone('click');
    setSelectedPreset(amt);
    setCustomAmount('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setCustomAmount(val);
  };

  const handleTopUp = async () => {
    if (currentAmount < 50) {
      soundService.playTone('alert');
      return;
    }

    setIsLoading(true);
    soundService.playTone('click');

    try {
      const methodObj = METHODS.find((m) => m.id === selectedMethod);
      const methodName = methodObj?.name || 'Электронный платеж';

      await userService.topUpBalance(userId, totalCredited, methodName);
      soundService.playTone('success');
      setSuccessMsg(`Баланс успешно пополнен на +${totalCredited} ₽!`);

      if (onSuccess) {
        onSuccess(totalCredited);
      }

      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    } catch (err) {
      soundService.playTone('alert');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-gradient-to-b from-[#0e111a] to-[#07080d] border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.18)]">
        {/* Top Glow Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-500" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white tracking-wide">Пополнение баланса</h2>
              <p className="text-xs text-white/50">Мгновенное зачисление средств на кошелек</p>
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

        <div className="p-6 space-y-5">
          {successMsg ? (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-base font-semibold text-white">{successMsg}</div>
              <p className="text-xs text-white/50 font-mono">Транзакция зарегистрирована в реестре кошелька</p>
            </div>
          ) : (
            <>
              {/* Presets Grid */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-white/60">
                  Выберите сумму или введите свою
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESETS.map((p) => {
                    const isSelected = !customAmount && selectedPreset === p.amount;
                    return (
                      <button
                        key={p.amount}
                        type="button"
                        onClick={() => handlePresetSelect(p.amount)}
                        className={`relative p-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-400/80 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                            : 'bg-black/30 border-white/5 text-white/70 hover:bg-white/[0.04] hover:text-white'
                        }`}
                      >
                        {p.badge && (
                          <span className="absolute -top-2 right-2 px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
                            {p.badge}
                          </span>
                        )}
                        <div className="font-semibold text-sm">{p.label}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Amount Input */}
                <div className="relative mt-2">
                  <input
                    type="text"
                    value={customAmount}
                    onChange={handleCustomChange}
                    placeholder="Либо введите любую другую сумму в ₽ (мин. 50 ₽)"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono placeholder:text-white/20 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/40 transition-all"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-white/40 font-mono">RUB</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-white/60">Способ оплаты</label>
                <div className="space-y-2">
                  {METHODS.map((m) => {
                    const isSelected = selectedMethod === m.id;
                    const IconComp = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          soundService.playTone('click');
                          setSelectedMethod(m.id);
                        }}
                        className={`w-full p-3 rounded-xl border text-left flex items-center gap-3.5 transition-all ${
                          isSelected
                            ? 'bg-cyan-500/10 border-cyan-500/50 text-white'
                            : 'bg-black/30 border-white/5 text-white/60 hover:bg-white/[0.03] hover:text-white'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg border ${
                            isSelected
                              ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                              : 'bg-white/5 border-white/10 text-white/40'
                          }`}
                        >
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-medium text-white">{m.name}</div>
                          <div className="text-[11px] text-white/40">{m.desc}</div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-white/20'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 font-mono text-xs space-y-1.5">
                <div className="flex justify-between text-white/50">
                  <span>Сумма к оплате:</span>
                  <span className="text-white">{currentAmount} ₽</span>
                </div>
                {bonusAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Бонус пополнения ({bonusPercent}%):
                    </span>
                    <span>+{bonusAmount} ₽</span>
                  </div>
                )}
                <div className="pt-2 border-t border-white/10 flex justify-between text-white font-semibold text-sm">
                  <span>Зачисление на баланс:</span>
                  <span className="text-cyan-400">{totalCredited} ₽</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleTopUp}
                disabled={isLoading || currentAmount < 50}
                className="w-full py-3.5 px-4 rounded-xl font-medium text-sm text-black bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.35)] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <span>{isLoading ? 'Обработка платежа...' : `Пополнить на ${totalCredited} ₽`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
