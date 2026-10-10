import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  Copy, 
  Check, 
  Edit3, 
  Trash2, 
  RotateCcw, 
  Cpu, 
  Clock, 
  Snowflake, 
  Ban,
  CheckCircle2,
  Calendar,
  Infinity as InfinityIcon,
  Plus,
  ChevronDown
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
  onUpdateLicense: (id: string, updates: Partial<License>) => Promise<void>;
  onExtendLicense?: (id: string, option: 7 | 30 | 'lifetime') => Promise<void>;
  onResetHWID: (id: string) => Promise<void>;
  onDeleteLicense: (id: string) => Promise<void>;
}

export const LicenseTable: React.FC<LicenseTableProps> = ({
  licenses,
  selectedIds,
  onSelectIds,
  onEditLicense,
  onUpdateLicense,
  onExtendLicense,
  onResetHWID,
  onDeleteLicense,
}) => {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LicenseStatus>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState<string>('');
  const [busyRowId, setBusyRowId] = useState<string | null>(null);

  const noteInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingNoteId && noteInputRef.current) {
      noteInputRef.current.focus();
      noteInputRef.current.select();
    }
  }, [editingNoteId]);

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

  // Inline Status Change
  const handleStatusChange = async (lic: License, newStatus: LicenseStatus) => {
    if (lic.status === newStatus) return;
    soundService.playTone('burst');
    setBusyRowId(lic.id);
    try {
      await onUpdateLicense(lic.id, { status: newStatus });
      toast.success(`Статус изменен на "${newStatus}"`, lic.key);
    } catch {
      toast.error('Не удалось обновить статус');
    } finally {
      setBusyRowId(null);
    }
  };

  // Inline Note Save
  const handleSaveNote = async (id: string) => {
    const trimmed = editingNoteText.trim();
    setEditingNoteId(null);
    try {
      await onUpdateLicense(id, { note: trimmed || null });
      toast.success('Примечание сохранено');
    } catch {
      toast.error('Ошибка сохранения примечания');
    }
  };

  // Inline Extension
  const handleQuickExtend = async (lic: License, option: 7 | 30 | 'lifetime') => {
    soundService.playTone('burst');
    setBusyRowId(lic.id);
    try {
      if (onExtendLicense) {
        await onExtendLicense(lic.id, option);
      } else {
        if (option === 'lifetime') {
          await onUpdateLicense(lic.id, { duration_days: 9999, expires_at: null });
        } else {
          const baseTime = lic.expires_at ? new Date(lic.expires_at).getTime() : Date.now();
          const currentOrNow = Math.max(baseTime, Date.now());
          const nextExpiration = new Date(currentOrNow + option * 86400000).toISOString();
          const newDuration = lic.duration_days >= 9999 ? option : lic.duration_days + option;
          await onUpdateLicense(lic.id, { 
            duration_days: newDuration, 
            expires_at: nextExpiration,
            status: lic.status === 'expired' ? 'active' : lic.status
          });
        }
      }
      toast.success(
        option === 'lifetime' ? 'Ключ переведен на Lifetime' : `Срок продлен на +${option} дней`,
        lic.key
      );
    } catch {
      toast.error('Ошибка продления лицензии');
    } finally {
      setBusyRowId(null);
    }
  };

  // Inline HWID Reset
  const handleQuickResetHWID = async (lic: License) => {
    if (!lic.hwid) return;
    soundService.playTone('burst');
    setBusyRowId(lic.id);
    try {
      await onResetHWID(lic.id);
      toast.success('Привязка оборудования очищена', lic.key);
    } catch {
      toast.error('Ошибка сброса HWID');
    } finally {
      setBusyRowId(null);
    }
  };

  const getStatusBadgeStyle = (status: LicenseStatus) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/25';
      case 'unused':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/40 hover:bg-amber-500/25';
      case 'frozen':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40 hover:bg-cyan-500/25';
      case 'expired':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/40 hover:bg-slate-500/30';
      case 'banned':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/40 hover:bg-rose-500/25';
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
            placeholder="Поиск по ключу, HWID или заметке..."
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
              <th className="py-3 px-3">Статус (1-клик)</th>
              <th className="py-3 px-3">Срок / Быстрое продление</th>
              <th className="py-3 px-3">HWID (1-клик сброс)</th>
              <th className="py-3 px-3">Заметка (клик для ввода)</th>
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
                const isBusy = busyRowId === lic.id;
                const isEditingThisNote = editingNoteId === lic.id;

                return (
                  <tr
                    key={lic.id}
                    className={`transition-colors hover:bg-white/[0.02] ${
                      isSelected ? 'bg-cyber-cyan/[0.04]' : ''
                    } ${isBusy ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 pl-6 pr-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(lic.id)}
                        className="rounded border-white/20 text-cyber-cyan focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Key with Copy button */}
                    <td className="py-3 px-3">
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

                    {/* 1-Click Interactive Status Dropdown */}
                    <td className="py-3 px-3">
                      <div className="relative inline-block">
                        <select
                          value={lic.status}
                          onChange={(e) => handleStatusChange(lic, e.target.value as LicenseStatus)}
                          className={`appearance-none cursor-pointer pl-3 pr-6 py-1 rounded-full text-[11px] font-mono font-semibold border transition-all focus:outline-none focus:ring-1 focus:ring-cyber-cyan ${getStatusBadgeStyle(
                            lic.status
                          )}`}
                          title="Нажмите для моментальной смены статуса"
                        >
                          <option value="active" className="bg-cosmic-950 text-emerald-400">
                            Active
                          </option>
                          <option value="unused" className="bg-cosmic-950 text-amber-400">
                            Unused
                          </option>
                          <option value="frozen" className="bg-cosmic-950 text-cyan-400">
                            Frozen
                          </option>
                          <option value="expired" className="bg-cosmic-950 text-slate-400">
                            Expired
                          </option>
                          <option value="banned" className="bg-cosmic-950 text-rose-400">
                            Banned
                          </option>
                        </select>
                        <ChevronDown className="w-3 h-3 absolute right-2 top-2 pointer-events-none opacity-60" />
                      </div>
                    </td>

                    {/* Duration + Quick Extend Buttons */}
                    <td className="py-3 px-3 font-mono">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-white font-medium">
                            {lic.duration_days >= 9999 ? 'Lifetime' : `${lic.duration_days} дн.`}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {lic.expires_at ? new Date(lic.expires_at).toLocaleDateString() : 'Без срока'}
                          </div>
                        </div>

                        {/* Quick Extension Pills */}
                        <div className="flex items-center gap-1 ml-1">
                          <button
                            onClick={() => handleQuickExtend(lic, 7)}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-white/[0.04] hover:bg-cyber-cyan/20 text-slate-300 hover:text-cyber-cyan border border-white/10 transition-colors"
                            title="Продлить на 7 дней"
                          >
                            +7д
                          </button>
                          <button
                            onClick={() => handleQuickExtend(lic, 30)}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-white/[0.04] hover:bg-cyber-cyan/20 text-slate-300 hover:text-cyber-cyan border border-white/10 transition-colors"
                            title="Продлить на 30 дней"
                          >
                            +30д
                          </button>
                          <button
                            onClick={() => handleQuickExtend(lic, 'lifetime')}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-white/[0.04] hover:bg-cyber-violet/25 text-slate-300 hover:text-cyber-violet border border-white/10 transition-colors"
                            title="Сделать Lifetime (Бессрочно)"
                          >
                            ∞ Life
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* HWID + 1-Click Instant Reset */}
                    <td className="py-3 px-3">
                      {lic.hwid ? (
                        <div className="flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-cyber-violet flex-shrink-0" />
                          <span className="font-mono text-[11px] text-slate-300 truncate max-w-[110px]" title={lic.hwid}>
                            {lic.hwid}
                          </span>
                          <button
                            onClick={() => handleQuickResetHWID(lic)}
                            className="px-1.5 py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20 text-[10px] font-mono flex items-center gap-1 transition-colors"
                            title="1-клик: сбросить привязку оборудования"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            <span>Сброс</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono italic">Свободен</span>
                      )}
                    </td>

                    {/* Note (Click-to-Edit Inline) */}
                    <td className="py-3 px-3">
                      {isEditingThisNote ? (
                        <div className="flex items-center gap-1">
                          <input
                            ref={noteInputRef}
                            type="text"
                            value={editingNoteText}
                            onChange={(e) => setEditingNoteText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveNote(lic.id);
                              if (e.key === 'Escape') setEditingNoteId(null);
                            }}
                            onBlur={() => handleSaveNote(lic.id)}
                            placeholder="Примечание..."
                            className="px-2 py-1 rounded bg-white/10 border border-cyber-cyan text-white text-xs font-sans focus:outline-none w-44"
                          />
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setEditingNoteId(lic.id);
                            setEditingNoteText(lic.note || '');
                          }}
                          className="group/note flex items-center gap-1.5 cursor-pointer max-w-[160px]"
                          title="Нажмите для редактирования заметки"
                        >
                          <span className={`text-xs truncate block ${lic.note ? 'text-slate-300' : 'text-slate-600 italic'}`}>
                            {lic.note || '+ Заметка'}
                          </span>
                          <Edit3 className="w-3 h-3 text-slate-600 group-hover/note:text-cyber-cyan transition-colors flex-shrink-0 opacity-0 group-hover/note:opacity-100" />
                        </div>
                      )}
                    </td>

                    {/* Row Actions */}
                    <td className="py-3 pl-3 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            soundService.playTone('click');
                            onEditLicense(lic);
                          }}
                          className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-cyber-cyan border border-white/[0.06] transition-colors"
                          title="Открыть расширенное редактирование"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            soundService.playTone('alert');
                            if (confirm(`Удалить ключ ${lic.key}?`)) {
                              onDeleteLicense(lic.id);
                            }
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
        <span>Моментальное сохранение: Inline Active</span>
      </div>
    </GlassCard>
  );
};
