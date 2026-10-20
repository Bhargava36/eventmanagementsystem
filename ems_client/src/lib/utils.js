import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function getEventTheme(event = {}, isDark = false) {
  const primary = event?.PrimaryColor || '#10B981';
  const secondary = event?.SecondaryColor || primary;
  const tertiary = event?.TertiaryColor || secondary;

  let c = String(primary).replace('#', '').trim();
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const num = parseInt(c, 16);
  let h = 160, s = 80, l = 50;

  if (!isNaN(num) && c.length === 6) {
    let r = ((num >> 16) & 255) / 255;
    let g = ((num >> 8) & 255) / 255;
    let b = (num & 255) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
  }

  if (isDark) {
    const sat = Math.max(s, 75);
    const brightText = `hsl(${h}, ${sat}%, 72%)`;
    const vibrantBorder = `hsl(${h}, ${Math.max(sat, 80)}%, 58%)`;
    const solidButtonBg = `hsl(${h}, ${Math.max(sat, 75)}%, 48%)`;
    const solidButtonHover = `hsl(${h}, ${Math.max(sat, 75)}%, 42%)`;
    return {
      primary: solidButtonBg,
      secondary,
      tertiary,
      accent: brightText,
      border: vibrantBorder,
      buttonBg: solidButtonBg,
      buttonHoverBg: solidButtonHover,
      buttonText: '#FFFFFF',
      badgeBg: `hsla(${h}, ${sat}%, 50%, 0.18)`,
      badgeBorder: `hsla(${h}, ${sat}%, 65%, 0.4)`,
      badgeText: `hsl(${h}, ${sat}%, 82%)`,
      iconBg: `hsla(${h}, ${sat}%, 50%, 0.16)`,
      iconColor: brightText,
      subtleBg: `hsla(${h}, ${sat}%, 50%, 0.10)`,
      accentBorder: vibrantBorder,
      cardBorder: vibrantBorder,
      glow: `hsla(${h}, ${sat}%, 55%, 0.25)`,
      statNumberColor: brightText,
      registeredBg: `hsla(${h}, ${sat}%, 50%, 0.18)`,
      registeredBorder: `hsla(${h}, ${sat}%, 65%, 0.45)`,
      registeredText: `hsl(${h}, ${sat}%, 82%)`,
    };
  }

  const deepColor = `hsl(${h}, ${Math.max(s, 65)}%, 36%)`;
  const solidButtonBg = `hsl(${h}, ${Math.max(s, 70)}%, 40%)`;
  const solidButtonHover = `hsl(${h}, ${Math.max(s, 70)}%, 34%)`;
  return {
    primary: solidButtonBg,
    secondary,
    tertiary,
    accent: deepColor,
    border: primary,
    buttonBg: solidButtonBg,
    buttonHoverBg: solidButtonHover,
    buttonText: '#FFFFFF',
    badgeBg: `hsla(${h}, ${s}%, 50%, 0.10)`,
    badgeBorder: `hsla(${h}, ${s}%, 45%, 0.30)`,
    badgeText: deepColor,
    iconBg: `hsla(${h}, ${s}%, 50%, 0.10)`,
    iconColor: deepColor,
    subtleBg: `hsla(${h}, ${s}%, 50%, 0.06)`,
    accentBorder: `hsla(${h}, ${s}%, 45%, 0.40)`,
    cardBorder: `hsla(${h}, ${s}%, 45%, 0.35)`,
    glow: `hsla(${h}, ${s}%, 50%, 0.15)`,
    statNumberColor: deepColor,
    registeredBg: `hsla(${h}, ${s}%, 50%, 0.12)`,
    registeredBorder: `hsla(${h}, ${s}%, 45%, 0.35)`,
    registeredText: deepColor,
  };
}
