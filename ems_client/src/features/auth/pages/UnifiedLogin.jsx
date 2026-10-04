import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ChartNoAxesCombined,
  ShieldCheck,
  Settings,
  Lock,
  Eye,
  EyeOff,
  Mail,
  Users,
  BarChart3,
  Trophy,
  Rocket,
  Code,
  Award,
  CalendarDays,
  AlertCircle,
  Check,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import WaveBackground from "../../../components/Molecules/WaveBackground";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../../Hooks/useAuth";
import useToast from "../../../Hooks/useToast";

const logoElement = (
  <div className="relative w-5 h-5 flex items-center justify-center">
    <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 top-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
    <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 left-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
    <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 right-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
    <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 bottom-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
  </div>
);

const ROLE_CONFIGS = {
  super_admin: {
    role: "super_admin",
    roleName: "Super Admin",
    loginPath: "/login",
    apiEndpoint: "http://localhost:3000/api/super_admin/login",
    defaultRedirect: "/sidebar",
    badge: "ONE PLATFORM. ALL EVENTS.",
    titleFirst: "Super Admin Control",
    titleHighlight: "Center",
    description:
      "Secure. Monitor. Manage. Take complete control of your event management platform with master-level governance.",
    features: [
      {
        icon: ChartNoAxesCombined,
        title: "Real-time Insights",
        desc: "Track platform registration, engagement & performance.",
      },
      {
        icon: ShieldCheck,
        title: "Role Based Access",
        desc: "Secure privilege isolation for every role in the system.",
      },
      {
        icon: Settings,
        title: "System Configuration",
        desc: "Customize event branding, themes and rules with ease.",
      },
      {
        icon: Lock,
        title: "Security & Logs",
        desc: "Monitor activities and ensure platform-wide audit safety.",
      },
    ],
    formHeading: "Welcome",
    formHeadingHighlight: "Back.",
    formSubtitle: "Sign in to access your master admin dashboard",
    showEventName: false,
    showRegisterLink: false,
    securityNotice: "Secure access for authorized super administrators only",
    alternateLink: {
      text: "Organizer portal? Admin Login →",
      path: "/admin/login",
    },
    buildPayload: ({ email, password }) => ({
      email,
      password,
    }),
    onSuccess: (data, { login }) => {
      const adminUser = data.admin || data.user || {};
      login(data.token, adminUser, "super_admin");
    },
  },

  admin: {
    role: "admin",
    roleName: "Organizer",
    loginPath: "/admin/login",
    apiEndpoint: "http://localhost:3000/api/admin/login",
    defaultRedirect: "/admin",
    badge: "COORDINATE. MANAGE. DELIVER.",
    titleFirst: "Event Organizer",
    titleHighlight: "Command",
    description:
      "Empower your event operations. Oversee team registrations, review applications, and coordinate your organizing committee seamlessly.",
    features: [
      {
        icon: Users,
        title: "Team Screening & Approvals",
        desc: "Review applicant rosters, verify members & manage team statuses.",
      },
      {
        icon: BarChart3,
        title: "Live Turnout Metrics",
        desc: "Monitor registered participants, live capacity & countdown timers.",
      },
      {
        icon: ShieldCheck,
        title: "Committee Management",
        desc: "Coordinate faculty conveners, student coordinators & volunteers.",
      },
      {
        icon: Trophy,
        title: "Prize & Track Setup",
        desc: "Configure track prizes, awards and celebrate winning innovations.",
      },
    ],
    formHeading: "Organizer",
    formHeadingHighlight: "Portal.",
    formSubtitle: "Sign in to manage your assigned event",
    showEventName: true,
    showRegisterLink: false,
    securityNotice: "Authorized event coordinators and organizing committee only",
    alternateLink: {
      text: "Looking for participant login? Student Portal →",
      path: "/user/login",
    },
    buildPayload: ({ email, password, eventName }) => ({
      Email: email,
      Password: password,
      EventName: eventName,
    }),
    onSuccess: (data, { login }) => {
      const adminUser = data.admin || data.user || {};
      localStorage.setItem("token", data.token);
      localStorage.setItem("admin", JSON.stringify(adminUser));
      login(data.token, adminUser, "admin");
    },
  },

  user: {
    role: "user",
    roleName: "Participant",
    loginPath: "/user/login",
    apiEndpoint: "http://localhost:3000/api/users/login",
    defaultRedirect: "/user/dashboard",
    badge: "CONNECT. BUILD. INNOVATE.",
    titleFirst: "Participant",
    titleHighlight: "Gateway",
    description:
      "Find exciting hackathons, team up with passionate creators, choose problem statements, and build projects you're proud of.",
    features: [
      {
        icon: Rocket,
        title: "Discover Hackathons",
        desc: "Browse upcoming campus and virtual hackathons with verified prizes.",
      },
      {
        icon: Users,
        title: "Dynamic Squad Builder",
        desc: "Create teams, invite peers, and assign roles in a few simple steps.",
      },
      {
        icon: Code,
        title: "Problem Statements",
        desc: "Explore curated challenges across web, AI, IoT and social impact.",
      },
      {
        icon: Award,
        title: "Digital Event Pass",
        desc: "Instant application tracking, approval badges and entry passes.",
      },
    ],
    formHeading: "Welcome",
    formHeadingHighlight: "Back.",
    formSubtitle: "Sign in to explore events and manage your teams",
    showEventName: false,
    showRegisterLink: true,
    registerPath: "/user/register",
    securityNotice: "Student & Developer Participant Login",
    alternateLink: {
      text: "Are you an event organizer? Organizer Portal →",
      path: "/admin/login",
    },
    buildPayload: ({ email, password }) => ({
      Email: email,
      Password: password,
    }),
    onSuccess: (data, { login }) => {
      const userObj = data.user || data.users || {};
      const token = data.token;
      localStorage.setItem("user", JSON.stringify(userObj));
      if (token) {
        localStorage.setItem("token", token);
      }
      localStorage.setItem("role", "user");
      login(token, userObj, "user");
    },
  },
};

function getActiveRole(pathname, propRole) {
  if (propRole && ROLE_CONFIGS[propRole]) {
    return propRole;
  }
  if (pathname.includes("/superadmin")) {
    return "super_admin";
  }
  if (pathname.includes("/admin")) {
    return "admin";
  }
  if (pathname.includes("/user")) {
    return "user";
  }
  return "super_admin";
}

function UnifiedLogin({ role: propRole }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();

  const activeRole = getActiveRole(location.pathname, propRole);
  const config = ROLE_CONFIGS[activeRole];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [eventName, setEventName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [shakeForm, setShakeForm] = useState(false);

  const [touched, setTouched] = useState({
    email: false,
    password: false,
    eventName: false,
  });

  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isEventFocused, setIsEventFocused] = useState(false);

  const isEmailFloating = Boolean(email) || isEmailFocused;
  const isPasswordFloating = Boolean(password) || isPasswordFocused;
  const isEventFloating = Boolean(eventName) || isEventFocused;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const getEmailError = () => {
    const val = email.trim();
    if (!val) return "Email address is required";
    if (!emailRegex.test(val)) return "Please enter a valid email address";
    return "";
  };

  const getPasswordError = () => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const getEventNameError = () => {
    if (config.showEventName && !eventName.trim()) {
      return "Event name is required for organizer login";
    }
    return "";
  };

  const emailError = getEmailError();
  const passwordError = getPasswordError();
  const eventNameError = getEventNameError();

  const showEmailError = (submitted || touched.email || email.length > 0) && emailError;
  const showPasswordError = (submitted || touched.password || password.length > 0) && passwordError;
  const showEventNameError = (submitted || touched.eventName || eventName.length > 0) && eventNameError;

  const isEmailValid = (touched.email || email.length > 0) && !emailError;
  const isPasswordValid = (touched.password || password.length > 0) && !passwordError;
  const isEventValid = config.showEventName && (touched.eventName || eventName.length > 0) && !eventNameError;

  const triggerShake = () => {
    setShakeForm(true);
    setTimeout(() => setShakeForm(false), 500);
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleGoogleSignIn = () => {
    toast.info("Google sign-in is coming soon.");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitted(true);

    setTouched({
      email: true,
      password: true,
      eventName: true,
    });

    if (emailError || passwordError || eventNameError) {
      triggerShake();
      const firstError = emailError || passwordError || eventNameError;
      setError(firstError);
      toast.error(firstError);
      return;
    }

    try {
      setLoading(true);

      const payload = config.buildPayload({
        email: email.trim(),
        password,
        eventName: eventName.trim(),
      });

      const res = await fetch(config.apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Login failed");
      }

      config.onSuccess(data, { login });

      toast.success("Logged in successfully!");
      let from = location.state?.from?.pathname;
      if (!from || from.includes("/login") || from.includes("/register") || from === "/") {
        from = config.defaultRedirect;
      }
      navigate(from, { replace: true });
    } catch (err) {
      triggerShake();
      const errMsg = err.message || "Login failed, try again later";
      setError(errMsg);
      toast.error(errMsg);
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
        <div className="hidden lg:flex flex-col w-full lg:w-6/12 p-0 lg:p-6 xl:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              <p className="text-sm font-semibold tracking-widest text-emerald-700 dark:text-emerald-400 mb-4">
                {config.badge}
              </p>

              <h1 className="text-3xl lg:text-5xl font-bold tracking-tight">
                {config.titleFirst}
              </h1>
              <h1 className="text-3xl lg:text-5xl font-bold tracking-tight">
                <span className="text-emerald-700 dark:text-emerald-400 italic font-serif">
                  {config.titleHighlight}
                </span>
              </h1>

              <p className="text-gray-700 dark:text-gray-300 mt-4 lg:mt-6 text-base lg:text-lg leading-relaxed max-w-xl">
                {config.description}
              </p>

              <div className="flex flex-col gap-4 lg:gap-5 mt-6 lg:mt-8">
                {config.features.map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * idx }}
                      className="flex items-center gap-4 lg:gap-5"
                    >
                      <div className="w-12 lg:w-14 h-12 lg:h-14 bg-gray-100 dark:bg-white/10 text-emerald-700 dark:text-emerald-500 p-3 rounded-xl shrink-0 flex items-center justify-center shadow-sm">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-snug">
                          {feature.desc}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex flex-col w-full lg:w-6/12 xl:w-5/12 max-w-xl px-2 sm:px-4"
        >
          <motion.form
            onSubmit={handleLogin}
            noValidate
            autoComplete="off"
            animate={
              shakeForm
                ? { x: [0, -10, 10, -8, 8, -4, 4, 0] }
                : { x: 0 }
            }
            transition={{ duration: 0.4 }}
            className="bg-gray-50/90 dark:bg-zinc-950/80 border-2 backdrop-blur-md border-emerald-700 dark:border-emerald-500/80 rounded-2xl p-7 sm:p-9 md:p-10 shadow-2xl"
          >
            <input
              type="text"
              name="prevent_autofill_username"
              style={{ display: "none" }}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            <input
              type="password"
              name="prevent_autofill_password"
              style={{ display: "none" }}
              tabIndex={-1}
              autoComplete="new-password"
              aria-hidden="true"
            />

            <div className="mb-6 sm:mb-8 text-center">
              <div className="border-2 border-emerald-500 w-12 h-12 p-2 mb-3 rounded-full mx-auto flex items-center justify-center bg-white dark:bg-zinc-900 shadow-sm">
                {logoElement}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                {config.formHeading}{" "}
                <span className="text-emerald-700 dark:text-emerald-500 italic font-serif">
                  {config.formHeadingHighlight}
                </span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                {config.formSubtitle}
              </p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-xs font-medium space-y-2.5"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="flex-1 text-left">{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {config.showEventName && (
              <div className="relative w-full mb-6">
                <CalendarDays
                  className={`absolute left-0 top-3 w-5 h-5 pointer-events-none transition-colors duration-200 ${
                    showEventNameError
                      ? "text-rose-500"
                      : isEventValid
                      ? "text-emerald-500"
                      : "text-emerald-700 dark:text-emerald-400"
                  }`}
                />
                <input
                  type="text"
                  id="user_event_name"
                  name="user_event_name"
                  placeholder=""
                  autoComplete="off"
                  value={eventName}
                  onFocus={() => setIsEventFocused(true)}
                  onBlur={() => {
                    setIsEventFocused(false);
                    handleBlur("eventName");
                  }}
                  onChange={(e) => setEventName(e.target.value)}
                  className={`w-full border-0 border-b-2 bg-transparent pl-8 pr-8 py-2 text-black dark:text-white focus:outline-none transition duration-200 text-sm ${
                    showEventNameError
                      ? "border-rose-500 focus:border-rose-500"
                      : isEventValid
                      ? "border-emerald-500 focus:border-emerald-500"
                      : "border-gray-300 dark:border-gray-600 focus:border-emerald-500"
                  }`}
                />
                <label
                  htmlFor="user_event_name"
                  className={`absolute left-8 transition-all duration-200 pointer-events-none select-none ${
                    isEventFloating
                      ? `-top-4 text-xs font-semibold ${
                          showEventNameError
                            ? "text-rose-500"
                            : isEventValid
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-emerald-700 dark:text-emerald-400"
                        }`
                      : "top-2 text-sm text-gray-500 dark:text-gray-400"
                  }`}
                >
                  Event Name
                </label>

                {isEventValid && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-1 top-3 text-emerald-500"
                  >
                    <Check className="w-4 h-4" />
                  </motion.div>
                )}

                <AnimatePresence>
                  {showEventNameError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -4, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-1.5 text-rose-500 text-xs mt-1.5 font-medium"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{eventNameError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="relative w-full mb-6">
              <Mail
                className={`absolute left-0 top-3 w-5 h-5 pointer-events-none transition-colors duration-200 ${
                  showEmailError
                    ? "text-rose-500"
                    : isEmailValid
                    ? "text-emerald-500"
                    : "text-emerald-700 dark:text-emerald-400"
                }`}
              />
              <input
                type="text"
                id="login_account_email"
                name="login_account_email"
                placeholder=""
                autoComplete="off"
                value={email}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => {
                  setIsEmailFocused(false);
                  handleBlur("email");
                }}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full border-0 border-b-2 bg-transparent pl-8 pr-8 py-2 text-black dark:text-white focus:outline-none transition duration-200 text-sm ${
                  showEmailError
                    ? "border-rose-500 focus:border-rose-500"
                    : isEmailValid
                    ? "border-emerald-500 focus:border-emerald-500"
                    : "border-gray-300 dark:border-gray-600 focus:border-emerald-500"
                }`}
              />
              <label
                htmlFor="login_account_email"
                className={`absolute left-8 transition-all duration-200 pointer-events-none select-none ${
                  isEmailFloating
                    ? `-top-4 text-xs font-semibold ${
                        showEmailError
                          ? "text-rose-500"
                          : isEmailValid
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-emerald-700 dark:text-emerald-400"
                      }`
                    : "top-2 text-sm text-gray-500 dark:text-gray-400"
                }`}
              >
                Email Address
              </label>

              {isEmailValid && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-1 top-3 text-emerald-500"
                >
                  <Check className="w-4 h-4" />
                </motion.div>
              )}

              <AnimatePresence>
                {showEmailError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -4, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1.5 text-rose-500 text-xs mt-1.5 font-medium"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{emailError}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative w-full mb-4">
              <Lock
                className={`absolute left-0 top-3 w-5 h-5 pointer-events-none transition-colors duration-200 ${
                  showPasswordError
                    ? "text-rose-500"
                    : isPasswordValid
                    ? "text-emerald-500"
                    : "text-emerald-700 dark:text-emerald-400"
                }`}
              />
              <input
                type={showPassword ? "text" : "password"}
                id="login_account_password"
                name="login_account_password"
                placeholder=""
                autoComplete="new-password"
                value={password}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => {
                  setIsPasswordFocused(false);
                  handleBlur("password");
                }}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full border-0 border-b-2 bg-transparent pl-8 pr-16 py-2 text-black dark:text-white focus:outline-none transition duration-200 text-sm ${
                  showPasswordError
                    ? "border-rose-500 focus:border-rose-500"
                    : isPasswordValid
                    ? "border-emerald-500 focus:border-emerald-500"
                    : "border-gray-300 dark:border-gray-600 focus:border-emerald-500"
                }`}
              />
              <label
                htmlFor="login_account_password"
                className={`absolute left-8 transition-all duration-200 pointer-events-none select-none ${
                  isPasswordFloating
                    ? `-top-4 text-xs font-semibold ${
                        showPasswordError
                          ? "text-rose-500"
                          : isPasswordValid
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-emerald-700 dark:text-emerald-400"
                      }`
                    : "top-2 text-sm text-gray-500 dark:text-gray-400"
                }`}
              >
                Password
              </label>

              <div className="absolute right-2 top-2.5 flex items-center gap-1.5">
                {isPasswordValid && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-emerald-500 mr-1"
                  >
                    <Check className="w-4 h-4" />
                  </motion.div>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-gray-500 hover:text-emerald-500 dark:text-gray-400 dark:hover:text-emerald-400 focus:outline-none transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {showPassword ? (
                      <motion.div
                        key="eye-off"
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        transition={{ duration: 0.15 }}
                      >
                        <EyeOff className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="eye"
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Eye className="w-5 h-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>

              <AnimatePresence>
                {showPasswordError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -4, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1.5 text-rose-500 text-xs mt-1.5 font-medium"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{passwordError}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between mb-6 text-xs sm:text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                {activeRole === "user" ? "Participant access" : "Secured login"}
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer font-medium">
                Forgot Password?
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer text-sm"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            {config.showRegisterLink && (
              <p className="text-center mt-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                New participant?{" "}
                <Link
                  to={config.registerPath}
                  className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
                >
                  Create an account
                </Link>
              </p>
            )}

            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-200 dark:border-white/10"></div>
              <span className="mx-4 text-gray-400 text-xs uppercase tracking-wider">
                or
              </span>
              <div className="flex-grow border-t border-gray-200 dark:border-white/10"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-gray-200 font-medium py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition duration-300 flex items-center justify-center gap-2 text-sm shadow-sm cursor-pointer"
            >
              <FcGoogle className="w-5 h-5" />
              Sign in with Google
            </button>

            {config.alternateLink && (
              <div className="text-center mt-4">
                <Link
                  to={config.alternateLink.path}
                  className="text-xs text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors"
                >
                  {config.alternateLink.text}
                </Link>
              </div>
            )}

            <div className="border-t border-gray-200 dark:border-white/10 mt-5 pt-4">
              <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
                <Lock className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                <p>{config.securityNotice}</p>
              </div>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default UnifiedLogin;
