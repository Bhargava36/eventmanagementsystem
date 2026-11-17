import React from 'react';
import { X, ExternalLink } from 'lucide-react';

export default function DocumentPreviewModal({
  url,
  onClose
}) {
  if (!url) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-3xl p-4 shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-200 transition cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="w-full text-center pb-3 border-b border-slate-100 dark:border-zinc-800 mb-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Document Preview</h4>
        </div>
        <div className="overflow-auto max-h-[75vh] w-full flex items-center justify-center p-2">
          {url.toLowerCase().endsWith('.pdf') ? (
            <iframe
              src={url}
              className="w-full h-[65vh] rounded-xl"
              title="Receipt PDF"
            />
          ) : (
            <img
              src={url}
              alt="Payment Receipt"
              className="max-w-full max-h-[70vh] object-contain rounded-xl"
            />
          )}
        </div>
        <div className="pt-3">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Full Document in New Tab</span>
          </a>
        </div>
      </div>
    </div>
  );
}

