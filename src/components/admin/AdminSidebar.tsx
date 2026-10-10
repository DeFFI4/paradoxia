import React from 'react';
import {
  KeyRound,
  ShieldCheck,
  BarChart3,
  Ban,
  ScrollText,
  LogOut,
  ArrowLeft,
  Database,
  Menu,
  X
} from 'lucide-react';
import { AdminTab } from '../../types/license';
import { soundService } from '../../services/soundService';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  counts: {
    totalLicenses: number;
    activeLicenses: number;
    bannedHwid: number;
    auditLogs: number;
    currentStatus?: string;
  };
  isSupabase: boolean;
  onBackToStore: () => void;
  onLogout: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  counts,
  isSupabase,
  onBackToStore,
  onLogout,
  mobileOpen,
  onCloseMobile,
}) => {
  const navItems: {
    id: AdminTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeVariant?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'slate';
  }[] = [
    {
      id: 'licenses',
      label: 'Лицензии и ключи',
      icon: KeyRound,
      badge: counts.totalLicenses,
      badgeVariant: 'cyan',
    },
    {
      id: 'status',
      label: 'Статус системы',
      icon: ShieldCheck,
      badge: counts.currentStatus || 'LIVE',
      badgeVariant: counts.currentStatus === 'UNDETECTED' ? 'emerald' : 'amber',
    },
    {
      id: 'analytics',
      label: 'Аналитика',
      icon: BarChart3,
      badge: `${counts.activeLicenses} акт.`,
      badgeVariant: 'slate',
    },
    {
      id: 'blacklist',
      label: 'Черный список HWID',
      icon: Ban,
      badge: counts.bannedHwid,
      badgeVariant: counts.bannedHwid > 0 ? 'rose' : 'slate',
    },
    {
      id: 'audit',
      label: 'Журнал аудита',
      icon: ScrollText,
      badge: counts.auditLogs,
      badgeVariant: 'slate',
    },
  ];

  const handleNavClick = (tab: AdminTab) => {
    soundService.playTone('click');
    onSelectTab(tab);
    onCloseMobile();
  };

  const badgeStyles = {
    cyan: 'bg-cyber-cyan/15 text-cyber-cyan border-cyber-cyan/30',
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    slate: 'bg-white/10 text-slate-300 border-white/10',
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-cosmic-950/95 backdrop-blur-2xl border-r border-white/10">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyber-cyan/20 to-cyber-violet/20 border border-cyber-cyan/30 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <span className="text-sm font-black font-display text-cyber-cyan">PX</span>
          </div>
          <div>
            <div className="text-base font-bold font-display text-white tracking-wide leading-tight">
              PARADOXIA
            </div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-cyber-cyan/90 font-semibold">
              Admin Workspace
            </div>
          </div>
        </div>

        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
          Модули управления
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const badgeClass = item.badgeVariant ? badgeStyles[item.badgeVariant] : badgeStyles.slate;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-medium transition-all group relative ${
                isActive
                  ? 'bg-gradient-to-r from-cyber-cyan/15 to-cyber-violet/10 text-white border border-cyber-cyan/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-cyber-cyan shadow-[0_0_8px_#06b6d4]" />
              )}
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-cyber-cyan' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span className="font-semibold">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${badgeClass}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer & Connection Status */}
      <div className="p-4 border-t border-white/10 space-y-3 bg-cosmic-900/40">
        {/* Supabase status badge */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-cyber-cyan" />
            <span className="text-[11px] font-mono text-slate-300">
              {isSupabase ? 'Supabase DB' : 'Local Cache'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabase ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
              } animate-pulse`}
            />
            <span className="text-[10px] font-mono text-slate-400">
              {isSupabase ? 'Online' : 'Fallback'}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              soundService.playTone('click');
              onBackToStore();
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition-colors"
            title="Вернуться на витрину"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>На сайт</span>
          </button>

          <button
            onClick={() => {
              soundService.playTone('alert');
              onLogout();
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 text-xs font-semibold transition-colors"
            title="Выйти из сессии администратора"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Выход</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 h-screen sticky top-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Sliding Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 lg:hidden transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
