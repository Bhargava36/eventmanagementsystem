import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';

function PasswordStrengthMeter({ password = '', showDetails = true }) {
  const rules = [
    { id: 'length', label: '8+ characters', test: (p) => p.length >= 8 },
    { id: 'upper', label: 'Uppercase letter (A-Z)', test: (p) => /[A-Z]/.test(p) },
    { id: 'lower', label: 'Lowercase letter (a-z)', test: (p) => /[a-z]/.test(p) },
    { id: 'number', label: 'Number (0-9)', test: (p) => /[0-9]/.test(p) },
    { id: 'special', label: 'Special symbol (!@#$...)', test: (p) => /[^A-Za-z0-9]/.test(p) }
  ];

  const results = rules.map((r) => ({
    ...r,
    passed: r.test(password)
  }));

  const passedCount = results.filter((r) => r.passed).length;

  let strengthLabel = 'Very Weak';
  let strengthColor = 'bg-rose-500 text-rose-500';
  let progressWidth = '20%';

  if (!password) {
    progressWidth = '0%';
    strengthLabel = 'Enter password';
    strengthColor = 'bg-slate-300 dark:bg-zinc-700 text-slate-400';
  } else if (passedCount <= 2) {
    progressWidth = '35%';
    strengthLabel = 'Weak';
    strengthColor = 'bg-rose-500 text-rose-600 dark:text-rose-400';
  } else if (passedCount === 3) {
    progressWidth = '60%';
    strengthLabel = 'Medium';
    strengthColor = 'bg-amber-500 text-amber-600 dark:text-amber-400';
  } else if (passedCount === 4) {
    progressWidth = '80%';
    strengthLabel = 'Good';
    strengthColor = 'bg-teal-500 text-teal-600 dark:text-teal-400';
  } else if (passedCount === 5) {
    progressWidth = '100%';
    strengthLabel = 'Strong';
    strengthColor = 'bg-emerald-500 text-emerald-600 dark:text-emerald-400';
  }

  if (!password) return null;

  return (
    <div className="w-full space-y-2 mt-2 select-none">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-zinc-400 text-[11px] font-medium">
          Password Strength:
        </span>
        <motion.span
          key={strengthLabel}
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          className={`font-bold text-[11px] ${strengthColor.split(' ')[1]}`}
        >
          {strengthLabel}
        </motion.span>
      </div>

      <div className="w-full h-1.5 rounded-md bg-slate-200 dark:bg-zinc-800 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: progressWidth }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={`h-full rounded-md ${strengthColor.split(' ')[0]}`}
        />
      </div>

      {showDetails && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]"
          >
            {results.map((r) => (
              <motion.div
                key={r.id}
                animate={{
                  color: r.passed ? '#059669' : '#64748b'
                }}
                className={`flex items-center gap-1.5 font-medium transition-colors ${
                  r.passed
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-zinc-500'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] transition-all ${
                    r.passed
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600'
                  }`}
                >
                  {r.passed ? (
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  ) : (
                    <X className="w-2.5 h-2.5" />
                  )}
                </div>
                <span>{r.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

export default PasswordStrengthMeter;
