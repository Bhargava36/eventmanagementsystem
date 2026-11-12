"use client";

import React, { useState, useEffect, useId } from "react";
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
      className="group/nav relative inline-flex items-center px-2 py-1 text-[13px] font-semibold whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 rounded-full"
    >
      <span className="inline-flex flex-col justify-start overflow-hidden h-[20px]">
        <span className="flex flex-col motion-safe:transition-transform motion-safe:duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover/nav:-translate-y-[20px]">
          <span
            className={cn(
              "h-[20px] leading-[20px] flex items-center whitespace-nowrap transition-colors",
              isActive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-700 dark:text-zinc-300"
            )}
          >
            {children}
          </span>
          <span
            aria-hidden="true"
            className="h-[20px] leading-[20px] text-emerald-600 dark:text-emerald-400 flex items-center whitespace-nowrap"
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

  const isRouteActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <motion.header
      initial={reduceMotion ? false : { y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] md:w-auto max-w-[calc(100%-1.5rem)]",
        "border bg-white/95 dark:bg-black/95 transition-all duration-300",
        isOpen ? "rounded-[26px]" : "rounded-full",
        scrolled
          ? "border-slate-300/90 dark:border-zinc-700/80 shadow-md dark:shadow-none"
          : "border-slate-200 dark:border-zinc-800 shadow-xs dark:shadow-none"
      )}
    >
      {/* Top Capsule Row */}
      <div className="flex items-center justify-between gap-4 lg:gap-7 px-4 sm:px-6 py-2.5 sm:py-3 whitespace-nowrap">
        {/* Brand Identity */}
        <Link
          to="/"
          onClick={() => setIsOpen(false)}
          className="group/brand inline-flex items-center gap-2.5 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 rounded-full"
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
            AYOJAN
          </span>
        </Link>

        {/* Desktop Links */}
        <LayoutGroup id={`nav-${navUid}`}>
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-3 lg:gap-5"
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

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          <ThemeToggle />

          <Link
            to="/user/login"
            className="px-4 py-2 text-xs font-semibold rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-700 dark:text-zinc-200 hover:border-emerald-500/70 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Log In
          </Link>

          <Link
            to="/user/register"
            className="group/join inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-xs"
          >
            <span>Join Free</span>
            <ArrowRight className="w-3.5 h-3.5 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover/join:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden flex items-center gap-2 shrink-0">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close Menu" : "Open Menu"}
            className="relative w-9 h-9 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black flex items-center justify-center text-slate-700 dark:text-zinc-200 hover:border-emerald-500/60 transition-colors cursor-pointer"
          >
            <span
              className={cn(
                "absolute w-4 h-[1.5px] bg-current rounded-full transition-transform duration-200",
                isOpen ? "rotate-45" : "-translate-y-1"
              )}
            />
            <span
              className={cn(
                "absolute w-4 h-[1.5px] bg-current rounded-full transition-transform duration-200",
                isOpen ? "-rotate-45" : "translate-y-1"
              )}
            />
          </button>
        </div>
      </div>

      {/* Smooth Mobile Accordion Drawer */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="mobile-nav-drawer"
            initial={
              reduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }
            }
            animate={{
              height: "auto",
              opacity: 1,
              transition: reduceMotion
                ? { duration: 0 }
                : {
                    height: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 0.2, delay: 0.04 },
                  },
            }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : {
                    height: 0,
                    opacity: 0,
                    transition: {
                      height: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
                      opacity: { duration: 0.14 },
                    },
                  }
            }
            className="md:hidden overflow-hidden border-t border-slate-200/80 dark:border-zinc-800"
          >
            <div className="px-4 py-4 space-y-4">
              <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => {
                  const active = isRouteActive(link.href);
                  return (
                    <Link
                      key={link.href}
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
                  );
                })}
              </nav>

              <div className="pt-3 border-t border-slate-200/80 dark:border-zinc-800 grid grid-cols-2 gap-2.5">
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
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
