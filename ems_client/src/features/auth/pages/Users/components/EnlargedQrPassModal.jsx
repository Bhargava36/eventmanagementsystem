import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Check, Copy } from 'lucide-react';

export default function EnlargedQrPassModal({
  isOpen,
  onClose,
  theme,
  isWebinar,
  isWorkshop,
  displayName,
  team,
  qrPassValue,
  qrSvgRef,
  onDownloadQr,
  onCopyPublicUrl,
  copiedLink
}) {
  if (!isOpen || !team) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-sm w-full bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 text-center space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="space-y-1 pt-2">
          <span
            className="inline-block px-3 py-1 rounded-xl text-[11px] font-extrabold uppercase tracking-wider border"
            style={{
              backgroundColor: theme.badgeBg,
              borderColor: theme.badgeBorder,
              color: theme.badgeText
            }}
          >
            {isWebinar ? "Official Webinar Pass" : isWorkshop ? "Official Workshop Pass" : "Official Team Pass"}
          </span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {displayName}
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            {isWebinar ? `Delegate #${team.TeamId} • ${team.EventName}` : isWorkshop ? `Attendee #${team.TeamId} • ${team.EventName}` : `Team #${team.TeamId} • ${team.EventName}`}
          </p>
        </div>
        <div
          ref={qrSvgRef}
          className="p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-inner flex flex-col items-center"
        >
          <QRCodeSVG
            value={qrPassValue}
            size={220}
            level="H"
            includeMargin={true}
          />
        </div>
        <p className="text-xs text-slate-500 dark:text-gray-400">
          Scan with camera to view public verification and scorecard.
        </p>
        <div className="w-full flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onDownloadQr}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-gray-200 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Save Image</span>
          </button>
          <button
            type="button"
            onClick={onCopyPublicUrl}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer"
            style={{ backgroundColor: theme.buttonBg }}
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? "Copied!" : "Copy URL"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

