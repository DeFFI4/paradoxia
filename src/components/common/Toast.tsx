import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { soundService } from '../../services/soundService';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastItem['type'], message: string, title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { id, type, message, title };

    // Play synthesized sound feedback
    if (type === 'success') {
      soundService.playTone('success');
    } else if (type === 'error' || type === 'warning') {
      soundService.playTone('alert');
    } else {
      soundService.playTone('click');
    }

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const toast = {
    success: (msg: string, title?: string) => addToast('success', msg, title),
    error: (msg: string, title?: string) => addToast('error', msg, title),
    warning: (msg: string, title?: string) => addToast('warning', msg, title),
    info: (msg: string, title?: string) => addToast('info', msg, title),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Overlay Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md pointer-events-none">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`
              pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-2xl shadow-2xl transition-all duration-300 animate-in slide-in-from-right-8 fade-in
              ${item.type === 'success' ? 'bg-cosmic-850/90 border-cyber-emerald/40 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : ''}
              ${item.type === 'error' ? 'bg-cosmic-850/90 border-cyber-crimson/40 text-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.2)]' : ''}
              ${item.type === 'warning' ? 'bg-cosmic-850/90 border-cyber-amber/40 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : ''}
              ${item.type === 'info' ? 'bg-cosmic-850/90 border-cyber-cyan/40 text-cyan-100 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : ''}
            `}
          >
            <div className="mt-0.5 shrink-0">
              {item.type === 'success' && <CheckCircle2 className="w-5 h-5 text-cyber-emerald" />}
              {item.type === 'error' && <XCircle className="w-5 h-5 text-cyber-crimson" />}
              {item.type === 'warning' && <AlertTriangle className="w-5 h-5 text-cyber-amber" />}
              {item.type === 'info' && <Info className="w-5 h-5 text-cyber-cyan" />}
            </div>
            <div className="flex-1 text-sm">
              {item.title && <div className="font-semibold text-white mb-0.5">{item.title}</div>}
              <div className="text-slate-300">{item.message}</div>
            </div>
            <button
              onClick={() => removeToast(item.id)}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context.toast;
};
