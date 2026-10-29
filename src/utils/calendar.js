import { EVENT } from '../config/event';

const compact = iso => iso.replaceAll('-', '');

const nextDay = iso => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};

/** All-day .ics for the festival (timings are not published, so none are invented). */
export const buildEventIcs = event =>
  [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Vanabhojanam//Youth Festival//EN',
    'BEGIN:VEVENT',
    `UID:vanabhojanam-${event.dateISO}@harekrishnavizag.org`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART;VALUE=DATE:${compact(event.dateISO)}`,
    `DTEND;VALUE=DATE:${compact(nextDay(event.dateISO))}`,
    `SUMMARY:${event.title}`,
    `LOCATION:${event.venue.name}\\, ${event.venue.address}`,
    `DESCRIPTION:${EVENT.tagline}. Organised by ${EVENT.organiser}.`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

export const downloadEventIcs = event => {
  const blob = new Blob([buildEventIcs(event)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vanabhojanam.ics';
  a.click();
  URL.revokeObjectURL(url);
};
