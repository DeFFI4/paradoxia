import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Copy, 
  Check, 
  Edit3, 
  Trash2, 
  RotateCcw, 
  Cpu, 
  KeyRound, 
  Calendar,
  CheckCircle2,
  Clock,
  Snowflake,
  AlertTriangle,
  Ban
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { License, LicenseStatus } from '../../types/license';
import { soundService } from '../../services/soundService';
import { useToast } from '../common/Toast';

interface LicenseTableProps {
  licenses: License[];
  selectedIds: string[];
  onSelectIds: (ids: string[]) => void;
  onEditLicense: (license: License) => void;
  onResetHWID: (id: string) => Promise<void>;
  onDeleteLicense: (id: string) => Promise<void>;
}

export const LicenseTable: React.FC<LicenseTableProps> = ({
  licenses,
  selectedIds,
  onSelectIds,
  onEditLicense,
  onResetHWID,
  onDeleteLicense,
}) => {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LicenseStatus>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filteredLicenses = useMemo(() => {
    return licenses.filter((lic) => {
      const matchSearch =
        search === '' ||
        lic.key.toLowerCase().includes(search.toLowerCase()) ||
        (lic.note && lic.note.toLowerCase().includes(search.toLowerCase())) ||
        (lic.hwid && lic.hwid.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = statusFilter === 'all' || lic.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [licenses, search, statusFilter]);

  const allSelected =
    filteredLicenses.length > 0 &&
    filteredLicenses.every((l) => selectedIds.includes(l.id));

  const toggleSelectAll = () => {
    soundService.playTone('click');
    if (allSelected) {
      onSelectIds([]);
    } else {
      onSelectIds(filteredLicenses.map((l) => l.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    soundService.playTone('click');
    if (selectedIds.includes(id)) {
      onSelectIds(selectedIds.filter((item) => item !== id));
    } else {
      onSelectIds([...selectedIds, id]);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    soundService.playTone('copy');
    toast.success(`Ключ ${key} скопирован`, 'Буфер обмена');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getStatusBadge = (status: LicenseStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        );
      case 'unused':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            Unused
          </span>
        );
      case 'frozen':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <Snowflake className="w-3 h-3" />
            Frozen
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-slate-500/20 text-slate-400 border border-slate-500/30">
            Expired
          </span>
        );
      case 'banned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <Ban className="w-3 h-3" />
            Banned
          </span>
        );
    }
  };

  return (
    <GlassCard className="border-white/10 bg-cosmic-900/60 p-4 sm:p-6 overflow-hidden">
      {/* Controls Bar: Search & Status Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по ключу, HWID или примечанию..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 focus:border-cyber-cyan text-white text-xs placeholder:text-slate-500 focus:outline-none transition-all font-mono"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['all', 'active', 'unused', 'frozen', 'expired', 'banned'] as const).map((st) => (
            <button
              key={st}
              onClick={() => {
                soundService.playTone('click');
                setStatusFilter(st);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'bg-white/[0.02] text-slate-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              {st === 'all' ? 'Все ключи' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto -mx-4 sm:-mx-6 mt-2">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.08] text-slate-400 font-mono text-[11px] uppercase tracking-wider bg-white/[0.01]">
              <th className="py-3 pl-6 pr-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-white/20 text-cyber-cyan focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="py-3 px-3">Лицензионный ключ</th>
              <th className="py-3 px-3">Статус</th>
              <th className="py-3 px-3">Тариф / Срок</th>
              <th className="py-3 px-3">Привязка HWID</th>
              <th className="py-3 px-3">Примечание</th>
              <th className="py-3 pl-3 pr-6 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {filteredLicenses.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 font-mono">
                  Лицензии по заданному фильтру не найдены
                </td>
              </tr>
            ) : (
              filteredLicenses.map((lic) => {
                const isSelected = selectedIds.includes(lic.id);
                return (
                  <tr
                    key={lic.id}
                    className={`transition-colors hover:bg-white/[0.02] ${
                      isSelected ? 'bg-cyber-cyan/[0.04]' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 pl-6 pr-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(lic.id)}
                        className="rounded border-white/20 text-cyber-cyan focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Key with Copy button */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-bold text-white select-all text-xs tracking-wide">
                          {lic.key}
                        </code>
                        <button
                          onClick={() => handleCopyKey(lic.key)}
                          className="p-1 rounded text-slate-500 hover:text-cyber-cyan transition-colors"
                          title="Скопировать ключ"
                        >
                          {copiedKey === lic.key ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-3">
                      {getStatusBadge(lic.status)}
                    </td>

                    {/* Duration / Expiration */}
                    <td className="py-3.5 px-3 font-mono">
                      <div className="text-white font-medium">
                        {lic.duration_days === 9999 ? 'Lifetime' : `${lic.duration_days} дней`}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {lic.expires_at ? new Date(lic.expires_at).toLocaleDateString() : 'Без срока'}
                      </div>
                    </td>

                    {/* HWID Binding */}
                    <td className="py-3.5 px-3">
                      {lic.hwid ? (
                        <div className="flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-cyber-violet flex-shrink-0" />
                          <span className="font-mono text-[11px] text-slate-300 truncate max-w-[120px]" title={lic.hwid}>
                            {lic.hwid}
                          </span>
                          <button
                            onClick={() => {
                              soundService.playTone('click');
                              onResetHWID(lic.id);
                            }}
                            className="p-1 rounded text-slate-500 hover:text-cyber-violet transition-colors"
                            title="Сбросить HWID привязку"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">Не привязан</span>
                      )}
                    </td>

                    {/* Note */}
                    <td className="py-3.5 px-3">
                      <span className="text-slate-400 text-xs truncate max-w-[160px] block" title={lic.note || ''}>
                        {lic.note || '—'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 pl-3 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            soundService.playTone('click');
                            onEditLicense(lic);
                          }}
                          className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-cyber-cyan border border-white/[0.06] transition-colors"
                          title="Редактировать ключ"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            soundService.playTone('alert');
                            onDeleteLicense(lic.id);
                          }}
                          className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-white/[0.06] transition-colors"
                          title="Удалить ключ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer info */}
      <div className="pt-4 border-t border-white/[0.08] mt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>Показано: {filteredLicenses.length} из {licenses.length} лицензий</span>
        <span>База данных: Supabase / LocalStorage Reactive</span>
      </div>
    </GlassCard>
  );
};
