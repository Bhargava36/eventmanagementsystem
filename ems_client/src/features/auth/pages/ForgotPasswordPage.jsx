import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Loader2,
  Check,
  Send,
} from "lucide-react";
import WaveBackground from "../../../components/Molecules/WaveBackground";
import { API_BASE_URL } from "@/lib/api";
import useToast from "../../../Hooks/useToast";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const toast = useToast();

  // Wizard Steps: 'EMAIL' | 'OTP' | 'PASSWORD' | 'SUCCESS'
  const [step, setStep] = useState("EMAIL");

  // Form State
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Focus states for input styling
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPassFocused, setIsPassFocused] = useState(false);
  const [isConfirmPassFocused, setIsConfirmPassFocused] = useState(false);

  // Status & feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [autoRedirectTimer, setAutoRedirectTimer] = useState(5);
  const [shakeCard, setShakeCard] = useState(false);

  const otpInputRefs = useRef([]);

  const triggerShake = () => {
    setShakeCard(true);
    setTimeout(() => setShakeCard(false), 500);
  };

  // Countdown timer for OTP Resend
  useEffect(() => {
    let timer;
    if (step === "OTP" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Countdown timer for automatic redirect on success
  useEffect(() => {
    let redirectInterval;
    if (step === "SUCCESS") {
      redirectInterval = setInterval(() => {
        setAutoRedirectTimer((prev) => {
          if (prev <= 1) {
            clearInterval(redirectInterval);
            navigate("/user/login");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(redirectInterval);
  }, [step, navigate]);

  // Auto-focus first OTP box when entering OTP step
  useEffect(() => {
    if (step === "OTP") {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 200);
    }
  }, [step]);

  // Step 1: Send OTP to Email via SMTP
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError("");
    setSuccessMsg("");

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError("Please enter your registered email address.");
      triggerShake();
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setError("Please enter a valid email address (e.g., alex@example.com).");
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/forgot-password/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to dispatch verification code.");
      }

      toast.success(data.message || "6-digit OTP code dispatched to your email!");
      setSuccessMsg(data.message || "Verification code dispatched successfully.");
      setCountdown(60);
      setCanResend(false);
      setOtpDigits(["", "", "", "", "", ""]);
      setStep("OTP");
    } catch (err) {
      triggerShake();
      setError(err.message || "Could not connect to the server.");
      toast.error(err.message || "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/forgot-password/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to resend verification code.");
      }

      toast.success("New verification code dispatched!");
      setSuccessMsg("A new 6-digit code has been sent to your email.");
      setCountdown(60);
      setCanResend(false);
      setOtpDigits(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
    } catch (err) {
      triggerShake();
      setError(err.message || "Failed to resend verification code.");
      toast.error(err.message || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  // OTP Digits Handling
  const handleOtpChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, "");
    if (!cleanVal) {
      const updated = [...otpDigits];
      updated[index] = "";
      setOtpDigits(updated);
      return;
    }

    const updated = [...otpDigits];
    updated[index] = cleanVal.slice(-1);
    setOtpDigits(updated);

    if (index < 5 && cleanVal) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim().replace(/\D/g, "");
    if (pasted.length >= 6) {
      const digits = pasted.slice(0, 6).split("");
      setOtpDigits(digits);
      otpInputRefs.current[5]?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setError("");
    setSuccessMsg("");

    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/forgot-password/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: fullOtp,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Invalid or expired verification code.");
      }

      toast.success("Verification successful!");
      setResetToken(data.resetToken || "");
      setStep("PASSWORD");
    } catch (err) {
      triggerShake();
      setError(err.message || "Verification failed. Please check the code.");
      toast.error(err.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  // Password rules validation
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e?.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!isPasswordValid) {
      setError("Please ensure your new password satisfies all security criteria.");
      triggerShake();
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match. Please re-type your password confirmation.");
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const fullOtp = otpDigits.join("");
      const res = await fetch(`${API_BASE_URL}/api/users/forgot-password/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: fullOtp,
          resetToken,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update password.");
      }

      toast.success("Password updated successfully!");
      setStep("SUCCESS");
    } catch (err) {
      triggerShake();
      setError(err.message || "Could not update password. Please try again.");
      toast.error(err.message || "Password update failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="relative w-full min-h-screen overflow-hidden bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300 pt-28 sm:pt-32 lg:pt-36 pb-16"
      animate={{ y: [-20, 0] }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <WaveBackground />

      <div className="relative z-10 flex flex-col lg:flex-row mx-4 sm:mx-8 lg:mx-12 xl:mx-20 gap-8 lg:gap-14 items-center lg:items-start justify-center">
        {/* Left Side: Brand & Feature Highlights */}
        <div className="hidden lg:flex flex-col w-full lg:w-6/12 p-0 lg:p-6 xl:p-8">
          <p className="text-sm font-semibold tracking-widest text-emerald-700 dark:text-emerald-400 mb-4 uppercase">
            ACCOUNT RECOVERY
          </p>

          <h1 className="text-3xl lg:text-5xl font-bold tracking-tight">
            Reset Your Password
          </h1>
          <h1 className="text-3xl lg:text-5xl font-bold tracking-tight">
            <span className="text-emerald-700 dark:text-emerald-400 italic font-serif">
              Safely & Securely
            </span>
          </h1>

          <p className="text-gray-700 dark:text-gray-300 mt-4 lg:mt-6 text-base lg:text-lg leading-relaxed max-w-xl">
            Lost access to your account? Enter your registered email address and we'll immediately dispatch a secure 6-digit one-time passcode via SMTP protocol.
          </p>

          <div className="flex flex-col gap-4 lg:gap-5 mt-8">
            <div className="flex items-center gap-4 lg:gap-5">
              <div className="w-12 lg:w-14 h-12 lg:h-14 bg-gray-100 dark:bg-white/10 text-emerald-700 dark:text-emerald-500 p-3 rounded-xl shrink-0 flex items-center justify-center shadow-sm">
                <Send className="w-6 h-6" />
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                  Direct SMTP Delivery
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-snug">
                  Encrypted email dispatch with standard TLS protection directly to your inbox.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 lg:gap-5">
              <div className="w-12 lg:w-14 h-12 lg:h-14 bg-gray-100 dark:bg-white/10 text-emerald-700 dark:text-emerald-500 p-3 rounded-xl shrink-0 flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                  Bcrypt Hash Security
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-snug">
                  Every 6-digit OTP is cryptographically hashed with auto-expiration in 10 minutes.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 lg:gap-5">
              <div className="w-12 lg:w-14 h-12 lg:h-14 bg-gray-100 dark:bg-white/10 text-emerald-700 dark:text-emerald-500 p-3 rounded-xl shrink-0 flex items-center justify-center shadow-sm">
                <Lock className="w-6 h-6" />
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                  Zero Unauthorized Overwrite
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-snug">
                  Password changes require a signed verification token to prevent unauthorized access.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive 4-Step Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex flex-col w-full lg:w-6/12 xl:w-5/12 max-w-xl px-2 sm:px-4"
        >
          {/* Step Pill Indicators */}
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase">
              Step {step === "EMAIL" ? "1 of 3: Email" : step === "OTP" ? "2 of 3: Verification" : step === "PASSWORD" ? "3 of 3: New Password" : "Complete"}
            </span>
            <div className="flex items-center gap-1.5">
              {["EMAIL", "OTP", "PASSWORD"].map((s, idx) => {
                const stepOrder = ["EMAIL", "OTP", "PASSWORD", "SUCCESS"];
                const isCompleted = stepOrder.indexOf(step) > idx;
                const isCurrent = step === s;
                return (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isCurrent
                        ? "w-7 bg-emerald-600 dark:bg-emerald-500"
                        : isCompleted
                        ? "w-3 bg-emerald-400/80 dark:bg-emerald-600"
                        : "w-2 bg-gray-200 dark:bg-zinc-800"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          <motion.div
            animate={
              shakeCard
                ? { x: [0, -10, 10, -8, 8, -4, 4, 0] }
                : { x: 0 }
            }
            transition={{ duration: 0.4 }}
            className="bg-gray-50/95 dark:bg-zinc-950/85 border-2 backdrop-blur-md border-emerald-700/60 dark:border-emerald-500/60 rounded-2xl p-7 sm:p-9 md:p-10 shadow-2xl relative overflow-hidden"
          >
            {/* Top Emerald hairline highlight */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600" />

            <AnimatePresence mode="wait">
              {/* STEP 1: ENTER EMAIL */}
              {step === "EMAIL" && (
                <motion.div
                  key="step-email"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Enter Registered Email
                      </h2>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        We'll send a 6-digit verification code to this address.
                      </p>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <form onSubmit={handleSendOtp} className="space-y-6">
                    <div className="relative">
                      <Mail
                        className={`absolute left-0 top-2.5 w-5 h-5 transition-colors duration-200 pointer-events-none ${
                          isEmailFocused
                            ? "text-emerald-600 dark:text-emerald-400"
                            : email
                            ? "text-emerald-500"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      />
                      <input
                        id="reset_email"
                        type="email"
                        autoFocus
                        value={email}
                        onFocus={() => setIsEmailFocused(true)}
                        onBlur={() => setIsEmailFocused(false)}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError("");
                        }}
                        required
                        className="w-full border-0 border-b-2 bg-transparent pl-8 pr-4 py-2 text-black dark:text-white focus:outline-none transition duration-200 text-sm border-gray-300 dark:border-gray-600 focus:border-emerald-500"
                      />
                      <label
                        htmlFor="reset_email"
                        className={`absolute left-8 transition-all duration-200 pointer-events-none select-none text-xs font-semibold ${
                          isEmailFocused || email
                            ? "-top-4 text-emerald-600 dark:text-emerald-400"
                            : "top-2.5 text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        Registered Email Address
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !email.trim()}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer text-sm flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Dispatching OTP...</span>
                        </>
                      ) : (
                        <span>Send Verification Code</span>
                      )}
                    </button>
                  </form>

                  <div className="mt-8 pt-5 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                    <Link
                      to="/user/login"
                      className="inline-flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back to Sign In
                    </Link>
                    <span className="text-gray-500 dark:text-gray-400">
                      Standard TLS SMTP
                    </span>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: VERIFY OTP */}
              {step === "OTP" && (
                <motion.div
                  key="step-otp"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Enter Verification Code
                      </h2>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Check your email inbox for the 6-digit code.
                      </p>
                    </div>
                  </div>

                  <div className="mb-5 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400">
                    <div className="flex items-center gap-1.5 truncate max-w-[240px]">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setStep("EMAIL");
                        setError("");
                      }}
                      className="underline font-medium hover:text-emerald-900 dark:hover:text-emerald-200 cursor-pointer ml-2"
                    >
                      Change
                    </button>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    {/* 6 Digit Input Boxes */}
                    <div
                      className="flex items-center justify-between gap-1.5 sm:gap-2.5"
                      onPaste={handleOtpPaste}
                    >
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (otpInputRefs.current[idx] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className={`w-11 sm:w-12 h-13 sm:h-14 text-center text-xl sm:text-2xl font-bold bg-white dark:bg-zinc-900 border-2 rounded-xl focus:outline-none transition-all ${
                            digit
                              ? "border-emerald-600 dark:border-emerald-400 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                              : "border-gray-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:border-emerald-500"
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otpDigits.join("").length !== 6}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer text-sm flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Verifying OTP...</span>
                        </>
                      ) : (
                        <span>Verify Code</span>
                      )}
                    </button>
                  </form>

                  {/* Resend Actions */}
                  <div className="mt-8 pt-5 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setStep("EMAIL")}
                      className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back
                    </button>

                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading}
                        className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Resend Code
                      </button>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        Resend code in <strong className="font-mono text-emerald-700 dark:text-emerald-400">0:{countdown < 10 ? `0${countdown}` : countdown}</strong>
                      </span>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: NEW PASSWORD */}
              {step === "PASSWORD" && (
                <motion.div
                  key="step-password"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Create New Password
                      </h2>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Choose a strong password to protect your account.
                      </p>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <form onSubmit={handleResetPassword} className="space-y-6">
                    {/* New Password */}
                    <div className="relative">
                      <Lock
                        className={`absolute left-0 top-2.5 w-5 h-5 transition-colors duration-200 pointer-events-none ${
                          isPassFocused
                            ? "text-emerald-600 dark:text-emerald-400"
                            : newPassword
                            ? "text-emerald-500"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      />
                      <input
                        id="reset_new_password"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onFocus={() => setIsPassFocused(true)}
                        onBlur={() => setIsPassFocused(false)}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full border-0 border-b-2 bg-transparent pl-8 pr-10 py-2 text-black dark:text-white focus:outline-none transition duration-200 text-sm border-gray-300 dark:border-gray-600 focus:border-emerald-500"
                      />
                      <label
                        htmlFor="reset_new_password"
                        className={`absolute left-8 transition-all duration-200 pointer-events-none select-none text-xs font-semibold ${
                          isPassFocused || newPassword
                            ? "-top-4 text-emerald-600 dark:text-emerald-400"
                            : "top-2.5 text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        New Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-1 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                      <Lock
                        className={`absolute left-0 top-2.5 w-5 h-5 transition-colors duration-200 pointer-events-none ${
                          isConfirmPassFocused
                            ? "text-emerald-600 dark:text-emerald-400"
                            : confirmPassword
                            ? "text-emerald-500"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      />
                      <input
                        id="reset_confirm_password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onFocus={() => setIsConfirmPassFocused(true)}
                        onBlur={() => setIsConfirmPassFocused(false)}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full border-0 border-b-2 bg-transparent pl-8 pr-10 py-2 text-black dark:text-white focus:outline-none transition duration-200 text-sm border-gray-300 dark:border-gray-600 focus:border-emerald-500"
                      />
                      <label
                        htmlFor="reset_confirm_password"
                        className={`absolute left-8 transition-all duration-200 pointer-events-none select-none text-xs font-semibold ${
                          isConfirmPassFocused || confirmPassword
                            ? "-top-4 text-emerald-600 dark:text-emerald-400"
                            : "top-2.5 text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        Confirm New Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-1 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Requirements Checklist */}
                    <div className="p-3 bg-white/70 dark:bg-zinc-900/70 border border-gray-200 dark:border-zinc-800 rounded-xl space-y-1.5 text-xs">
                      <p className="font-semibold text-gray-700 dark:text-gray-300 text-[11px] uppercase tracking-wider">
                        Security Requirements
                      </p>
                      <div className="grid grid-cols-2 gap-1 text-[11px]">
                        <span
                          className={`flex items-center gap-1.5 ${
                            hasMinLength ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          <Check className={`w-3 h-3 ${hasMinLength ? "opacity-100" : "opacity-30"}`} />
                          At least 8 chars
                        </span>
                        <span
                          className={`flex items-center gap-1.5 ${
                            hasUppercase ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          <Check className={`w-3 h-3 ${hasUppercase ? "opacity-100" : "opacity-30"}`} />
                          Uppercase letter
                        </span>
                        <span
                          className={`flex items-center gap-1.5 ${
                            hasLowercase ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          <Check className={`w-3 h-3 ${hasLowercase ? "opacity-100" : "opacity-30"}`} />
                          Lowercase letter
                        </span>
                        <span
                          className={`flex items-center gap-1.5 ${
                            hasNumber ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          <Check className={`w-3 h-3 ${hasNumber ? "opacity-100" : "opacity-30"}`} />
                          Number included
                        </span>
                      </div>
                      {confirmPassword && (
                        <div
                          className={`pt-1 border-t border-gray-200 dark:border-zinc-700 text-[11px] flex items-center gap-1.5 ${
                            passwordsMatch ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-rose-500"
                          }`}
                        >
                          <Check className={`w-3 h-3 ${passwordsMatch ? "opacity-100" : "opacity-30"}`} />
                          {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !isPasswordValid || !passwordsMatch}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer text-sm flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <span>Update Password</span>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* STEP 4: SUCCESS */}
              {step === "SUCCESS" && (
                <motion.div
                  key="step-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-4"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Password Reset Complete!
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-sm mx-auto">
                    Your password has been successfully updated. A confirmation notice has been dispatched to your email.
                  </p>

                  <div className="mt-6 p-3 rounded-xl bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs text-gray-600 dark:text-gray-400">
                    Redirecting to sign in automatically in{" "}
                    <strong className="text-emerald-700 dark:text-emerald-400 font-mono text-sm">
                      {autoRedirectTimer}
                    </strong>{" "}
                    seconds...
                  </div>

                  <div className="mt-5">
                    <Link
                      to="/user/login"
                      className="w-full inline-flex items-center justify-center py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg cursor-pointer"
                    >
                      Sign In Now
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
