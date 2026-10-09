import React, { useState, useEffect } from 'react';
import { ToastProvider } from './components/common/Toast';
import { CursorGlow } from './components/common/CursorGlow';
import { StorefrontView } from './components/storefront/StorefrontView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLogin } from './components/admin/AdminLogin';
import { ServiceStatusConfig } from './types/license';
import { licenseService } from './services/licenseService';

export const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<'storefront' | 'admin'>('storefront');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('pdx_admin_auth') === 'true';
  });
  const [statusConfig, setStatusConfig] = useState<ServiceStatusConfig | null>(null);

  useEffect(() => {
    licenseService.getServiceStatus().then((cfg) => setStatusConfig(cfg));
  }, []);

  return (
    <div className="relative min-h-screen bg-cosmic-950 text-slate-100 font-sans selection:bg-cyber-cyan/30 selection:text-white">
      {/* Dynamic Cursor Light Follower */}
      <CursorGlow />

      {/* Main View Switcher */}
      {currentView === 'storefront' ? (
        <StorefrontView
          statusConfig={statusConfig}
          onNavigateAdmin={() => setCurrentView('admin')}
        />
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
