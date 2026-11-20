import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

/**
 * Sanitizes any CSS color string by ensuring pure sRGB / HEX / standard RGB formats.
 */
export function sanitizeCssColorString(str) {
  if (!str || typeof str !== 'string') return str || '#ffffff';
  if (!str.includes('oklab') && !str.includes('oklch') && !str.includes('color(')) {
    return str;
  }
  // Fallback for any legacy oklab strings
  return '#10b981';
}

/**
 * Helper to draw a rounded rectangle on a 2D canvas context
 */
function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.max(0, Math.min(radius || 0, width / 2, height / 2));
  if (r === 0) {
    ctx.rect(x, y, width, height);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Helper to word-wrap multiline text cleanly on canvas
 */
function wrapAndDrawText(ctx, text, x, y, maxWidth, lineHeightPx, textAlign = 'center') {
  if (!text) return;
  const words = String(text).split(' ');
  let line = '';
  const lines = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + (line ? ' ' : '') + words[n];
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      lines.push(line);
      line = words[n];
    } else {
      line = testLine;
    }
  }
  if (line) lines.push(line);

  // Draw lines
  let curY = y;
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, curY);
    curY += lineHeightPx;
  }
}

/**
 * Replaces dynamic placeholders in text
 */
function resolvePlaceholders(rawText, memberData = {}) {
  if (!rawText) return '';
  let str = String(rawText);
  const name = memberData.recipientName || memberData.name || 'Participant';
  const role = memberData.role || 'Member';
  const team = memberData.teamName || 'Team';
  const college = memberData.college || 'AITAM College, Tekkali';
  const event = memberData.eventName || 'Avishkaar 4';
  const track = memberData.track || 'Virtual';
  const eventDate = memberData.eventDate || 'Nov 24 - 26, 2026';
  const certId = memberData.certificateId || memberData.certId || 'CERT-VIRT-22-01';
  const issueDate = memberData.issueDate || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  str = str.replace(/\{\{recipient_name\}\}/gi, name);
  str = str.replace(/\{\{role\}\}/gi, role);
  str = str.replace(/\{\{team_name\}\}/gi, team);
  str = str.replace(/\{\{team_and_role\}\}/gi, `of Team ${team} (${role})`);
  str = str.replace(/\{\{college_name\}\}/gi, college);
  str = str.replace(/\{\{event_name\}\}/gi, event);
  str = str.replace(/\{\{track\}\}/gi, track);
  str = str.replace(/\{\{event_date\}\}/gi, eventDate);
  str = str.replace(/\{\{venue_location\}\}/gi, college);
  str = str.replace(/\{\{certificate_id\}\}/gi, certId);
  str = str.replace(/\{\{issue_date\}\}/gi, issueDate);
  str = str.replace(/\{\{signatory_1_name\}\}/gi, 'Dr. Ch. Ramesh');
  str = str.replace(/\{\{signatory_1_title\}\}/gi, 'Convener & HOD, CSE');
  str = str.replace(/\{\{signatory_2_name\}\}/gi, 'Dr. A.S. Srinivasa Rao');
  str = str.replace(/\{\{signatory_2_title\}\}/gi, 'Principal, AITAM');
  return str;
}

/**
 * Loads an image from a URL or data URL
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Pure 2D Canvas vector certificate renderer
 * Renders the exact template elements at 2x or 3x scale without ANY html2canvas CSS parsing bugs.
 */
export async function renderCertificateToDirectCanvas(templateConfig = {}, memberData = {}, scale = 2) {
  const canvasWidth = templateConfig.CanvasWidth || (templateConfig.orientation === 'portrait' ? 707 : 1000);
  const canvasHeight = templateConfig.CanvasHeight || (templateConfig.orientation === 'portrait' ? 1000 : 707);
  const bgColor = templateConfig.BackgroundColor || '#021814';
  const borderColor = templateConfig.BorderColor || '#10b981';
  const elements = templateConfig.Elements || [];

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(canvasWidth * scale);
  canvas.height = Math.round(canvasHeight * scale);
  const ctx = canvas.getContext('2d', { alpha: false });

  // 1. Fill Canvas Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Draw outer border if defined
  if (borderColor) {
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = Math.max(1, Math.round(2 * scale));
    drawRoundedRect(ctx, 4 * scale, 4 * scale, (canvasWidth - 8) * scale, (canvasHeight - 8) * scale, 14 * scale);
    ctx.stroke();
  }

  // 3. Sort elements by zIndex
  const sortedElements = [...elements].sort((a, b) => (a.zIndex || 1) - (b.zIndex || 1));

  // 4. Render each element
  for (const el of sortedElements) {
    if (el.hidden) continue;

    const elX = Math.round(el.x * scale);
    const elY = Math.round(el.y * scale);
    const elW = Math.round(el.width * scale);
    const elH = Math.round((el.height || 20) * scale);

    // ── SHAPE ──
    if (el.type === 'shape') {
      const radius = Math.round((el.borderRadius || 0) * scale);
      ctx.save();

      // Fill
      if (el.fill && el.fill !== 'transparent') {
        ctx.fillStyle = el.fill;
        drawRoundedRect(ctx, elX, elY, elW, elH, radius);
        ctx.fill();
      }

      // Stroke
      if (el.stroke && el.stroke !== 'transparent' && el.strokeWidth > 0) {
        ctx.strokeStyle = el.stroke;
        ctx.lineWidth = Math.round(el.strokeWidth * scale);
        drawRoundedRect(ctx, elX, elY, elW, elH, radius);
        ctx.stroke();
      }

      ctx.restore();
    }

    // ── TEXT ──
    else if (el.type === 'text') {
      const raw = el.text || '';
      const resolved = resolvePlaceholders(raw, memberData);
      const fontSizePx = Math.round((el.fontSize || 14) * scale);
      const fontWeight = el.fontWeight || 'normal';
      const fontFamily = el.fontFamily || 'Inter, sans-serif';
      const color = el.color || '#ffffff';
      const textAlign = el.textAlign || 'center';
      const letterSpacingPx = el.letterSpacing ? Math.round(el.letterSpacing * scale) : 0;
      const lineHeightMultiplier = el.lineHeight || 1.35;
      const lineHeightPx = Math.round(fontSizePx * lineHeightMultiplier);

      ctx.save();
      ctx.font = `${fontWeight} ${fontSizePx}px ${fontFamily}`;
      ctx.fillStyle = color;
      ctx.textAlign = textAlign;
      ctx.textBaseline = 'top';

      if ('letterSpacing' in ctx && letterSpacingPx) {
        try {
          ctx.letterSpacing = `${letterSpacingPx}px`;
        } catch {
          // Ignore if browser unsupported
        }
      }

      let drawX = elX;
      if (textAlign === 'center') {
        drawX = elX + Math.round(elW / 2);
      } else if (textAlign === 'right') {
        drawX = elX + elW;
      }

      // Check if long text paragraph (e.g. citation)
      const measured = ctx.measureText(resolved);
      if (measured.width > elW && resolved.length > 50) {
        wrapAndDrawText(ctx, resolved, drawX, elY, elW, lineHeightPx, textAlign);
      } else {
        ctx.fillText(resolved, drawX, elY);
      }

      ctx.restore();
    }

    // ── QR CODE ──
    else if (el.type === 'qr') {
      const certId = memberData.certificateId || memberData.certId || 'CERT-VIRT-22-01';
      const memName = memberData.recipientName || memberData.name || 'Participant';
      const tmName = memberData.teamName || 'Team';
      const evName = memberData.eventName || 'Avishkaar 4';
      const qrVal = el.qrValue || `https://ems.aitamsac.in/verify/certificate?id=${certId}&member=${encodeURIComponent(memName)}&team=${encodeURIComponent(tmName)}&event=${encodeURIComponent(evName)}`;

      try {
        const qrDataUrl = await QRCode.toDataURL(qrVal, {
          margin: 1,
          color: {
            dark: el.color || '#000000',
            light: el.bgColor || '#ffffff'
          },
          width: elW
        });

        const qrImg = await loadImage(qrDataUrl);

        ctx.save();
        // Background card behind QR
        const qrBg = el.bgColor || '#ffffff';
        ctx.fillStyle = qrBg;
        const qrRadius = Math.round((el.borderRadius || 6) * scale);
        drawRoundedRect(ctx, elX, elY, elW, elH, qrRadius);
        ctx.fill();

        // Draw QR
        const padding = Math.round(4 * scale);
        ctx.drawImage(qrImg, elX + padding, elY + padding, elW - (padding * 2), elH - (padding * 2));
        ctx.restore();
      } catch (qrErr) {
        console.warn('QR code generation warning:', qrErr);
      }
    }

    // ── IMAGE / LOGO ──
    else if (el.type === 'image' && el.src) {
      try {
        const imgObj = await loadImage(el.src);
        ctx.save();
        if (el.opacity !== undefined && el.opacity < 1) {
          ctx.globalAlpha = el.opacity;
        }
        if (el.borderRadius) {
          drawRoundedRect(ctx, elX, elY, elW, elH, Math.round(el.borderRadius * scale));
          ctx.clip();
        }
        ctx.drawImage(imgObj, elX, elY, elW, elH);
        ctx.restore();
      } catch (imgErr) {
        console.warn('Certificate image load warning:', imgErr);
      }
    }
  }

  return canvas;
}

/**
 * Extracts certificate template configuration and member data from a DOM element
 */
function extractConfigFromDom(domElement) {
  if (!domElement) return null;

  // 1. Direct object attachment
  if (domElement.__templateConfig) {
    return domElement.__templateConfig;
  }

  // 2. Window-level active config cache
  if (typeof window !== 'undefined' && window.__ACTIVE_CERT_CONFIG) {
    return window.__ACTIVE_CERT_CONFIG;
  }

  // 3. Fallback extraction from computed styles and children
  const width = domElement.offsetWidth || parseInt(domElement.style.width, 10) || 1000;
  const height = domElement.offsetHeight || parseInt(domElement.style.height, 10) || 707;
  const computed = window.getComputedStyle(domElement);
  const bgColor = domElement.style.backgroundColor || computed.backgroundColor || '#021814';
  const borderColor = domElement.style.borderColor || computed.borderColor || '#10b981';

  return {
    CanvasWidth: width,
    CanvasHeight: height,
    BackgroundColor: bgColor,
    BorderColor: borderColor,
    Elements: []
  };
}

/**
 * Generates and downloads a single high-resolution A4 certificate PDF
 * Fully replaces html2canvas with pure HTML5 Canvas Vector rendering.
 * NEVER throws 'Attempting to parse an unsupported color function oklab'.
 *
 * @param {HTMLElement|Object} target - DOM element or { templateConfig, memberData } object
 * @param {string} fileName - Destination file name (e.g. "Certificate_Lakshmi_Sai.pdf")
 * @param {Object} options - Optional overrides
 */
export async function downloadCertificatePdf(target, fileName = 'Participation-Certificate.pdf', options = {}) {
  if (!target) {
    throw new Error('Certificate target is required');
  }

  let templateConfig = null;
  let memberData = options.memberData || {};

  // Check if target is a configuration object
  if (target.templateConfig || target.Elements || target.CanvasWidth) {
    templateConfig = target.templateConfig || target;
    memberData = target.memberData || memberData;
  } else if (target instanceof HTMLElement || (typeof target === 'object' && target.nodeType === 1)) {
    // Extract from DOM
    templateConfig = extractConfigFromDom(target);
    if (target.__memberData) {
      memberData = target.__memberData;
    }
  }

  // If templateConfig is still incomplete, fallback to default AITAM Emerald Prestige template
  if (!templateConfig || !templateConfig.Elements || templateConfig.Elements.length === 0) {
    templateConfig = {
      TemplateName: 'AITAM Official Prestige',
      Orientation: 'landscape',
      CanvasWidth: 1000,
      CanvasHeight: 707,
      BackgroundColor: templateConfig?.BackgroundColor || '#021814',
      BorderColor: templateConfig?.BorderColor || '#10b981',
      Elements: [
        { id: 'outer-frame', type: 'shape', x: 24, y: 24, width: 952, height: 659, fill: '#021814', stroke: '#10b981', strokeWidth: 3, borderRadius: 16, zIndex: 1 },
        { id: 'inner-frame', type: 'shape', x: 38, y: 38, width: 924, height: 631, fill: 'transparent', stroke: 'rgba(16, 185, 129, 0.4)', strokeWidth: 1.5, borderRadius: 12, zIndex: 1 },
        { id: 'corner-tl', type: 'shape', x: 32, y: 32, width: 20, height: 20, fill: '#10b981', stroke: 'transparent', strokeWidth: 0, borderRadius: 2, zIndex: 2 },
        { id: 'corner-tr', type: 'shape', x: 948, y: 32, width: 20, height: 20, fill: '#10b981', stroke: 'transparent', strokeWidth: 0, borderRadius: 2, zIndex: 2 },
        { id: 'corner-bl', type: 'shape', x: 32, y: 655, width: 20, height: 20, fill: '#10b981', stroke: 'transparent', strokeWidth: 0, borderRadius: 2, zIndex: 2 },
        { id: 'corner-br', type: 'shape', x: 948, y: 655, width: 20, height: 20, fill: '#10b981', stroke: 'transparent', strokeWidth: 0, borderRadius: 2, zIndex: 2 },
        { id: 'inst-name', type: 'text', text: 'ADITYA INSTITUTE OF TECHNOLOGY AND MANAGEMENT (AITAM)', x: 80, y: 60, width: 840, fontSize: 14, fontWeight: '800', fontFamily: 'Inter, sans-serif', textAlign: 'center', color: '#e2e8f0', letterSpacing: 2.5, zIndex: 3 },
        { id: 'inst-sub', type: 'text', text: 'An Autonomous Institution • Approved by AICTE • Accredited by NAAC A+', x: 80, y: 86, width: 840, fontSize: 9.5, fontWeight: '600', fontFamily: 'Inter, sans-serif', textAlign: 'center', color: '#94a3b8', letterSpacing: 1.5, zIndex: 3 },
        { id: 'cert-title', type: 'text', text: 'CERTIFICATE OF PARTICIPATION', x: 80, y: 122, width: 840, fontSize: 28, fontWeight: '900', fontFamily: 'Georgia, serif', textAlign: 'center', color: '#10b981', letterSpacing: 4, zIndex: 3 },
        { id: 'cert-sub', type: 'text', text: 'THIS IS PROUDLY PRESENTED TO', x: 80, y: 170, width: 840, fontSize: 10.5, fontWeight: '700', fontFamily: 'Inter, sans-serif', textAlign: 'center', color: '#94a3b8', letterSpacing: 3, zIndex: 3 },
        { id: 'recipient-name', type: 'text', text: '{{recipient_name}}', x: 80, y: 200, width: 840, fontSize: 32, fontWeight: '900', fontFamily: 'Georgia, serif', textAlign: 'center', color: '#ffffff', letterSpacing: 1.5, zIndex: 4 },
        { id: 'name-underline', type: 'shape', x: 320, y: 255, width: 360, height: 2, fill: '#10b981', stroke: '#10b981', strokeWidth: 2, zIndex: 3 },
        { id: 'team-and-role', type: 'text', text: 'of Team {{team_name}} ({{role}})', x: 80, y: 270, width: 840, fontSize: 14, fontWeight: '700', fontFamily: 'Inter, sans-serif', textAlign: 'center', color: '#34d399', letterSpacing: 1, zIndex: 3 },
        { id: 'college-name', type: 'text', text: 'representing {{college_name}}', x: 80, y: 298, width: 840, fontSize: 12, fontWeight: '500', fontFamily: 'Inter, sans-serif', textAlign: 'center', color: '#cbd5e1', letterSpacing: 0.5, zIndex: 3 },
        { id: 'citation', type: 'text', text: 'for exemplary participation and successful jury evaluation in {{event_name}} ({{track}} Hackathon Track), organized on {{event_date}} at {{venue_location}}. The candidate demonstrated notable software innovation, technical diligence, and team excellence.', x: 120, y: 340, width: 760, fontSize: 11, fontWeight: '400', fontFamily: 'Inter, sans-serif', textAlign: 'center', color: '#94a3b8', lineHeight: 1.6, zIndex: 3 },
        { id: 'event-date', type: 'text', text: '{{event_date}}', x: 80, y: 415, width: 840, fontSize: 14, fontWeight: '700', fontFamily: 'Inter, sans-serif', textAlign: 'center', color: '#f8fafc', letterSpacing: 1, zIndex: 3 },
        { id: 'sig1-line', type: 'shape', x: 160, y: 535, width: 220, height: 1.5, fill: '#64748b', stroke: '#64748b', strokeWidth: 1.5, zIndex: 3 },
        { id: 'sig1-name', type: 'text', text: 'Dr. Ch. Ramesh', x: 160, y: 545, width: 220, fontSize: 11, fontWeight: '700', fontFamily: 'Inter, sans-serif', textAlign: 'center', color: '#ffffff', zIndex: 3 },
        { id: 'sig1-title', type: 'text', text: 'Convener & HOD, CSE', x: 160, y: 562, width: 220, fontSize: 9.5, fontWeight: '500', fontFamily: 'Inter, sans-serif', textAlign: 'center', color: '#94a3b8', zIndex: 3 },
        { id: 'qr-code', type: 'qr', x: 460, y: 510, width: 80, height: 80, zIndex: 4, color: '#000000', bgColor: '#ffffff' },
        { id: 'sig2-line', type: 'shape', x: 620, y: 535, width: 220, height: 1.5, fill: '#64748b', stroke: '#64748b', strokeWidth: 1.5, zIndex: 3 },
        { id: 'sig2-name', type: 'text', text: 'Dr. A.S. Srinivasa Rao', x: 620, y: 545, width: 220, fontSize: 11, fontWeight: '700', fontFamily: 'Inter, sans-serif', textAlign: 'center', color: '#ffffff', zIndex: 3 },
        { id: 'sig2-title', type: 'text', text: 'Principal, AITAM', x: 620, y: 562, width: 220, fontSize: 9.5, fontWeight: '500', fontFamily: 'Inter, sans-serif', textAlign: 'center', color: '#94a3b8', zIndex: 3 },
        { id: 'cert-serial', type: 'text', text: 'Certificate ID: {{certificate_id}}', x: 80, y: 625, width: 300, fontSize: 9, fontWeight: '600', fontFamily: 'Courier Prime, monospace', textAlign: 'left', color: '#eab308', zIndex: 3 },
        { id: 'cert-issued', type: 'text', text: 'Issued: {{issue_date}}', x: 620, y: 625, width: 300, fontSize: 9, fontWeight: '500', fontFamily: 'Inter, sans-serif', textAlign: 'right', color: '#94a3b8', zIndex: 3 }
      ]
    };
  }

  // Format clean file name
  const cleanFileName = (fileName || 'Participation-Certificate.pdf')
    .replace(/[<>:"/\\|?*]/g, '_')
    .trim();
  const finalFileName = cleanFileName.endsWith('.pdf') ? cleanFileName : `${cleanFileName}.pdf`;

  // Render to 2x high resolution Canvas
  const scale = options.scale || 2;
  const canvas = await renderCertificateToDirectCanvas(templateConfig, memberData, scale);
  const imgData = canvas.toDataURL('image/png', 1.0);

  // Initialize jsPDF A4 standard
  const isLandscape = (templateConfig.CanvasWidth || 1000) >= (templateConfig.CanvasHeight || 707);
  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
  pdf.save(finalFileName);
  return true;
}

/**
 * Generates and downloads all member certificates sequentially
 * @param {Array<{ domElement?: HTMLElement, templateConfig?: Object, memberData?: Object, recipientName: string, certificateId: string }>} items
 * @param {string} teamName
 */
export async function downloadAllMemberCertificates(items, teamName = 'Team') {
  if (!Array.isArray(items) || items.length === 0) return;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const safeName = (item.recipientName || item.memberName || `Member_${i + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Certificate_${safeName}_${item.certificateId || item.certId || (i + 1)}.pdf`;

    await downloadCertificatePdf(
      item.templateConfig ? { templateConfig: item.templateConfig, memberData: item } : (item.domElement || item),
      filename,
      { memberData: item }
    );

    // Stagger downloads to prevent browser multi-download blockage
    if (i < items.length - 1) {
      await new Promise((r) => setTimeout(r, 400));
    }
  }
}
