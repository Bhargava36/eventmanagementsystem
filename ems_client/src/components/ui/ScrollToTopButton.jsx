import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTopButton({ className = '' }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling down 280px
      if (window.scrollY > 280) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.2 }}
          className="group relative flex items-center mb-2.5"
        >
          {/* Subtle tooltip on hover for desktop */}
          <span className="pointer-events-none absolute right-full mr-3 hidden sm:inline-flex items-center px-3 py-1.5 rounded-xl bg-gray-950/90 dark:bg-zinc-900/95 text-white border border-gray-700/50 dark:border-white/10 shadow-xl text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap backdrop-blur-md">
            Back to top
          </span>

          <motion.button
            type="button"
            onClick={scrollToTop}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className={`relative w-12 h-12 rounded-full flex items-center justify-center bg-white/95 dark:bg-zinc-900/95 text-gray-700 dark:text-zinc-200 hover:text-white dark:hover:text-white hover:bg-emerald-600 dark:hover:bg-emerald-600 border border-gray-200 dark:border-white/10 shadow-xl hover:shadow-emerald-500/25 ring-2 ring-black/5 dark:ring-white/10 backdrop-blur-md transition-colors duration-200 cursor-pointer ${className}`}
            aria-label="Scroll to top"
            title="Back to top"
          >
            <ArrowUp className="w-5 h-5 transition-transform duration-200 group-hover:-translate-y-0.5" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
