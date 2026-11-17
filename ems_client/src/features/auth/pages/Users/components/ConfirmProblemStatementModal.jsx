import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, X, Check, RefreshCw } from 'lucide-react';

export default function ConfirmProblemStatementModal({
  selectedPS,
  team,
  displayName,
  teamSelection,
  submitting,
  onConfirm,
  onClose
}) {
  if (!selectedPS || !team) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="my-auto w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-950 border border-emerald-500/30 p-6 text-slate-900 dark:text-white shadow-2xl space-y-5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-500" />
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Confirm Problem Statement
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3 bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-black">
                {selectedPS.ProblemCode}
              </span>
              {selectedPS.Theme && (
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 text-[10px] font-bold">
                  {selectedPS.Theme}
                </span>
              )}
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {selectedPS.Title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed line-clamp-3">
              {selectedPS.Description}
            </p>
            <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-zinc-400">
              <span>Selected For:</span>
              <span className="font-bold text-slate-900 dark:text-white">{displayName}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {teamSelection?.ProblemStatementId
              ? `Switching to ${selectedPS.ProblemCode} will replace your previous selection. You can continue to change your problem statement anytime until the timer expires.`
              : `Once confirmed, this problem statement will be set for your team. You can continue to switch to another challenge anytime before the selection countdown timer ends.`}
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 transition cursor-pointer flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving selection...</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>{teamSelection?.ProblemStatementId ? 'Confirm & Switch Statement' : 'Confirm & Lock In'}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

