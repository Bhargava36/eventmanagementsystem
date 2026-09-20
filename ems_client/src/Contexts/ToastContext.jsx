import React, { createContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
  };

  const getToastConfig = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
          borderColor: 'border-emerald-500/30 dark:border-emerald-500/30',
          bgColor: 'bg-white/95 dark:bg-gray-950/95',
          accentColor: 'text-emerald-700 dark:text-emerald-400',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />,
          borderColor: 'border-red-500/30 dark:border-red-500/30',
          bgColor: 'bg-white/95 dark:bg-gray-950/95',
          accentColor: 'text-red-700 dark:text-red-400',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0" />,
          borderColor: 'border-amber-500/30 dark:border-amber-500/30',
          bgColor: 'bg-white/95 dark:bg-gray-950/95',
          accentColor: 'text-amber-700 dark:text-amber-400',
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0" />,
          borderColor: 'border-blue-500/30 dark:border-blue-500/30',
          bgColor: 'bg-white/95 dark:bg-gray-950/95',
          accentColor: 'text-blue-700 dark:text-blue-400',
        };
    }
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2.5rem)] pointer-events-none"
        aria-live="polite"
      >
        <AnimatePresence>
          {toasts.map(({ id, message, type }) => {
            const config = getToastConfig(type);
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, x: 60, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.95 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-xl backdrop-blur-md ${config.bgColor} ${config.borderColor}`}
              >
                <div className="mt-0.5">{config.icon}</div>
                <div className="flex-1 min-w-0 pr-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words leading-snug">
                    {message}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(id)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-0.5 rounded-lg shrink-0 cursor-pointer"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
