import React, { useMemo } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { Award } from 'lucide-react';

/**
 * EventSponsorsSection
 * Displays sponsors cleanly showing just their official brand logos/images.
 * If website exists, clicking the logo navigates to their page.
 */
export default function EventSponsorsSection({
  sponsors = [],
  eventName = 'Event',
  eventTheme = null,
}) {
  const normalizedSponsors = useMemo(() => {
    return (sponsors || [])
      .map((sp) => {
        let logo = sp.LogoUrl || sp.logoUrl || sp.Logo || '';
        if (logo && logo.startsWith('/uploads')) {
          logo = `${API_BASE_URL}${logo}`;
        }
        return {
          id: sp.Id || sp.id || Math.random(),
          name: sp.Name || sp.name || 'Official Sponsor',
          logo,
          website: sp.WebsiteUrl || sp.websiteUrl || sp.website || '',
        };
      })
      .filter((sp) => Boolean(sp.logo || sp.name));
  }, [sponsors]);

  if (normalizedSponsors.length === 0) {
    return null;
  }

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
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
            <Award className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Sponsors & Partners
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
                {normalizedSponsors.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sponsors Logos Only */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        {normalizedSponsors.map((sp) => {
          const cardContent = (
            <div
              className="h-20 sm:h-24 w-36 sm:w-48 px-5 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-center transition-all duration-200 hover:scale-[1.03] hover:border-slate-300 dark:hover:border-zinc-700 shadow-xs group cursor-pointer"
              title={sp.name}
            >
              {sp.logo ? (
                <img
                  src={sp.logo}
                  alt={sp.name}
                  className="max-h-full max-w-full object-contain filter dark:brightness-95 contrast-105 transition-transform duration-200 group-hover:scale-105"
                />
              ) : (
                <span className="text-sm font-bold text-slate-700 dark:text-zinc-300 text-center truncate">
                  {sp.name}
                </span>
              )}
            </div>
          );

          if (sp.website) {
            return (
              <a
                key={sp.id}
                href={sp.website.startsWith('http') ? sp.website : `https://${sp.website}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block"
              >
                {cardContent}
              </a>
            );
          }

          return <div key={sp.id}>{cardContent}</div>;
        })}
      </div>
    </div>
  );
}
