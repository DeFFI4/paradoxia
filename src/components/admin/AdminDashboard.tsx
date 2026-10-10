import React, { useState, useEffect, useCallback } from 'react';
import {
  Menu,
  RefreshCw,
  Database,
  ArrowLeft,
  LogOut,
  KeyRound,
  ShieldCheck,
  BarChart3,
  Ban,
  ScrollText,
} from 'lucide-react';
import { License, ServiceStatusConfig, BulkAction, AdminTab } from '../../types/license';
import { licenseService } from '../../services/licenseService';
import { soundService } from '../../services/soundService';
import { useToast } from '../common/Toast';
import { isSupabaseConfigured } from '../../services/supabase';

// Sidebar & Modular Views
import { AdminSidebar } from './AdminSidebar';
import { LicensesView } from './views/LicensesView';
import { SystemStatusView } from './views/SystemStatusView';
import { AnalyticsView } from './views/AnalyticsView';
import { HwidBlacklistView } from './views/HwidBlacklistView';
import { AuditLogsView } from './views/AuditLogsView';

// Modals
import { KeyGeneratorModal } from './KeyGeneratorModal';
import { EditLicenseModal } from './EditLicenseModal';
import { ExportModal } from './ExportModal';

interface AdminDashboardProps {
  onBackToStore: () => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToStore,
  onLogout,
}) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>('licenses');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [licenses, setLicenses] = useState<License[]>([]);
  const [statusConfig, setStatusConfig] = useState<ServiceStatusConfig | null>(null);
  const [bannedHwidCount, setBannedHwidCount] = useState<number>(0);
  const [auditLogsCount, setAuditLogsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [lics, config, blacklist, logs] = await Promise.all([
        licenseService.getLicenses(),
        licenseService.getServiceStatus(),
        licenseService.getHWIDBlacklist(),
        licenseService.getAuditLogs(),
      ]);
      setLicenses(lics);
      setStatusConfig(config);
      setBannedHwidCount(blacklist.length);
      setAuditLogsCount(logs.length);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      toast.error('Не удалось синхронизировать данные системы');
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
    toast.info('Данные системы актуализированы', 'Синхронизация');
  };

  const handleResetHWID = async (id: string) => {
    try {
      await licenseService.resetHWID(id);
      soundService.playTone('burst');
      toast.success('HWID успешно сброшен', 'Сброс привязки');
      await loadData();
    } catch {
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
    } catch {
      toast.error('Ошибка при удалении лицензии');
    }
  };

  const handleBulkAction = async (action: BulkAction) => {
    try {
      await licenseService.bulkUpdateLicenses(selectedIds, action);
      soundService.playTone('burst');
      toast.success(`Действие "${action}" применено к ${selectedIds.length} лицензиям`);
      setSelectedIds([]);
      await loadData();
    } catch {
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
    } catch {
      toast.error('Ошибка сохранения лицензии');
    }
  };

  const handleUpdateLicense = async (id: string, updates: Partial<License>) => {
    try {
      await licenseService.updateLicense(id, updates);
      await loadData();
    } catch (err) {
      toast.error('Ошибка сохранения параметров');
      throw err;
    }
  };

  const handleExtendLicense = async (id: string, option: 7 | 30 | 'lifetime') => {
    try {
      await licenseService.extendLicense(id, option);
      soundService.playTone('burst');
      toast.success('Срок действия лицензии успешно продлен');
      await loadData();
    } catch (err) {
      toast.error('Ошибка продления лицензии');
      throw err;
    }
  };

  const handleUpdateStatusConfig = async (newConf: ServiceStatusConfig) => {
    try {
      const saved = await licenseService.updateServiceStatus(newConf);
      setStatusConfig(saved);
      toast.success('Статус системы успешно обновлен');
    } catch {
      toast.error('Ошибка обновления статуса системы');
    }
  };

  const getTabTitle = (tab: AdminTab) => {
    switch (tab) {
      case 'licenses':
        return { title: 'Реестр лицензий', icon: KeyRound, desc: 'Управление ключами, привязками и экспортом' };
      case 'status':
        return { title: 'Статус системы', icon: ShieldCheck, desc: 'Глобальный статус обхода и версия' };
      case 'analytics':
        return { title: 'Аналитика и финансы', icon: BarChart3, desc: 'Статистика тарифов и финансовые проекции' };
      case 'blacklist':
        return { title: 'Черный список HWID', icon: Ban, desc: 'Аппаратные блокировки устройств' };
      case 'audit':
        return { title: 'Журнал аудита', icon: ScrollText, desc: 'Неизменяемый журнал действий администрации' };
    }
  };

  const currentTabInfo = getTabTitle(activeTab);
  const CurrentIcon = currentTabInfo.icon;

  return (
    <div className="min-h-screen bg-cosmic-950 text-slate-100 flex flex-col lg:flex-row selection:bg-cyber-cyan/30 selection:text-white">
      {/* Modular Navigation Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        counts={{
          totalLicenses: licenses.length,
          activeLicenses: licenses.filter((l) => l.status === 'active').length,
          bannedHwid: bannedHwidCount,
          auditLogs: auditLogsCount,
          currentStatus: statusConfig?.status || 'UNDETECTED',
        }}
        isSupabase={isSupabaseConfigured}
        onBackToStore={onBackToStore}
        onLogout={onLogout}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Control Bar */}
        <header className="sticky top-0 z-20 border-b border-white/10 bg-cosmic-950/85 backdrop-blur-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Left: Mobile hamburger & Current active view badge */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  soundService.playTone('click');
                  setMobileMenuOpen(true);
                }}
                className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Открыть меню"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="hidden sm:flex p-1.5 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/20 text-cyber-cyan">
                  <CurrentIcon className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-sm sm:text-base font-bold font-display text-white leading-tight">
                    {currentTabInfo.title}
                  </h1>
                  <p className="text-[10px] text-slate-400 font-mono hidden md:block">
                    {currentTabInfo.desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: DB Status Indicator & Action buttons */}
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-white/5 border border-white/10 text-slate-300">
                <Database className="w-3.5 h-3.5 text-cyber-cyan" />
                <span>{isSupabaseConfigured ? 'Supabase Connected' : 'Local Storage Mode'}</span>
              </div>

              <button
                onClick={handleRefresh}
                className={`p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors ${loading ? 'animate-spin' : ''}`}
                title="Обновить данные"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  soundService.playTone('click');
                  onBackToStore();
                }}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition-colors"
                title="Вернуться в каталог"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>На сайт</span>
              </button>

              <button
                onClick={() => {
                  soundService.playTone('alert');
                  onLogout();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors"
                title="Завершить сессию администратора"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Выйти</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic View Container */}
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 pb-24">
          {activeTab === 'licenses' && (
            <LicensesView
              licenses={licenses}
              selectedIds={selectedIds}
              onSelectIds={setSelectedIds}
              onEditLicense={(lic) => setEditingLicense(lic)}
              onUpdateLicense={handleUpdateLicense}
              onExtendLicense={handleExtendLicense}
              onResetHWID={handleResetHWID}
              onDeleteLicense={handleDeleteLicense}
              onOpenGenerator={() => setIsGeneratorOpen(true)}
              onOpenExport={() => setIsExportOpen(true)}
              onBulkAction={handleBulkAction}
            />
          )}

          {activeTab === 'status' && (
            <SystemStatusView
              statusConfig={statusConfig}
              onUpdateConfig={handleUpdateStatusConfig}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView licenses={licenses} />
          )}

          {activeTab === 'blacklist' && (
            <HwidBlacklistView onRefreshStats={loadData} />
          )}

          {activeTab === 'audit' && (
            <AuditLogsView onRefreshStats={loadData} />
          )}
        </main>
      </div>

      {/* Shared Modals */}
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
