import QRCode from 'qrcode';
import { API_BASE_URL } from '@/lib/api';
import { loadGoogleFontDynamically } from '../constants/fontsCatalog';

/**
 * Image loader with cache and fallback
 */
const imageCache = new Map();

export const loadSafeImage = (src) => {
  return new Promise((resolve) => {
    if (!src) return resolve(null);

    let resolvedSrc = src;
    if (typeof resolvedSrc === 'string' && resolvedSrc.startsWith('/uploads')) {
      resolvedSrc = `${API_BASE_URL}${resolvedSrc}`;
    }

    if (imageCache.has(resolvedSrc)) {
      return resolve(imageCache.get(resolvedSrc));
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(resolvedSrc, img);
      resolve(img);
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = resolvedSrc;

    // Timeout safety
    setTimeout(() => resolve(null), 5000);
  });
};

/**
 * Replace placeholders in template text
 */
export const replaceDynamicPlaceholders = (text, participant = {}, event = {}) => {
  if (!text || typeof text !== 'string') return '';

  const name = participant.ParticipantName || participant.UserName || participant.name || participant.TeamLeaderName || participant.LeaderName || 'Participant Name';
  const regId = participant.IdCardNumber || (participant.UserId ? `EV${event.Id || ''}-U${participant.UserId}` : 'EV-2026-001');
  const college = participant.College || participant.MemberCollege || participant.college || event.CollegeName || 'Aditya Institute of Technology and Management';
  const dept = participant.Department || participant.Branch || 'Engineering & Technology';
  const team = participant.TeamName || participant.teamName || 'Team Alpha';
  const teamId = participant.TeamId || participant.Id || participant.teamId || '101';
  const placement = participant.Placement || participant.Lab || 'D-BLOCK • Innovation Hall • Desk 14';
  const direction = participant.Direction || 'Right Wing';
  const psTitle = participant.ProblemStatement || participant.ProblemTitle || participant.psTitle || 'AI Automated Campus Optimization';
  const psDomain = participant.Category || participant.Domain || participant.psDomain || 'Software & AI';
  const members = Array.isArray(participant.members) ? participant.members : [];
  const membersCount = members.length || participant.TeamSize || 4;

  const lead = members.find(m => (m.Role || '').toLowerCase().includes('lead')) || members[0] || {};
  const otherMembers = members.filter(m => m !== lead);
  const member1 = lead;
  const member2 = otherMembers[0] || members[1] || {};
  const member3 = otherMembers[1] || members[2] || {};
  const member4 = otherMembers[2] || members[3] || {};

  const teamLeadName = lead.UserName || lead.MemberName || participant.LeaderName || 'Alex Rivers';
  const m1Name = member1.UserName || member1.MemberName || teamLeadName;
  const m2Name = member2.UserName || member2.MemberName || 'Priya Sharma';
  const m3Name = member3.UserName || member3.MemberName || 'David Chen';
  const m4Name = member4.UserName || member4.MemberName || 'Aisha Patel';

  const m1Role = member1.Role || 'TEAM LEADER';
  const m2Role = member2.Role || 'MEMBER';
  const m3Role = member3.Role || 'MEMBER';
  const m4Role = member4.Role || 'MEMBER';

  const m1Roll = member1.RollNumber || member1.RollNo || '21A51A0501';
  const m2Roll = member2.RollNumber || member2.RollNo || '21A51A4205';
  const m3Roll = member3.RollNumber || member3.RollNo || '21A51A1210';
  const m4Roll = member4.RollNumber || member4.RollNo || '21A51A0415';

  const eventName = event.EventName || event.eventName || 'Ayojan Hackathon';
  const category = participant.ParticipantCategory || (participant.TeamLeader ? 'Team Leader' : 'Participant');

  let dateVal = event.PhysicalStartDate || event.StartDate || event.startDate || 'Upcoming';
  if (dateVal && dateVal !== 'Upcoming') {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      dateVal = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  }

  return text
    .replace(/\{\{participant_name\}\}/gi, name)
    .replace(/\{\{registration_id\}\}/gi, regId)
    .replace(/\{\{college_name\}\}/gi, college)
    .replace(/\{\{department\}\}/gi, dept)
    .replace(/\{\{team_name\}\}/gi, team)
    .replace(/\{\{team_id\}\}/gi, String(teamId))
    .replace(/\{\{placement\}\}/gi, placement)
    .replace(/\{\{direction\}\}/gi, direction)
    .replace(/\{\{problem_statement\}\}/gi, psTitle)
    .replace(/\{\{ps_domain\}\}/gi, psDomain)
    .replace(/\{\{members_count\}\}/gi, String(membersCount))
    .replace(/\{\{team_lead_name\}\}/gi, teamLeadName)
    .replace(/\{\{member_1_name\}\}/gi, m1Name)
    .replace(/\{\{member_2_name\}\}/gi, m2Name)
    .replace(/\{\{member_3_name\}\}/gi, m3Name)
    .replace(/\{\{member_4_name\}\}/gi, m4Name)
    .replace(/\{\{member_1_role\}\}/gi, m1Role)
    .replace(/\{\{member_2_role\}\}/gi, m2Role)
    .replace(/\{\{member_3_role\}\}/gi, m3Role)
    .replace(/\{\{member_4_role\}\}/gi, m4Role)
    .replace(/\{\{member_1_roll\}\}/gi, m1Roll)
    .replace(/\{\{member_2_roll\}\}/gi, m2Roll)
    .replace(/\{\{member_3_roll\}\}/gi, m3Roll)
    .replace(/\{\{member_4_roll\}\}/gi, m4Roll)
    .replace(/\{\{event_name\}\}/gi, eventName)
    .replace(/\{\{event_date\}\}/gi, dateVal)
    .replace(/\{\{participant_category\}\}/gi, category);
};

/**
 * Generate Avatar fallback for missing participant photo
 */
const drawAvatarFallback = (ctx, x, y, width, height, name = 'P', borderRadius = 0) => {
  ctx.save();
  ctx.beginPath();
  if (borderRadius > 0) {
    ctx.roundRect(x, y, width, height, borderRadius);
  } else {
    ctx.rect(x, y, width, height);
  }
  ctx.clip();

  // Gradient background
  const grad = ctx.createLinearGradient(x, y, x + width, y + height);
  grad.addColorStop(0, '#047857');
  grad.addColorStop(1, '#064e3b');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, width, height);

  // Initials
  const initials = (name || 'P')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(14, Math.floor(width * 0.38))}px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials || 'P', x + width / 2, y + height / 2);
  ctx.restore();
};

/**
 * Main function: Renders a card side onto an HTML5 canvas at custom scale
 */
export const renderCardSide = async (
  canvas,
  sideConfig,
  participant = {},
  event = {},
  options = {}
) => {
  if (!canvas || !sideConfig) return;

  const {
    scale = 2,
    cardWidth = 380,
    cardHeight = 600,
    showSafeMargin = false,
    showCropMarks = false,
    previewMode = false
  } = options;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Set real pixel resolution and unconditionally reset transforms
  const pixelWidth = Math.round(cardWidth * scale);
  const pixelHeight = Math.round(cardHeight * scale);

  canvas.width = pixelWidth;
  canvas.height = pixelHeight;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, pixelWidth, pixelHeight);

  ctx.save();
  ctx.scale(scale, scale);

  // 1. Draw Card Background (Solid, Gradient, or Image)
  const bgType = sideConfig.bgType === 'solid'
    ? 'solid'
    : sideConfig.bgType === 'gradient'
    ? 'gradient'
    : sideConfig.bgType === 'image'
    ? 'image'
    : sideConfig.backgroundImage
    ? 'image'
    : (sideConfig.gradientColor1 && sideConfig.gradientColor2 && !sideConfig.backgroundColor)
    ? 'gradient'
    : 'solid';

  if (bgType === 'gradient') {
    const angle = Number(sideConfig.gradientAngle) || 135;
    let x0 = 0, y0 = 0, x1 = 0, y1 = cardHeight;

    if (angle === 90) {
      x0 = 0; y0 = 0; x1 = cardWidth; y1 = 0; // left to right
    } else if (angle === 180) {
      x0 = 0; y0 = 0; x1 = 0; y1 = cardHeight; // top to bottom
    } else if (angle === 45) {
      x0 = 0; y0 = cardHeight; x1 = cardWidth; y1 = 0; // diagonal up
    } else {
      // 135 deg default diagonal down
      x0 = 0; y0 = 0; x1 = cardWidth; y1 = cardHeight;
    }

    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    grad.addColorStop(0, sideConfig.gradientColor1 || '#064e3b');
    grad.addColorStop(1, sideConfig.gradientColor2 || '#022c22');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cardWidth, cardHeight);
  } else {
    // Solid background (default or 'solid')
    const bgColor = sideConfig.backgroundColor || '#09090b';
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, cardWidth, cardHeight);
  }

  // Draw Background Image if present and bgType is 'image'
  if (bgType === 'image' && sideConfig.backgroundImage) {
    const bgImg = await loadSafeImage(sideConfig.backgroundImage);
    if (bgImg) {
      const imgRatio = bgImg.width / bgImg.height;
      const cardRatio = cardWidth / cardHeight;
      let sWidth, sHeight, sx, sy;

      if (cardRatio > imgRatio) {
        sWidth = bgImg.width;
        sHeight = bgImg.width / cardRatio;
        sx = 0;
        sy = (bgImg.height - sHeight) / 2;
      } else {
        sHeight = bgImg.height;
        sWidth = bgImg.height * cardRatio;
        sx = (bgImg.width - sWidth) / 2;
        sy = 0;
      }

      ctx.save();
      const imgOpacity = sideConfig.bgImageOpacity !== undefined ? Number(sideConfig.bgImageOpacity) : 1;
      ctx.globalAlpha = imgOpacity;
      ctx.drawImage(bgImg, sx, sy, sWidth, sHeight, 0, 0, cardWidth, cardHeight);
      ctx.restore();

      // Draw dark overlay on top of background image if enabled
      const overlayOpacity = Number(sideConfig.bgOverlayOpacity) || 0;
      if (overlayOpacity > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${overlayOpacity})`;
        ctx.fillRect(0, 0, cardWidth, cardHeight);
      }
    }
  }

  // 2. Sort elements by zIndex
  const elements = Array.isArray(sideConfig.elements) ? [...sideConfig.elements] : [];
  elements.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  // 3. Render each element
  for (const elem of elements) {
    if (elem.hidden) continue;

    ctx.save();

    const x = Number(elem.x) || 0;
    const y = Number(elem.y) || 0;
    const w = Number(elem.width) || 100;
    const h = Number(elem.height) || 40;
    const rotation = (Number(elem.rotation) || 0) * (Math.PI / 180);
    const opacity = elem.opacity !== undefined ? Number(elem.opacity) : 1;

    ctx.globalAlpha = opacity;

    // Apply rotation around element center
    if (rotation !== 0) {
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate(rotation);
      ctx.translate(-(x + w / 2), -(y + h / 2));
    }

    // --- A. SHAPE ELEMENT ---
    if (elem.type === 'shape') {
      const radius = Number(elem.borderRadius) || 0;
      const strokeWidth = Number(elem.strokeWidth) || 0;
      const strokeColor = elem.stroke || 'transparent';
      const fill = elem.fill || '#10b981';

      ctx.beginPath();
      if (elem.shapeType === 'circle') {
        const radiusCircle = Math.min(w, h) / 2;
        ctx.arc(x + w / 2, y + h / 2, radiusCircle, 0, Math.PI * 2);
      } else if (elem.shapeType === 'line') {
        ctx.moveTo(x, y + h / 2);
        ctx.lineTo(x + w, y + h / 2);
      } else {
        if (radius > 0) {
          ctx.roundRect(x, y, w, h, radius);
        } else {
          ctx.rect(x, y, w, h);
        }
      }

      if (elem.shapeType !== 'line') {
        ctx.fillStyle = fill;
        ctx.fill();
      }

      if (strokeWidth > 0 && strokeColor !== 'transparent') {
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = strokeColor;
        ctx.stroke();
      }
    }

    // --- B. TEXT ELEMENT ---
    else if (elem.type === 'text') {
      const rawText = elem.text || '';
      let processedText = replaceDynamicPlaceholders(rawText, participant, event);
      if (elem.textTransform === 'uppercase') {
        processedText = processedText.toUpperCase();
      } else if (elem.textTransform === 'lowercase') {
        processedText = processedText.toLowerCase();
      } else if (elem.textTransform === 'capitalize') {
        processedText = processedText.replace(/\b\w/g, (c) => c.toUpperCase());
      }

      const fontSize = Number(elem.fontSize) || 14;
      const fontWeight = elem.fontWeight || 'normal';
      const fontStyle = elem.fontStyle === 'italic' ? 'italic ' : '';
      const fontFamily = elem.fontFamily || 'Inter, sans-serif';
      const color = elem.color || '#ffffff';
      const align = elem.textAlign || 'center';
      const letterSpacing = Number(elem.letterSpacing) || 0;

      loadGoogleFontDynamically(fontFamily);

      ctx.font = `${fontStyle}${fontWeight} ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = color;
      ctx.textBaseline = 'top';

      if (ctx.letterSpacing !== undefined) {
        ctx.letterSpacing = `${letterSpacing}px`;
      }

      let textX = x;
      if (align === 'center') textX = x + w / 2;
      else if (align === 'right') textX = x + w;

      ctx.textAlign = align;

      // Handle simple multi-line wrap
      const words = processedText.split(' ');
      let line = '';
      const lines = [];
      const maxWidth = w;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          lines.push(line.trim());
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line.trim());

      const lineHeight = fontSize * 1.25;
      lines.forEach((l, idx) => {
        ctx.fillText(l, textX, y + idx * lineHeight);
      });
    }

    // --- C. IMAGE ELEMENT ---
    else if (elem.type === 'image') {
      const radius = Number(elem.borderRadius) || 0;
      const borderWidth = Number(elem.borderWidth) || 0;
      const borderColor = elem.borderColor || '#10b981';

      let imgSrc = elem.src;
      let avatarFallbackName = participant.ParticipantName || 'P';

      const members = Array.isArray(participant.members) ? participant.members : [];
      const lead = members.find(m => (m.Role || '').toLowerCase().includes('lead')) || members[0] || {};
      const otherMembers = members.filter(m => m !== lead);
      const member1 = lead;
      const member2 = otherMembers[0] || members[1] || {};
      const member3 = otherMembers[1] || members[2] || {};
      const member4 = otherMembers[2] || members[3] || {};

      const isPhotoField = elem.dynamicField && (
        elem.dynamicField === 'participant_photo' ||
        elem.dynamicField === 'team_lead_photo' ||
        elem.dynamicField.startsWith('member_')
      );

      if (elem.dynamicField === 'participant_photo') {
        imgSrc = participant.Photo || participant.photo || elem.src;
        avatarFallbackName = participant.ParticipantName || participant.UserName || 'P';
      } else if (elem.dynamicField === 'team_lead_photo' || elem.dynamicField === 'member_1_photo') {
        imgSrc = member1.Photo || participant.Photo || elem.src;
        avatarFallbackName = member1.UserName || member1.MemberName || participant.LeaderName || 'Lead';
      } else if (elem.dynamicField === 'member_2_photo') {
        imgSrc = member2.Photo || elem.src;
        avatarFallbackName = member2.UserName || member2.MemberName || 'M2';
      } else if (elem.dynamicField === 'member_3_photo') {
        imgSrc = member3.Photo || elem.src;
        avatarFallbackName = member3.UserName || member3.MemberName || 'M3';
      } else if (elem.dynamicField === 'member_4_photo') {
        imgSrc = member4.Photo || elem.src;
        avatarFallbackName = member4.UserName || member4.MemberName || 'M4';
      }

      const img = imgSrc ? await loadSafeImage(imgSrc) : null;

      ctx.save();
      ctx.beginPath();
      if (radius > 0) {
        ctx.roundRect(x, y, w, h, radius);
      } else {
        ctx.rect(x, y, w, h);
      }
      ctx.clip();

      if (img) {
        const fit = elem.objectFit || (isPhotoField ? 'cover' : 'contain');
        const imgRatio = img.width / img.height;
        const elemRatio = w / h;

        if (fit === 'contain') {
          // Scale image to fit inside w & h without cropping (perfect for logos)
          let renderW, renderH, renderX, renderY;
          if (imgRatio > elemRatio) {
            renderW = w;
            renderH = w / imgRatio;
            renderX = x;
            renderY = y + (h - renderH) / 2;
          } else {
            renderH = h;
            renderW = h * imgRatio;
            renderX = x + (w - renderW) / 2;
            renderY = y;
          }
          ctx.drawImage(img, renderX, renderY, renderW, renderH);
        } else if (fit === 'fill') {
          // Stretch to fill exact bounds
          ctx.drawImage(img, x, y, w, h);
        } else {
          // Cover (default for photos)
          let sWidth, sHeight, sx, sy;
          if (elemRatio > imgRatio) {
            sWidth = img.width;
            sHeight = img.width / elemRatio;
            sx = 0;
            sy = (img.height - sHeight) / 2;
          } else {
            sHeight = img.height;
            sWidth = img.height * elemRatio;
            sx = (img.width - sWidth) / 2;
            sy = 0;
          }
          ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
        }
      } else {
        // Fallback avatar
        drawAvatarFallback(ctx, x, y, w, h, avatarFallbackName, radius);
      }
      ctx.restore();

      // Border stroke around image
      if (borderWidth > 0 && borderColor !== 'transparent') {
        ctx.beginPath();
        if (radius > 0) {
          ctx.roundRect(x, y, w, h, radius);
        } else {
          ctx.rect(x, y, w, h);
        }
        ctx.lineWidth = borderWidth;
        ctx.strokeStyle = borderColor;
        ctx.stroke();
      }
    }

    // --- D. QR CODE ELEMENT ---
    else if (elem.type === 'qr') {
      const radius = Number(elem.borderRadius) || 0;
      const borderWidth = Number(elem.borderWidth) || 0;
      const borderColor = elem.borderColor || 'transparent';
      const qrColor = elem.color || '#000000';
      const qrBg = elem.bgColor || '#ffffff';

      // Verification / Team URL format
      const isTeam = Boolean(participant.TeamId || participant.TeamName || participant.TeamLeaderName);
      const teamId = participant.TeamId || participant.Id || '';
      const token = participant.VerificationToken || participant.IdCardNumber || 'DEMO-TOKEN';
      const eventId = event.Id || '';
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ayojan.event';
      const verifyUrl = isTeam && teamId
        ? `${origin}/teams/public/${teamId}`
        : `${origin}/verify-id?token=${encodeURIComponent(token)}&eventId=${encodeURIComponent(eventId)}`;

      try {
        const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
          margin: 1,
          errorCorrectionLevel: 'M',
          color: {
            dark: qrColor,
            light: qrBg
          }
        });

        const qrImg = await loadSafeImage(qrDataUrl);
        if (qrImg) {
          ctx.save();
          ctx.beginPath();
          if (radius > 0) {
            ctx.roundRect(x, y, w, h, radius);
          } else {
            ctx.rect(x, y, w, h);
          }
          ctx.clip();
          ctx.drawImage(qrImg, x, y, w, h);
          ctx.restore();

          if (borderWidth > 0 && borderColor && borderColor !== 'transparent') {
            ctx.beginPath();
            if (radius > 0) {
              ctx.roundRect(x, y, w, h, radius);
            } else {
              ctx.rect(x, y, w, h);
            }
            ctx.lineWidth = borderWidth;
            ctx.strokeStyle = borderColor;
            ctx.stroke();
          }
        }
      } catch (qrErr) {
        console.error('Error rendering QR code onto canvas:', qrErr);
      }
    }

    ctx.restore();
  }

  // 4. Safe print margins guide (visual in designer)
  if (showSafeMargin) {
    const margin = Number(sideConfig.safeMargin) || 15;
    ctx.save();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(margin, margin, cardWidth - margin * 2, cardHeight - margin * 2);
    ctx.restore();
  }

  // 5. Crop marks (cutting margins for print sheet)
  if (showCropMarks) {
    ctx.save();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 0.5;
    const len = 10;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(-len, 0); ctx.lineTo(0, 0); ctx.lineTo(0, -len);
    ctx.moveTo(cardWidth, -len); ctx.lineTo(cardWidth, 0); ctx.lineTo(cardWidth + len, 0);
    ctx.moveTo(-len, cardHeight); ctx.lineTo(0, cardHeight); ctx.lineTo(0, cardHeight + len);
    ctx.moveTo(cardWidth, cardHeight + len); ctx.lineTo(cardWidth, cardHeight); ctx.lineTo(cardWidth + len, cardHeight);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
};

export const renderCardSideCanvas = renderCardSide;
