import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle2, 
  AlertOctagon, 
  AlertTriangle, 
  Info, 
  X, 
  Loader2,
  HelpCircle
} from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  createdAt: number;
}

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export interface NotificationContextType {
  notify: {
    success: (message: string, title?: string, duration?: number) => string;
    error: (message: string, title?: string, duration?: number) => string;
    warning: (message: string, title?: string, duration?: number) => string;
    info: (message: string, title?: string, duration?: number) => string;
    dismiss: (id: string) => void;
    clearAll: () => void;
  };
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    options: ConfirmDialogOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const activeMessagesRef = useRef<Set<string>>(new Set());

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => {
      const target = prev.find(n => n.id === id);
      if (target) {
        activeMessagesRef.current.delete(`${target.type}:${target.message}`);
      }
      return prev.filter((n) => n.id !== id);
    });
  }, []);

  const addNotification = useCallback((
    type: NotificationType, 
    message: string, 
    title?: string, 
    duration?: number
  ): string => {
    // Prevent duplicate spam of identical message while active
    const msgKey = `${type}:${message}`;
    if (activeMessagesRef.current.has(msgKey)) {
      return '';
    }
    activeMessagesRef.current.add(msgKey);

    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    // Default durations according to UX specification
    let autoDismissTime = duration;
    if (autoDismissTime === undefined) {
      if (type === 'success') autoDismissTime = 3800;
      else if (type === 'error') autoDismissTime = 7000;
      else if (type === 'warning') autoDismissTime = 6000;
      else autoDismissTime = 4500;
    }

    const item: NotificationItem = {
      id,
      type,
      title,
      message,
      duration: autoDismissTime,
      createdAt: Date.now()
    };

    setNotifications((prev) => [item, ...prev.slice(0, 4)]); // Keep maximum 5 stacked toasts

    if (autoDismissTime > 0) {
      setTimeout(() => {
        dismiss(id);
      }, autoDismissTime);
    }

    return id;
  }, [dismiss]);

  const clearAll = useCallback(() => {
    activeMessagesRef.current.clear();
    setNotifications([]);
  }, []);

  const confirm = useCallback((options: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmDialog({
        isOpen: true,
        options,
        resolve: (result: boolean) => {
          setConfirmDialog(null);
          resolve(result);
        }
      });
    });
  }, []);

  const notify = {
    success: (message: string, title?: string, duration?: number) => addNotification('success', message, title, duration),
    error: (message: string, title?: string, duration?: number) => addNotification('error', message, title, duration),
    warning: (message: string, title?: string, duration?: number) => addNotification('warning', message, title, duration),
    info: (message: string, title?: string, duration?: number) => addNotification('info', message, title, duration),
    dismiss,
    clearAll
  };

  return (
    <NotificationContext.Provider value={{ notify, confirm }}>
      {children}

      {/* FIXED TOAST NOTIFICATION CONTAINER */}
      <div 
        aria-live="polite" 
        aria-atomic="false"
        className="fixed top-4 right-4 left-4 sm:left-auto sm:w-[420px] z-[9999] pointer-events-none flex flex-col gap-2.5 max-h-screen overflow-hidden"
      >
        {notifications.map((n) => {
          return (
            <div
              key={n.id}
              role={n.type === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto transform transition-all duration-300 ease-out translate-y-0 opacity-100 rounded-2xl p-4 shadow-xl border backdrop-blur-md flex items-start gap-3 relative overflow-hidden ${
                n.type === 'success' 
                  ? 'bg-emerald-900/95 text-white border-emerald-500/40 shadow-emerald-950/20' 
                  : n.type === 'error'
                  ? 'bg-red-900/95 text-white border-red-500/40 shadow-red-950/20'
                  : n.type === 'warning'
                  ? 'bg-amber-900/95 text-white border-amber-500/40 shadow-amber-950/20'
                  : 'bg-slate-900/95 text-white border-blue-500/40 shadow-slate-950/20'
              }`}
            >
              {/* Type Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {n.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-300" />}
                {n.type === 'error' && <AlertOctagon className="w-5 h-5 text-red-300" />}
                {n.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-300" />}
                {n.type === 'info' && <Info className="w-5 h-5 text-blue-300" />}
              </div>

              {/* Text Body */}
              <div className="flex-1 text-left pr-4">
                {n.title && (
                  <h4 className="font-extrabold text-sm tracking-tight leading-tight mb-0.5">
                    {n.title}
                  </h4>
                )}
                <p className="text-xs leading-relaxed font-medium opacity-90">
                  {n.message}
                </p>
              </div>

              {/* Dismiss Button */}
              <button
                type="button"
                onClick={() => dismiss(n.id)}
                className="flex-shrink-0 p-1 rounded-lg opacity-70 hover:opacity-100 hover:bg-white/10 transition-colors focus:outline-none focus:ring-1 focus:ring-white"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Subtle animated auto-dismiss progress bar */}
              {n.duration && n.duration > 0 && (
                <div 
                  className={`absolute bottom-0 left-0 h-1 bg-white/30 animate-pulse`}
                  style={{
                    animation: `shrinkWidth ${n.duration}ms linear forwards`,
                    width: '100%'
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* CONFIRMATION DIALOG MODAL */}
      {confirmDialog?.isOpen && (
        <div 
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
        >
          <div className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-dark-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-scale-in text-left">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${
                confirmDialog.options.isDestructive 
                  ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40' 
                  : 'bg-emerald-50 dark:bg-emerald-950/30 text-brand-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40'
              }`}>
                {confirmDialog.options.isDestructive ? <AlertTriangle className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
              </div>
              <div>
                <h3 id="confirm-dialog-title" className="font-extrabold text-lg text-gray-900 dark:text-dark-50 tracking-tight leading-snug">
                  {confirmDialog.options.title}
                </h3>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {t('common.confirmation') || 'The Khedut Confirmation'}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-dark-300 leading-relaxed">
              {confirmDialog.options.message}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => confirmDialog.resolve(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-700 text-gray-700 dark:text-dark-200 font-bold text-xs hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors focus:outline-none"
              >
                {confirmDialog.options.cancelText || (t('common.cancel') || 'Cancel')}
              </button>
              <button
                type="button"
                onClick={() => confirmDialog.resolve(true)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition-all focus:outline-none ${
                  confirmDialog.options.isDestructive
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                    : 'bg-brand-700 hover:bg-brand-800 shadow-brand-700/20'
                }`}
              >
                {confirmDialog.options.confirmText || (t('common.confirm') || 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
