import React, { useState } from 'react';
import { X, Download, Copy, Check, FileSpreadsheet, FileCode, FileText } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { License } from '../../types/license';
import { soundService } from '../../services/soundService';
import { useToast } from '../common/Toast';

interface ExportModalProps {
  isOpen: boolean;
  licenses: License[];
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  licenses,
  onClose,
}) => {
  const toast = useToast();
  const [format, setFormat] = useState<'csv' | 'json' | 'txt'>('csv');
  const [filter, setFilter] = useState<'all' | 'active' | 'unused'>('all');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getFilteredLicenses = () => {
    if (filter === 'active') return licenses.filter((l) => l.status === 'active');
    if (filter === 'unused') return licenses.filter((l) => l.status === 'unused');
    return licenses;
  };

  const generateExportData = () => {
    const list = getFilteredLicenses();

    if (format === 'json') {
      return JSON.stringify(list, null, 2);
    }

    if (format === 'txt') {
      return list.map((l) => l.key).join('\n');
    }

    // CSV format
    const headers = ['Key', 'Status', 'DurationDays', 'HWID', 'Note', 'CreatedAt', 'ExpiresAt'];
    const rows = list.map((l) => [
      l.key,
      l.status,
      l.duration_days,
      l.hwid || '',
      `"${(l.note || '').replace(/"/g, '""')}"`,
      l.created_at,
      l.expires_at || '',
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  };

  const handleCopy = () => {
    const content = generateExportData();
    navigator.clipboard.writeText(content);
    setCopied(true);
    soundService.playTone('copy');
    toast.success('Данные экспорта скопированы в буфер', 'Успешно');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const content = generateExportData();
    const mimeTypes = {
      csv: 'text/csv;charset=utf-8;',
      json: 'application/json;charset=utf-8;',
      txt: 'text/plain;charset=utf-8;',
    };

    const blob = new Blob([content], { type: mimeTypes[format] });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `paradoxia_export_${filter}_${Date.now()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    soundService.playTone('burst');
    toast.success(`Файл paradoxia_export_${format} скачан`, 'Экспорт завершен');
  };

  const handleClose = () => {
    soundService.playTone('click');
    onClose();
  };

  const targetCount = getFilteredLicenses().length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-md z-10 my-8">
        <GlassCard className="bg-cosmic-900/95 border-white/15 p-6 shadow-[0_0_60px_rgba(0,0,0,0.85)]">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-white/10 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyber-cyan/15 border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Экспорт лицензий</h3>
                <p className="text-xs text-slate-400">
                  Выгрузка базы ключей в табличном или текстовом виде
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Filter selection */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider">
                Фильтрация выборки:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['all', 'active', 'unused'] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      soundService.playTone('click');
                      setFilter(item);
                    }}
                    className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                      filter === item
                        ? 'border-cyber-cyan bg-cyber-cyan/20 text-white font-bold'
                        : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
                    }`}
                  >
                    {item === 'all' ? 'Все ключи' : item === 'active' ? 'Активные' : 'Неактивные'}
                  </button>
                ))}
              </div>
            </div>

            {/* Format selection */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider">
                Формат файла:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundService.playTone('click');
                    setFormat('csv');
                  }}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    format === 'csv'
                      ? 'border-emerald-500 bg-emerald-500/20 text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                      : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
                  }`}
                >
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  <span className="font-mono">CSV Таблица</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundService.playTone('click');
                    setFormat('json');
                  }}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    format === 'json'
                      ? 'border-cyber-cyan bg-cyber-cyan/20 text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
                  }`}
                >
                  <FileCode className="w-5 h-5 text-cyber-cyan" />
                  <span className="font-mono">JSON База</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundService.playTone('click');
                    setFormat('txt');
                  }}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    format === 'txt'
                      ? 'border-cyber-violet bg-cyber-violet/20 text-white font-bold shadow-[0_0_15px_rgba(139,92,246,0.25)]'
                      : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-5 h-5 text-cyber-violet" />
                  <span className="font-mono">TXT Список</span>
                </button>
              </div>
            </div>

            {/* Preview notice */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-slate-400 font-mono text-[11px] flex justify-between">
              <span>Готово к выгрузке:</span>
              <span className="text-white font-bold">{targetCount} лицензий</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-bold transition-all flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Скопировано!' : 'В буфер'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyber-cyan to-cyber-violet hover:from-cyan-400 hover:to-violet-500 text-white font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Скачать</span>
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
