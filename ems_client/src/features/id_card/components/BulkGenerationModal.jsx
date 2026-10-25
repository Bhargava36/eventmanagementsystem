import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';
import {
  X,
  IdCard,
  FileText,
  Printer,
  Archive,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Download,
  Users,
  ShieldCheck,
  ChevronRight,
  Eye
} from 'lucide-react';
import {
  generateCombinedPdf,
  generateSheetPrintPdf,
  generateZipArchive,
  downloadSingleCardImage
} from '../services/idCardPdfGenerator';
import { renderCardSide } from '../services/idCardRenderer';

export default function BulkGenerationModal({
  isOpen,
  onClose,
  eventId,
  event,
  template,
  onCompleted = () => {}
}) {
  const [stage, setStage] = useState('confirm'); // 'confirm' | 'generating' | 'completed' | 'error'
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [includeBack, setIncludeBack] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, percentage: 0, currentName: '' });
  const [exportingType, setExportingType] = useState(null); // 'combined' | 'sheet' | 'zip' | null
  const [exportMessage, setExportMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [previewParticipant, setPreviewParticipant] = useState(null);
  const [activeTemplate, setActiveTemplate] = useState(template);

  useEffect(() => {
    if (template) setActiveTemplate(template);
  }, [template]);

  // Fetch participants when modal opens
  useEffect(() => {
    if (!isOpen || !eventId) return;

    setStage('confirm');
    setErrorMsg('');
    setExportMessage('');
    setBatchResult(null);
    setLoadingParticipants(true);

    fetch(`${API_BASE_URL}/api/id-cards/events/${encodeURIComponent(eventId)}/participants`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data.participants) ? data.participants : [];
        setParticipants(list);
        if (list.length > 0) setPreviewParticipant(list[0]);
      })
      .catch((err) => {
        setErrorMsg('Failed to load eligible participants for this event.');
      })
      .finally(() => {
        setLoadingParticipants(false);
      });

    // Fetch latest saved template to guarantee visual designer sync
    fetch(`${API_BASE_URL}/api/id-cards/events/${encodeURIComponent(eventId)}/templates`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data.templates) ? data.templates : [];
        if (list.length > 0) {
          const defTpl = list.find((t) => t.IsDefault) || list[0];
          setActiveTemplate(defTpl);
        }
      })
      .catch((err) => console.error('Failed to sync template in bulk modal:', err));
  }, [isOpen, eventId]);

  if (!isOpen) return null;

  const handleStartGeneration = async () => {
    if (participants.length === 0) {
      setErrorMsg('No eligible participants found for this event.');
      return;
    }

    setStage('generating');
    setErrorMsg('');
    setProgress({ current: 0, total: participants.length, percentage: 0, currentName: 'Initializing batch...' });

    try {
      // 1. Call Backend to create batch and secure verification tokens
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/id-cards/events/${eventId}/batches/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          templateId: activeTemplate?.Id || null
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to initialize generation batch.');

      setBatchResult(data);
      const updatedList = Array.isArray(data.participants) && data.participants.length > 0
        ? data.participants
        : participants;
      setParticipants(updatedList);

      // 2. Pre-cache/warm cards with live progress simulation
      const total = updatedList.length;
      for (let i = 0; i < total; i++) {
        setProgress({
          current: i + 1,
          total,
          percentage: Math.round(((i + 1) / total) * 100),
          currentName: updatedList[i].ParticipantName || `Participant ${i + 1}`
        });
        // Tiny yield to keep UI smooth
        if (i % 5 === 0) {
          await new Promise((r) => setTimeout(r, 16));
        }
      }

      setStage('completed');
      if (onCompleted) onCompleted(data);
    } catch (err) {
      setErrorMsg(err.message || 'Generation failed.');
      setStage('error');
    }
  };

  const handleExport = async (type) => {
    setExportingType(type);
    setExportMessage('');
    try {
      if (type === 'combined') {
        setExportMessage('Generating combined print-ready PDF...');
        await generateCombinedPdf(participants, activeTemplate, event, { includeBack }, (p) => {
          setExportMessage(`Rendering card ${p.current} of ${p.total}...`);
        });
        setExportMessage('Combined PDF downloaded successfully!');
      } else if (type === 'sheet') {
        setExportMessage('Generating A4 print sheets with cutting guides...');
        await generateSheetPrintPdf(participants, activeTemplate, event, {}, (p) => {
          setExportMessage(`Rendering sheet card ${p.current} of ${p.total}...`);
        });
        setExportMessage('Print sheets downloaded successfully!');
      } else if (type === 'zip') {
        setExportMessage('Rendering high-res card PNGs & creating ZIP archive...');
        await generateZipArchive(participants, activeTemplate, event, { includeBack }, (p) => {
          setExportMessage(`Archiving card ${p.current} of ${p.total}...`);
        });
        setExportMessage('ZIP archive downloaded successfully!');
      }
    } catch (err) {
      alert(`Export error: ${err.message}`);
      setExportMessage(`Export failed: ${err.message}`);
    } finally {
      setExportingType(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <IdCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Bulk ID Card Generator
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {event?.EventName || 'Event'} • Template: {activeTemplate?.TemplateName || 'Official Event Pass'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STAGE 1: CONFIRMATION & PREVIEW */}
          {stage === 'confirm' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Eligible Cards
                  </p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {loadingParticipants ? '...' : participants.length}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Card Standard
                  </p>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1.5">
                    CR80 (85.6×54mm)
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Orientation
                  </p>
                  <p className="text-sm font-extrabold capitalize text-slate-900 dark:text-white mt-1.5">
                    {activeTemplate?.Orientation || 'Portrait'}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Security QR
                  </p>
                  <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4" />
                    Encrypted Token
                  </p>
                </div>
              </div>

              {/* Front Side Card Notice */}
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                    Badge Format
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Single Front-Side Badge with verifiable QR code.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  Front Side Only
                </span>
              </div>

              {/* Summary notice */}
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-600 dark:text-zinc-300 space-y-1">
                <p className="font-bold text-emerald-600 dark:text-emerald-400">
                  Ready to process {participants.length} participant cards:
                </p>
                <p>
                  • Each participant receives a unique, non-guessable verification token.
                </p>
                <p>
                  • Dynamic fields (Names, Photos, Colleges, Teams, Categories, QR codes) will be bound automatically.
                </p>
                <p>
                  • Output options include Combined PDF, Multi-card A4 Sheets with cut marks, and ZIP of individual PNGs.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loadingParticipants || participants.length === 0}
                  onClick={handleStartGeneration}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/20 transition disabled:opacity-50 cursor-pointer"
                >
                  <IdCard className="h-4 w-4" />
                  <span>Generate All {participants.length} ID Cards</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 2: LIVE GENERATION PROGRESS */}
          {stage === 'generating' && (
            <div className="py-8 text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-pulse">
                <RefreshCw className="h-8 w-8 animate-spin" />
              </div>

              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  Generating Participant Badges...
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Binding dynamic fields, encoding encrypted QR tokens, and building high-res vector canvases.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500 dark:text-zinc-400 truncate max-w-[250px]">
                    {progress.currentName || 'Processing...'}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {progress.current} / {progress.total} ({progress.percentage}%)
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-200"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STAGE 3: COMPLETED & DOWNLOAD CENTER */}
          {stage === 'completed' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                    Generation Complete!
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 mt-0.5">
                    {batchResult?.message || `Successfully generated all ${participants.length} ID cards.`}
                  </p>
                </div>
              </div>

              {exportMessage && (
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-zinc-900 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>{exportMessage}</span>
                </div>
              )}

              {/* 3 Main Export Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Combined PDF */}
                <button
                  type="button"
                  disabled={Boolean(exportingType)}
                  onClick={() => handleExport('combined')}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 hover:border-emerald-500 transition text-left space-y-2 cursor-pointer group disabled:opacity-50"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900 dark:text-white">
                      Combined PDF
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      All cards in one document for single-card badge printers.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 pt-1">
                    <Download className="h-3 w-3" /> Download PDF
                  </span>
                </button>

                {/* 2. Print Sheets (A4 with cut marks) */}
                <button
                  type="button"
                  disabled={Boolean(exportingType)}
                  onClick={() => handleExport('sheet')}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 hover:border-emerald-500 transition text-left space-y-2 cursor-pointer group disabled:opacity-50"
                >
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition">
                    <Printer className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900 dark:text-white">
                      Print Sheets (A4)
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      Multiple cards per A4 page with cutting guides / trim marks.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 dark:text-teal-400 pt-1">
                    <Download className="h-3 w-3" /> Download Sheets
                  </span>
                </button>

                {/* 3. ZIP Archive */}
                <button
                  type="button"
                  disabled={Boolean(exportingType)}
                  onClick={() => handleExport('zip')}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 hover:border-emerald-500 transition text-left space-y-2 cursor-pointer group disabled:opacity-50"
                >
                  <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-105 transition">
                    <Archive className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900 dark:text-white">
                      ZIP Archive
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      Individual high-res PNG cards for digital distribution.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 pt-1">
                    <Download className="h-3 w-3" /> Download ZIP
                  </span>
                </button>
              </div>

              {/* Participant Card Quick Preview Section */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                    Generated Participant Cards ({participants.length})
                  </h5>
                  <span className="text-[11px] text-slate-500">
                    Click to download single card
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800">
                  {participants.slice(0, 50).map((p) => (
                    <div
                      key={p.UserId || p.IdCardNumber}
                      className="py-2 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {p.ParticipantName}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                          {p.IdCardNumber} • {p.TeamName} • {p.College}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => downloadSingleCardImage(p, activeTemplate, event, 'front')}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-emerald-500 hover:border-emerald-500 transition cursor-pointer"
                        title="Download single PNG card"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {participants.length > 50 && (
                    <p className="py-2 text-center text-[11px] text-slate-400">
                      + {participants.length - 50} more cards included in batch download.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-xs font-bold text-white transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* STAGE: ERROR */}
          {stage === 'error' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Batch Generation Failed
                </h4>
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                  {errorMsg}
                </p>
              </div>
              <button
                type="button"
                onClick={handleStartGeneration}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-xs font-bold text-white shadow transition hover:bg-emerald-500 cursor-pointer"
              >
                Retry Generation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
