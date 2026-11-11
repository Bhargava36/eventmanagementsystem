// Calendar Utilities for Events, Webinars & Workshops Supports Google Calendar URL, Outlook Web URL, and RFC 5545 iCalendar (.ics) download.
function formatToIcsDate(dateStr) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  } catch {
    return '';
  }
}
export function buildGoogleCalendarUrl({ title, description, location, startDate, endDate }) {
  const start = formatToIcsDate(startDate);
  // Default to 2 hours after start if endDate not provided
  let end = formatToIcsDate(endDate);
  if (!end && start) {
    const d = new Date(startDate);
    d.setHours(d.getHours() + 2);
    end = formatToIcsDate(d);
  }
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title || 'Event',
    dates: `${start}/${end}`,
    details: description || '',
    location: location || 'Virtual Live Stream'
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
export function buildOutlookCalendarUrl({ title, description, location, startDate, endDate }) {
  const start = new Date(startDate).toISOString();
  let end = endDate ? new Date(endDate).toISOString() : new Date(new Date(startDate).getTime() + 2 * 3600000).toISOString();
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: title || 'Event',
    startdt: start,
    enddt: end,
    body: description || '',
    location: location || 'Virtual Live Stream'
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
export function downloadIcsFile({ title, description, location, startDate, endDate }) {
  const dtStamp = formatToIcsDate(new Date());
  const dtStart = formatToIcsDate(startDate);
  let dtEnd = formatToIcsDate(endDate);
  if (!dtEnd && dtStart) {
    const d = new Date(startDate);
    d.setHours(d.getHours() + 2);
    dtEnd = formatToIcsDate(d);
  }
  const cleanTitle = (title || 'Event').replace(/[\r\n]+/g, ' ');
  const cleanDesc = (description || '').replace(/[\r\n]+/g, '\\n');
  const cleanLoc = (location || 'Virtual Live Stream').replace(/[\r\n]+/g, ' ');
  const uid = `ems-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@eventmanagementsystem`;
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EMS//Webinar Event Management//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${cleanTitle}`,
    `DESCRIPTION:${cleanDesc}`,
    `LOCATION:${cleanLoc}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `${cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
