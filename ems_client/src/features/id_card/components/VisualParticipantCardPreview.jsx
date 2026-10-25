import React, { useEffect, useRef, useState } from 'react';
import {
  Download,
  FileText,
  Printer,
  CheckCircle2,
  X,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { renderCardSideCanvas } from '../services/idCardRenderer';
import {
  downloadSingleCardImage,
  generateCombinedPdf
} from '../services/idCardPdfGenerator';

/**
 * VisualParticipantCardPreview
 * Renders the participant ID card using the exact saved visual designer template
 */
export default function VisualParticipantCardPreview({
  participant,
  template,
  event,
  onClose
}) {
  const canvasRef = useRef(null);
  const [rendering, setRendering] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 440, height: 620 });

  const participantName =
    participant?.ParticipantName ||
    participant?.UserName ||
    participant?.Name ||
    'Participant';

  const cardNumber =
    participant?.IdCardNumber ||
    participant?.idCardNumber ||
    participant?.RegistrationId ||
    'PASS-ACTIVE';

  const teamName =
    participant?.TeamName ||
    participant?.teamName ||
    'Independent';

  // Render card onto canvas using active template configuration
  useEffect(() => {
    let isCancelled = false;

    const render = async () => {
      if (!canvasRef.current || !participant) return;
      setRendering(true);

      try {
        const sideConfig =
          typeof template?.FrontConfig === 'string'
            ? JSON.parse(template.FrontConfig)
            : template?.FrontConfig || {};

        const orientation = template?.Orientation || 'portrait';
        const cardWidth =
          Number(sideConfig.canvasWidth) ||
          (orientation === 'portrait' ? 440 : 620);
        const cardHeight =
          Number(sideConfig.canvasHeight) ||
          (orientation === 'portrait' ? 620 : 440);

        setDimensions({ width: cardWidth, height: cardHeight });

        // Render card canvas with 2x resolution
        await renderCardSideCanvas(
          canvasRef.current,
          sideConfig,
          participant,
          event || {},
          {
            scale: 2,
            cardWidth,
            cardHeight,
            previewMode: true
          }
        );
      } catch (err) {
        console.error('Failed to render visual participant card:', err);
      } finally {
        if (!isCancelled) {
          setRendering(false);
        }
      }
    };

    render();

    return () => {
      isCancelled = true;
    };
  }, [participant, template, event]);

  // Handle PNG Image Download
  const handleDownloadPng = async () => {
    setDownloading(true);
    try {
      await downloadSingleCardImage(participant, template, event, 'front');
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      alert(`Download failed: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  // Handle PDF Download
  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      await generateCombinedPdf([participant], template, event, {
        includeBack: false
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      alert(`PDF export failed: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  // Handle Direct Print
  const handlePrint = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${participantName} - ID Badge</title>
          <style>
            @page { size: auto; margin: 0mm; }
            body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; }
            img { max-width: 95vw; max-height: 95vh; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 backdrop-blur-sm p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="my-auto w-full max-w-xl rounded-3xl bg-zinc-950 border border-zinc-800 p-5 sm:p-6 text-white shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Visual Designer Layout
              </span>
              {template?.TemplateName && (
                <span className="text-xs text-zinc-400 font-medium">
                  • {template.TemplateName}
                </span>
              )}
            </div>
            <h2 className="text-lg font-black text-white mt-1">
              {participantName}
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              ID: {cardNumber} • Team: {teamName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 transition text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Canvas Display with Loading Indicator */}
        <div className="relative mx-auto flex items-center justify-center p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 min-h-[380px]">
          {rendering && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/70 backdrop-blur-xs rounded-2xl z-10">
              <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin mb-2" />
              <p className="text-xs text-zinc-400 font-medium">
                Rendering visual badge...
              </p>
            </div>
          )}

          <canvas
            ref={canvasRef}
            style={{
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              maxWidth: '100%',
              maxHeight: '520px',
              aspectRatio: `${dimensions.width} / ${dimensions.height}`
            }}
            className="rounded-xl shadow-2xl object-contain border border-zinc-700/50"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={downloading || rendering}
              onClick={handleDownloadPng}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-bold text-white transition cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download PNG</span>
            </button>

            <button
              type="button"
              disabled={downloading || rendering}
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-bold text-white transition cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-4 h-4 text-sky-400" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              disabled={downloading || rendering}
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-bold text-zinc-300 transition cursor-pointer disabled:opacity-50"
              title="Print Badge"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 hover:text-white transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
