import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, Info, X, Loader2 } from 'lucide-react';
export default function AppConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  variant = 'danger',
  children
}) {
  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';
  return (
    <AnimatePresence>
      {isOpen && (
        <div key="confirm-modal-portal" className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <motion.div
            key="confirm-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !loading && onCancel && onCancel()}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />
          <motion.div
            key="confirm-modal-dialog"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-2xl z-10"
          >
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              {isDanger ? (
                <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              ) : isWarning ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              ) : (
                <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              )}
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {title}
              </h3>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={onCancel}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3 mb-6">
            {message && (
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {message}
              </p>
            )}
            {children}
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              disabled={loading}
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className={`px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm disabled:opacity-60 ${
                isDanger
                  ? 'bg-rose-600 hover:bg-rose-500'
                  : isWarning
                  ? 'bg-amber-600 hover:bg-amber-500'
                  : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{confirmText}</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
