import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './components/common/Toast';
import { CursorGlow } from './components/common/CursorGlow';
import { Navbar } from './components/common/Navbar';
import { StorefrontView } from './components/storefront/StorefrontView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLogin } from './components/admin/AdminLogin';
import { UserCabinetView } from './components/cabinet/UserCabinetView';
import { ServiceStatusConfig } from './types/license';
import { licenseService } from './services/licenseService';
import { userService } from './services/userService';

export const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<'storefront' | 'admin' | 'cabinet'>('storefront');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('pdx_admin_auth') === 'true';
  });
  const [statusConfig, setStatusConfig] = useState<ServiceStatusConfig | null>(null);
  const toast = useToast();

  useEffect(() => {
    licenseService.getServiceStatus().then((cfg) => setStatusConfig(cfg));

    // Security Token Interceptor from Email Link Simulation (?security_token=...)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const securityToken = params.get('security_token');
      if (securityToken) {
        userService.confirmSecurityAction(securityToken).then((res) => {
          if (res.success) {
            toast.success(res.message, 'Подтверждение безопасности');
            setCurrentView('cabinet');
          } else {
            toast.error(res.message, 'Ошибка подтверждения');
          }
          // Clean URL without reloading page
          window.history.replaceState({}, document.title, window.location.pathname);
        });
      }
    }
  }, [toast]);

  return (
    <div className="relative min-h-screen bg-cosmic-950 text-slate-100 font-sans selection:bg-cyber-cyan/30 selection:text-white">
      {/* Dynamic Cursor Light Follower */}
      <CursorGlow />

      {/* Main View Switcher */}
      {currentView === 'storefront' ? (
        <StorefrontView
          statusConfig={statusConfig}
          onNavigateAdmin={() => setCurrentView('admin')}
          onNavigateCabinet={() => setCurrentView('cabinet')}
        />
      ) : currentView === 'cabinet' ? (
        <div className="flex flex-col min-h-screen">
          <Navbar
            statusConfig={statusConfig}
            currentView="cabinet"
            onNavigate={(view) => setCurrentView(view)}
          />
          <main className="flex-1 pb-16">
            <UserCabinetView onBackToStore={() => setCurrentView('storefront')} />
          </main>
        </div>
      ) : isAdminAuthenticated ? (
        <AdminDashboard
          onBackToStore={() => setCurrentView('storefront')}
          onLogout={() => {
            sessionStorage.removeItem('pdx_admin_auth');
            setIsAdminAuthenticated(false);
          }}
        />
      ) : (
        <AdminLogin
          onSuccess={() => setIsAdminAuthenticated(true)}
          onBackToStore={() => setCurrentView('storefront')}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
