import React, { useState, useEffect } from 'react';
import { Ban, Plus, Search, Trash2, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { HWIDBlacklistEntry } from '../../../types/license';
import { licenseService } from '../../../services/licenseService';
import { soundService } from '../../../services/soundService';
import { GlassCard } from '../../common/GlassCard';
import { useToast } from '../../common/Toast';

interface HwidBlacklistViewProps {
  onRefreshStats?: () => void;
}

export const HwidBlacklistView: React.FC<HwidBlacklistViewProps> = ({ onRefreshStats }) => {
  const toast = useToast();
  const [entries, setEntries] = useState<HWIDBlacklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHwid, setNewHwid] = useState('');
  const [newReason, setNewReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await licenseService.getHWIDBlacklist();
      setEntries(data);
    } catch {
      toast.error('Не удалось загрузить черный список HWID');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUnban = async (hwid: string) => {
    try {
      soundService.playTone('burst');
      await licenseService.removeFromBlacklist(hwid);
      toast.success(`HWID ${hwid} разблокирован`, 'Разблокировка');
      await loadData();
      onRefreshStats?.();
    } catch {
      toast.error('Ошибка при разблокировке HWID');
    }
  };

  const handleAddBan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHwid.trim()) {
      toast.error('Укажите HWID для блокировки');
      return;
    }

    setSubmitting(true);
    try {
      soundService.playTone('alert');
      await licenseService.addToBlacklist(newHwid.trim(), newReason.trim() || undefined);
      toast.success(`HWID ${newHwid.trim()} внесен в черный список`, 'Блокировка добавлена');
      setNewHwid('');
      setNewReason('');
      setIsModalOpen(false);
      await loadData();
      onRefreshStats?.();
    } catch {
      toast.error('Не удалось заблокировать HWID');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEntries = entries.filter(
    (e) =>
      e.hwid.toLowerCase().includes(search.toLowerCase()) ||
      (e.reason && e.reason.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Ban className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-white tracking-wide">
              Черный список аппаратных идентификаторов (HWID)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Управление глобальными блокировками устройств при попытках взлома, дампинга и нарушении условий
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            soundService.playTone('click');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold shadow-[0_0_20px_rgba(244,63,94,0.2)] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Заблокировать HWID</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по HWID или причине блокировки..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-slate-500 text-xs focus:border-rose-500/50 focus:outline-none transition-all"
        />
      </div>

      {/* List / Table */}
      <GlassCard className="p-0 border-white/10 bg-cosmic-900/60 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 font-mono">
            Загрузка списка блокировок...
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-slate-500">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="text-sm font-semibold text-white">Блокировок не найдено</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {search
                ? 'По вашему поисковому запросу ничего не найдено.'
                : 'В данный момент ни одно устройство не заблокировано в системе защиты.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] border-b border-white/10 text-[11px] font-mono uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Аппаратный HWID</th>
                  <th className="px-5 py-3.5">Причина блокировки</th>
                  <th className="px-5 py-3.5">Дата бана</th>
                  <th className="px-5 py-3.5 text-right">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredEntries.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="font-mono font-semibold text-rose-300">
                          {item.hwid}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-300 max-w-md">
                      {item.reason || 'Причина не указана'}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-400 text-[11px]">
                      {new Date(item.banned_at).toLocaleString('ru-RU')}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleUnban(item.hwid)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold transition-colors inline-flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Разбанить</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Add Ban Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-cosmic-950 border border-white/15 rounded-2xl shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Добавить HWID в бан</h3>
                  <p className="text-[11px] text-slate-400">Устройство будет заблокировано навсегда</p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Аппаратный HWID устройства:
                </label>
                <input
                  type="text"
                  required
                  placeholder="HWID-XXXX-XXXX-XXXX-XXXX"
                  value={newHwid}
                  onChange={(e) => setNewHwid(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-xs focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Причина блокировки:
                </label>
                <textarea
                  rows={3}
                  placeholder="Попытка реверс-инжиниринга, дамп памяти, передача аккаунта..."
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-rose-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all disabled:opacity-50"
                >
                  {submitting ? 'Блокировка...' : 'Подтвердить бан'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
