import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, X, Image as ImageIcon } from 'lucide-react';

/**
 * EventMediaSlider
 * High-end responsive photo slider & carousel with auto-advance, thumbnail strip,
 * and integrated full-screen lightbox.
 */
export default function EventMediaSlider({
  images = [],
  eventName = 'Event',
  eventTheme = null,
  aspectRatio = 'aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3]',
  autoPlay = true,
  interval = 4000,
}) {
  // Normalize images to array of strings
  const normalizedImages = (images || []).map((img) => {
    if (!img) return null;
    if (typeof img === 'string') {
      return img.startsWith('/uploads') ? `http://localhost:3000${img}` : img;
    }
    const url = img.url || img.ImageUrl || img.imageUrl || null;
    return url && url.startsWith('/uploads') ? `http://localhost:3000${url}` : url;
  }).filter(Boolean);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Auto-play timer
  useEffect(() => {
    if (!autoPlay || normalizedImages.length <= 1 || isPaused || isLightboxOpen) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % normalizedImages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, normalizedImages.length, isPaused, isLightboxOpen, interval]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % normalizedImages.length);
      }
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : normalizedImages.length - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, normalizedImages.length]);

  if (normalizedImages.length === 0) {
    return (
      <div
        className={`w-full ${aspectRatio} rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-black flex flex-col items-center justify-center p-6 text-center shadow-sm`}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
          style={{
            backgroundColor: eventTheme?.iconBg || 'rgba(168,85,247,0.1)',
            color: eventTheme?.iconColor || '#a855f7',
          }}
        >
          <ImageIcon className="w-7 h-7" />
        </div>
        <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
          {eventName}
        </p>
        <span className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
          Visual showcase updating soon
        </span>
      </div>
    );
  }

  const currentImg = normalizedImages[currentIndex] || normalizedImages[0];

  const handlePrev = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : normalizedImages.length - 1));
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev < normalizedImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <div
      className="flex flex-col gap-3 w-full select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Slide Card */}
      <div
        className={`relative ${aspectRatio} w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-900 group shadow-md flex items-center justify-center`}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={currentImg}
            alt={`${eventName} slide ${currentIndex + 1}`}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onClick={() => setIsLightboxOpen(true)}
            className="w-full h-full object-cover object-center cursor-pointer transition-transform duration-500 group-hover:scale-105"
          />
        </AnimatePresence>

        {/* Counter Badge */}
        {normalizedImages.length > 1 && (
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/10 shadow">
            {currentIndex + 1} / {normalizedImages.length}
          </div>
        )}

        {/* Fullscreen Button */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="absolute top-3 right-3 z-10 p-2 rounded-xl bg-black/60 hover:bg-black/90 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow border border-white/10"
          title="View Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Slide Controls (if > 1 image) */}
        {normalizedImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous slide"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow border border-white/10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next slide"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow border border-white/10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Bottom Dots Indicator */}
            <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 z-10 pointer-events-none">
              {normalizedImages.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentIndex === idx ? 'w-6 bg-white shadow' : 'w-1.5 bg-white/40'
                  }`}
                  style={
                    currentIndex === idx && eventTheme?.accent
                      ? { backgroundColor: eventTheme.accent }
                      : {}
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {normalizedImages.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 no-scrollbar">
          {normalizedImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`relative shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                currentIndex === idx
                  ? 'scale-105 shadow-md'
                  : 'border-slate-200 dark:border-zinc-800 opacity-60 hover:opacity-100'
              }`}
              style={
                currentIndex === idx
                  ? {
                      borderColor: eventTheme?.accent || '#a855f7',
                      boxShadow: `0 0 0 2px ${eventTheme?.badgeBorder || 'rgba(168,85,247,0.3)'}`,
                    }
                  : {}
              }
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {idx === 0 && (
                <span
                  className="absolute bottom-0 inset-x-0 text-white text-[8px] font-bold text-center py-0.5"
                  style={{
                    backgroundColor: eventTheme?.buttonBg || '#a855f7',
                    color: eventTheme?.buttonText || '#ffffff',
                  }}
                >
                  Primary
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 select-none"
            onClick={() => setIsLightboxOpen(false)}
          >
            <div className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center justify-center">
              {/* Top Controls */}
              <div className="absolute -top-12 inset-x-0 flex items-center justify-between text-white px-2">
                <span className="text-xs font-mono font-bold tracking-wider text-zinc-300">
                  {currentIndex + 1} / {normalizedImages.length} • {eventName}
                </span>
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Expanded Image */}
              <div
                className="relative max-w-full max-h-[80vh] flex items-center justify-center overflow-hidden rounded-2xl border border-zinc-800 bg-black"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={currentImg}
                  alt={`${eventName} enlarged`}
                  className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
                />

                {normalizedImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black text-white backdrop-blur-md transition-all cursor-pointer shadow border border-white/20"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black text-white backdrop-blur-md transition-all cursor-pointer shadow border border-white/20"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
