import React, { useState, useEffect } from 'react';
import {
  Activity,
  KeyRound,
  Cpu,
  Wallet,
  ShieldCheck,
  LogOut,
  Sparkles,
  Lock,
  User,
  ExternalLink,
  ChevronRight,
  PlusCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  UserProfile,
  UserSubscription,
  WalletTransaction,
  UserSession,
  LoginAuditRecord,
  SecurityActionRequest,
} from '../../types/user';
import { userService } from '../../services/userService';
import { soundService } from '../../services/soundService';

import { OverviewTab } from './OverviewTab';
import { SubscriptionsTab } from './SubscriptionsTab';
import { HwidManagerTab } from './HwidManagerTab';
import { WalletTab } from './WalletTab';
import { SecuritySettingsTab } from './SecuritySettingsTab';
import { TopUpModal } from './TopUpModal';
import { EmailDispatcherModal } from './EmailDispatcherModal';

interface UserCabinetViewProps {
  onBackToStore?: () => void;
}

type CabinetTab = 'overview' | 'subscriptions' | 'hwid' | 'wallet' | 'security';

export const UserCabinetView: React.FC<UserCabinetViewProps> = ({ onBackToStore }) => {
  const [user, setUser] = useState<UserProfile | null>(userService.getCurrentUser());
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [auditLogs, setAuditLogs] = useState<LoginAuditRecord[]>([]);

  const [activeTab, setActiveTab] = useState<CabinetTab>('overview');
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [pendingEmailReq, setPendingEmailReq] = useState<SecurityActionRequest | null>(null);

  const loadData = async (targetUser: UserProfile) => {
    const [subs, txs] = await Promise.all([
      userService.getUserSubscriptions(targetUser.id),
      userService.getTransactionHistory(targetUser.id),
    ]);
    const sess = userService.getUserSessions(targetUser.id);
    const logs = userService.getLoginAudit(targetUser.id);

    setSubscriptions(subs);
    setTransactions(txs);
    setSessions(sess);
    setAuditLogs(logs);
  };

  useEffect(() => {
    const unsub = userService.subscribe((u) => {
      setUser(u);
      if (u) {
        loadData(u);
      }
    });

    // Listen for security email dispatcher events
    const handleEmailDispatch = (e: CustomEvent<SecurityActionRequest>) => {
      setPendingEmailReq(e.detail);
    };

    window.addEventListener('pdx:security_email_dispatched' as any, handleEmailDispatch);

    if (user) {
      loadData(user);
    }

    return () => {
      unsub();
      window.removeEventListener('pdx:security_email_dispatched' as any, handleEmailDispatch);
    };
  }, []);

  const handleTabChange = (tab: CabinetTab) => {
    soundService.playTone('click');
    setActiveTab(tab);
  };

  const handleLogout = () => {
    soundService.playTone('click');
    userService.logout();
    if (onBackToStore) {
      onBackToStore();
    }
  };

  const handleRefreshData = () => {
    const current = userService.getCurrentUser();
    if (current) {
      setUser({ ...current });
      loadData(current);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
          <User className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-white">Сессия завершена</h2>
        <p className="text-sm text-white/50 max-w-sm">
          Для доступа к Личному Кабинету выполните вход под своей учетной записью.
        </p>
        <button
          onClick={() => {
            soundService.playTone('click');
            userService.demoLogin();
          }}
          className="py-3 px-6 rounded-xl font-medium text-xs text-black bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-[0_0_20px_rgba(6,182,212,0.3)]"
        >
          Войти в Demo-аккаунт
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Обзор', icon: Activity },
    { id: 'subscriptions', label: 'Подписки', icon: KeyRound, badge: subscriptions.length },
    { id: 'hwid', label: 'Управление HWID', icon: Cpu },
    { id: 'wallet', label: 'Кошелек', icon: Wallet },
    { id: 'security', label: 'Безопасность', icon: ShieldCheck, alert: user.is_frozen },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Breadcrumb & User Hero Bar */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0c0f1d] via-[#090b14] to-[#07090f] border border-cyan-500/20 p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.12)]">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-violet-500 to-cyan-500" />
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* User Profile Info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border-2 border-cyan-400/40 text-cyan-400 flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
              )}
              {user.is_frozen && (
                <div
                  className="absolute -top-1 -right-1 p-1 rounded-full bg-rose-500 text-white shadow-md"
                  title="Аккаунт заморожен"
                >
                  <Lock className="w-3 h-3" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-extrabold text-white tracking-wide">{user.username}</h1>
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm">
                  {user.role.toUpperCase()}
                </span>
                {user.email_verified && (
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    VERIFIED
                  </span>
                )}
              </div>
              <div className="text-xs font-mono text-white/50 flex flex-wrap items-center gap-3">
                <span>{user.email}</span>
                <span>•</span>
                <span>ID: {user.id}</span>
                {user.telegram_username && (
                  <>
                    <span>•</span>
                    <span className="text-cyan-400">{user.telegram_username}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Balance Pill & Logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 p-2.5 pr-4 rounded-2xl bg-black/60 border border-white/10 font-mono">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-white/40 uppercase">Баланс</div>
                <div className="text-base font-bold text-white">
                  {user.balance.toLocaleString('ru-RU')} <span className="text-cyan-400 text-xs">₽</span>
                </div>
              </div>
              <button
                onClick={() => {
                  soundService.playTone('click');
                  setIsTopUpOpen(true);
                }}
                className="ml-2 p-1.5 rounded-lg bg-cyan-400/20 text-cyan-300 hover:bg-cyan-400 hover:text-black transition-colors"
                title="Пополнить"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="p-3 rounded-2xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-white/60 hover:text-rose-400 transition-colors"
              title="Выйти из аккаунта"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Panic Freeze Alert Banner in User Cabinet */}
        {user.is_frozen && (
          <div className="mt-6 p-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>ВНИМАНИЕ:</strong> Включен режим Panic Freeze. Все финансовые и защитные операции
                приостановлены до подтверждения через почту.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('security')}
              className="px-3 py-1 rounded bg-rose-500 text-black font-semibold text-xs shrink-0"
            >
              Перейти к разморозке
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex overflow-x-auto gap-2 p-1.5 rounded-2xl bg-[#090b14] border border-white/10 scrollbar-none">
        {tabs.map((t) => {
          const isCurrent = activeTab === t.id;
          const IconComp = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id as CabinetTab)}
              className={`py-3 px-5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 shrink-0 ${
                isCurrent
                  ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-500/40 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <IconComp className={`w-4 h-4 ${isCurrent ? 'text-cyan-400' : 'text-white/40'}`} />
              <span>{t.label}</span>
              {t.badge !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/10 text-white/70">
                  {t.badge}
                </span>
              )}
              {t.alert && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab View Container */}
      <div className="min-h-[450px]">
        {activeTab === 'overview' && (
          <OverviewTab
            user={user}
            subscriptions={subscriptions}
            onOpenTopUp={() => setIsTopUpOpen(true)}
            onNavigateTab={(tab) => handleTabChange(tab as CabinetTab)}
            onRefresh={handleRefreshData}
          />
        )}

        {activeTab === 'subscriptions' && (
          <SubscriptionsTab
            user={user}
            subscriptions={subscriptions}
            onRefresh={handleRefreshData}
            onOpenTopUp={() => setIsTopUpOpen(true)}
          />
        )}

        {activeTab === 'hwid' && (
          <HwidManagerTab
            user={user}
            subscriptions={subscriptions}
            onRefresh={handleRefreshData}
          />
        )}

        {activeTab === 'wallet' && (
          <WalletTab
            user={user}
            transactions={transactions}
            onOpenTopUp={() => setIsTopUpOpen(true)}
            onRefresh={handleRefreshData}
          />
        )}

        {activeTab === 'security' && (
          <SecuritySettingsTab
            user={user}
            sessions={sessions}
            auditLogs={auditLogs}
            onRefresh={handleRefreshData}
          />
        )}
      </div>

      {/* TopUp Modal */}
      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        userId={user.id}
        onSuccess={() => handleRefreshData()}
      />

      {/* Cyberpunk Email Dispatcher Modal */}
      <EmailDispatcherModal
        request={pendingEmailReq}
        onClose={() => setPendingEmailReq(null)}
        onActionConfirmed={() => handleRefreshData()}
      />
    </div>
  );
};
