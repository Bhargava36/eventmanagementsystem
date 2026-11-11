import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Mail,
  KeyRound,
  Lock,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../Hooks/useToast';
export default function TwoFactorSettingsCard() {
  const toast = useToast();
  const [enabled, setEnabled] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  // Enable 2FA Modal states
  const [showEnableModal, setShowEnableModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  // Disable 2FA Modal states
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [password, setPassword] = useState('');
  const [disabling, setDisabling] = useState(false);
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }, []);
  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/security/2fa/status`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEnabled(Boolean(data.twoFactorEnabled));
        if (data.email) setUserEmail(data.email);
      }
    } catch (err) {
      console.error('[2FA] Error fetching status:', err);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);
  // Trigger Enable Flow: request OTP first
  const handleStartEnable = async () => {
    try {
      setRequestingOtp(true);
      const res = await fetch(`${API_BASE_URL}/api/security/2fa/request-enable`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Verification code sent to ${data.email || 'your email'}`);
        setShowEnableModal(true);
      } else {
        toast.error(data.message || 'Failed to request verification code.');
      }
    } catch (err) {
      toast.error('Network error initiating 2FA setup.');
    } finally {
      setRequestingOtp(false);
    }
  };
  // Submit OTP to Confirm Enablement
  const handleConfirmEnable = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      toast.error('Please enter the 6-digit code received via email.');
      return;
    }
    try {
      setVerifyingOtp(true);
      const res = await fetch(`${API_BASE_URL}/api/security/2fa/confirm-enable`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ otpCode: otpCode.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Two-Factor Authentication is now enabled!');
        setEnabled(true);
        setShowEnableModal(false);
        setOtpCode('');
      } else {
        toast.error(data.message || 'Invalid or expired verification code.');
      }
    } catch (err) {
      toast.error('Network error confirming 2FA.');
    } finally {
      setVerifyingOtp(false);
    }
  };
  // Submit Password to Disable 2FA
  const handleConfirmDisable = async (e) => {
    e.preventDefault();
    if (!password) {
      toast.error('Account password is required to disable 2FA.');
      return;
    }
    try {
      setDisabling(true);
      const res = await fetch(`${API_BASE_URL}/api/security/2fa/disable`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Two-Factor Authentication has been disabled.');
        setEnabled(false);
        setShowDisableModal(false);
        setPassword('');
      } else {
        toast.error(data.message || 'Incorrect password.');
      }
    } catch (err) {
      toast.error('Network error disabling 2FA.');
    } finally {
      setDisabling(false);
    }
  };
  return (
    <>
      <div className="bg-white dark:bg-black rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className={`w-2.5 h-2.5 rounded-full ${enabled ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                Two-Factor Authentication (2FA)
              </h3>
              {loading ? null : enabled ? (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Enabled
                </span>
              ) : (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Disabled
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Require a 6-digit one-time code sent to your registered email address every time you sign in.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Toggle Switch */}
            <button
              type="button"
              disabled={loading || requestingOtp}
              onClick={() => {
                if (enabled) {
                  setShowDisableModal(true);
                } else {
                  handleStartEnable();
                }
              }}
              className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                enabled ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
              role="switch"
              aria-checked={enabled}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
        <div className="mt-4 pt-1">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 flex items-start gap-3">
            <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              {enabled ? (
                <span>
                  Your account is protected. Every login requires your password plus an email verification code dispatched to <strong className="text-gray-900 dark:text-white">{userEmail || 'your email'}</strong>.
                </span>
              ) : (
                <span>
                  Two-Factor Authentication is currently <strong className="text-gray-900 dark:text-white">off</strong>. Turning it on will require OTP verification upon every login for enhanced security.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* MODAL 1: Enable 2FA (Enter OTP) */}
      {showEnableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-2xl max-w-md w-full p-6 sm:p-7">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">
                    Enable Two-Factor Auth
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Verify ownership of your email address
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEnableModal(false);
                  setOtpCode('');
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleConfirmEnable} className="mt-5 space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
                We sent a 6-digit confirmation code to your email. Enter it below to activate 2FA.
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full text-center text-2xl tracking-[0.4em] font-mono py-3 px-4 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-black text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowEnableModal(false);
                    setOtpCode('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyingOtp || otpCode.length !== 6}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {verifyingOtp ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Activating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Activate 2FA</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL 2: Disable 2FA (Enter Password) */}
      {showDisableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-2xl max-w-md w-full p-6 sm:p-7">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">
                    Disable Two-Factor Auth
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Confirm your identity to turn off 2FA
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDisableModal(false);
                  setPassword('');
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleConfirmDisable} className="mt-5 space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Disabling 2FA reduces account security. You will only require a password to sign in.
                </span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Confirm Current Password
                </label>
                <input
                  type="password"
                  autoFocus
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full py-2.5 px-3.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-black text-gray-900 dark:text-white focus:outline-none focus:border-zinc-500 text-sm"
                />
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowDisableModal(false);
                    setPassword('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={disabling || !password}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-black transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {disabling ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Turn Off 2FA</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
