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

export function normalizeHackathonMode(mode, location = '') {
  const normalized = String(mode || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');

  if (
    normalized === 'both' ||
    normalized === 'hybrid' ||
    normalized === 'virtual and physical' ||
    normalized === 'physical and virtual' ||
    normalized === 'virtual & physical' ||
    normalized === 'physical & virtual'
  ) {
    return 'both';
  }

  if (normalized === 'virtual' || normalized === 'online') {
    return 'virtual';
  }

  if (
    normalized === 'physical' ||
    normalized === 'offline' ||
    normalized === 'in person' ||
    normalized === 'in-person' ||
    normalized === 'on campus' ||
    normalized === 'on-campus'
  ) {
    return 'physical';
  }

  const loc = String(location || '').trim().toLowerCase();
  if (loc.includes('virtual') || loc.includes('online') || loc.includes('zoom') || loc.includes('meet')) {
    return 'virtual';
  }

  // Never default to 'both'
  return 'physical';
}

export function getTrackVisibility(mode, location = '', eventType = '') {
  if (String(eventType || '').toLowerCase().includes('webinar')) {
    return {
      mode: 'virtual',
      isBoth: false,
      isVirtual: true,
      isPhysical: false,
      showVirtual: true,
      showPhysical: false,
    };
  }

  const normalized = normalizeHackathonMode(mode, location);
  const isBoth = normalized === 'both';
  const isVirtual = normalized === 'virtual';
  const isPhysical = normalized === 'physical';

  return {
    mode: normalized,
    isBoth,
    isVirtual,
    isPhysical,
    showVirtual: isBoth || isVirtual,
    showPhysical: isBoth || isPhysical,
  };
}

export function isSoloTeamSize(teamSize) {
  if (!teamSize) return false;
  const str = String(teamSize).trim().toLowerCase();
  if (
    str === '1' ||
    str === 'solo' ||
    str === 'individual' ||
    str === '1 member' ||
    str === '1-1' ||
    str === 'single'
  ) {
    return true;
  }
  // Check if exactly starts with 1 and no range
  if (/^1\b(?!\s*[-to])/.test(str)) {
    return true;
  }
  return false;
}

export function parseTeamSizeOptions(rawTeamSize) {
  if (!rawTeamSize) return [2, 3, 4];
  const str = String(rawTeamSize).trim().toLowerCase();

  // If Individual / Solo
  if (isSoloTeamSize(str)) {
    return [1];
  }

  // Check for range e.g. "2-4", "2 - 4", "2 to 4", "2 - 4 members"
  const rangeMatch = str.match(/(\d+)\s*(?:-|to)\s*(\d+)/);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10);
    const max = parseInt(rangeMatch[2], 10);
    if (!isNaN(min) && !isNaN(max) && min <= max && min > 0) {
      return Array.from({ length: max - min + 1 }, (_, i) => min + i);
    }
  }

  // Check for exact single number e.g. "4", "4 members", "4 per team"
  const singleMatch = str.match(/\b(\d+)\b/);
  if (singleMatch) {
    const num = parseInt(singleMatch[1], 10);
    if (!isNaN(num) && num > 0) {
      return [num];
    }
  }

  return [2, 3, 4];
}

export function getEventTypeInfo(eventType = '') {
  const t = String(eventType || '').trim().toLowerCase();
  const isWorkshop = t.includes('workshop') || t.includes('bootcamp');
  const isWebinar = t.includes('webinar');
  const isSeminar = (t.includes('seminar') || t.includes('conference') || t.includes('talk')) && !isWebinar && !t.includes('alumni');
  const isAlumni = t.includes('alumni') || t.includes('reunion');
  const isCodingContest = t.includes('coding') || t.includes('contest') || t.includes('competitive') || t.includes('challenge');
  const isTechFest = t.includes('fest') || t.includes('symposium');
  const isHackathon = !isWorkshop && !isSeminar && !isCodingContest && !isTechFest && !isWebinar && !isAlumni;

  let label = 'Event';
  let badgeColor = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
  let participantTerm = 'Participants & Teams';
  let singleParticipantTerm = 'Participant';
  let agendaTerm = 'Event Schedule & Timelines';
  let submissionTerm = 'Project Submission';
  let prizeTerm = 'Prize Pool & Rewards';

  if (isWebinar) {
    label = 'Webinar';
    badgeColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    participantTerm = 'Registered Delegates';
    singleParticipantTerm = 'Delegate';
    agendaTerm = 'Keynote Agenda & Schedule';
    submissionTerm = 'Keynote Resources & Replays';
    prizeTerm = 'Delegate Certification & Access';
  } else if (isWorkshop) {
    label = 'Workshop';
    participantTerm = 'Registered Attendees';
    singleParticipantTerm = 'Attendee';
    agendaTerm = 'Session Agenda & Hands-on Topics';
    submissionTerm = 'Coursework & Exercises';
    prizeTerm = 'Perks, Certification & Swag';
  } else if (isSeminar) {
    label = 'Seminar / Conference';
    participantTerm = 'Registered Delegates';
    singleParticipantTerm = 'Delegate';
    agendaTerm = 'Keynote Speakers & Talk Schedule';
    submissionTerm = 'Paper / Presentation Upload';
    prizeTerm = 'Keynote Honor & Certificates';
  } else if (isAlumni) {
    label = 'Alumni Meet';
    badgeColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    participantTerm = 'Registered Alumni';
    singleParticipantTerm = 'Alumnus';
    agendaTerm = 'Reunion Agenda & Activities';
    submissionTerm = 'Memories & Wall of Fame';
    prizeTerm = 'Felicitations & Mementos';
  } else if (isCodingContest) {
    label = 'Coding Contest';
    participantTerm = 'Contestants & Teams';
    singleParticipantTerm = 'Contestant';
    agendaTerm = 'Contest Rounds & Time Limits';
    submissionTerm = 'Code Submission';
    prizeTerm = 'Prize Pool & Bounties';
  } else if (isTechFest) {
    label = 'Tech Fest';
    participantTerm = 'Participants & Teams';
    singleParticipantTerm = 'Participant';
    agendaTerm = 'Fest Schedule & Competitions';
    submissionTerm = 'Competition Entries';
    prizeTerm = 'Trophies, Cash & Rewards';
  } else {
    label = 'Hackathon';
    participantTerm = 'Hacking Teams';
    singleParticipantTerm = 'Hacker';
    agendaTerm = 'Sprint Roadmap & Milestones';
    submissionTerm = 'Project Submission';
    prizeTerm = 'Prize Money & Rewards';
  }

  return {
    type: eventType || 'Hackathon',
    label,
    badgeColor,
    participantTerm,
    singleParticipantTerm,
    agendaTerm,
    submissionTerm,
    prizeTerm,
    isWebinar,
    isWorkshop,
    isSeminar,
    isCodingContest,
    isTechFest,
    isAlumni,
    isHackathon,
  };
}

/**
 * Validates the chronological sequence of event dates:
 * 1. Registration Start Date <= Registration Closing Date (From <= To)
 * 2. Registration Closing Date <= Event Start Date (Registrations close on or before event starts)
 * 3. Event Start Date <= Event End Date (From <= To)
 */
export function validateEventDates({
  registrationStart,
  registrationEnd,
  eventStart,
  eventEnd,
  trackName = ''
}) {
  const prefix = trackName ? `[${trackName}] ` : '';

  const toTimestamp = (val) => {
    if (!val) return 0;
    if (typeof val === 'string') {
      const datePart = val.split('T')[0];
      const parts = datePart.split('-');
      if (parts.length === 3) {
        const y = Number(parts[0]);
        const m = Number(parts[1]);
        const d = Number(parts[2]);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          return new Date(y, m - 1, d).getTime();
        }
      }
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? 0 : new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  };

  const regS = toTimestamp(registrationStart);
  const regE = toTimestamp(registrationEnd);
  const evS = toTimestamp(eventStart);
  const evE = toTimestamp(eventEnd);

  if (regS && regE && regS > regE) {
    return `${prefix}Registration Start Date (From) must be before or on Registration Closing Date (To).`;
  }

  if (evS && evE && evS > evE) {
    return `${prefix}Event Start Date (From) must be before or on Event End Date (To).`;
  }

  if (regE && evS && regE > evS) {
    return `${prefix}Registration Closing Date must be on or before Event Start Date (Registrations must close before the event starts).`;
  }

  if (regS && evS && regS > evS) {
    return `${prefix}Registration Start Date must be before Event Start Date.`;
  }

  return null;
}


