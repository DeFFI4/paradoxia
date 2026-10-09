import React, { useState } from 'react';
import { X, Save, Trash2, KeyRound, Cpu, Clock, Tag, Ban, Snowflake, Flame } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { License, LicenseStatus } from '../../types/license';
import { soundService } from '../../services/soundService';

interface EditLicenseModalProps {
  license: License | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<License>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const EditLicenseModal: React.FC<EditLicenseModalProps> = ({
  license,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!isOpen || !license) return null;

  const [status, setStatus] = useState<LicenseStatus>(license.status);
  const [hwid, setHwid] = useState<string>(license.hwid || '');
  const [note, setNote] = useState<string>(license.note || '');
  const [durationDays, setDurationDays] = useState<number>(license.duration_days);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    soundService.playTone('burst');
    try {
      await onSave(license.id, {
        status,
        hwid: hwid.trim() ? hwid.trim() : null,
        note: note.trim() ? note.trim() : null,
        duration_days: durationDays,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Вы уверены, что хотите удалить ключ ${license.key}?`)) {
      soundService.playTone('burst');
      await onDelete(license.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg z-10 my-8">
        <GlassCard className="bg-cosmic-900/95 border-white/15 p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.85)]">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-white/10 mb-5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyber-cyan">
                ID: {license.id.slice(0, 8)}...
              </span>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                <KeyRound className="w-4 h-4 text-cyber-cyan" />
                <code className="font-mono text-sm sm:text-base text-cyber-cyan select-all">{license.key}</code>
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Status Selector */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider">
                Статус ключа:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LicenseStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:border-cyber-cyan focus:outline-none"
              >
                <option value="unused" className="bg-cosmic-900">Неактивен (Unused)</option>
                <option value="active" className="bg-cosmic-900">Активен (Active)</option>
                <option value="frozen" className="bg-cosmic-900">Заморожен (Frozen)</option>
                <option value="expired" className="bg-cosmic-900">Истек (Expired)</option>
                <option value="banned" className="bg-cosmic-900">Заблокирован (Banned)</option>
              </select>
            </div>

            {/* HWID field with 1-click Reset */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-300 font-semibold uppercase tracking-wider">
                  Привязка оборудования (HWID):
                </label>
                {hwid && (
                  <button
                    type="button"
                    onClick={() => {
                      soundService.playTone('click');
                      setHwid('');
                    }}
                    className="text-[10px] text-cyber-violet hover:underline font-mono"
                  >
                    Сбросить привязку
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={hwid}
                  onChange={(e) => setHwid(e.target.value)}
                  placeholder="Оборудование не привязано"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-xs focus:border-cyber-cyan focus:outline-none"
                />
                <Cpu className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            {/* Duration Days */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider">
                Длительность (дней, 9999 = Lifetime):
              </label>
              <input
                type="number"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-xs focus:border-cyber-cyan focus:outline-none"
              />
            </div>

            {/* Note / Tag */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider">
                Заметка администратора:
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Заметка или имя покупателя"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-cyber-cyan focus:outline-none"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleDelete}
              className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Удалить ключ</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-semibold transition-colors"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-cyber-cyan hover:bg-cyan-400 text-cosmic-950 font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Сохранить</span>
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
