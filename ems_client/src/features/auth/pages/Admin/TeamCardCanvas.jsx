import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/lib/api";
import { QRCodeSVG } from "qrcode.react";
import { Download, Printer, FileText, Palette } from "lucide-react";
import { jsPDF } from "jspdf";
import { renderCardSide } from "@/features/id_card/services/idCardRenderer";
import { TEAM_CARD_SIZES } from "@/features/id_card/components/IdCardDesigner";

const hexToRgb = (hex, fallback = { r: 0, g: 229, b: 255 }) => {
  if (!hex || typeof hex !== "string") return fallback;
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) clean = clean.split("").map((c) => c + c).join("");
  if (clean.length !== 6) return fallback;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return isNaN(r) || isNaN(g) || isNaN(b) ? fallback : { r, g, b };
};

const hexToRgba = (hex, alpha = 1, fallback) => {
  const { r, g, b } = hexToRgb(hex, fallback);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const loadImage = (src) =>
  new Promise((resolve) => {
    if (!src) return resolve(null);

    let resolvedSrc = src;
    if (typeof resolvedSrc === 'string' && resolvedSrc.startsWith('/uploads')) {
      resolvedSrc = `${API_BASE_URL}${resolvedSrc}`;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Do NOT load without crossOrigin as that taints the canvas and blocks PDF generation!
      resolve(null);
    };
    img.src = resolvedSrc;
    setTimeout(() => resolve(null), 7000);
  });

// Standard Team Display Card: 1200 × 750 (Rendered at 2x: 2400 × 1500 for ultra-crisp print & PDF)
const BASE_W = 1200;
const BASE_H = 750;
const RENDER_SCALE = 2;

export default function TeamCardCanvas({ team, event, eventId: propEventId }) {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const qrRef = useRef(null);
  const [usingCustomTemplate, setUsingCustomTemplate] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 750, height: 475 });

  const teamId = team?.Id || team?.TeamId || "";
  const teamName = team?.TeamName || "Team";
  const members = Array.isArray(team?.members) ? team.members : [];
  const eventName = event?.EventName || team?.EventName || "AVISHKAAR";
  const eventId = propEventId || team?.EventId || team?.eventId || (event?.EventId) || (event?.Id && event.Id !== (team?.Id || team?.TeamId) ? event.Id : "") || "";

  // Dynamic Event Colors from Admin Settings
  const primaryColor = event?.PrimaryColor || team?.PrimaryColor || "#00E5FF";
  const secondaryColor = event?.SecondaryColor || team?.SecondaryColor || "#FFFFFF";
  const { r, g, b } = hexToRgb(primaryColor, { r: 0, g: 229, b: 255 });

  const placement = team?.Placement || team?.Lab || "D-BLOCK - Innovation Hall";
  const direction = team?.Direction || "Right Wing";

  // Custom Team Card Background uploaded by admin in Event Settings
  const customBackgroundUrl = event?.TeamCardBackground || team?.TeamCardBackground;

  // Public scannable team URL for judges and visitors
  const publicTeamUrl = `${window.location.origin}/teams/public/${teamId}`;

  useEffect(() => {
    let cancelled = false;

    const drawBuiltInTeamCard = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = BASE_W * RENDER_SCALE;   // 2400 px
      canvas.height = BASE_H * RENDER_SCALE; // 1500 px

      ctx.save();
      ctx.scale(RENDER_SCALE, RENDER_SCALE);

      const rounded = (x, y, w, h, radius, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, radius);
        ctx.fill();
      };

      const strokeRounded = (x, y, w, h, radius, strokeColor, lineWidth = 1) => {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, radius);
        ctx.stroke();
      };

      const drawText = (val, x, y, font, color, maxW = 500) => {
        ctx.font = font;
        ctx.fillStyle = color;
        let str = String(val || "");
        while (ctx.measureText(str).width > maxW && str.length > 4) {
          str = str.slice(0, -4) + "...";
        }
        ctx.fillText(str, x, y);
      };

      // Load all member photos and custom background if uploaded
      const [loadedMemberPhotos, customBgImage] = await Promise.all([
        Promise.all(members.slice(0, 4).map((m) => loadImage(m.Photo))),
        loadImage(customBackgroundUrl),
      ]);

      if (cancelled) return;

      // 1. BACKGROUND: Use Admin Custom Background if provided, otherwise Cyber Dark Space Grid
      if (customBgImage) {
        ctx.drawImage(customBgImage, 0, 0, BASE_W, BASE_H);
      } else {
        const bgGrad = ctx.createLinearGradient(0, 0, BASE_W, BASE_H);
        bgGrad.addColorStop(0, "#030712");
        bgGrad.addColorStop(0.5, `rgba(${Math.round(r * 0.05)}, ${Math.round(g * 0.05)}, ${Math.round(b * 0.08)}, 0.98)`);
        bgGrad.addColorStop(1, "#030611");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, BASE_W, BASE_H);

        // Cyber Grid matrix background pattern in event theme color
        ctx.save();
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.04)`;
        ctx.lineWidth = 1;
        for (let x = 0; x < BASE_W; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, BASE_H);
          ctx.stroke();
        }
        for (let y = 0; y < BASE_H; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(BASE_W, y);
          ctx.stroke();
        }
        ctx.restore();

        // Outer Glowing Frame in event theme color
        ctx.save();
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.45)`;
        ctx.shadowBlur = 16;
        strokeRounded(16, 16, BASE_W - 32, BASE_H - 32, 18, `rgba(${r}, ${g}, ${b}, 0.5)`, 2);
        ctx.restore();
      }

      // 2. TOP HEADER
      // Event Brand Title (Left)
      ctx.save();
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.75)`;
      ctx.shadowBlur = 12;
      drawText(eventName.toUpperCase(), 48, 66, "900 36px 'Arial Black', Arial", primaryColor, 450);
      ctx.restore();
      drawText("SEASON 4", 48, 88, "bold 13px Arial", "rgba(255, 255, 255, 0.8)", 200);

      // College Crest & Wordmark (Right)
      ctx.textAlign = "right";
      drawText("aitam", BASE_W - 90, 64, "bold 32px 'Georgia', serif", "#FFFFFF", 200);
      drawText("ADITYA INSTITUTE OF TECHNOLOGY AND MANAGEMENT", BASE_W - 48, 84, "bold 8.5px Arial", "rgba(255, 255, 255, 0.7)", 350);
      drawText("An Autonomous Institution", BASE_W - 48, 96, "italic 8px Arial", "rgba(255, 255, 255, 0.5)", 250);

      // Crest emblem box
      rounded(BASE_W - 84, 40, 36, 42, 6, "rgba(220, 38, 38, 0.2)");
      strokeRounded(BASE_W - 84, 40, 36, 42, 6, "#DC2626", 1.5);
      ctx.fillStyle = "#FBBF24";
      ctx.textAlign = "center";
      ctx.font = "bold 18px Arial";
      ctx.fillText("🏛", BASE_W - 66, 68);
      ctx.textAlign = "start";

      // Horizontal Header Divider in event theme color gradient
      const divGrad = ctx.createLinearGradient(48, 114, BASE_W - 48, 114);
      divGrad.addColorStop(0, primaryColor);
      divGrad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.4)`);
      divGrad.addColorStop(1, primaryColor);
      ctx.fillStyle = divGrad;
      ctx.fillRect(48, 114, BASE_W - 96, 2.5);

      // 3. TEAM IDENTITY SECTION (Middle)
      // Team Name in glowing event theme color
      ctx.save();
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.85)`;
      ctx.shadowBlur = 14;
      drawText(teamName, 48, 172, "900 42px 'Arial Black', Arial", primaryColor, 580);
      ctx.restore();

      // Team ID
      drawText(`Team ID: TEAM-${teamId}`, 48, 206, "bold 17px Arial", "#FFFFFF", 450);

      // Placement & Direction
      drawText(`Team Placement : ${placement}`, 48, 238, "bold 14px Arial", primaryColor, 500);
      drawText(`Direction : ${direction}`, 48, 262, "bold 13px Arial", "rgba(255, 255, 255, 0.85)", 400);

      // Sub-divider under team details
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.4)`;
      ctx.fillRect(48, 282, 540, 1.5);

      // RIGHT WIDGETS: Number Box + QR Code + Mascot Box
      // Widget 1: Large Team Sequence Box
      const numBoxX = BASE_W - 430;
      rounded(numBoxX, 140, 100, 100, 14, "rgba(4, 18, 38, 0.85)");
      strokeRounded(numBoxX, 140, 100, 100, 14, primaryColor, 2);
      ctx.save();
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.9)`;
      ctx.shadowBlur = 10;
      ctx.textAlign = "center";
      ctx.font = "900 48px 'Arial Black', Arial";
      ctx.fillStyle = primaryColor;
      ctx.fillText(String(teamId), numBoxX + 50, 208);
      ctx.restore();

      // Widget 2: QR Code Box
      const qrBoxX = BASE_W - 310;
      rounded(qrBoxX, 140, 100, 100, 14, "#FFFFFF");
      strokeRounded(qrBoxX, 140, 100, 100, 14, primaryColor, 2);
      const svg = qrRef.current?.querySelector("svg");
      if (svg) {
        const serialized = new XMLSerializer().serializeToString(svg);
        const qrImg = await loadImage(
          `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`
        );
        if (qrImg) {
          ctx.drawImage(qrImg, qrBoxX + 6, 146, 88, 88);
        }
      }

      // Widget 3: Cyber Mascot Box
      const mascotBoxX = BASE_W - 190;
      rounded(mascotBoxX, 140, 140, 100, 14, "rgba(4, 18, 38, 0.85)");
      strokeRounded(mascotBoxX, 140, 140, 100, 14, primaryColor, 2);
      ctx.save();
      ctx.textAlign = "center";
      ctx.font = "46px Arial";
      ctx.fillText("👨‍🚀", mascotBoxX + 70, 204);
      drawText("HACKER PASS", mascotBoxX + 70, 228, "bold 9px Arial", primaryColor, 120);
      ctx.restore();

      // 4. TEAM MEMBERS CARDS (Horizontal Cards)
      const count = Math.min(4, Math.max(1, members.length));
      const cardGap = 16;
      const totalWidth = BASE_W - 96;
      const cardWidth = (totalWidth - (count - 1) * cardGap) / count;
      const cardHeight = 160;
      const cardY = 315;

      members.slice(0, 4).forEach((m, idx) => {
        const cardX = 48 + idx * (cardWidth + cardGap);
        const isLead = (m.Role || "").toLowerCase().includes("lead");
        const photoImg = loadedMemberPhotos[idx];

        // Glassmorphic Card Container
        rounded(cardX, cardY, cardWidth, cardHeight, 14, "rgba(6, 20, 44, 0.85)");
        strokeRounded(
          cardX,
          cardY,
          cardWidth,
          cardHeight,
          14,
          isLead ? `rgba(${r}, ${g}, ${b}, 0.8)` : `rgba(${r}, ${g}, ${b}, 0.35)`,
          isLead ? 1.8 : 1
        );

        // Circular Photo Ring
        const avatarSize = 64;
        const avatarX = cardX + (cardWidth - avatarSize) / 2;
        const avatarY = cardY + 16;
        const centerX = avatarX + avatarSize / 2;
        const centerY = avatarY + avatarSize / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, avatarSize / 2, 0, Math.PI * 2);
        ctx.clip();

        if (photoImg) {
          ctx.drawImage(photoImg, avatarX, avatarY, avatarSize, avatarSize);
        } else {
          ctx.fillStyle = isLead ? `rgba(${r}, ${g}, ${b}, 0.25)` : "rgba(255, 255, 255, 0.1)";
          ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
          ctx.textAlign = "center";
          ctx.font = "bold 24px Arial";
          ctx.fillStyle = "#FFFFFF";
          ctx.fillText((m.UserName || "M").charAt(0).toUpperCase(), centerX, centerY + 8);
        }
        ctx.restore();

        // Neon Border around circular avatar
        ctx.save();
        ctx.strokeStyle = isLead ? primaryColor : `rgba(${r}, ${g}, ${b}, 0.55)`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, avatarSize / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Member Name
        ctx.save();
        ctx.textAlign = "center";
        drawText(
          m.UserName || "Team Member",
          centerX,
          avatarY + avatarSize + 22,
          "bold 15px Arial",
          "#FFFFFF",
          cardWidth - 20
        );

        // Member Role
        drawText(
          isLead ? "★ Team Lead" : "Team Member",
          centerX,
          avatarY + avatarSize + 39,
          "bold 11px Arial",
          isLead ? primaryColor : "rgba(255, 255, 255, 0.65)",
          cardWidth - 20
        );

        // Room Assignment Chip (if room is allocated)
        if (m.RoomNumber) {
          rounded(centerX - 48, avatarY + avatarSize + 48, 96, 18, 9, `rgba(${r}, ${g}, ${b}, 0.18)`);
          strokeRounded(centerX - 48, avatarY + avatarSize + 48, 96, 18, 9, `rgba(${r}, ${g}, ${b}, 0.5)`, 1);
          drawText(`Room: ${m.RoomNumber}`, centerX, avatarY + avatarSize + 61, "bold 9px Arial", primaryColor, 90);
        }
        ctx.restore();
      });

      // 5. CYBER WIREFRAME GLOBE & HORIZON (Bottom Graphic) in event theme color
      if (!customBgImage) {
        ctx.save();
        const globeCenterX = BASE_W / 2;
        const globeCenterY = BASE_H + 280;
        const globeRadius = 400;

        // Glow behind the globe
        const glowGrad = ctx.createRadialGradient(
          globeCenterX,
          globeCenterY - 100,
          50,
          globeCenterX,
          globeCenterY - 100,
          380
        );
        glowGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.4)`);
        glowGrad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.12)`);
        glowGrad.addColorStop(1, "transparent");
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(globeCenterX, globeCenterY - 100, 380, 0, Math.PI * 2);
        ctx.fill();

        // Digital Globe Horizon Arc
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 3;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(globeCenterX, globeCenterY, globeRadius, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();

        // Perspective wireframe grid longitude/latitude rings
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.28)`;
        ctx.lineWidth = 1;
        for (let angle = 1.25; angle <= 1.75; angle += 0.1) {
          ctx.beginPath();
          ctx.arc(globeCenterX, globeCenterY, globeRadius - 40, Math.PI * angle, Math.PI * (angle + 0.08));
          ctx.stroke();
        }
        ctx.restore();
      }

      // 6. FOOTER POWERED BY BADGE
      const footerPillW = 340;
      const footerPillH = 34;
      const footerPillX = (BASE_W - footerPillW) / 2;
      const footerPillY = BASE_H - 56;

      rounded(footerPillX, footerPillY, footerPillW, footerPillH, 17, "rgba(4, 18, 38, 0.95)");
      strokeRounded(footerPillX, footerPillY, footerPillW, footerPillH, 17, `rgba(${r}, ${g}, ${b}, 0.65)`, 1.5);

      ctx.save();
      ctx.textAlign = "center";
      ctx.font = "bold 11px Arial";
      ctx.fillStyle = primaryColor;
      ctx.fillText(`Powered by Web Team · ${eventName} 2026`, BASE_W / 2, footerPillY + 21);
      ctx.restore();

      ctx.restore(); // Restore scale
    };

    const drawTeamCard = async () => {
      if (cancelled) return;

      // Check if a custom visual Team Card template exists for this event
      if (eventId) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/id-cards/events/${encodeURIComponent(eventId)}/templates?cardType=team_card`);
          if (res.ok) {
            const data = await res.json();
            const templates = data?.templates || [];
            const activeTpl = templates.find((t) => t.IsActive) || templates[0];
            let frontConfig = activeTpl?.FrontConfig;
            if (typeof frontConfig === 'string') {
              try {
                frontConfig = JSON.parse(frontConfig);
              } catch (e) {
                console.error("Error parsing FrontConfig:", e);
              }
            }

            if (frontConfig && typeof frontConfig === 'object' && Array.isArray(frontConfig.elements) && canvasRef.current) {
              setUsingCustomTemplate(true);
              const teamData = {
                ...team,
                TeamName: teamName,
                TeamId: teamId,
                placement: placement,
                direction: direction,
                problem_statement: team?.ProblemStatement || team?.ProblemStatementText || "",
                ps_domain: team?.Domain || team?.Category || "",
                members_count: members.length,
                members: members.map((m, idx) => ({
                  UserName: m?.UserName || m?.Name || m?.FullName || (idx === 0 ? "Team Lead" : `Member ${idx + 1}`),
                  MemberName: m?.UserName || m?.Name || m?.FullName || "",
                  Role: m?.Role || (idx === 0 ? "Team Leader" : "Member"),
                  Photo: m?.Photo || m?.ProfilePhoto || m?.PhotoUrl || "",
                  College: m?.College || m?.MemberCollege || team?.College || "",
                  RollNumber: m?.RollNumber || m?.RollNo || ""
                })),
                event_name: eventName,
                public_team_url: publicTeamUrl,
              };

              const orientation = activeTpl?.Orientation || frontConfig?.orientation || 'landscape';
              const matchedSize = (TEAM_CARD_SIZES || []).find(s => s.id === (frontConfig?.cardSizeId || activeTpl?.CardSizeId)) || { landscape: { width: 750, height: 475 }, portrait: { width: 475, height: 750 } };
              const sizeObj = matchedSize[orientation] || matchedSize.landscape || { width: 750, height: 475 };
              const cardWidth = sizeObj.width;
              const cardHeight = sizeObj.height;
              setDimensions({ width: cardWidth, height: cardHeight });

              await renderCardSide(
                canvasRef.current,
                frontConfig,
                teamData,
                event || team || {},
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
          console.warn("Failed to load custom team card template, using built-in design:", err);
        }
      }

      setUsingCustomTemplate(false);
      setDimensions({ width: BASE_W, height: BASE_H });
      await drawBuiltInTeamCard();
    };

    drawTeamCard();

    return () => {
      cancelled = true;
    };
  }, [team, event, teamId, teamName, members, eventName, placement, direction, primaryColor, secondaryColor, r, g, b, eventId]);

  // Download direct PDF for Team Card
  const downloadTeamCardPdf = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isLandscape = dimensions.width >= dimensions.height;
    const wMm = isLandscape ? 240 : 150;
    const hMm = isLandscape ? 150 : 240;

    try {
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({
        orientation: isLandscape ? "landscape" : "portrait",
        unit: "mm",
        format: [wMm, hMm],
      });

      pdf.addImage(dataUrl, "JPEG", 0, 0, wMm, hMm, undefined, 'FAST');
      pdf.save(`${teamName.replace(/\s+/g, "_")}_TeamCard.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      try {
        const pngUrl = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ orientation: isLandscape ? "landscape" : "portrait", unit: "mm", format: [wMm, hMm] });
        pdf.addImage(pngUrl, "PNG", 0, 0, wMm, hMm);
        pdf.save(`${teamName.replace(/\s+/g, "_")}_TeamCard.pdf`);
      } catch (err2) {
        console.error("Fallback PDF also failed:", err2);
        downloadTeamCardPng();
      }
    }
  };

  const downloadTeamCardPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const link = document.createElement("a");
      link.download = `${teamName.replace(/\s+/g, "_")}_TeamCard.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      alert("Unable to download Team Card directly. Please check image permissions.");
    }
  };

  const printTeamCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print the Team Card.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${teamName} - Official Team Card</title>
          <style>
            @page {
              size: landscape;
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
          <img src="${dataUrl}" alt="Official Team Card" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="w-full">
      <div ref={qrRef} className="hidden" aria-hidden="true">
        <QRCodeSVG value={publicTeamUrl} size={160} level="M" />
      </div>

      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-400">
        <span className="flex items-center gap-1.5" style={{ color: primaryColor }}>
          <FileText className="h-3.5 w-3.5" />
          <span>Official Landscape Team Card</span>
          {usingCustomTemplate && (
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Custom Designed
            </span>
          )}
        </span>
        <div className="flex items-center gap-2">
          {eventId && (
            <button
              type="button"
              onClick={() => navigate(`/admin/team-card-designer?eventId=${eventId}`)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition cursor-pointer"
              title="Open Visual Team Card Designer"
            >
              <Palette className="h-3 w-3" />
              <span>Customize Card</span>
            </button>
          )}
          <span className="font-mono text-[11px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
            PDF & Ultra HD
          </span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="mx-auto h-auto w-full max-w-[540px] rounded-xl border shadow-2xl"
        style={{
          aspectRatio: `${dimensions.width} / ${dimensions.height}`,
          borderColor: `rgba(${r}, ${g}, ${b}, 0.35)`,
          boxShadow: `0 20px 40px rgba(${r}, ${g}, ${b}, 0.15)`
        }}
      />

      <div className="mt-4 grid grid-cols-4 gap-2">
        <button
          type="button"
          onClick={downloadTeamCardPdf}
          className="flex items-center justify-center gap-1.5 rounded-xl text-white font-bold py-2.5 px-2 text-xs shadow-lg transition hover:brightness-110 cursor-pointer"
          style={{ backgroundColor: primaryColor }}
          title="Save as official PDF document"
        >
          <FileText className="h-4 w-4" />
          <span>PDF</span>
        </button>

        <button
          type="button"
          onClick={downloadTeamCardPng}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold py-2.5 px-2 text-xs transition cursor-pointer"
          title="Download as PNG image"
        >
          <Download className="h-4 w-4" />
          <span>PNG</span>
        </button>

        <button
          type="button"
          onClick={printTeamCard}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold py-2.5 px-2 text-xs transition cursor-pointer"
        >
          <Printer className="h-4 w-4" style={{ color: primaryColor }} />
          <span>Print</span>
        </button>

        <button
          type="button"
          onClick={() => navigate(eventId ? `/admin/team-card-designer?eventId=${eventId}` : "/admin/team-card-designer")}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 font-bold py-2.5 px-2 text-xs transition cursor-pointer"
          title="Open Visual Studio to customize layout, colors & placeholders"
        >
          <Palette className="h-4 w-4" />
          <span>Design</span>
        </button>
      </div>
    </div>
  );
}
