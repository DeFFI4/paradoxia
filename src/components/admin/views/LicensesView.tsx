import React from 'react';
import { KeyRound, Sparkles, Download, Layers } from 'lucide-react';
import { License, BulkAction } from '../../../types/license';
import { LicenseTable } from '../LicenseTable';
import { BulkActionBar } from '../BulkActionBar';
import { soundService } from '../../../services/soundService';

interface LicensesViewProps {
  licenses: License[];
  selectedIds: string[];
  onSelectIds: (ids: string[]) => void;
  onEditLicense: (lic: License) => void;
  onUpdateLicense: (id: string, updates: Partial<License>) => Promise<void>;
  onExtendLicense: (id: string, option: 7 | 30 | 'lifetime') => Promise<void>;
  onResetHWID: (id: string) => Promise<void>;
  onDeleteLicense: (id: string) => Promise<void>;
  onOpenGenerator: () => void;
  onOpenExport: () => void;
  onBulkAction: (action: BulkAction) => Promise<void>;
}

export const LicensesView: React.FC<LicensesViewProps> = ({
  licenses,
  selectedIds,
  onSelectIds,
  onEditLicense,
  onUpdateLicense,
  onExtendLicense,
  onResetHWID,
  onDeleteLicense,
  onOpenGenerator,
  onOpenExport,
  onBulkAction,
}) => {
  return (
    <div className="space-y-6">
      {/* View Header with Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/20 text-cyber-cyan">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-white tracking-wide">
                Лицензии и ключи доступа
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Централизованный реестр ключей, массовая генерация, аудит привязок и управление HWID
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => {
              soundService.playTone('click');
              onOpenExport();
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold transition-all hover:border-white/20"
          >
            <Download className="w-4 h-4 text-cyber-cyan" />
            <span>Экспорт ключей</span>
          </button>

          <button
            onClick={() => {
              soundService.playTone('click');
              onOpenGenerator();
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-cyber-violet hover:opacity-95 text-white text-xs font-semibold shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Сгенерировать партию</span>
          </button>
        </div>
      </div>

      {/* Main License Table */}
      <LicenseTable
        licenses={licenses}
        selectedIds={selectedIds}
        onSelectIds={onSelectIds}
        onEditLicense={onEditLicense}
        onUpdateLicense={onUpdateLicense}
        onExtendLicense={onExtendLicense}
        onResetHWID={onResetHWID}
        onDeleteLicense={onDeleteLicense}
      />

      {/* Floating Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        onClearSelection={() => onSelectIds([])}
        onExecuteAction={onBulkAction}
      />
    </div>
  );
};
