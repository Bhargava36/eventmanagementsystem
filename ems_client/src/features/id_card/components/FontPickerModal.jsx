import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  Type,
  Check,
  SlidersHorizontal,
  Flame,
  Crown,
  Laptop,
  PenTool,
  Zap,
  Tag
} from 'lucide-react';
import {
  FONTS_CATALOG,
  FONT_CATEGORIES,
  loadGoogleFontDynamically
} from '../constants/fontsCatalog';

export default function FontPickerModal({
  isOpen,
  onClose,
  currentFont,
  onSelectFont
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewText, setPreviewText] = useState('AVISHKAAR 2026');

  // Pre-load visible fonts dynamically
  useEffect(() => {
    if (!isOpen) return;
    // Load top 30 initial fonts immediately so previews appear instantly
    FONTS_CATALOG.slice(0, 35).forEach((f) => loadGoogleFontDynamically(f.family));
  }, [isOpen]);

  const filteredFonts = useMemo(() => {
    return FONTS_CATALOG.filter((f) => {
      const matchCat = selectedCategory === 'All' || f.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchQuery =
        !query ||
        f.name.toLowerCase().includes(query) ||
        f.family.toLowerCase().includes(query) ||
        (f.badge && f.badge.toLowerCase().includes(query)) ||
        f.category.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[88vh] bg-[#0d1012] border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-[#111618]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
              <Type className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-wide">
                  Typography Studio
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {FONTS_CATALOG.length} Designer Fonts
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Pick from modern sans, bold headlines, cyber sci-fi, luxury serifs, and handwritten scripts
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toolbar: Search, Sample Preview Text, Categories */}
        <div className="p-4 border-b border-zinc-800/80 bg-[#0c0e10] space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search 150+ fonts by name, style, or badge (e.g. Orbitron, Gothic, Script)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Custom Preview Text */}
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">Preview Text:</span>
              <input
                type="text"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                placeholder="Custom sample text"
                className="w-48 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-bold text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {FONT_CATEGORIES.map((cat) => {
              const count = cat === 'All' ? FONTS_CATALOG.length : FONTS_CATALOG.filter(f => f.category === cat).length;
              const isSel = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSel
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isSel ? 'bg-black/30 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Font Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredFonts.map((f) => {
            const isCurrent = currentFont === f.value || currentFont?.includes(f.family);
            // Preload font as it renders in view
            loadGoogleFontDynamically(f.family);

            return (
              <div
                key={f.name}
                onClick={() => {
                  loadGoogleFontDynamically(f.family);
                  onSelectFont(f.value);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 group relative hover:scale-[1.01] ${
                  isCurrent
                    ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/50 shadow-lg'
                    : 'bg-zinc-900/50 hover:bg-zinc-900 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                {/* Top: Name, Category, Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {f.name}
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-mono">
                      {f.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                      {f.badge}
                    </span>
                    {isCurrent && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Sample Live Typography Rendering */}
                <div className="py-2 px-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center min-h-[54px] overflow-hidden">
                  <p
                    className="text-base sm:text-lg text-center tracking-normal text-slate-100 truncate w-full"
                    style={{ fontFamily: f.value }}
                  >
                    {previewText || f.name}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                  <span>CSS: {f.family}</span>
                  <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform font-bold">
                    Apply Font →
                  </span>
                </div>
              </div>
            );
          })}

          {filteredFonts.length === 0 && (
            <div className="col-span-full py-16 text-center text-zinc-500">
              <Type className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-bold text-zinc-400">No font styles found</p>
              <p className="text-xs mt-1">Try another search term or select "All" categories.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-[#0a0c0e] flex items-center justify-between text-xs text-zinc-500">
          <span>Click any font style to apply it directly to your card text.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
