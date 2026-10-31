"use client";

import React, { useState, useEffect, Suspense } from "react";
import Spline from "@splinetool/react-spline";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const HeroSection = ({ className }) => {
  const [splineLoaded, setSplineLoaded] = useState(false);
  const splineAppRef = React.useRef(null);

  // Responsive Zoom Tuning for 4K-exported scenes:
  // Dynamically scales the camera zoom so the 4K design fits flawlessly on mobile
  // without clipping or being oversized on laptops, tablets, and phones.
  const adjustZoomFor4K = React.useCallback((app) => {
    if (!app) return;
    const width = typeof window !== "undefined" ? window.innerWidth : 1920;
    let zoomFactor;

    if (width < 420) {
      zoomFactor = 0.22; // Small & standard phones (360px - 414px) - prevents 3D clipping!
    } else if (width < 640) {
      zoomFactor = 0.28; // Large phones / Phablets
    } else if (width < 768) {
      zoomFactor = 0.40; // Mini tablets
    } else if (width < 1024) {
      zoomFactor = 0.55; // Tablets
    } else if (width < 1440) {
      zoomFactor = 0.72; // Laptops / MacBooks (matches user's approved view)
    } else if (width < 1920) {
      zoomFactor = 0.85; // Full HD 1080p
    } else if (width < 2560) {
      zoomFactor = 0.95; // QHD 1440p / 2K
    } else {
      zoomFactor = 1.0;  // 4K Ultra-HD native
    }

    try {
      if (typeof app.setZoom === "function") {
        app.setZoom(zoomFactor);
      }
    } catch (e) {
      console.debug("Spline setZoom fallback:", e);
    }
  }, []);

  const handleSplineLoad = (app) => {
    splineAppRef.current = app;
    setSplineLoaded(true);

    // 1. Programmatically hide any Built-with-Spline watermark object in the 3D scene
    try {
      const allObjects = app.getAllObjects ? app.getAllObjects() : [];
      allObjects.forEach((obj) => {
        if (obj.name && /spline|watermark|logo|badge|credit/i.test(obj.name)) {
          obj.visible = false;
          if (obj.scale) obj.scale.set(0, 0, 0);
          if (obj.position) obj.position.set(0, -99999, 0);
        }
      });
      const wm = app.findObjectByName("SplineWatermark") || app.findObjectByName("logo");
      if (wm) {
        wm.visible = false;
        if (wm.scale) wm.scale.set(0, 0, 0);
        if (wm.position) wm.position.set(0, -99999, 0);
      }
    } catch (err) {
      console.debug("Spline watermark program hide:", err);
    }

    adjustZoomFor4K(app);
  };

  useEffect(() => {
    // Graceful trigger so the smooth bottom-to-top motion activates reliably
    const timer = setTimeout(() => {
      setSplineLoaded(true);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (splineAppRef.current) {
        adjustZoomFor4K(splineAppRef.current);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustZoomFor4K]);


  return (
    <section
      className={cn(
        "relative w-full min-h-[92vh] sm:min-h-screen bg-white dark:bg-black overflow-hidden flex flex-col justify-between transition-colors duration-300 select-none",
        className
      )}
    >
      {/* ======================================================== */}
      {/* 1. 3D SPLINE SCENE CANVAS (SMOOTH BOTTOM-TO-TOP MOTION)  */}
      {/* User's custom scene: https://prod.spline.design/7EOAAK0Mc7k1gp0O/scene.splinecode */}
      {/* ======================================================== */}
      <div className="absolute inset-0 w-full h-full z-0 flex items-center justify-center transform-gpu overflow-hidden">
        <Suspense fallback={null}>
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.94 }}
            animate={
              splineLoaded
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0, y: 100, scale: 0.5 }
            }
            transition={{
              duration: 1.5,
              ease: [0.16, 1, 0.3, 1], // Cinematic smooth luxury ease-out
            }}
            className="w-full h-full flex items-center justify-center"
          >
            <Spline
              scene="https://prod.spline.design/7EOAAK0Mc7k1gp0O/scene.splinecode"
              onLoad={handleSplineLoad}
              className="w-full h-full"
            />
          </motion.div>
        </Suspense>

        {/* Top subtle fade mask for Navbar */}
        <div className="absolute top-0 inset-x-0 h-24 sm:h-28 bg-gradient-to-b from-white via-white/40 to-transparent dark:from-black dark:via-black/40 to-transparent pointer-events-none z-10" />

        {/* BOTTOM SOLID OPAQUE MASK: Completely hides the "Built with Spline" watermark */}
        <div className="absolute inset-x-0 bottom-0 h-48 sm:h-48 bg-gradient-to-t from-white via-white dark:from-black dark:via-black to-transparent pointer-events-none z-10" />
      </div>

      {/* Top spacing to account for floating Navbar */}
      <div className="h-20 sm:h-28 w-full shrink-0 pointer-events-none" />

      {/* ======================================================== */}
      {/* 2. FLOATING HUD OVERLAY & ACTION CTAs                    */}
      {/* Positioned cleanly below the 3D model with no collision  */}
      {/* ======================================================== */}
      <div className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-12 flex flex-col items-center text-center pointer-events-none mt-auto">
        
        {/* Subtitle / Value Proposition with Cinematic Blur Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-2 max-w-xl mx-auto"
        >
          <p className="text-xs sm:text-base text-zinc-600 dark:text-zinc-300 font-normal leading-relaxed px-4">
            Where crafters connect, events scale, and bold ideas take flight.
          </p>
        </motion.div>

        {/* Primary Action Buttons (Clickable) */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center gap-2.5 sm:gap-4 pt-3 sm:pt-4 pointer-events-auto"
        >
          {/* Explore Hackathons */}
          <Link
            to="/events"
            className="group relative overflow-hidden inline-flex items-center justify-center gap-1.5 sm:gap-2 px-5 py-2.5 sm:px-7 sm:py-3 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white font-semibold text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            <span className="relative z-10">Explore Events</span>
            <span className="relative z-10 transition-transform duration-200 group-hover:translate-x-1 font-bold">
              →
            </span>
          </Link>

          {/* Join Platform */}
          <Link
            to="/user/register"
            className="inline-flex items-center justify-center px-5 py-2.5 sm:px-6 sm:py-3 rounded-full border border-zinc-300 dark:border-white/20 bg-white/90 dark:bg-black/70 hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-800 dark:text-white font-medium text-xs sm:text-sm tracking-wide backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
          >
            Join Free
          </Link>
        </motion.div>


      </div>
    </section>
  );
};

export default HeroSection;