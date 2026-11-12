import React, { useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUp, ArrowUpRight, Mail, MapPin } from "lucide-react";

const CURRENT_YEAR = new Date().getFullYear();

const FOOTER_DIRECTORIES = [
  {
    index: "01",
    title: "Discover",
    links: [
      { name: "All Open Events", href: "/events" },
      { name: "Explore Directory", href: "/explore" },
      { name: "Flagship Events", href: "/#arena" },
      { name: "How It Works", href: "/#blueprint" },
      { name: "Platform Modules", href: "/#logistics" },
    ],
  },
  {
    index: "02",
    title: "Participants",
    links: [
      { name: "Create Student Account", href: "/user/register" },
      { name: "Participant Sign In", href: "/user/login" },
      { name: "Verify Gate Pass", href: "/verify-id" },
      { name: "Community Feedback", href: "/#testimonials" },
      { name: "Reset Password", href: "/forgot-password" },
    ],
  },
  {
    index: "03",
    title: "Organizers & Jury",
    links: [
      { name: "Register as Organizer", href: "/admin/register" },
      { name: "Organizer Portal", href: "/admin/login" },
      { name: "Jury Evaluation Portal", href: "/evaluator/login" },
      { name: "SuperAdmin Portal", href: "/superadmin/login" },
    ],
  },
  {
    index: "04",
    title: "Governance",
    links: [
      { name: "Platform Policies", href: "/policies" },
      { name: "Event Guidelines", href: "/guidelines" },
      { name: "Privacy Notice", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Common Questions", href: "/#faq" },
    ],
  },
];

const CONTACT_DESKS = [
  { label: "Support", value: "support@ayojan.live", href: "mailto:support@ayojan.live" },
  { label: "Privacy", value: "privacy@ayojan.live", href: "mailto:privacy@ayojan.live" },
  { label: "Grievance", value: "grievance@ayojan.live", href: "mailto:grievance@ayojan.live" },
];

const BRAND_LETTERS = ["A", "Y", "O", "J", "A", "N"];

function SlotFooterLink({ href, children, onClick }) {
  return (
    <Link
      to={href}
      onClick={onClick}
      className="group/link flex items-center justify-between gap-2 py-0.5 text-[13px] font-medium focus:outline-none"
    >
      <span className="inline-flex flex-col justify-start overflow-hidden h-[22px] min-w-0">
        <span className="flex flex-col motion-safe:transition-transform motion-safe:duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover/link:-translate-y-[22px]">
          <span className="h-[22px] leading-[22px] text-slate-600 dark:text-zinc-400 group-hover/link:text-emerald-600 dark:group-hover/link:text-emerald-400 truncate transition-colors">
            {children}
          </span>
          <span
            aria-hidden="true"
            className="h-[22px] leading-[22px] text-emerald-600 dark:text-emerald-400 truncate"
          >
            {children}
          </span>
        </span>
      </span>

      <ArrowUpRight className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-zinc-600 group-hover/link:text-emerald-500 motion-safe:transition-all motion-safe:duration-300 motion-safe:group-hover/link:translate-x-0.5 motion-safe:group-hover/link:-translate-y-0.5" />
    </Link>
  );
}

export function Footer() {
  const location = useLocation();
  const navigate = useNavigate();
  const plinthRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const getScrollBehavior = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";

  const scrollToSection = (targetId) => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });
    }
  };

  const handleNavClick = (e, href) => {
    if (!href.startsWith("/#")) return;
    e.preventDefault();
    const targetId = href.replace("/#", "");

    if (location.pathname !== "/") {
      navigate("/");
      window.setTimeout(() => scrollToSection(targetId), 140);
      return;
    }

    scrollToSection(targetId);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: getScrollBehavior() });
  };

  const handlePlinthMove = (e) => {
    const node = plinthRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    node.style.setProperty("--mx", `${x.toFixed(2)}%`);
    node.style.setProperty("--my", `${y.toFixed(2)}%`);
    node.style.setProperty("--spotlight-opacity", "1");
  };

  const handlePlinthLeave = () => {
    const node = plinthRef.current;
    if (!node) return;
    node.style.setProperty("--spotlight-opacity", "0");
  };

  return (
    <footer
      ref={plinthRef}
      onMouseMove={reduceMotion ? undefined : handlePlinthMove}
      onMouseLeave={handlePlinthLeave}
      aria-label="Site footer"
      style={{
        "--mx": "50%",
        "--my": "50%",
        "--spotlight-opacity": "0",
      }}
      className="relative w-full min-h-[100dvh] flex flex-col justify-between gap-8 bg-emerald-600 dark:bg-emerald-600 text-white px-5 sm:px-10 lg:px-14 xl:px-20 py-8 sm:py-10 lg:py-12 transition-colors duration-300 overflow-hidden border-t border-emerald-500/40 dark:border-emerald-800/60 selection:bg-white selection:text-emerald-900"
    >
      {/* Subtle Full-Width Dot Matrix matching Emerald Backdrop */}
      <div
        className="absolute inset-0 opacity-[0.14] dark:opacity-[0.16] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.45) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />

      {/* Full-Viewport Optical Cursor Sheen */}
      <div
        className="hidden md:block absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: "var(--spotlight-opacity)",
          background:
            "radial-gradient(560px circle at var(--mx) var(--my), rgba(255, 255, 255, 0.14), transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Tier 1: Full-Width White / Black Architectural Bento Directory */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch"
      >
        {/* Left Card: Brand Identity, Campus Chapter & Official Desks */}
        <div className="lg:col-span-4 rounded-[28px] border border-white/80 dark:border-emerald-900/70 bg-white dark:bg-black p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-sm dark:shadow-none transition-colors duration-300">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <Link
                to="/"
                onClick={(e) => {
                  if (location.pathname === "/") {
                    e.preventDefault();
                    scrollToTop();
                  }
                }}
                className="group/brand inline-flex items-center gap-3 focus:outline-none"
              >
                <span
                  className="relative w-6 h-6 flex items-center justify-center shrink-0 motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover/brand:rotate-90"
                  aria-hidden="true"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-800 dark:bg-emerald-500 absolute top-0 left-1/2 -translate-x-1/2" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-zinc-200 absolute left-0 top-1/2 -translate-y-1/2" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-zinc-200 absolute right-0 top-1/2 -translate-y-1/2" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-800 dark:bg-emerald-500 bottom-0 left-1/2 -translate-x-1/2 absolute" />
                </span>
                <span className="font-heading text-lg font-bold tracking-[0.14em] text-slate-900 dark:text-white">
                  AYOJAN
                </span>
              </Link>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <MapPin className="w-3 h-3" />
                <span>AITAM Tekkali</span>
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
                Collegiate Event Management System.
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Structured infrastructure for campus hackathons, project expos, workshops, seminars, and alumni meets.
              </p>
            </div>
          </div>

          {/* Official Contact Desks */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-zinc-800 space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-500 mb-2">
              Official Desks
            </p>
            {CONTACT_DESKS.map((desk) => (
              <a
                key={desk.label}
                href={desk.href}
                className="group/mail flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/70 dark:bg-zinc-950 hover:border-emerald-500/50 transition-colors"
              >
                <span className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-500">
                  <Mail className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  {desk.label}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-zinc-300 group-hover/mail:text-emerald-600 dark:group-hover/mail:text-emerald-400 transition-colors">
                  <span>{desk.value}</span>
                  <ArrowUpRight className="w-3 h-3 opacity-70 group-hover/mail:opacity-100 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover/mail:translate-x-0.5 motion-safe:group-hover/mail:-translate-y-0.5" />
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Right Card: Full-Width 4-Column Sitemap Navigation */}
        <nav
          aria-label="Footer navigation"
          className="lg:col-span-8 rounded-[28px] border border-white/80 dark:border-emerald-900/70 bg-white dark:bg-black p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-sm dark:shadow-none transition-colors duration-300"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-7 my-auto">
            {FOOTER_DIRECTORIES.map((col) => (
              <div key={col.title} className="group/col flex flex-col">
                <div className="relative flex items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-zinc-800/90">
                  <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    {col.title}
                  </h3>
                  
                </div>

                <ul className="space-y-2.5">
                  {col.links.map((item) => (
                    <li key={item.name}>
                      <SlotFooterLink
                        href={item.href}
                        onClick={(e) => handleNavClick(e, item.href)}
                      >
                        {item.name}
                      </SlotFooterLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>
      </motion.div>

      {/* Tier 2: Monumental Full-Width Open Emerald Brand Centerpiece */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
        className="group/plinth relative z-10 flex-1 w-full flex flex-col items-center justify-center py-6 sm:py-10 select-none"
      >
        <div className="flex items-center justify-center gap-4 sm:gap-7 md:gap-10">
          {/* Signature 4-Dot Orbital Emblem */}
          <div
            className="relative w-10 h-10 sm:w-14 sm:h-14 md:w-18 md:h-18 lg:w-22 lg:h-22 xl:w-28 xl:h-28 flex items-center justify-center shrink-0 motion-safe:transition-transform motion-safe:duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover/plinth:rotate-90"
            aria-hidden="true"
          >
            <span className="absolute w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 xl:w-5 xl:h-5 rounded-full bg-white top-0 left-1/2 -translate-x-1/2 motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover/plinth:-translate-y-0.5" />
            <span className="absolute w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 xl:w-5 xl:h-5 rounded-full bg-emerald-200 dark:bg-emerald-400 left-0 top-1/2 -translate-y-1/2 motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover/plinth:-translate-x-0.5" />
            <span className="absolute w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 xl:w-5 xl:h-5 rounded-full bg-emerald-200 dark:bg-emerald-400 right-0 top-1/2 -translate-y-1/2 motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover/plinth:translate-x-0.5" />
            <span className="absolute w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 xl:w-5 xl:h-5 rounded-full bg-white bottom-0 left-1/2 -translate-x-1/2 motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover/plinth:translate-y-0.5" />
          </div>

          {/* Sculpted Full-Width Playfair Brand Wordmark */}
          <div className="font-heading flex items-baseline text-5xl sm:text-7xl md:text-8xl lg:text-[116px] xl:text-[148px] 2xl:text-[176px] font-bold tracking-[0.14em] leading-none text-white">
            <span className="sr-only">AYOJAN</span>
            {BRAND_LETTERS.map((char, index) => (
              <span
                key={`${char}-${index}`}
                aria-hidden="true"
                className="inline-block motion-safe:transition-all motion-safe:duration-500 hover:text-emerald-100 dark:hover:text-emerald-300 motion-safe:hover:-translate-y-1.5"
                style={{ transitionDelay: `${index * 10}ms` }}
              >
                {char}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 sm:mt-8 w-full max-w-2xl flex items-center gap-4">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/35 dark:to-emerald-400/35" />
          <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.28em] text-emerald-100 dark:text-emerald-300 whitespace-nowrap">
            PLAN • COORDINATE • EVALUATE
          </p>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/35 dark:to-emerald-400/35" />
        </div>
      </motion.div>

      {/* Tier 3: Full-Width White / Black Legal Baseline */}
      <div className="relative z-10 w-full rounded-2xl sm:rounded-full border border-white/80 dark:border-emerald-900/70 bg-white dark:bg-black px-5 sm:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-zinc-400 shadow-sm dark:shadow-none">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-center">
          <span className="font-semibold text-slate-900 dark:text-white">
            © {CURRENT_YEAR} AYOJAN
          </span>
          <span className="text-slate-300 dark:text-zinc-700">•</span>
          <span>Collegiate Event Management System</span>
          <span className="hidden sm:inline text-slate-300 dark:text-zinc-700">•</span>
          <span className="hidden sm:inline">AITAM Tekkali</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6">
          <Link
            to="/policies"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Policies
          </Link>
          <Link
            to="/guidelines"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Guidelines
          </Link>
          <Link
            to="/privacy"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Privacy
          </Link>
          <Link
            to="/terms"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Terms
          </Link>
          <button
            type="button"
            onClick={scrollToTop}
            className="group inline-flex items-center gap-1.5 pl-3.5 pr-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors cursor-pointer shadow-xs"
            aria-label="Scroll back to top"
          >
            <span>Top</span>
            <ArrowUp className="w-3.5 h-3.5 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
