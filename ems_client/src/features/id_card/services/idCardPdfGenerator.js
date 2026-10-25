import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { renderCardSide } from './idCardRenderer';

/**
 * Helper to parse template configs safely
 */
const parseConfig = (cfg) => {
  if (!cfg) return null;
  if (typeof cfg === 'object') return cfg;
  try {
    return JSON.parse(cfg);
  } catch (e) {
    return null;
  }
};

/**
 * Trigger browser file download from Blob
 */
const triggerBlobDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

export const CARD_SIZES = [
  {
    id: 'cr80',
    name: 'CR80 Standard',
    badge: 'PVC Pass',
    dimensions: '85.6 × 54 mm',
    widthMm: 53.98,
    heightMm: 85.60,
    portrait: { width: 380, height: 600 },
    landscape: { width: 600, height: 380 }
  },
  {
    id: 'a6',
    name: 'A6 Large Badge',
    badge: 'Conference / Festival',
    dimensions: '105 × 148 mm',
    widthMm: 105,
    heightMm: 148,
    portrait: { width: 440, height: 620 },
    landscape: { width: 620, height: 440 }
  },
  {
    id: 'a7',
    name: 'A7 Compact Pass',
    badge: 'Pocket Badge',
    dimensions: '74 × 105 mm',
    widthMm: 74,
    heightMm: 105,
    portrait: { width: 360, height: 510 },
    landscape: { width: 510, height: 360 }
  },
  {
    id: 'square',
    name: 'Square VIP Pass',
    badge: 'Convention Badge',
    dimensions: '100 × 100 mm',
    widthMm: 100,
    heightMm: 100,
    portrait: { width: 480, height: 480 },
    landscape: { width: 480, height: 480 }
  },
  {
    id: 'hanging',
    name: 'Tall Lanyard Pass',
    badge: 'Large Hanging Pass',
    dimensions: '90 × 140 mm',
    widthMm: 90,
    heightMm: 140,
    portrait: { width: 390, height: 610 },
    landscape: { width: 610, height: 390 }
  }
];

export const resolveCardDimensions = (template = {}, orientation = 'portrait') => {
  const frontConfig = parseConfig(template.FrontConfig) || {};
  const sizeId = template.cardSizeId || frontConfig.cardSizeId || (
    Number(template.CardWidth) > 90 || Number(template.CardHeight) > 130 ? 'a6' : 'cr80'
  );

  const matchedSize = CARD_SIZES.find(s => s.id === sizeId) || CARD_SIZES[0];

  let widthMm = Number(template.CardWidth);
  let heightMm = Number(template.CardHeight);

  // If width/height are not set or were left at default CR80 despite sizeId being a6/a7/square/hanging
  if (!widthMm || !heightMm || (sizeId !== 'cr80' && widthMm === 53.98)) {
    widthMm = orientation === 'portrait' ? matchedSize.widthMm : matchedSize.heightMm;
    heightMm = orientation === 'portrait' ? matchedSize.heightMm : matchedSize.widthMm;
  }

  const canvasWidth = orientation === 'portrait' ? matchedSize.portrait.width : matchedSize.landscape.width;
  const canvasHeight = orientation === 'portrait' ? matchedSize.portrait.height : matchedSize.landscape.height;

  return {
    sizeId,
    matchedSize,
    widthMm,
    heightMm,
    canvasWidth,
    canvasHeight
  };
};

/**
 * 1. Generate Combined Print-Ready PDF (Each card on its own page)
 */
export const generateCombinedPdf = async (
  participants = [],
  template = {},
  event = {},
  options = {},
  onProgress = () => {}
) => {
  if (!participants || participants.length === 0) {
    throw new Error('No eligible participants found to generate cards.');
  }

  const { includeBack = false, scale = 2.5 } = options;

  const orientation = template.Orientation || 'portrait';
  const { widthMm, heightMm, canvasWidth, canvasHeight } = resolveCardDimensions(template, orientation);

  const frontConfig = parseConfig(template.FrontConfig);
  const backConfig = parseConfig(template.BackConfig);

  if (!frontConfig) {
    throw new Error('Template front configuration is invalid or missing.');
  }

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: [widthMm, heightMm]
  });

  const offscreenCanvas = document.createElement('canvas');
  const total = participants.length;

  for (let i = 0; i < total; i++) {
    const participant = participants[i];
    onProgress({
      current: i + 1,
      total,
      percentage: Math.round(((i + 1) / total) * 100),
      currentName: participant.ParticipantName || `Participant ${i + 1}`
    });

    if (i > 0) {
      pdf.addPage([widthMm, heightMm], orientation);
    }

    // Render Front Side
    await renderCardSide(offscreenCanvas, frontConfig, participant, event, {
      scale,
      cardWidth: canvasWidth,
      cardHeight: canvasHeight
    });
    const frontImg = offscreenCanvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(frontImg, 'JPEG', 0, 0, widthMm, heightMm);

    // Render Back Side if requested
    if (includeBack && backConfig && Array.isArray(backConfig.elements) && backConfig.elements.length > 0) {
      pdf.addPage([widthMm, heightMm], orientation);
      await renderCardSide(offscreenCanvas, backConfig, participant, event, {
        scale,
        cardWidth: canvasWidth,
        cardHeight: canvasHeight
      });
      const backImg = offscreenCanvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(backImg, 'JPEG', 0, 0, widthMm, heightMm);
    }
  }

  const cleanEventName = (event.EventName || 'Event').replace(/[^a-zA-Z0-9_-]/g, '_');
  pdf.save(`${cleanEventName}_ID_Cards_Combined.pdf`);
  return true;
};

/**
 * 2. Generate Print-Sheet PDF (A4 Sheet layout with multiple cards per page & cutting guides)
 */
export const generateSheetPrintPdf = async (
  participants = [],
  template = {},
  event = {},
  options = {},
  onProgress = () => {}
) => {
  if (!participants || participants.length === 0) {
    throw new Error('No eligible participants found to generate print sheets.');
  }

  const orientation = template.Orientation || 'portrait';
  const { sizeId, widthMm: cardWidthMm, heightMm: cardHeightMm, canvasWidth, canvasHeight } = resolveCardDimensions(template, orientation);

  const frontConfig = parseConfig(template.FrontConfig);
  if (!frontConfig) throw new Error('Template configuration missing.');

  // A4 Dimensions: 210mm × 297mm
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const a4Width = 210;
  const a4Height = 297;

  // Grid calculation based on actual card size
  let cols, rows, gapX, gapY;

  if (sizeId === 'a6') {
    cols = orientation === 'portrait' ? 2 : 1;
    rows = orientation === 'portrait' ? 2 : 2;
    gapX = 0;
    gapY = 0;
  } else if (sizeId === 'a7') {
    cols = 2;
    rows = 2;
    gapX = 8;
    gapY = 8;
  } else if (sizeId === 'square') {
    cols = 2;
    rows = 2;
    gapX = 5;
    gapY = 5;
  } else if (sizeId === 'hanging') {
    cols = 2;
    rows = 2;
    gapX = 8;
    gapY = 8;
  } else {
    if (orientation === 'portrait') {
      cols = 3;
      rows = 3;
      gapX = 8;
      gapY = 8;
    } else {
      cols = 2;
      rows = 4;
      gapX = 8;
      gapY = 6;
    }
  }

  const totalGridW = cols * cardWidthMm + (cols - 1) * gapX;
  const totalGridH = rows * cardHeightMm + (rows - 1) * gapY;
  const marginX = Math.max(1, (a4Width - totalGridW) / 2);
  const marginY = Math.max(5, (a4Height - totalGridH) / 2);

  const cardsPerPage = cols * rows;
  const total = participants.length;
  const offscreenCanvas = document.createElement('canvas');

  for (let i = 0; i < total; i++) {
    const pageIndex = Math.floor(i / cardsPerPage);
    const slotIndex = i % cardsPerPage;

    if (i > 0 && slotIndex === 0) {
      pdf.addPage('a4', 'portrait');
    }

    // Draw header on new sheet
    if (slotIndex === 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text(
        `${event.EventName || 'Event'} • Official Participant ID Badges (Sheet ${pageIndex + 1}) • Cut along guide marks`,
        a4Width / 2,
        9,
        { align: 'center' }
      );
    }

    const col = slotIndex % cols;
    const row = Math.floor(slotIndex / cols);
    const x = marginX + col * (cardWidthMm + gapX);
    const y = marginY + row * (cardHeightMm + gapY);

    const participant = participants[i];
    onProgress({
      current: i + 1,
      total,
      percentage: Math.round(((i + 1) / total) * 100),
      currentName: participant.ParticipantName || `Participant ${i + 1}`
    });

    // Render card
    await renderCardSide(offscreenCanvas, frontConfig, participant, event, {
      scale: 2.2,
      cardWidth: canvasWidth,
      cardHeight: canvasHeight
    });
    const cardImg = offscreenCanvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(cardImg, 'JPEG', x, y, cardWidthMm, cardHeightMm);

    // Draw crop marks / cutting lines around the card slot
    pdf.setDrawColor(180, 180, 180);
    pdf.setLineWidth(0.2);
    const markLen = 3;
    // Top-left
    pdf.line(x - markLen, y, x, y);
    pdf.line(x, y - markLen, x, y);
    // Top-right
    pdf.line(x + cardWidthMm, y, x + cardWidthMm + markLen, y);
    pdf.line(x + cardWidthMm, y - markLen, x + cardWidthMm, y);
    // Bottom-left
    pdf.line(x - markLen, y + cardHeightMm, x, y + cardHeightMm);
    pdf.line(x, y + cardHeightMm, x, y + cardHeightMm + markLen);
    // Bottom-right
    pdf.line(x + cardWidthMm, y + cardHeightMm, x + cardWidthMm + markLen, y + cardHeightMm);
    pdf.line(x + cardWidthMm, y + cardHeightMm, x + cardWidthMm, y + cardHeightMm + markLen);
  }

  const cleanEventName = (event.EventName || 'Event').replace(/[^a-zA-Z0-9_-]/g, '_');
  pdf.save(`${cleanEventName}_ID_Cards_Print_Sheets.pdf`);
  return true;
};

/**
 * 3. Generate ZIP Archive of all participant cards (High-Res PNGs)
 */
export const generateZipArchive = async (
  participants = [],
  template = {},
  event = {},
  options = {},
  onProgress = () => {}
) => {
  if (!participants || participants.length === 0) {
    throw new Error('No eligible participants found for ZIP export.');
  }

  const { includeBack = false, scale = 2.5 } = options;
  const orientation = template.Orientation || 'portrait';
  const { canvasWidth, canvasHeight } = resolveCardDimensions(template, orientation);
  const frontConfig = parseConfig(template.FrontConfig);
  const backConfig = parseConfig(template.BackConfig);

  const zip = new JSZip();
  const folder = zip.folder('ID_Cards');

  const offscreenCanvas = document.createElement('canvas');
  const total = participants.length;

  for (let i = 0; i < total; i++) {
    const participant = participants[i];
    const safeName = `${participant.IdCardNumber || `U${participant.UserId}`}_${(participant.ParticipantName || 'Member').replace(/[^a-zA-Z0-9]/g, '_')}`;

    onProgress({
      current: i + 1,
      total,
      percentage: Math.round(((i + 1) / total) * 100),
      currentName: participant.ParticipantName || `Participant ${i + 1}`
    });

    // Render Front Side
    await renderCardSide(offscreenCanvas, frontConfig, participant, event, {
      scale,
      cardWidth: canvasWidth,
      cardHeight: canvasHeight
    });

    const frontBlob = await new Promise((resolve) => offscreenCanvas.toBlob(resolve, 'image/png'));
    if (frontBlob) {
      folder.file(`${safeName}_Front.png`, frontBlob);
    }

    // Render Back Side
    if (includeBack && backConfig && Array.isArray(backConfig.elements) && backConfig.elements.length > 0) {
      await renderCardSide(offscreenCanvas, backConfig, participant, event, {
        scale,
        cardWidth: canvasWidth,
        cardHeight: canvasHeight
      });
      const backBlob = await new Promise((resolve) => offscreenCanvas.toBlob(resolve, 'image/png'));
      if (backBlob) {
        folder.file(`${safeName}_Back.png`, backBlob);
      }
    }
  }

  const content = await zip.generateAsync({ type: 'blob' }, (metadata) => {
    onProgress({
      current: total,
      total,
      percentage: Math.round(metadata.percent),
      currentName: 'Compressing archive...'
    });
  });

  const cleanEventName = (event.EventName || 'Event').replace(/[^a-zA-Z0-9_-]/g, '_');
  triggerBlobDownload(content, `${cleanEventName}_ID_Cards_Archive.zip`);
  return true;
};

/**
 * 4. Download single participant card as PNG
 */
export const downloadSingleCardImage = async (
  participant,
  template,
  event,
  side = 'front'
) => {
  const orientation = template.Orientation || 'portrait';
  const { canvasWidth, canvasHeight } = resolveCardDimensions(template, orientation);
  const config = side === 'back' ? parseConfig(template.BackConfig) : parseConfig(template.FrontConfig);
  if (!config) return;

  const canvas = document.createElement('canvas');
  await renderCardSide(canvas, config, participant, event, {
    scale: 3,
    cardWidth: canvasWidth,
    cardHeight: canvasHeight
  });

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (blob) {
    const safeName = `${participant.IdCardNumber || `U${participant.UserId}`}_${side.toUpperCase()}`;
    triggerBlobDownload(blob, `${safeName}.png`);
  }
};
