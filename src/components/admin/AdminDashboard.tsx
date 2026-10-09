import React, { useState, useEffect, useCallback } from 'react';
import { 
  KeyRound, 
  Sparkles, 
  Download, 
  RefreshCw, 
  LogOut, 
  ArrowLeft, 
  ShieldCheck, 
  Database,
  Layers,
  Activity
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { License, ServiceStatusConfig, BulkAction } from '../../types/license';
import { licenseService } from '../../services/licenseService';
import { soundService } from '../../services/soundService';
import { useToast } from '../common/Toast';
import { ServiceStatusController } from './ServiceStatusController';
import { AnalyticsSection } from './AnalyticsSection';
import { LicenseTable } from './LicenseTable';
import { BulkActionBar } from './BulkActionBar';
import { KeyGeneratorModal } from './KeyGeneratorModal';
import { EditLicenseModal } from './EditLicenseModal';
import { ExportModal } from './ExportModal';
import { isSupabaseConfigured } from '../../services/supabase';

interface AdminDashboardProps {
  onBackToStore: () => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToStore,
  onLogout,
}) => {
  const toast = useToast();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [statusConfig, setStatusConfig] = useState<ServiceStatusConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modals
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [lics, config] = await Promise.all([
        licenseService.getLicenses(),
        licenseService.getServiceStatus(),
      ]);
      setLicenses(lics);
      setStatusConfig(config);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      toast.error('Не удалось загрузить данные системы');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    soundService.playTone('click');
    await loadData();
    toast.info('Данные синхронизированы', 'Обновление');
  };

  const handleResetHWID = async (id: string) => {
    try {
      await licenseService.resetHWID(id);
      soundService.playTone('burst');
      toast.success('HWID успешно сброшен', 'Сброс привязки');
      await loadData();
    } catch (err) {
      toast.error('Ошибка сброса HWID');
    }
  };

  const handleDeleteLicense = async (id: string) => {
    try {
      await licenseService.deleteLicense(id);
      soundService.playTone('alert');
      toast.info('Лицензия удалена из базы');
      setSelectedIds((prev) => prev.filter((i) => i !== id));
      await loadData();
    } catch (err) {
      toast.error('Ошибка при удалении лицензии');
    }
  };

  const handleBulkAction = async (action: BulkAction) => {
    try {
      await licenseService.bulkUpdateLicenses(selectedIds, action);
      toast.success(`Действие "${action}" применено к ${selectedIds.length} лицензиям`);
      setSelectedIds([]);
      await loadData();
    } catch (err) {
      toast.error('Ошибка при выполнении массового действия');
    }
  };

  const handleSaveLicense = async (id: string, updates: Partial<License>) => {
    try {
      await licenseService.updateLicense(id, updates);
      soundService.playTone('burst');
      toast.success('Параметры лицензии сохранены');
      setEditingLicense(null);
      await loadData();
    } catch (err) {
      toast.error('Ошибка сохранения лицензии');
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col selection:bg-cyber-cyan/30 selection:text-white pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-cosmic-950/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundService.playTone('click');
                onBackToStore();
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Вернуться на сайт"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold font-display text-white tracking-wide">
                PARADOXIA
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30">
                ADMIN CONSOLE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Database indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-white/5 border border-white/10 text-slate-300">
              <Database className="w-3.5 h-3.5 text-cyber-cyan" />
              <span>{isSupabaseConfigured ? 'Supabase Connected' : 'Local Storage Mode'}</span>
            </div>

            <button
              onClick={handleRefresh}
              className={`p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors ${loading ? 'animate-spin' : ''}`}
              title="Обновить данные"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                soundService.playTone('alert');
                onLogout();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Выйти</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1 w-full">
        {/* Service Status Controller */}
        {statusConfig && (
          <ServiceStatusController
            config={statusConfig}
            onUpdated={(newConf) => setStatusConfig(newConf)}
          />
        )}

        {/* Analytics & Metrics */}
        <AnalyticsSection licenses={licenses} />

        {/* Management Actions Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-cyber-cyan" />
              Управление лицензионными ключами
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Редактирование, генерация партий, фильтрация и аудит статусов
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                soundService.playTone('click');
                setIsExportOpen(true);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold transition-colors"
            >
              <Download className="w-4 h-4 text-cyber-cyan" />
              <span>Экспорт</span>
            </button>

            <button
              onClick={() => {
                soundService.playTone('click');
                setIsGeneratorOpen(true);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyber-cyan to-cyber-violet hover:opacity-95 text-white text-xs font-semibold shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Сгенерировать ключи</span>
            </button>
          </div>
        </div>

        {/* License Table */}
        <LicenseTable
          licenses={licenses}
          selectedIds={selectedIds}
          onSelectIds={setSelectedIds}
          onEditLicense={(lic) => setEditingLicense(lic)}
          onResetHWID={handleResetHWID}
          onDeleteLicense={handleDeleteLicense}
        />
      </main>

      {/* Bulk Action Sticky Bar */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onExecuteAction={handleBulkAction}
      />

      {/* Modals */}
      <KeyGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onGenerated={async () => {
          await loadData();
        }}
      />

      <ExportModal
        isOpen={isExportOpen}
        licenses={licenses}
        onClose={() => setIsExportOpen(false)}
      />

      <EditLicenseModal
        isOpen={Boolean(editingLicense)}
        license={editingLicense}
        onClose={() => setEditingLicense(null)}
        onSave={handleSaveLicense}
        onDelete={handleDeleteLicense}
      />
    </div>
  );
};
