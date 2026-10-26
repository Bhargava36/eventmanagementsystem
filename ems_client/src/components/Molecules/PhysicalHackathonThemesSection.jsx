import React from 'react';
import {
  Layers,
  Cpu,
  Globe,
  Radio,
  ShieldCheck,
  HeartPulse,
  Coins,
  Smartphone,
  Zap,
  Compass,
  Code2,
  Database,
  Terminal,
  Activity,
  Bot
} from 'lucide-react';

/**
 * Intelligent icon resolver based on theme name / keywords.
 */
export const getThemeIcon = (name = '', desc = '') => {
  const text = `${name} ${desc}`.toLowerCase();
  if (
    text.includes('ai') ||
    text.includes('intelligence') ||
    text.includes('machine learning') ||
    text.includes('ml') ||
    text.includes('neural') ||
    text.includes('vision') ||
    text.includes('nlp') ||
    text.includes('deep learning')
  ) {
    return Cpu;
  }
  if (
    text.includes('web') ||
    text.includes('fullstack') ||
    text.includes('frontend') ||
    text.includes('backend') ||
    text.includes('cloud') ||
    text.includes('saas') ||
    text.includes('devops')
  ) {
    return Globe;
  }
  if (
    text.includes('iot') ||
    text.includes('internet of things') ||
    text.includes('hardware') ||
    text.includes('embedded') ||
    text.includes('sensor') ||
    text.includes('robot') ||
    text.includes('automation')
  ) {
    return Radio;
  }
  if (
    text.includes('cyber') ||
    text.includes('security') ||
    text.includes('privacy') ||
    text.includes('cryptography') ||
    text.includes('defense')
  ) {
    return ShieldCheck;
  }
  if (
    text.includes('health') ||
    text.includes('med') ||
    text.includes('bio') ||
    text.includes('clinical') ||
    text.includes('care')
  ) {
    return HeartPulse;
  }
  if (
    text.includes('fintech') ||
    text.includes('finance') ||
    text.includes('crypto') ||
    text.includes('blockchain') ||
    text.includes('web3') ||
    text.includes('payment')
  ) {
    return Coins;
  }
  if (
    text.includes('mobile') ||
    text.includes('app') ||
    text.includes('android') ||
    text.includes('ios')
  ) {
    return Smartphone;
  }
  if (
    text.includes('green') ||
    text.includes('energy') ||
    text.includes('climate') ||
    text.includes('sustainab') ||
    text.includes('clean') ||
    text.includes('solar')
  ) {
    return Zap;
  }
  if (
    text.includes('data') ||
    text.includes('analytics') ||
    text.includes('big data') ||
    text.includes('warehouse')
  ) {
    return Database;
  }
  if (
    text.includes('code') ||
    text.includes('software') ||
    text.includes('developer') ||
    text.includes('api')
  ) {
    return Code2;
  }
  return Compass;
};

/**
 * PhysicalHackathonThemesSection
 * 
 * Clean, modern showcase for Hackathon Innovation Themes.
 * Displays ONLY:
 * - Theme Photo or Icon
 * - Theme Title
 * - Theme Description
 * 
 * STRICT GUIDELINES:
 * - No pills anywhere
 * - No problem statements / challenges
 * - Seamless match with the application design
 */
export default function PhysicalHackathonThemesSection({
  themes = [],
  event = {},
  eventTheme = {}
}) {
  const isHackathon = (event?.EventType || '').toLowerCase() === 'hackathon';
  if (!isHackathon) return null;

  return (
    <div className="space-y-4 pt-1">
      {/* ── SECTION HEADER (Clean layout matching Venue Specifications & Amenities) ── */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
          style={{
            backgroundColor: eventTheme?.iconBg || 'rgba(16, 185, 129, 0.1)',
            borderColor: eventTheme?.badgeBorder || 'rgba(16, 185, 129, 0.25)',
            color: eventTheme?.iconColor || '#10b981'
          }}
        >
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Hackathon Themes
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Explore the official technical tracks and innovation domains published for this hackathon.
          </p>
        </div>
      </div>

      {themes && themes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {themes.map((theme, idx) => {
            const IconComponent = getThemeIcon(theme.ThemeName, theme.Description);
            const hasImage = Boolean(theme.ImageUrl && theme.ImageUrl.trim());

            return (
              <div
                key={theme.Id || idx}
                className="group relative rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#111613] hover:border-emerald-500/40 dark:hover:border-emerald-500/30 transition-all duration-300 p-5 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md"
              >
                <div>
                  {/* Visual: Image/Photo Banner OR Modern Icon Container */}
                  {hasImage ? (
                    <div className="w-full h-36 rounded-xl overflow-hidden mb-4 border border-slate-100 dark:border-zinc-800/80 bg-slate-100 dark:bg-zinc-900 relative">
                      <img
                        src={theme.ImageUrl}
                        alt={theme.ThemeName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.parentElement?.querySelector('.theme-fallback-icon');
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="theme-fallback-icon absolute inset-0 hidden items-center justify-center bg-slate-100 dark:bg-zinc-900 text-emerald-500">
                        <IconComponent className="h-10 w-10 opacity-70" />
                      </div>
                      {/* Subtle minimalist track index in corner */}
                      <span className="absolute top-2.5 right-2.5 font-mono text-[11px] font-bold text-white/90 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3 mb-4">
                      {/* Modern Icon Box */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 group-hover:scale-105"
                        style={{
                          backgroundColor: eventTheme?.iconBg || 'rgba(16, 185, 129, 0.1)',
                          borderColor: eventTheme?.badgeBorder || 'rgba(16, 185, 129, 0.25)',
                          color: eventTheme?.iconColor || '#10b981'
                        }}
                      >
                        <IconComponent className="h-6 w-6" />
                      </div>

                      {/* Clean Typographic Track Index (NO PILL BADGE) */}
                      <span className="font-mono text-xs font-semibold text-slate-400 dark:text-zinc-600 tracking-wider pt-1">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                  )}

                  {/* Theme Title */}
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                    {theme.ThemeName}
                  </h4>

                  {/* Theme Description */}
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed mt-2 line-clamp-4">
                    {theme.Description || 'Explore, formulate and build novel solutions under this technical domain.'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-center space-y-2">
          <Layers className="h-8 w-8 mx-auto text-slate-400" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Themes Announced Soon</h4>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
            The event organizers will finalize and list the official innovation themes prior to the on-campus hackathon kickoff.
          </p>
        </div>
      )}
    </div>
  );
}
