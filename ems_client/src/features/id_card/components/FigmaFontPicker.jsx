import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  Check,
  Type,
  LayoutGrid,
  X,
  Layers
} from 'lucide-react';
import {
  FONTS_CATALOG,
  FONT_CATEGORIES,
  loadGoogleFontDynamically
} from '../constants/fontsCatalog';

export default function FigmaFontPicker({
  value,
  onChange,
  onOpenStudio
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const dropdownRef = useRef(null);
  const listRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Current active font object
  const currentFontObj = useMemo(() => {
    return (
      FONTS_CATALOG.find((f) => f.value === value || value?.includes(f.family)) ||
      FONTS_CATALOG[0]
    );
  }, [value]);

  // Ensure current font is loaded
  useEffect(() => {
    if (currentFontObj?.family) {
      loadGoogleFontDynamically(currentFontObj.family);
    }
  }, [currentFontObj]);

  // Filtered fonts based on search & category
  const filteredFonts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return FONTS_CATALOG.filter((f) => {
      const matchCat = activeCategory === 'All' || f.category === activeCategory;
      const matchQuery =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.family.toLowerCase().includes(q) ||
        (f.badge && f.badge.toLowerCase().includes(q)) ||
        f.category.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [search, activeCategory]);

  // Preload visible fonts when dropdown opens
  useEffect(() => {
    if (isOpen) {
      filteredFonts.slice(0, 25).forEach((f) => loadGoogleFontDynamically(f.family));
    }
  }, [isOpen, filteredFonts]);

  return (
    <div className="relative w-full select-none" ref={dropdownRef}>
      {/* 1. Figma-Style Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-left group ${
          isOpen
            ? 'bg-emerald-50 dark:bg-zinc-900 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
            : 'bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
        }`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
            <Type className="w-3.5 h-3.5" />
          </div>
          <div className="truncate">
            <p
              className="text-xs text-slate-900 dark:text-white tracking-wide truncate"
              style={{ fontFamily: currentFontObj.value }}
            >
              {currentFontObj.name}
            </p>
            <p className="text-[9px] text-slate-400 dark:text-zinc-500 font-mono">
              {currentFontObj.category} • {currentFontObj.badge}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 pl-1">
          <ChevronDown
            className={`w-4 h-4 text-slate-400 dark:text-zinc-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-emerald-500 dark:text-emerald-400' : 'group-hover:text-slate-900 dark:group-hover:text-white'
            }`}
          />
        </div>
      </button>

      {/* 2. Figma-Style Popover Menu (Controlled Height, stays inside window) */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white dark:bg-[#0d0f12] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[380px] animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Search Header */}
          <div className="p-2 border-b border-slate-200 dark:border-zinc-800/80 bg-slate-50 dark:bg-[#12161a] space-y-2 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search font styles..."
                autoFocus
                className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 outline-none focus:border-emerald-500"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {FONT_CATEGORIES.map((cat) => {
                const isSel = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 transition cursor-pointer ${
                      isSel
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font List Items */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-zinc-700"
          >
            {filteredFonts.map((f) => {
              const isSelected = currentFontObj.value === f.value;
              loadGoogleFontDynamically(f.family);

              return (
                <button
                  key={f.name}
                  type="button"
                  onClick={() => {
                    loadGoogleFontDynamically(f.family);
                    onChange(f.value);
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => {
                    loadGoogleFontDynamically(f.family);
                  }}
                  className={`w-full px-2.5 py-2 rounded-xl text-left transition flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-white font-bold ring-1 ring-emerald-500/40'
                      : 'hover:bg-slate-100 dark:hover:bg-zinc-900/80 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {/* Left: Font Name rendered in ITS AUTHENTIC FONT STYLE */}
                  <div className="flex items-baseline gap-2 truncate pr-2">
                    <span
                      className="text-sm tracking-normal truncate transition-transform group-hover:scale-[1.02] origin-left"
                      style={{ fontFamily: f.value }}
                    >
                      {f.name}
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-sans font-normal opacity-0 group-hover:opacity-100 transition-opacity">
                      {f.category}
                    </span>
                  </div>

                  {/* Right: Badge & Selected Check */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400">
                      {f.badge}
                    </span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 stroke-[3]" />
                    )}
                  </div>
                </button>
              );
            })}

            {filteredFonts.length === 0 && (
              <div className="py-8 text-center text-slate-400 dark:text-zinc-500 text-xs">
                No matching font styles found.
              </div>
            )}
          </div>

          {/* Footer with Studio Grid Shortcut */}
          <div className="p-2 border-t border-slate-200 dark:border-zinc-800/80 bg-slate-50 dark:bg-[#101417] flex items-center justify-between text-[11px] shrink-0">
            <span className="text-slate-500 dark:text-zinc-500 font-mono">
              {filteredFonts.length} of {FONTS_CATALOG.length} styles
            </span>
            {onOpenStudio && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenStudio();
                }}
                className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold transition cursor-pointer"
              >
                <LayoutGrid className="w-3 h-3" />
                <span>Large Grid Studio ↗</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
