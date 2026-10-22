import React, { useState, useMemo } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * EventGallerySection
 * Displays event photo gallery cleanly in a responsive grid with a full-screen lightbox viewer.
 * Season grouping removed per user requirement - photos display cleanly without tags.
 */
export default function EventGallerySection({
  gallery = [],
  eventName = 'Event',
  eventTheme = null,
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(null);

  // Normalize gallery items (strictly gallery images, not banner posters)
  const items = useMemo(() => {
    return (gallery || [])
      .map((item, idx) => {
        let url = typeof item === 'string' ? item : item.ImageUrl || item.imageUrl || '';
        if (url && url.startsWith('/uploads')) {
          url = `${API_BASE_URL}${url}`;
        }
        return {
          id: item.Id || item.id || `gallery-${idx}`,
          url,
          caption: typeof item === 'string' ? '' : item.Caption || '',
        };
      })
      .filter((i) => Boolean(i.url));
  }, [gallery]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-2xl shrink-0"
            style={{
              backgroundColor: eventTheme?.iconBg || 'rgba(168,85,247,0.1)',
              color: eventTheme?.iconColor || '#a855f7',
            }}
          >
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Event Gallery
              </h2>
              <span
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: eventTheme?.badgeBg || 'rgba(168,85,247,0.1)',
                  color: eventTheme?.accent || '#a855f7',
                  borderColor: eventTheme?.badgeBorder || 'rgba(168,85,247,0.2)',
                  borderWidth: 1,
                }}
              >
                {items.length} Photos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item, idx) => (
          <motion.div
            key={item.id || idx}
            layout
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-950 shadow-xs aspect-[4/3] cursor-pointer"
            onClick={() => setActiveImageIndex(idx)}
          >
            <img
              src={item.url}
              alt={item.caption || `${eventName} gallery photo ${idx + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Subtle Overlay on Hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3.5">
              <div className="flex justify-end">
                <span className="p-1.5 rounded-lg bg-black/60 text-white backdrop-blur-md">
                  <Maximize2 className="w-3.5 h-3.5" />
                </span>
              </div>

              {item.caption && (
                <p className="text-xs font-semibold text-white line-clamp-2 bg-black/60 backdrop-blur-md p-2 rounded-xl">
                  {item.caption}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox for Gallery */}
      <AnimatePresence>
        {activeImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 select-none"
            onClick={() => setActiveImageIndex(null)}
          >
            <div className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center justify-center">
              {/* Header */}
              <div className="absolute -top-12 inset-x-0 flex items-center justify-between text-white px-2">
                <span className="text-xs font-mono text-zinc-300">
                  {activeImageIndex + 1} / {items.length}
                </span>

                <button
                  type="button"
                  onClick={() => setActiveImageIndex(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Image */}
              <div
                className="relative max-w-full max-h-[80vh] flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-zinc-800 bg-black"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={items[activeImageIndex]?.url}
                  alt={items[activeImageIndex]?.caption || 'Gallery photo'}
                  className="max-w-full max-h-[75vh] object-contain rounded-2xl"
                />

                {items[activeImageIndex]?.caption && (
                  <div className="w-full p-3 bg-zinc-950/90 border-t border-zinc-800 text-center">
                    <p className="text-xs font-medium text-zinc-200">
                      {items[activeImageIndex]?.caption}
                    </p>
                  </div>
                )}

                {items.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black text-white backdrop-blur-md transition-all cursor-pointer shadow border border-white/20"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
                      }}
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
