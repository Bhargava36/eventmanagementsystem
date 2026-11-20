"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  useReducedMotion,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "../Organisms/ThemeToggler";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Explore Events", href: "/events" },
  { label: "Organizers", href: "/admin/login" },
  { label: "Jury Portal", href: "/evaluator/login" },
  { label: "Test Accounts", href: "/test-credentials" },
];

function SlotNavLink({ href, isActive, children }) {
  return (
    <Link
      to={href}
      className="group/nav relative inline-flex items-center px-2 xl:px-2.5 py-1 text-xs xl:text-[13px] font-semibold whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 rounded-full"
    >
      <span className="inline-flex flex-col justify-start overflow-hidden h-[18px] xl:h-[20px]">
        <span className="flex flex-col motion-safe:transition-transform motion-safe:duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover/nav:-translate-y-[18px] xl:motion-safe:group-hover/nav:-translate-y-[20px]">
          <span
            className={cn(
              "h-[18px] xl:h-[20px] leading-[18px] xl:leading-[20px] flex items-center whitespace-nowrap transition-colors",
              isActive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-700 dark:text-zinc-300"
            )}
          >
            {children}
          </span>
          <span
            aria-hidden="true"
            className="h-[18px] xl:h-[20px] leading-[18px] xl:leading-[20px] text-emerald-600 dark:text-emerald-400 flex items-center whitespace-nowrap"
          >
            {children}
          </span>
        </span>
      </span>

      {isActive && (
        <motion.span
          layoutId="navbar-active-dot"
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500"
          aria-hidden="true"
        />
      )}
    </Link>
  );
}

export function Navbar() {
  const navRef = useRef(null);
  const navUid = useId();
  const { pathname } = useLocation();
  const reduceMotion = useReducedMotion();

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(() =>
    typeof window !== "undefined" ? window.scrollY > 24 : false
  );

  useEffect(() => {
    const handleScroll = () => {
      const next = window.scrollY > 24;
      setScrolled((prev) => (prev === next ? prev : next));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Auto-close drawer when resized to desktop (>= 1024px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close drawer on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const isRouteActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const drawerVariants = {
    hidden: {
      height: 0,
      opacity: 0,
      transition: {
        height: {
          duration: 0.34,
          ease: [0.16, 1, 0.3, 1],
        },
        opacity: {
          duration: 0.22,
          ease: [0.22, 1, 0.36, 1],
        },
        staggerChildren: 0.02,
        staggerDirection: -1,
      },
    },
    visible: {
      height: "auto",
      opacity: 1,
      transition: {
        height: {
          duration: 0.42,
          ease: [0.16, 1, 0.3, 1],
        },
        opacity: {
          duration: 0.28,
        },
        staggerChildren: 0.045,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: -6,
      scale: 0.98,
      transition: {
        duration: 0.2,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.32,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.header
      ref={navRef}
      layout
      initial={reduceMotion ? false : { y: -16, x: "-50%", opacity: 0 }}
      animate={{ y: 0, x: "-50%", opacity: 1 }}
      transition={{
        layout: { type: "spring", stiffness: 340, damping: 32 },
        y: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
        opacity: { duration: 0.35 },
      }}
      className={cn(
        "fixed top-3.5 sm:top-5 left-1/2 z-50",
        isOpen
          ? "w-[calc(100%-1.5rem)] sm:w-[480px] rounded-[26px]"
          : "w-[calc(100%-1.5rem)] sm:w-auto rounded-full",
        "max-w-[calc(100%-1.5rem)]",
        "border bg-white/95 dark:bg-black/95 backdrop-blur-md shadow-xs dark:shadow-none",
        scrolled
          ? "border-slate-300/90 dark:border-zinc-700/80 shadow-md dark:shadow-none"
          : "border-slate-200 dark:border-zinc-800"
      )}
    >
      {/* Top Capsule Row */}
      <div className="flex items-center justify-between gap-3 lg:gap-4 xl:gap-7 px-3.5 sm:px-5 lg:px-6 py-2 sm:py-2.5 whitespace-nowrap">
        {/* Brand Identity */}
        <Link
          to="/"
          onClick={() => setIsOpen(false)}
          className="group/brand inline-flex items-center gap-2 sm:gap-2.5 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 rounded-full"
        >
          <span
            className="relative w-5 h-5 flex items-center justify-center shrink-0 motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover/brand:rotate-90"
            aria-hidden="true"
          >
            <span className="absolute w-1.5 h-1.5 rounded-full bg-slate-800 dark:bg-emerald-500 top-0 left-1/2 -translate-x-1/2" />
            <span className="absolute w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-zinc-200 left-0 top-1/2 -translate-y-1/2" />
            <span className="absolute w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-zinc-200 right-0 top-1/2 -translate-y-1/2" />
            <span className="absolute w-1.5 h-1.5 rounded-full bg-slate-800 dark:bg-emerald-500 bottom-0 left-1/2 -translate-x-1/2" />
          </span>
          <span className="font-heading text-sm sm:text-base font-bold tracking-[0.14em] text-slate-900 dark:text-white">
            AVISHKAAR
          </span>
        </Link>

        {/* Desktop Links (Visible on lg: 1024px and up) */}
        <LayoutGroup id={`nav-${navUid}`}>
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-1.5 lg:gap-2.5 xl:gap-4"
          >
            {NAV_LINKS.map((link) => (
              <SlotNavLink
                key={link.href}
                href={link.href}
                isActive={isRouteActive(link.href)}
              >
                {link.label}
              </SlotNavLink>
            ))}
          </nav>
        </LayoutGroup>

        {/* Desktop Actions (Visible on lg: 1024px and up) */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 shrink-0">
          <ThemeToggle />

          <Link
            to="/user/login"
            className="px-3 xl:px-4 py-1.5 xl:py-2 text-xs font-semibold rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-700 dark:text-zinc-200 hover:border-emerald-500/70 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Log In
          </Link>

          <Link
            to="/user/register"
            className="group/join inline-flex items-center gap-1 xl:gap-1.5 px-3 xl:px-4 py-1.5 xl:py-2 text-xs font-semibold rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-xs"
          >
            <span>Join Free</span>
            <ArrowRight className="w-3.5 h-3.5 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover/join:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile & Tablet Controls (< lg: below 1024px) */}
        <div className="lg:hidden flex items-center gap-2 sm:gap-2.5 shrink-0">
          <ThemeToggle />

          {/* Quick CTA buttons on tablet screens (sm to lg) */}
          <Link
            to="/user/login"
            className="hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-700 dark:text-zinc-200 hover:border-emerald-500/70 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Log In
          </Link>

          <Link
            to="/user/register"
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-xs"
          >
            <span>Join Free</span>
            <ArrowRight className="w-3 h-3 motion-safe:transition-transform motion-safe:duration-200" />
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close Menu" : "Open Menu"}
            className="relative w-9 h-9 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black flex items-center justify-center text-slate-700 dark:text-zinc-200 hover:border-emerald-500/60 transition-colors cursor-pointer"
          >
            <motion.span
              animate={
                isOpen
                  ? { rotate: 45, y: 0 }
                  : { rotate: 0, y: -4 }
              }
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 350, damping: 24 }
              }
              className="absolute w-4 h-[1.5px] bg-current rounded-full"
            />
            <motion.span
              animate={
                isOpen
                  ? { rotate: -45, y: 0 }
                  : { rotate: 0, y: 4 }
              }
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 350, damping: 24 }
              }
              className="absolute w-4 h-[1.5px] bg-current rounded-full"
            />
          </button>
        </div>
      </div>

      {/* Smooth Mobile / Tablet Accordion Drawer with Staggered Cascading Links */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="mobile-nav-drawer"
            initial={reduceMotion ? "visible" : "hidden"}
            animate="visible"
            exit="hidden"
            variants={drawerVariants}
            className="lg:hidden overflow-hidden border-t border-slate-200/80 dark:border-zinc-800"
          >
            <div className="px-4 py-4 space-y-3">
              <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => {
                  const active = isRouteActive(link.href);
                  return (
                    <motion.div key={link.href} variants={itemVariants}>
                      <Link
                        to={link.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors",
                          active
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900"
                        )}
                      >
                        <span>{link.label}</span>
                        {active && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Mobile-only auth CTA buttons (hidden on sm: where they are already in the top row) */}
              <motion.div
                variants={itemVariants}
                className="sm:hidden pt-3 border-t border-slate-200/80 dark:border-zinc-800 grid grid-cols-2 gap-2.5"
              >
                <Link
                  to="/user/login"
                  onClick={() => setIsOpen(false)}
                  className="py-2.5 text-center text-xs font-semibold rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-800 dark:text-zinc-200 hover:border-emerald-500/60 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/user/register"
                  onClick={() => setIsOpen(false)}
                  className="py-2.5 text-center text-xs font-semibold rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                >
                  Join Free
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
