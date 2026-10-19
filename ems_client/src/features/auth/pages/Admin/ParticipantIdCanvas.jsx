import React, { useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

const getValue = (obj, ...keys) => {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return "";
};

const getPosterUrl = (event) => {
  let posters = getValue(event, "Posters", "posters", "Poster", "poster");
  if (typeof posters === "string") {
    try {
      posters = JSON.parse(posters);
    } catch {
      return posters;
    }
  }

  const poster = Array.isArray(posters) ? posters[0] : posters;
  const url =
    typeof poster === "string"
      ? poster
      : getValue(poster, "url", "URL", "image", "Image", "PosterURL", "posterUrl");

  if (!url || /^(data:|blob:|https?:\/\/)/i.test(url)) return url;
  return `http://localhost:3000/${String(url).replace(/^\/+/, "")}`;
};

const loadImage = (src) =>
  new Promise((resolve) => {
    if (!src) return resolve(null);

    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);

    image.crossOrigin = "anonymous";
    image.src = src;

    setTimeout(() => resolve(null), 8000);
  });

export default function ParticipantIdCanvas({
  participant,
  event,
  eventId,
  cardNumber,
}) {
  const canvasRef = useRef(null);
  const qrRef = useRef(null);

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
    getValue(participant, "College", "college") || "College not provided";

  const team =
    getValue(participant, "TeamName", "teamName") || "Individual";

  const userId = getValue(
    participant,
    "UserId",
    "userId",
    "Id",
    "id"
  );

  const eventName =
    getValue(event, "EventName", "eventName", "Name", "name") ||
    "HackHub Event";

  const theme =
    getValue(event, "PrimaryColor", "ThemeColor", "themeColor") ||
    "#102B59";

  const accent =
    getValue(event, "SecondaryColor", "AccentColor", "accentColor") ||
    "#FFD12F";

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

  const logo = getValue(
    event,
    "LogoImage",
    "logoImage",
    "LogoURL",
    "logoUrl"
  );

  const poster = getPosterUrl(event);

  const startDate = getValue(
    event,
    "StartDate",
    "startDate",
    "EventDate"
  );

  const venue =
    getValue(event, "Location", "location", "Venue", "venue") ||
    "Venue not provided";

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

    const drawCard = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = 638;
      canvas.height = 1013;

      const rounded = (x, y, width, height, radius, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, radius);
        ctx.fill();
      };

      const drawText = (
        value,
        x,
        y,
        font,
        color,
        maxWidth = 350
      ) => {
        ctx.font = font;
        ctx.fillStyle = color;

        let output = String(value || "Not provided");

        while (
          ctx.measureText(output).width > maxWidth &&
          output.length > 5
        ) {
          output = output.slice(0, -4) + "...";
        }

        ctx.fillText(output, x, y);
      };

      const containImage = (image, x, y, width, height) => {
        if (!image) return;

        const scale = Math.min(
          width / image.width,
          height / image.height
        );

        const drawWidth = image.width * scale;
        const drawHeight = image.height * scale;

        ctx.drawImage(
          image,
          x + (width - drawWidth) / 2,
          y + (height - drawHeight) / 2,
          drawWidth,
          drawHeight
        );
      };

      const coverImage = (image, x, y, width, height) => {
        if (!image) return;

        const scale = Math.max(
          width / image.width,
          height / image.height
        );

        const sourceWidth = width / scale;
        const sourceHeight = height / scale;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 12);
        ctx.clip();

        ctx.drawImage(
          image,
          (image.width - sourceWidth) / 2,
          (image.height - sourceHeight) / 2,
          sourceWidth,
          sourceHeight,
          x,
          y,
          width,
          height
        );

        ctx.restore();
      };

      const [photoImage, logoImage, posterImage] = await Promise.all([
        loadImage(photo),
        loadImage(logo),
        loadImage(poster),
      ]);

      if (cancelled) return;

      ctx.fillStyle = "#E8EDF5";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.shadowColor = "rgba(15, 23, 42, 0.2)";
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 10;
      rounded(12, 12, 614, 989, 30, "#FFFFFF");
      ctx.restore();

      coverImage(posterImage, 20, 20, 598, 330);
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(20, 20, 598, 330, 26);
      ctx.clip();
      const headerGradient = ctx.createLinearGradient(0, 20, 0, 350);
      headerGradient.addColorStop(0, "rgba(8, 15, 32, 0.50)");
      headerGradient.addColorStop(0.48, "rgba(8, 15, 32, 0.72)");
      headerGradient.addColorStop(1, "rgba(8, 15, 32, 0.96)");
      ctx.fillStyle = headerGradient;
      ctx.fillRect(20, 20, 598, 330);
      ctx.restore();

      if (!posterImage) {
        const fallbackGradient = ctx.createLinearGradient(20, 20, 618, 350);
        fallbackGradient.addColorStop(0, theme);
        fallbackGradient.addColorStop(1, "#101827");
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(20, 20, 598, 330, 26);
        ctx.clip();
        ctx.fillStyle = fallbackGradient;
        ctx.fillRect(20, 20, 598, 330);
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(565, 80, 155, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      rounded(42, 42, 72, 72, 18, "#FFFFFF");
      if (logoImage) {
        containImage(logoImage, 49, 49, 58, 58);
      } else {
        drawText(eventName.charAt(0), 65, 91, "bold 38px Arial", theme, 45);
      }
      drawText("OFFICIAL PARTICIPANT PASS", 42, 174, "bold 13px Arial", accent, 420);
      drawText(eventName, 42, 222, "bold 31px Arial", "#FFFFFF", 530);
      ctx.fillStyle = accent;
      ctx.fillRect(42, 243, 74, 5);
      drawText("PHYSICAL EVENT", 42, 276, "bold 12px Arial", "#FFFFFF", 200);
      rounded(42, 296, 164, 32, 16, accent);
      drawText("VERIFIED PARTICIPANT", 54, 317, "bold 10px Arial", theme, 145);

      drawText("PARTICIPANT PROFILE", 44, 390, "bold 11px Arial", "#748198", 250);
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.roundRect(42, 408, 210, 272, 18);
      ctx.fill();
      rounded(48, 414, 198, 260, 14, "#F1F5F9");

      if (photoImage) {
        coverImage(photoImage, 48, 414, 198, 260);
      } else {
        ctx.fillStyle = `${theme}18`;
        ctx.fillRect(48, 414, 198, 260);
        const initials = name
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part.charAt(0))
          .join("")
          .toUpperCase();
        ctx.textAlign = "center";
        ctx.font = "bold 64px Arial";
        ctx.fillStyle = theme;
        ctx.fillText(initials || "P", 147, 562);
        ctx.textAlign = "start";
      }

      const drawField = (label, value, y, fontSize = 18) => {
        drawText(label.toUpperCase(), 280, y, "bold 10px Arial", "#8490A3", 318);
        drawText(value, 280, y + 28, `bold ${fontSize}px Arial`, "#16243A", 318);
        ctx.strokeStyle = "#E5EAF1";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(280, y + 42);
        ctx.lineTo(594, y + 42);
        ctx.stroke();
      };

      drawField("Participant name", name, 430, 20);
      drawField("Team", team, 510, 18);
      drawField("College", college, 590, 15);

      const svg = qrRef.current?.querySelector("svg");

      if (svg) {
        const serialized = new XMLSerializer().serializeToString(svg);

        const qrImage = await loadImage(
          `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`
        );

        if (cancelled) return;

        rounded(42, 714, 158, 158, 16, "#E8EDF5");
        rounded(48, 720, 146, 146, 12, "#FFFFFF");

        if (qrImage) {
          ctx.drawImage(qrImage, 54, 726, 134, 134);
        }

        drawText(
          "SCAN FOR EVENT CHECK-IN",
          42,
          892,
          "bold 10px Arial",
          theme,
          170
        );
      }

      rounded(226, 714, 368, 158, 16, "#F5F7FA");
      drawText("PASS NUMBER", 248, 750, "bold 10px Arial", "#748198", 320);
      drawText(cardNumber || "Pending", 248, 781, "bold 20px Arial", theme, 320);
      ctx.fillStyle = accent;
      ctx.fillRect(248, 800, 52, 4);

      const formattedDate = startDate
        ? new Date(startDate).toLocaleDateString("en-IN")
        : "Date not provided";

      drawText("EVENT DATE", 248, 830, "bold 9px Arial", "#748198", 140);
      drawText(formattedDate, 248, 850, "bold 12px Arial", "#16243A", 140);
      drawText("VENUE", 414, 830, "bold 9px Arial", "#748198", 150);
      drawText(venue, 414, 850, "bold 12px Arial", "#16243A", 164);

      ctx.fillStyle = theme;
      ctx.beginPath();
      ctx.roundRect(20, 914, 598, 70, [0, 0, 26, 26]);
      ctx.fill();
      ctx.fillStyle = accent;
      ctx.fillRect(42, 914, 554, 3);
      drawText(eventName, 42, 949, "bold 13px Arial", "#FFFFFF", 340);
      drawText("LEARN  •  BUILD  •  CONNECT", 42, 970, "bold 9px Arial", accent, 320);
      if (logoImage) {
        containImage(logoImage, 540, 928, 48, 42);
      }
    };

    drawCard();

    return () => {
      cancelled = true;
    };
  }, [
    participant,
    event,
    eventId,
    cardNumber,
    name,
    college,
    team,
    photo,
    logo,
    poster,
    eventName,
    theme,
    accent,
    startDate,
    venue,
    userId,
  ]);

  const downloadCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const link = document.createElement("a");
      link.download = `${cardNumber || "participant-id"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      alert(
        "Unable to download the card. Check whether the image URLs allow canvas downloads."
      );
    }
  };

  return (
    <div className="w-full">
      <div ref={qrRef} className="hidden" aria-hidden="true">
        <QRCodeSVG
          value={verificationUrl}
          size={180}
          level="M"
        />
      </div>

      <canvas
        ref={canvasRef}
        aria-label={`ID card for ${name}`}
        className="mx-auto h-auto w-full max-w-[300px] rounded-xl border border-slate-200 shadow-md"
      />

      <button
        type="button"
        onClick={downloadCard}
        className="mt-3 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-700"
      >
        Download ID Card
      </button>
    </div>
  );
}
