import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShieldCheck,
  Users,
  BarChart3,
  Settings,
  Lock,
  Eye,
  EyeOff,
  Mail,
  User,
  Phone,
  GraduationCap,
  MapPin,
  Map,
  Trophy,
  Rocket,
  Code,
  Award,
  CalendarDays,
  VenusAndMars,
  AlertCircle,
  Check,
} from "lucide-react";
import WaveBackground from "../../../components/Molecules/WaveBackground";
import PasswordStrengthMeter from "../../../components/Molecules/PasswordStrengthMeter";
import { motion, AnimatePresence } from "framer-motion";
import useToast from "../../../Hooks/useToast";

const logoElement = (
  <div className="relative w-5 h-5 flex items-center justify-center">
    <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 top-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
    <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 left-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
    <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 right-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
    <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 bottom-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
  </div>
);

const REGISTER_CONFIGS = {
  super_admin: {
    role: "super_admin",
    roleName: "Super Admin",
    badge: "CENTRAL GOVERNANCE & CONTROL",
    titleFirst: "Master Admin",
    titleHighlight: "Provisioning",
    description:
      "Establish master authority over HackHub EMS. Manage multi-event infrastructures, deploy organizing committees, and track cross-campus innovation metrics.",
    features: [
      {
        icon: ShieldCheck,
        title: "Platform-Wide Authority",
        desc: "Unified privileges across all events, organizers, and users.",
      },
      {
        icon: Settings,
        title: "Dynamic Event Engine",
        desc: "Provision branded hackathons and configure prize budgets.",
      },
      {
        icon: BarChart3,
        title: "Aggregated Analytics",
        desc: "Real-time visibility into overall registrations and submission trends.",
      },
      {
        icon: Lock,
        title: "Enterprise Security",
        desc: "End-to-end encrypted audits and administrative role protection.",
      },
    ],
    formHeading: "Create",
    formHeadingHighlight: "Super Admin.",
    formSubtitle: "Set up master administrative credentials",
    loginPath: "/superadmin/login",
    loginPrompt: "Already a Super Admin? Sign in",
    securityNotice: "Authorized institutional heads only",
    apiEndpoint: "http://localhost:3000/api/super_admin/register",
    successMsg: "Super Admin account created successfully!",
    redirectPath: "/superadmin/login",
  },

  admin: {
    role: "admin",
    roleName: "Organizer",
    badge: "EVENT OPERATIONS & MANAGEMENT",
    titleFirst: "Organizer",
    titleHighlight: "Onboarding",
    description:
      "Take charge of your hackathon. Screen incoming team applications, build organizing subcommittees, and oversee track leaderboards effortlessly.",
    features: [
      {
        icon: Users,
        title: "Applicant Screening",
        desc: "Approve teams, verify members, and manage capacity quotas.",
      },
      {
        icon: Trophy,
        title: "Prize & Track Allocation",
        desc: "Designate tracks, problem statements, and sponsor awards.",
      },
      {
        icon: ShieldCheck,
        title: "Committee Coordination",
        desc: "Assign student coordinators, faculty conveners, and volunteers.",
      },
      {
        icon: BarChart3,
        title: "Operational Dashboard",
        desc: "Live countdowns, registration feeds, and turnout tracking.",
      },
    ],
    formHeading: "Organizer",
    formHeadingHighlight: "Account.",
    formSubtitle: "Register to coordinate and manage your assigned hackathon",
    loginPath: "/admin/login",
    loginPrompt: "Already an organizer? Sign in",
    securityNotice: "Official event coordinators only",
    apiEndpoint: "http://localhost:3000/api/admin/create",
    successMsg: "Organizer account created successfully!",
    redirectPath: "/admin/login",
  },

  user: {
    role: "user",
    roleName: "Participant",
    badge: "START YOUR BUILDER JOURNEY",
    titleFirst: "Join the Next",
    titleHighlight: "Cohort",
    description:
      "Create your participant passport to discover premier hackathons, recruit skilled teammates, pick problem statements, and build impactful projects.",
    features: [
      {
        icon: Rocket,
        title: "Curated Competitions",
        desc: "Browse verified physical and virtual hackathons with major prize pools.",
      },
      {
        icon: Users,
        title: "Squad Collaboration",
        desc: "Form squads, invite friends, and coordinate team submissions.",
      },
      {
        icon: Code,
        title: "Problem Statements",
        desc: "Access verified industry challenges across Web3, AI, and Sustainability.",
      },
      {
        icon: Award,
        title: "Digital Entry Pass",
        desc: "Instant live approval tracking, badge passes, and certificates.",
      },
    ],
    formHeading: "Create",
    formHeadingHighlight: "Account.",
    formSubtitle: "Sign up to explore events, form teams, and start building",
    loginPath: "/user/login",
    loginPrompt: "Already have an account? Sign in",
    securityNotice: "Student & Developer Participant Registration",
    apiEndpoint: "http://localhost:3000/api/users/create",
    successMsg: "User account created successfully!",
    redirectPath: "/user/login",
  },
};

function getActiveRole(pathname, propRole) {
  if (propRole && REGISTER_CONFIGS[propRole]) {
    return propRole;
  }
  if (pathname.includes("/superadmin") || pathname === "/register") {
    return "super_admin";
  }
  if (pathname.includes("/admin")) {
    return "admin";
  }
  return "user";
}

function UnifiedRegister({ role: propRole }) {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const activeRole = getActiveRole(location.pathname, propRole);
  const config = REGISTER_CONFIGS[activeRole];

  const [formData, setFormData] = useState({
    UserName: "",
    Email: "",
    Password: "",
    confirmPassword: "",
    PhoneNumber: "",
    Mobile: "",
    College: "",
    Location: "",
    State: "",
    Gender: "Male",
    EventId: "",
  });

  const [touched, setTouched] = useState({
    UserName: false,
    Email: false,
    Password: false,
    confirmPassword: false,
    Phone: false,
    College: false,
    EventId: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shakeForm, setShakeForm] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const nameRegex = /^[a-zA-Z\s.'-]+$/;
  const phoneOnlyDigits = /^[0-9]+$/;
  const phoneValidRegex = /^[6-9]\d{9}$/;

  const getUserNameError = () => {
    const val = formData.UserName.trim();
    if (!val) {
      return activeRole === "admin" ? "Admin Name is required" : "Full Name is required";
    }
    if (val.length < 3) {
      return "Name must be at least 3 characters";
    }
    if (!nameRegex.test(val)) {
      return "Name should only contain letters (no numbers or symbols)";
    }
    return "";
  };

  const getEmailError = () => {
    const val = formData.Email.trim();
    if (!val) return "Email address is required";
    if (!emailRegex.test(val)) return "Please enter a valid email (e.g. name@domain.com)";
    return "";
  };

  const getPhoneError = () => {
    const val = activeRole === "super_admin" ? formData.PhoneNumber.trim() : formData.Mobile.trim();
    if (!val) return "Mobile number is required";
    if (!phoneOnlyDigits.test(val)) return "Mobile number must only contain digits";
    if (val.length !== 10) return `Mobile number must be 10 digits (currently ${val.length})`;
    if (!phoneValidRegex.test(val)) return "Mobile number should start with 6, 7, 8, or 9";
    return "";
  };

  const getPasswordError = () => {
    const val = formData.Password;
    if (!val) return "Password is required";
    if (val.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(val)) return "Password must contain at least one uppercase letter (A-Z)";
    if (!/[a-z]/.test(val)) return "Password must contain at least one lowercase letter (a-z)";
    if (!/[0-9]/.test(val)) return "Password must contain at least one number (0-9)";
    if (!/[^A-Za-z0-9]/.test(val)) return "Password must contain at least one special symbol (!@#$...)";
    return "";
  };

  const getConfirmPasswordError = () => {
    if (!formData.confirmPassword) return "Please confirm your password";
    if (formData.Password !== formData.confirmPassword) return "Passwords do not match";
    return "";
  };

  const getCollegeError = () => {
    if (activeRole === "user") {
      const val = formData.College.trim();
      if (!val) return "College / Institution is required";
      if (val.length < 2) return "Please enter a valid college name";
    }
    return "";
  };

  const getEventIdError = () => {
    if (activeRole === "admin") {
      const val = formData.EventId.trim();
      if (!val) return "Assigned Event ID is required";
    }
    return "";
  };

  const userNameError = getUserNameError();
  const emailError = getEmailError();
  const phoneError = getPhoneError();
  const passwordError = getPasswordError();
  const confirmPasswordError = getConfirmPasswordError();
  const collegeError = getCollegeError();
  const eventIdError = getEventIdError();

  const showUserNameError = (submitted || touched.UserName || formData.UserName.length > 0) && userNameError;
  const showEmailError = (submitted || touched.Email || formData.Email.length > 0) && emailError;
  const showPhoneError =
    (submitted ||
      touched.Phone ||
      (activeRole === "super_admin" ? formData.PhoneNumber.length > 0 : formData.Mobile.length > 0)) &&
    phoneError;
  const showPasswordError = (submitted || touched.Password || formData.Password.length > 0) && passwordError;
  const showConfirmPasswordError =
    (submitted || touched.confirmPassword || formData.confirmPassword.length > 0) && confirmPasswordError;
  const showCollegeError = (submitted || touched.College || formData.College.length > 0) && collegeError;
  const showEventIdError = (submitted || touched.EventId || formData.EventId.length > 0) && eventIdError;

  const isUserNameValid = (touched.UserName || formData.UserName.length > 0) && !userNameError;
  const isEmailValid = (touched.Email || formData.Email.length > 0) && !emailError;
  const isPhoneValid =
    (touched.Phone ||
      (activeRole === "super_admin" ? formData.PhoneNumber.length > 0 : formData.Mobile.length > 0)) &&
    !phoneError;
  const isPasswordValid = (touched.Password || formData.Password.length > 0) && !passwordError;
  const isConfirmValid =
    formData.confirmPassword.length > 0 && formData.Password === formData.confirmPassword && !passwordError;
  const isCollegeValid = activeRole === "user" && (touched.College || formData.College.length > 0) && !collegeError;
  const isEventIdValid = activeRole === "admin" && (touched.EventId || formData.EventId.length > 0) && !eventIdError;

  const triggerShake = () => {
    setShakeForm(true);
    setTimeout(() => setShakeForm(false), 500);
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitted(true);

    setTouched({
      UserName: true,
      Email: true,
      Password: true,
      confirmPassword: true,
      Phone: true,
      College: true,
      EventId: true,
    });

    const hasAnyError =
      userNameError ||
      emailError ||
      phoneError ||
      passwordError ||
      confirmPasswordError ||
      collegeError ||
      eventIdError;

    if (hasAnyError) {
      triggerShake();
      const firstError =
        userNameError ||
        emailError ||
        phoneError ||
        passwordError ||
        confirmPasswordError ||
        collegeError ||
        eventIdError;
      setError(firstError);
      toast.error(firstError);
      return;
    }

    try {
      setLoading(true);

      let payload = {};
      if (activeRole === "super_admin") {
        payload = {
          UserName: formData.UserName.trim(),
          Email: formData.Email.trim(),
          Password: formData.Password,
          PhoneNumber: formData.PhoneNumber.trim(),
        };
      } else if (activeRole === "admin") {
        payload = {
          AdminName: formData.UserName.trim(),
          Email: formData.Email.trim(),
          Password: formData.Password,
          Mobile: formData.Mobile.trim() || formData.PhoneNumber.trim(),
          EventId: formData.EventId.trim() || "1",
        };
      } else {
        payload = {
          UserName: formData.UserName.trim(),
          Email: formData.Email.trim(),
          Password: formData.Password,
          College: formData.College.trim(),
          Location: formData.Location.trim(),
          State: formData.State.trim(),
          Mobile: formData.Mobile.trim(),
          Gender: formData.Gender || "Male",
        };
      }

      const res = await fetch(config.apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Registration failed");
      }

      toast.success(config.successMsg);
      navigate(config.redirectPath);
    } catch (err) {
      triggerShake();
      const errMsg = err.message || "Registration failed, please try again.";
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
        <div className="hidden lg:flex flex-col w-full lg:w-5/12 xl:w-5/12 p-0 lg:p-6 xl:p-8">
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
          className="flex flex-col w-full lg:w-7/12 xl:w-6/12 max-w-2xl px-2 sm:px-4"
        >
          <motion.form
            onSubmit={handleRegister}
            noValidate
            autoComplete="off"
            animate={
              shakeForm
                ? { x: [0, -12, 12, -8, 8, -4, 4, 0] }
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
                  className="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-xs text-center font-medium flex items-center justify-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <div className="relative w-full">
                <User
                  className={`absolute left-0 top-3 w-5 h-5 pointer-events-none transition-colors duration-200 ${
                    showUserNameError
                      ? "text-rose-500"
                      : isUserNameValid
                      ? "text-emerald-500"
                      : "text-emerald-700 dark:text-emerald-400"
                  }`}
                />
                <input
                  type="text"
                  id="reg_userName"
                  name="UserName"
                  placeholder=""
                  autoComplete="off"
                  value={formData.UserName}
                  onBlur={() => handleBlur("UserName")}
                  onChange={handleChange}
                  className={`w-full border-0 border-b-2 bg-transparent pl-8 pr-8 py-2 text-black dark:text-white focus:outline-none transition duration-200 text-sm ${
                    showUserNameError
                      ? "border-rose-500 focus:border-rose-500"
                      : isUserNameValid
                      ? "border-emerald-500 focus:border-emerald-500"
                      : "border-gray-300 dark:border-gray-600 focus:border-emerald-500"
                  }`}
                />
                <label
                  htmlFor="reg_userName"
                  className={`absolute left-8 transition-all duration-200 pointer-events-none select-none ${
                    formData.UserName
                      ? `-top-4 text-xs font-semibold ${
                          showUserNameError
                            ? "text-rose-500"
                            : isUserNameValid
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-emerald-700 dark:text-emerald-400"
                        }`
                      : "top-2 text-sm text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {activeRole === "admin" ? "Admin Name" : "Full Name"}
                </label>

                {isUserNameValid && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-1 top-3 text-emerald-500"
                  >
                    <Check className="w-4 h-4" />
                  </motion.div>
                )}

                <AnimatePresence>
                  {showUserNameError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -4, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-1.5 text-rose-500 text-xs mt-1.5 font-medium"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{userNameError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative w-full">
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
                  type="email"
                  id="reg_email"
                  name="Email"
                  placeholder=""
                  autoComplete="off"
                  value={formData.Email}
                  onBlur={() => handleBlur("Email")}
                  onChange={handleChange}
                  className={`w-full border-0 border-b-2 bg-transparent pl-8 pr-8 py-2 text-black dark:text-white focus:outline-none transition duration-200 text-sm ${
                    showEmailError
                      ? "border-rose-500 focus:border-rose-500"
                      : isEmailValid
                      ? "border-emerald-500 focus:border-emerald-500"
                      : "border-gray-300 dark:border-gray-600 focus:border-emerald-500"
                  }`}
                />
                <label
                  htmlFor="reg_email"
                  className={`absolute left-8 transition-all duration-200 pointer-events-none select-none ${
                    formData.Email
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

              <div className="relative w-full">
                <Phone
                  className={`absolute left-0 top-3 w-5 h-5 pointer-events-none transition-colors duration-200 ${
                    showPhoneError
                      ? "text-rose-500"
                      : isPhoneValid
                      ? "text-emerald-500"
                      : "text-emerald-700 dark:text-emerald-400"
                  }`}
                />
                <input
                  type="tel"
                  id="reg_phone"
                  name={activeRole === "super_admin" ? "PhoneNumber" : "Mobile"}
                  placeholder=""
                  autoComplete="off"
                  value={
                    activeRole === "super_admin"
                      ? formData.PhoneNumber
                      : formData.Mobile
                  }
                  onBlur={() => handleBlur("Phone")}
                  onChange={handleChange}
                  className={`w-full border-0 border-b-2 bg-transparent pl-8 pr-8 py-2 text-black dark:text-white focus:outline-none transition duration-200 text-sm ${
                    showPhoneError
                      ? "border-rose-500 focus:border-rose-500"
                      : isPhoneValid
                      ? "border-emerald-500 focus:border-emerald-500"
                      : "border-gray-300 dark:border-gray-600 focus:border-emerald-500"
                  }`}
                />
                <label
                  htmlFor="reg_phone"
                  className={`absolute left-8 transition-all duration-200 pointer-events-none select-none ${
                    formData.PhoneNumber || formData.Mobile
                      ? `-top-4 text-xs font-semibold ${
                          showPhoneError
                            ? "text-rose-500"
                            : isPhoneValid
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-emerald-700 dark:text-emerald-400"
                        }`
                      : "top-2 text-sm text-gray-500 dark:text-gray-400"
                  }`}
                >
                  10-Digit Mobile Number
                </label>

                {isPhoneValid && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-1 top-3 text-emerald-500"
                  >
                    <Check className="w-4 h-4" />
                  </motion.div>
                )}

                <AnimatePresence>
                  {showPhoneError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -4, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-1.5 text-rose-500 text-xs mt-1.5 font-medium"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{phoneError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {activeRole === "user" && (
                <div className="relative w-full">
                  <VenusAndMars className="absolute left-0 top-3 w-5 h-5 text-emerald-700 dark:text-emerald-400 pointer-events-none" />
                  <select
                    id="reg_gender"
                    name="Gender"
                    value={formData.Gender}
                    onChange={handleChange}
                    className="w-full border-0 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent pl-8 py-2 text-black dark:text-white focus:outline-none focus:border-emerald-500 transition duration-200 text-sm cursor-pointer"
                  >
                    <option value="Male" className="dark:bg-zinc-900">
                      Male
                    </option>
                    <option value="Female" className="dark:bg-zinc-900">
                      Female
                    </option>
                    <option value="Other" className="dark:bg-zinc-900">
                      Other
                    </option>
                  </select>
                  <label
                    htmlFor="reg_gender"
                    className="absolute left-8 -top-4 text-xs text-emerald-700 dark:text-emerald-400 font-semibold pointer-events-none select-none"
                  >
                    Gender
                  </label>
                </div>
              )}

              {activeRole === "user" && (
                <div className="relative w-full">
                  <GraduationCap
                    className={`absolute left-0 top-3 w-5 h-5 pointer-events-none transition-colors duration-200 ${
                      showCollegeError
                        ? "text-rose-500"
                        : isCollegeValid
                        ? "text-emerald-500"
                        : "text-emerald-700 dark:text-emerald-400"
                    }`}
                  />
                  <input
                    type="text"
                    id="reg_college"
                    name="College"
                    placeholder=""
                    autoComplete="off"
                    value={formData.College}
                    onBlur={() => handleBlur("College")}
                    onChange={handleChange}
                    className={`w-full border-0 border-b-2 bg-transparent pl-8 pr-8 py-2 text-black dark:text-white focus:outline-none transition duration-200 text-sm ${
                      showCollegeError
                        ? "border-rose-500 focus:border-rose-500"
                        : isCollegeValid
                        ? "border-emerald-500 focus:border-emerald-500"
                        : "border-gray-300 dark:border-gray-600 focus:border-emerald-500"
                    }`}
                  />
                  <label
                    htmlFor="reg_college"
                    className={`absolute left-8 transition-all duration-200 pointer-events-none select-none ${
                      formData.College
                        ? `-top-4 text-xs font-semibold ${
                            showCollegeError
                              ? "text-rose-500"
                              : isCollegeValid
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-emerald-700 dark:text-emerald-400"
                          }`
                        : "top-2 text-sm text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    College / Institution
                  </label>

                  {isCollegeValid && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-1 top-3 text-emerald-500"
                    >
                      <Check className="w-4 h-4" />
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {showCollegeError && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -4, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-1.5 text-rose-500 text-xs mt-1.5 font-medium"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{collegeError}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {activeRole === "user" && (
                <div className="relative w-full">
                  <Map className="absolute left-0 top-3 w-5 h-5 text-emerald-700 dark:text-emerald-400 pointer-events-none" />
                  <input
                    type="text"
                    id="reg_state"
                    name="State"
                    placeholder=""
                    autoComplete="off"
                    value={formData.State}
                    onChange={handleChange}
                    className="w-full border-0 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent pl-8 py-2 text-black dark:text-white focus:outline-none focus:border-emerald-500 transition duration-200 text-sm"
                  />
                  <label
                    htmlFor="reg_state"
                    className={`absolute left-8 transition-all duration-200 pointer-events-none select-none ${
                      formData.State
                        ? "-top-4 text-xs text-emerald-700 dark:text-emerald-400 font-semibold"
                        : "top-2 text-sm text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    State
                  </label>
                </div>
              )}

              {activeRole === "user" && (
                <div className="relative w-full">
                  <MapPin className="absolute left-0 top-3 w-5 h-5 text-emerald-700 dark:text-emerald-400 pointer-events-none" />
                  <input
                    type="text"
                    id="reg_location"
                    name="Location"
                    placeholder=""
                    autoComplete="off"
                    value={formData.Location}
                    onChange={handleChange}
                    className="w-full border-0 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent pl-8 py-2 text-black dark:text-white focus:outline-none focus:border-emerald-500 transition duration-200 text-sm"
                  />
                  <label
                    htmlFor="reg_location"
                    className={`absolute left-8 transition-all duration-200 pointer-events-none select-none ${
                      formData.Location
                        ? "-top-4 text-xs text-emerald-700 dark:text-emerald-400 font-semibold"
                        : "top-2 text-sm text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    City / Location
                  </label>
                </div>
              )}

              {activeRole === "admin" && (
                <div className="relative w-full">
                  <CalendarDays
                    className={`absolute left-0 top-3 w-5 h-5 pointer-events-none transition-colors duration-200 ${
                      showEventIdError
                        ? "text-rose-500"
                        : isEventIdValid
                        ? "text-emerald-500"
                        : "text-emerald-700 dark:text-emerald-400"
                    }`}
                  />
                  <input
                    type="text"
                    id="reg_eventId"
                    name="EventId"
                    placeholder=""
                    autoComplete="off"
                    value={formData.EventId}
                    onBlur={() => handleBlur("EventId")}
                    onChange={handleChange}
                    className={`w-full border-0 border-b-2 bg-transparent pl-8 pr-8 py-2 text-black dark:text-white focus:outline-none transition duration-200 text-sm ${
                      showEventIdError
                        ? "border-rose-500 focus:border-rose-500"
                        : isEventIdValid
                        ? "border-emerald-500 focus:border-emerald-500"
                        : "border-gray-300 dark:border-gray-600 focus:border-emerald-500"
                    }`}
                  />
                  <label
                    htmlFor="reg_eventId"
                    className={`absolute left-8 transition-all duration-200 pointer-events-none select-none ${
                      formData.EventId
                        ? `-top-4 text-xs font-semibold ${
                            showEventIdError
                              ? "text-rose-500"
                              : isEventIdValid
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-emerald-700 dark:text-emerald-400"
                          }`
                        : "top-2 text-sm text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    Assigned Event ID
                  </label>

                  {isEventIdValid && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-1 top-3 text-emerald-500"
                    >
                      <Check className="w-4 h-4" />
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {showEventIdError && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -4, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-1.5 text-rose-500 text-xs mt-1.5 font-medium"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{eventIdError}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <div className="relative w-full">
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
                  id="reg_password"
                  name="Password"
                  placeholder=""
                  autoComplete="new-password"
                  value={formData.Password}
                  onBlur={() => handleBlur("Password")}
                  onChange={handleChange}
                  className={`w-full border-0 border-b-2 bg-transparent pl-8 pr-16 py-2 text-black dark:text-white focus:outline-none transition duration-200 text-sm ${
                    showPasswordError
                      ? "border-rose-500 focus:border-rose-500"
                      : isPasswordValid
                      ? "border-emerald-500 focus:border-emerald-500"
                      : "border-gray-300 dark:border-gray-600 focus:border-emerald-500"
                  }`}
                />
                <label
                  htmlFor="reg_password"
                  className={`absolute left-8 transition-all duration-200 pointer-events-none select-none ${
                    formData.Password
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
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
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

              <div className="relative w-full">
                <Lock
                  className={`absolute left-0 top-3 w-5 h-5 pointer-events-none transition-colors duration-200 ${
                    showConfirmPasswordError
                      ? "text-rose-500"
                      : isConfirmValid
                      ? "text-emerald-500"
                      : "text-emerald-700 dark:text-emerald-400"
                  }`}
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="reg_confirmPassword"
                  name="confirmPassword"
                  placeholder=""
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onBlur={() => handleBlur("confirmPassword")}
                  onChange={handleChange}
                  className={`w-full border-0 border-b-2 bg-transparent pl-8 pr-16 py-2 text-black dark:text-white focus:outline-none transition duration-200 text-sm ${
                    showConfirmPasswordError
                      ? "border-rose-500 focus:border-rose-500"
                      : isConfirmValid
                      ? "border-emerald-500 focus:border-emerald-500"
                      : "border-gray-300 dark:border-gray-600 focus:border-emerald-500"
                  }`}
                />
                <label
                  htmlFor="reg_confirmPassword"
                  className={`absolute left-8 transition-all duration-200 pointer-events-none select-none ${
                    formData.confirmPassword
                      ? `-top-4 text-xs font-semibold ${
                          showConfirmPasswordError
                            ? "text-rose-500"
                            : isConfirmValid
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-emerald-700 dark:text-emerald-400"
                        }`
                      : "top-2 text-sm text-gray-500 dark:text-gray-400"
                  }`}
                >
                  Confirm Password
                </label>

                <div className="absolute right-2 top-2.5 flex items-center gap-1.5">
                  {isConfirmValid && (
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="p-1 text-gray-500 hover:text-emerald-500 dark:text-gray-400 dark:hover:text-emerald-400 focus:outline-none transition-colors cursor-pointer"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <AnimatePresence>
                  {showConfirmPasswordError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -4, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-1.5 text-rose-500 text-xs mt-1.5 font-medium"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{confirmPasswordError}</span>
                    </motion.div>
                  )}
                  {isConfirmValid && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -4, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs mt-1.5 font-medium"
                    >
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>Passwords match</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence>
              {Boolean(formData.Password) && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden pt-1 border-t border-gray-200/50 dark:border-zinc-800/60"
                >
                  <PasswordStrengthMeter
                    password={formData.Password}
                    showDetails={true}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer text-sm"
              >
                {loading ? "Creating account..." : "Complete Registration"}
              </button>
            </div>

            <p className="text-center mt-5 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {config.loginPrompt.split("?")[0]}?{" "}
              <Link
                to={config.loginPath}
                className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
              >
                {config.loginPrompt.split("?")[1] || "Sign in"}
              </Link>
            </p>

            <div className="border-t border-gray-200 dark:border-white/10 mt-6 pt-4">
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

export default UnifiedRegister;
