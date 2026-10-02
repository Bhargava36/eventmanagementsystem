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
  Compass,
  Trophy,
  Rocket,
  Code,
  Award,
  CalendarDays,
  VenusAndMars,
} from "lucide-react";
import WaveBackground from "../../../components/Molecules/WaveBackground";
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

  // Common and role-specific form state
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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!formData.UserName.trim() || !formData.Email.trim() || !formData.Password) {
      const msg = "Please fill in all required fields.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (activeRole === "super_admin") {
      if (!formData.PhoneNumber.trim()) {
        const msg = "Please enter your phone number.";
        setError(msg);
        toast.error(msg);
        return;
      }
      if (formData.Password !== formData.confirmPassword) {
        const msg = "Passwords do not match!";
        setError(msg);
        toast.error(msg);
        return;
      }
    }

    if (activeRole === "user") {
      if (!formData.Mobile.trim() || !formData.College.trim()) {
        const msg = "Please provide your Mobile number and College name.";
        setError(msg);
        toast.error(msg);
        return;
      }
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
        // User registration
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

      {/* Main Split Container */}
      <div className="relative z-10 flex flex-col lg:flex-row mx-4 sm:mx-8 lg:mx-12 xl:mx-20 gap-8 lg:gap-14 items-center lg:items-start justify-center">
        {/* Left Side: Brand Marketing & Role Value Prop */}
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

              {/* Feature Cards Grid (4 items) */}
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

        {/* Right Side: Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex flex-col w-full lg:w-7/12 xl:w-6/12 max-w-2xl px-2 sm:px-4"
        >
          <form
            onSubmit={handleRegister}
            autoComplete="off"
            className="bg-gray-50/90 dark:bg-zinc-950/80 border-2 backdrop-blur-md border-emerald-700 dark:border-emerald-500/80 rounded-2xl p-7 sm:p-9 md:p-10 shadow-2xl"
          >
            {/* Dummy hidden inputs to prevent browser aggressive autofill */}
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

            {error && (
              <div className="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-xs text-center font-medium">
                {error}
              </div>
            )}

            {/* Responsive Input Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              {/* Full Name / Username */}
              <div className="relative w-full">
                <User className="absolute left-0 top-3 w-5 h-5 text-emerald-700 dark:text-emerald-400 pointer-events-none" />
                <input
                  type="text"
                  id="reg_userName"
                  name="UserName"
                  placeholder=""
                  required
                  autoComplete="off"
                  value={formData.UserName}
                  onChange={handleChange}
                  className="w-full border-0 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent pl-8 py-2 text-black dark:text-white focus:outline-none focus:border-emerald-500 transition duration-200 text-sm"
                />
                <label
                  htmlFor="reg_userName"
                  className={`absolute left-8 transition-all duration-200 pointer-events-none select-none ${
                    formData.UserName
                      ? "-top-4 text-xs text-emerald-700 dark:text-emerald-400 font-semibold"
                      : "top-2 text-sm text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {activeRole === "admin" ? "Admin Name" : "Full Name"}
                </label>
              </div>

              {/* Email Address */}
              <div className="relative w-full">
                <Mail className="absolute left-0 top-3 w-5 h-5 text-emerald-700 dark:text-emerald-400 pointer-events-none" />
                <input
                  type="email"
                  id="reg_email"
                  name="Email"
                  placeholder=""
                  required
                  autoComplete="off"
                  value={formData.Email}
                  onChange={handleChange}
                  className="w-full border-0 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent pl-8 py-2 text-black dark:text-white focus:outline-none focus:border-emerald-500 transition duration-200 text-sm"
                />
                <label
                  htmlFor="reg_email"
                  className={`absolute left-8 transition-all duration-200 pointer-events-none select-none ${
                    formData.Email
                      ? "-top-4 text-xs text-emerald-700 dark:text-emerald-400 font-semibold"
                      : "top-2 text-sm text-gray-500 dark:text-gray-400"
                  }`}
                >
                  Email Address
                </label>
              </div>

              {/* Phone / Mobile */}
              <div className="relative w-full">
                <Phone className="absolute left-0 top-3 w-5 h-5 text-emerald-700 dark:text-emerald-400 pointer-events-none" />
                <input
                  type="tel"
                  id="reg_phone"
                  name={activeRole === "super_admin" ? "PhoneNumber" : "Mobile"}
                  placeholder=""
                  required
                  autoComplete="off"
                  value={
                    activeRole === "super_admin"
                      ? formData.PhoneNumber
                      : formData.Mobile
                  }
                  onChange={handleChange}
                  className="w-full border-0 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent pl-8 py-2 text-black dark:text-white focus:outline-none focus:border-emerald-500 transition duration-200 text-sm"
                />
                <label
                  htmlFor="reg_phone"
                  className={`absolute left-8 transition-all duration-200 pointer-events-none select-none ${
                    formData.PhoneNumber || formData.Mobile
                      ? "-top-4 text-xs text-emerald-700 dark:text-emerald-400 font-semibold"
                      : "top-2 text-sm text-gray-500 dark:text-gray-400"
                  }`}
                >
                  Phone / Mobile Number
                </label>
              </div>

              {/* Gender for User */}
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

              {/* College for User */}
              {activeRole === "user" && (
                <div className="relative w-full">
                  <GraduationCap className="absolute left-0 top-3 w-5 h-5 text-emerald-700 dark:text-emerald-400 pointer-events-none" />
                  <input
                    type="text"
                    id="reg_college"
                    name="College"
                    placeholder=""
                    required
                    autoComplete="off"
                    value={formData.College}
                    onChange={handleChange}
                    className="w-full border-0 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent pl-8 py-2 text-black dark:text-white focus:outline-none focus:border-emerald-500 transition duration-200 text-sm"
                  />
                  <label
                    htmlFor="reg_college"
                    className={`absolute left-8 transition-all duration-200 pointer-events-none select-none ${
                      formData.College
                        ? "-top-4 text-xs text-emerald-700 dark:text-emerald-400 font-semibold"
                        : "top-2 text-sm text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    College / Institution
                  </label>
                </div>
              )}

              {/* State for User */}
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

              {/* Location for User */}
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

              {/* Event ID for Admin */}
              {activeRole === "admin" && (
                <div className="relative w-full">
                  <CalendarDays className="absolute left-0 top-3 w-5 h-5 text-emerald-700 dark:text-emerald-400 pointer-events-none" />
                  <input
                    type="text"
                    id="reg_eventId"
                    name="EventId"
                    placeholder=""
                    required
                    autoComplete="off"
                    value={formData.EventId}
                    onChange={handleChange}
                    className="w-full border-0 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent pl-8 py-2 text-black dark:text-white focus:outline-none focus:border-emerald-500 transition duration-200 text-sm"
                  />
                  <label
                    htmlFor="reg_eventId"
                    className={`absolute left-8 transition-all duration-200 pointer-events-none select-none ${
                      formData.EventId
                        ? "-top-4 text-xs text-emerald-700 dark:text-emerald-400 font-semibold"
                        : "top-2 text-sm text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    Assigned Event ID
                  </label>
                </div>
              )}

              {/* Password */}
              <div className="relative w-full">
                <Lock className="absolute left-0 top-3 w-5 h-5 text-emerald-700 dark:text-emerald-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="reg_password"
                  name="Password"
                  placeholder=""
                  required
                  autoComplete="new-password"
                  value={formData.Password}
                  onChange={handleChange}
                  className="w-full border-0 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent pl-8 pr-10 py-2 text-black dark:text-white focus:outline-none focus:border-emerald-500 transition duration-200 text-sm"
                />
                <label
                  htmlFor="reg_password"
                  className={`absolute left-8 transition-all duration-200 pointer-events-none select-none ${
                    formData.Password
                      ? "-top-4 text-xs text-emerald-700 dark:text-emerald-400 font-semibold"
                      : "top-2 text-sm text-gray-500 dark:text-gray-400"
                  }`}
                >
                  Password
                </label>

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2.5 p-1 text-gray-500 hover:text-emerald-500 dark:text-gray-400 dark:hover:text-emerald-400 focus:outline-none transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Confirm Password for Super Admin */}
              {activeRole === "super_admin" && (
                <div className="relative w-full">
                  <Lock className="absolute left-0 top-3 w-5 h-5 text-emerald-700 dark:text-emerald-400 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="reg_confirmPassword"
                    name="confirmPassword"
                    placeholder=""
                    required
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full border-0 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent pl-8 pr-10 py-2 text-black dark:text-white focus:outline-none focus:border-emerald-500 transition duration-200 text-sm"
                  />
                  <label
                    htmlFor="reg_confirmPassword"
                    className={`absolute left-8 transition-all duration-200 pointer-events-none select-none ${
                      formData.confirmPassword
                        ? "-top-4 text-xs text-emerald-700 dark:text-emerald-400 font-semibold"
                        : "top-2 text-sm text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    Confirm Password
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-2 top-2.5 p-1 text-gray-500 hover:text-emerald-500 dark:text-gray-400 dark:hover:text-emerald-400 focus:outline-none transition-colors cursor-pointer"
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer text-sm"
              >
                {loading ? "Creating account..." : "Complete Registration"}
              </button>
            </div>

            {/* Back to Login link */}
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
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default UnifiedRegister;
