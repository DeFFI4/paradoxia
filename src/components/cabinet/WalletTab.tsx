import React, { useState } from 'react';
import {
  Wallet,
  PlusCircle,
  Ticket,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
} from 'lucide-react';
import { UserProfile, WalletTransaction } from '../../types/user';
import { userService } from '../../services/userService';
import { soundService } from '../../services/soundService';

interface WalletTabProps {
  user: UserProfile;
  transactions: WalletTransaction[];
  onOpenTopUp: () => void;
  onRefresh: () => void;
}

export const WalletTab: React.FC<WalletTabProps> = ({
  user,
  transactions,
  onOpenTopUp,
  onRefresh,
}) => {
  const [voucherCode, setVoucherCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [voucherFeedback, setVoucherFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const handleRedeemVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;

    setIsRedeeming(true);
    setVoucherFeedback(null);
    soundService.playTone('click');

    try {
      const res = await userService.redeemVoucher(user.id, voucherCode);
      if (res.success) {
        soundService.playTone('success');
        setVoucherFeedback({ success: true, message: res.message });
        setVoucherCode('');
        onRefresh();
      } else {
        soundService.playTone('alert');
        setVoucherFeedback({ success: false, message: res.message });
      }
    } catch (err: any) {
      soundService.playTone('alert');
      setVoucherFeedback({ success: false, message: err?.message || 'Ошибка активации кода' });
    } finally {
      setIsRedeeming(false);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'all') return true;
    if (filterType === 'topup') return t.type === 'topup' || t.type === 'voucher_redeem';
    if (filterType === 'expense') return t.type === 'purchase' || t.type === 'extend';
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Row: Balance Card + Voucher Redemption */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Wallet Balance Card (1 col) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#121626] to-[#080a12] border border-cyan-500/20 p-6 flex flex-col justify-between space-y-6 shadow-[0_0_40px_rgba(6,182,212,0.1)]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 text-[10px] font-mono rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                INTERNAL BALANCE
              </span>
            </div>

            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-white/50">Доступный остаток</div>
              <div className="text-4xl font-extrabold font-mono text-white tracking-tight mt-1">
                {user.balance.toLocaleString('ru-RU')}{' '}
                <span className="text-cyan-400 font-semibold text-2xl">₽</span>
              </div>
            </div>

            <p className="text-xs text-white/50 leading-relaxed">
              Мгновенная оплата любых подписок, продление лицензий со скидкой 10% и покупка приватных аддонов.
            </p>
          </div>

          <button
            onClick={() => {
              soundService.playTone('click');
              onOpenTopUp();
            }}
            className="w-full py-3.5 px-4 rounded-xl font-medium text-xs text-black bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.35)]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Пополнить баланс</span>
          </button>
        </div>

        {/* Voucher & Promo Code Card (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-[#090c16] border border-white/10 p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Ticket className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white tracking-wide">Активация промокода или ваучера</h3>
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              Введите подарочный промокод от реселлера, стримера или администрации Paradoxia для мгновенного начисления
              рублей на баланс.
            </p>
          </div>

          <form onSubmit={handleRedeemVoucher} className="space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                  <Ticket className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  placeholder="Введите код, например: PARADOXIA2026"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs placeholder:text-white/20 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 uppercase tracking-wider"
                />
              </div>

              <button
                type="submit"
                disabled={isRedeeming || !voucherCode.trim()}
                className="w-full sm:w-auto py-3 px-6 rounded-xl font-medium text-xs text-black bg-gradient-to-r from-emerald-400 to-cyan-300 hover:from-emerald-300 hover:to-cyan-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-40"
              >
                <span>{isRedeeming ? 'Активация...' : 'Активировать'}</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Hint Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
              <span className="text-white/40">Тестовые ваучеры:</span>
              <button
                type="button"
                onClick={() => setVoucherCode('PARADOXIA2026')}
                className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300"
              >
                PARADOXIA2026 (+500 ₽)
              </button>
              <button
                type="button"
                onClick={() => setVoucherCode('BOOST1000')}
                className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300"
              >
                BOOST1000 (+1,000 ₽)
              </button>
              <button
                type="button"
                onClick={() => setVoucherCode('WELCOME250')}
                className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300"
              >
                WELCOME250 (+250 ₽)
              </button>
            </div>

            {/* Feedback Message */}
            {voucherFeedback && (
              <div
                className={`p-3 rounded-xl border font-mono text-xs flex items-center gap-2.5 ${
                  voucherFeedback.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                {voucherFeedback.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{voucherFeedback.message}</span>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Transactions History Table */}
      <div className="rounded-2xl bg-[#090b14] border border-white/10 overflow-hidden space-y-4">
        {/* Table Top Header */}
        <div className="p-6 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">История операций по кошельку</h3>
            <p className="text-xs text-white/50">Полный реестр пополнений, активаций и продлений</p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundService.playTone('click');
                setFilterType('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                filterType === 'all'
                  ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                  : 'text-white/50 hover:text-white bg-white/5'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => {
                soundService.playTone('click');
                setFilterType('topup');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                filterType === 'topup'
                  ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                  : 'text-white/50 hover:text-white bg-white/5'
              }`}
            >
              Пополнения (+)
            </button>
            <button
              onClick={() => {
                soundService.playTone('click');
                setFilterType('expense');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                filterType === 'expense'
                  ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                  : 'text-white/50 hover:text-white bg-white/5'
              }`}
            >
              Списания (-)
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/40 text-white/40 font-mono text-[11px] uppercase border-y border-white/5">
              <tr>
                <th className="px-6 py-3">Тип</th>
                <th className="px-6 py-3">Описание операции</th>
                <th className="px-6 py-3">Дата и время</th>
                <th className="px-6 py-3">Статус</th>
                <th className="px-6 py-3 text-right">Сумма</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-white/40">
                    Транзакций не найдено
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isPositive = tx.amount > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded-lg border ${
                              isPositive
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                            }`}
                          >
                            {isPositive ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          </div>
                          <span className="uppercase text-[11px] text-white/70">
                            {tx.type === 'topup'
                              ? 'Пополнение'
                              : tx.type === 'voucher_redeem'
                              ? 'Ваучер'
                              : tx.type === 'purchase'
                              ? 'Покупка'
                              : 'Продление'}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-sans text-xs text-white">
                        {tx.description}
                      </td>

                      <td className="px-6 py-4 text-white/50 text-[11px]">
                        {new Date(tx.created_at).toLocaleString('ru-RU')}
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {tx.status === 'completed' ? 'Зачислено' : tx.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right font-bold text-sm">
                        <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>
                          {isPositive ? `+${tx.amount}` : tx.amount} ₽
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
