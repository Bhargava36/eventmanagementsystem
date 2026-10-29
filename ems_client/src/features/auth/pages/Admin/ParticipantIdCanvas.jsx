import React, { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from '@/lib/api';
import { QRCodeSVG } from "qrcode.react";
import { Printer, Download, FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import { renderCardSide } from "@/features/id_card/services/idCardRenderer";
import { CARD_SIZES } from "@/features/id_card/components/IdCardDesigner";

const getValue = (obj, ...keys) => {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return "";
};

const loadImage = (src) =>
  new Promise((resolve) => {
    if (!src) return resolve(null);

    let resolvedSrc = src;
    if (typeof resolvedSrc === 'string' && resolvedSrc.startsWith('/uploads')) {
      resolvedSrc = `${API_BASE_URL}${resolvedSrc}`;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => {
      // Do NOT load without crossOrigin as that taints canvas and blocks PDF download!
      resolve(null);
    };

    image.src = resolvedSrc;
    setTimeout(() => resolve(null), 7000);
  });

const hexToRgb = (hex, fallback = { r: 16, g: 185, b: 129 }) => {
  if (!hex || typeof hex !== 'string') return fallback;
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) clean = clean.split('').map((c) => c + c).join('');
  if (clean.length !== 6) return fallback;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return isNaN(r) || isNaN(g) || isNaN(b) ? fallback : { r, g, b };
};

// ISO 216 Standard A6 Dimensions: 105mm × 148mm
// Base design units: 620 × 874 (ratio 105:148)
// Rendered at 2x scale for 300 DPI print quality: 1240 × 1748 px
const BASE_W = 620;
const BASE_H = 874;
const RENDER_SCALE = 2;

export default function ParticipantIdCanvas({
  participant,
  event,
  eventId: propEventId,
  cardNumber,
}) {
  const canvasRef = useRef(null);
  const qrRef = useRef(null);
  const [usingCustomTemplate, setUsingCustomTemplate] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 380, height: 600 });

  const eventId =
    propEventId ||
    event?.EventId ||
    participant?.EventId ||
    (event?.Id && event.Id !== (participant?.UserId || participant?.Id) ? event.Id : "") ||
    "";

  const name =
    getValue(
      participant,
      "ParticipantName",
      "UserName",
      "Name",
      "name",
      "FullName"
    ) || "Participant";

  const college =
    getValue(participant, "College", "college", "CollegeName") || "AITAM COLLEGE";

  const team =
    getValue(participant, "TeamName", "teamName") || "MASONS";

  const userId = getValue(
    participant,
    "UserId",
    "userId",
    "Id",
    "id"
  );

  const eventName =
    getValue(event, "EventName", "eventName", "Name", "name") ||
    "AVISHKAAR";

  // Event Theme Colors dynamically pulled from event settings
  const primaryColor =
    getValue(event, "PrimaryColor", "ThemeColor", "themeColor") || "#00E5FF";

  const secondaryColor =
    getValue(event, "SecondaryColor", "AccentColor", "accentColor") || "#FFFFFF";

  const { r, g, b } = hexToRgb(primaryColor, { r: 0, g: 229, b: 255 });

  const photo = getValue(
    participant,
    "Photo",
    "photo",
    "PhotoURL",
    "photoUrl",
    "ProfileImage",
    "profileImage",
    "UserPhoto",
    "userPhoto"
  );

  // Custom ID Card Background uploaded by admin in Event Settings
  const customBackgroundUrl =
    getValue(event, "IdCardBackground", "idCardBackground") ||
    getValue(participant, "IdCardBackground", "idCardBackground");

  const verificationUrl = (() => {
    const params = new URLSearchParams({
      eventId: String(eventId ?? ""),
      userId: String(userId ?? ""),
      idCardNumber: String(cardNumber ?? ""),
    });

    return `${window.location.origin}/verify-id?${params.toString()}`;
  })();

  useEffect(() => {
    let cancelled = false;

    const drawBuiltInCard = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Exact Standard A6 Sheet size (105mm × 148mm @ 300 DPI)
      canvas.width = BASE_W * RENDER_SCALE;   // 1240 px
      canvas.height = BASE_H * RENDER_SCALE; // 1748 px

      ctx.save();
      ctx.scale(RENDER_SCALE, RENDER_SCALE);

      const rounded = (x, y, width, height, radius, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, radius);
        ctx.fill();
      };

      const strokeRounded = (x, y, width, height, radius, strokeColor, lineWidth = 1) => {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, radius);
        ctx.stroke();
      };

      const drawCenteredText = (val, centerY, font, color, maxW = BASE_W - 40) => {
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        let str = String(val || "");
        while (ctx.measureText(str).width > maxW && str.length > 4) {
          str = str.slice(0, -4) + "...";
        }
        ctx.fillText(str, BASE_W / 2, centerY);
      };

      const [photoImage, customBgImage] = await Promise.all([
        loadImage(photo),
        loadImage(customBackgroundUrl),
      ]);

      if (cancelled) return;

      // 1. BACKGROUND: Use Admin Custom Uploaded Background if present, else Cyber Space Grid
      if (customBgImage) {
        // Draw admin uploaded background
        ctx.drawImage(customBgImage, 0, 0, BASE_W, BASE_H);
      } else {
        // Sleek Cyber Pitch-Black Space Background
        const bgGrad = ctx.createLinearGradient(0, 0, BASE_W, BASE_H);
        bgGrad.addColorStop(0, "#000000");
        bgGrad.addColorStop(0.35, `rgba(${Math.round(r * 0.04)}, ${Math.round(g * 0.04)}, ${Math.round(b * 0.07)}, 1)`);
        bgGrad.addColorStop(0.7, "#02050E");
        bgGrad.addColorStop(1, "#000000");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, BASE_W, BASE_H);

        // Cyber Matrix Dot/Grid Pattern
        ctx.save();
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.06)`;
        for (let x = 20; x < BASE_W; x += 30) {
          for (let y = 20; y < BASE_H; y += 30) {
            ctx.beginPath();
            ctx.arc(x, y, 0.9, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();

        // Outer Glowing A6 Frame in Event Theme Color
        ctx.save();
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.5)`;
        ctx.shadowBlur = 16;
        strokeRounded(12, 12, BASE_W - 24, BASE_H - 24, 20, `rgba(${r}, ${g}, ${b}, 0.45)`, 1.5);
        ctx.restore();
      }

      // 2. TOP HEADER
      // Top Right: AITAM wordmark and crest emblem (matching Image 2)
      ctx.textAlign = "right";
      ctx.font = "bold 26px 'Georgia', serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText("aitam", BASE_W - 80, 56);

      ctx.font = "bold 7.5px Arial";
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.fillText("ADITYA INSTITUTE OF", BASE_W - 44, 72);
      ctx.fillText("TECHNOLOGY AND MANAGEMENT", BASE_W - 44, 82);
      ctx.font = "italic 7px Arial";
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.fillText("An Autonomous Institution", BASE_W - 44, 92);

      // Crest emblem box (Red/Gold)
      rounded(BASE_W - 74, 34, 30, 36, 5, "rgba(220, 38, 38, 0.25)");
      strokeRounded(BASE_W - 74, 34, 30, 36, 5, "#DC2626", 1.2);
      ctx.fillStyle = "#FBBF24";
      ctx.textAlign = "center";
      ctx.font = "bold 15px Arial";
      ctx.fillText("🏛", BASE_W - 59, 58);

      // Top Center/Left: Event Name and Season in Event Theme Color
      ctx.save();
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
      ctx.shadowBlur = 14;
      ctx.textAlign = "start";
      ctx.font = "900 32px 'Arial Black', Arial";
      ctx.fillStyle = primaryColor;
      ctx.fillText(eventName.toUpperCase(), 44, 62);
      ctx.restore();

      ctx.textAlign = "start";
      ctx.font = "bold 12px Arial";
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.fillText("SEASON 4", 44, 84);

      // 3. CENTER PARTICIPANT PHOTO
      // Portrait rectangular box with rounded corners and neon glow in theme color
      const photoW = 280;
      const photoH = 300;
      const photoX = (BASE_W - photoW) / 2;
      const photoY = 120;
      const photoRadius = 18;

      ctx.save();
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.85)`;
      ctx.shadowBlur = 18;
      strokeRounded(photoX, photoY, photoW, photoH, photoRadius, primaryColor, 3);
      ctx.restore();

      // Clip photo inside
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(photoX, photoY, photoW, photoH, photoRadius);
      ctx.clip();

      if (photoImage) {
        // Draw photo with cover crop
        const imgRatio = photoImage.width / photoImage.height;
        const boxRatio = photoW / photoH;
        let sWidth = photoImage.width;
        let sHeight = photoImage.height;
        let sX = 0;
        let sY = 0;

        if (imgRatio > boxRatio) {
          sWidth = photoImage.height * boxRatio;
          sX = (photoImage.width - sWidth) / 2;
        } else {
          sHeight = photoImage.width / boxRatio;
          sY = (photoImage.height - sHeight) / 2;
        }

        ctx.drawImage(photoImage, sX, sY, sWidth, sHeight, photoX, photoY, photoW, photoH);
      } else {
        // Futuristic fallback box with initials
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.15)`;
        ctx.fillRect(photoX, photoY, photoW, photoH);

        const initials = name
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part.charAt(0))
          .join("")
          .toUpperCase() || "P";

        ctx.textAlign = "center";
        ctx.font = "900 64px Arial";
        ctx.fillStyle = primaryColor;
        ctx.fillText(initials, photoX + photoW / 2, photoY + photoH / 2 + 22);
      }
      ctx.restore();

      // Inner border refinement
      strokeRounded(photoX, photoY, photoW, photoH, photoRadius, `rgba(${r}, ${g}, ${b}, 0.4)`, 1);

      // 4. PARTICIPANT IDENTITY SECTION (Centered below photo - Room No removed as requested)
      // Name (Bold futuristic white uppercase)
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
      ctx.shadowBlur = 8;
      drawCenteredText(name.toUpperCase(), 468, "900 27px 'Arial Black', Arial", "#FFFFFF", BASE_W - 60);
      ctx.restore();

      // College / Institution in Event Theme Color
      drawCenteredText(college.toUpperCase(), 498, "bold 15px Arial", primaryColor, BASE_W - 60);

      // Team Name in light silver / white
      drawCenteredText(team.toUpperCase(), 526, "bold 14px Arial", "rgba(255, 255, 255, 0.85)", BASE_W - 80);

      // 5. SCANNABLE QR CODE (Centered)
      const qrSize = 110;
      const qrY = 560;
      const qrX = (BASE_W - qrSize) / 2;

      // Clean white rounded box
      rounded(qrX, qrY, qrSize, qrSize, 12, "#FFFFFF");
      ctx.save();
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.7)`;
      ctx.shadowBlur = 8;
      strokeRounded(qrX, qrY, qrSize, qrSize, 12, primaryColor, 2);
      ctx.restore();

      const svg = qrRef.current?.querySelector("svg");
      if (svg) {
        const serialized = new XMLSerializer().serializeToString(svg);
        const qrImg = await loadImage(
          `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`
        );
        if (qrImg) {
          ctx.drawImage(qrImg, qrX + 6, qrY + 6, qrSize - 12, qrSize - 12);
        }
      }

      // 6. BOTTOM CYBER WIREFRAME GLOBE GRAPHIC (rendered if no custom background overrides it)
      if (!customBgImage) {
        ctx.save();
        const globeCenterX = BASE_W / 2;
        const globeCenterY = BASE_H + 180;
        const globeRadius = 300;

        // Radial ambient neon glow in event theme color behind the globe
        const glowGrad = ctx.createRadialGradient(
          globeCenterX,
          globeCenterY - 60,
          30,
          globeCenterX,
          globeCenterY - 60,
          280
        );
        glowGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.45)`);
        glowGrad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.12)`);
        glowGrad.addColorStop(1, "transparent");
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(globeCenterX, globeCenterY - 60, 280, 0, Math.PI * 2);
        ctx.fill();

        // Horizon glowing digital arc
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 3;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(globeCenterX, globeCenterY, globeRadius, Math.PI * 1.18, Math.PI * 1.82);
        ctx.stroke();

        // Dotted / wireframe perspective latitude & longitude grid matrix lines
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.35)`;
        ctx.lineWidth = 1;
        for (let angle = 1.25; angle <= 1.75; angle += 0.08) {
          ctx.beginPath();
          ctx.arc(globeCenterX, globeCenterY, globeRadius - 30, Math.PI * angle, Math.PI * (angle + 0.06));
          ctx.stroke();
        }
        for (let offset = 40; offset <= 140; offset += 35) {
          ctx.beginPath();
          ctx.arc(globeCenterX, globeCenterY, globeRadius - offset, Math.PI * 1.22, Math.PI * 1.78);
          ctx.stroke();
        }
        ctx.restore();
      }

      ctx.restore(); // Restore scale
    };

    const drawIdCard = async () => {
      if (cancelled) return;

      if (eventId) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/id-cards/events/${encodeURIComponent(eventId)}/templates?cardType=id_card`);
          if (res.ok) {
            const data = await res.json();
            const templates = data?.templates || [];
            const activeTpl = templates.find((t) => t.IsActive) || templates[0];
            let frontConfig = activeTpl?.FrontConfig;
            if (typeof frontConfig === 'string') {
              try {
                frontConfig = JSON.parse(frontConfig);
              } catch (e) {
                console.error("Error parsing ID Card FrontConfig:", e);
              }
            }

            if (frontConfig && typeof frontConfig === 'object' && Array.isArray(frontConfig.elements) && canvasRef.current) {
              setUsingCustomTemplate(true);
              const participantData = {
                ...participant,
                ParticipantName: name,
                UserName: name,
                FullName: name,
                name: name,
                College: college,
                CollegeName: college,
                TeamName: team,
                teamName: team,
                IdCardNumber: cardNumber,
                UserId: userId,
                photo: photo,
                Photo: photo,
                ProfileImage: photo,
                qr_code: verificationUrl,
                event_name: eventName,
                EventName: eventName,
                event_date: event?.EventDate || event?.Date || '2026',
                department: participant?.Department || participant?.Branch || 'Engineering & Technology'
              };

              const orientation = activeTpl?.Orientation || frontConfig?.orientation || 'portrait';
              const matchedSize = (CARD_SIZES || []).find(s => s.id === (frontConfig?.cardSizeId || activeTpl?.CardSizeId)) || { portrait: { width: 380, height: 600 }, landscape: { width: 600, height: 380 } };
              const sizeObj = matchedSize[orientation] || matchedSize.portrait || { width: 380, height: 600 };
              const cardWidth = sizeObj.width;
              const cardHeight = sizeObj.height;
              setDimensions({ width: cardWidth, height: cardHeight });

              await renderCardSide(
                canvasRef.current,
                frontConfig,
                participantData,
                event || participant || {},
                {
                  scale: 2,
                  cardWidth,
                  cardHeight,
                  previewMode: true
                }
              );
              return;
            }
          }
        } catch (err) {
          console.warn("Failed to load custom ID card template, using built-in design:", err);
        }
      }

      setUsingCustomTemplate(false);
      setDimensions({ width: BASE_W, height: BASE_H });
      await drawBuiltInCard();
    };

    drawIdCard();

    return () => {
      cancelled = true;
    };
  }, [
    name,
    college,
    team,
    userId,
    eventId,
    event,
    primaryColor,
    secondaryColor,
    r,
    g,
    b,
    photo,
    eventName,
    cardNumber,
    verificationUrl,
    customBackgroundUrl,
  ]);

  // Direct PDF Download (Responsive to portrait / landscape template)
  const downloadPdf = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      const isLandscape = dimensions.width > dimensions.height;
      const pdfW = isLandscape ? 148 : 105;
      const pdfH = isLandscape ? 105 : 148;
      const pdf = new jsPDF({
        orientation: isLandscape ? "landscape" : "portrait",
        unit: "mm",
        format: [pdfW, pdfH],
      });

      pdf.addImage(dataUrl, "JPEG", 0, 0, pdfW, pdfH, undefined, 'FAST');
      pdf.save(`${name.replace(/\s+/g, "_")}_IDCard.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      try {
        // Fallback: try raw PNG
        const pngUrl = canvas.toDataURL("image/png");
        const isLandscape = dimensions.width > dimensions.height;
        const pdfW = isLandscape ? 148 : 105;
        const pdfH = isLandscape ? 105 : 148;
        const pdf = new jsPDF({
          orientation: isLandscape ? "landscape" : "portrait",
          unit: "mm",
          format: [pdfW, pdfH]
        });
        pdf.addImage(pngUrl, "PNG", 0, 0, pdfW, pdfH);
        pdf.save(`${name.replace(/\s+/g, "_")}_IDCard.pdf`);
      } catch (err2) {
        console.error("Fallback PDF also failed:", err2);
        downloadPng();
      }
    }
  };

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const link = document.createElement("a");
      link.download = `${name.replace(/\s+/g, "_")}_IDCard.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      alert("Unable to download image. Please check image permissions.");
    }
  };

  const printCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print the ID card.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${name} - Official A6 Pass</title>
          <style>
            @page {
              size: 105mm 148mm;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              background-color: #000;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            img {
              width: 100vw;
              height: 100vh;
              object-fit: contain;
              display: block;
            }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" alt="A6 Participant Pass" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="w-full">
      <div ref={qrRef} className="hidden" aria-hidden="true">
        <QRCodeSVG value={verificationUrl} size={180} level="M" />
      </div>

      {/* Dimension & Custom Template Badge */}
      <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-slate-400">
        <span className="inline-flex items-center gap-1" style={{ color: primaryColor }}>
          <FileText className="h-3 w-3" />
          <span>Participant ID Pass</span>
          {usingCustomTemplate && (
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Custom Designed
            </span>
          )}
        </span>
        <span className="font-mono text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
          {usingCustomTemplate ? 'Designer Template' : '105 × 148 mm (300 DPI)'}
        </span>
      </div>

      <canvas
        ref={canvasRef}
        aria-label={`Official ID Pass for ${name}`}
        className="mx-auto h-auto w-full max-w-[340px] rounded-2xl border shadow-2xl"
        style={{
          aspectRatio: `${dimensions.width} / ${dimensions.height}`,
          borderColor: `rgba(${r}, ${g}, ${b}, 0.35)`,
          boxShadow: `0 20px 40px rgba(${r}, ${g}, ${b}, 0.15)`
        }}
      />

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={downloadPdf}
          className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-bold text-white shadow-lg transition hover:brightness-110 cursor-pointer"
          style={{ backgroundColor: primaryColor }}
          title="Save as standard A6 PDF"
        >
          <FileText className="h-4 w-4" />
          <span>Download PDF</span>
        </button>

        <button
          type="button"
          onClick={downloadPng}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 py-2.5 px-3 text-xs font-bold transition cursor-pointer"
          title="Save as PNG"
        >
          <Download className="h-4 w-4" />
          <span>Save PNG</span>
        </button>

        <button
          type="button"
          onClick={printCard}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 py-2.5 px-3 text-xs font-bold transition cursor-pointer"
        >
          <Printer className="h-4 w-4" style={{ color: primaryColor }} />
          <span>Print A6</span>
        </button>
      </div>
    </div>
  );
}
