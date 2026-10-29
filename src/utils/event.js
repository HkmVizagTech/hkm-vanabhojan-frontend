const ORDINAL = n => (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th'));

/** "Sunday, 8th November 2026". Event dates are calendar days stored at UTC midnight, so format in UTC. */
export function formatEventDate(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const weekday = d.toLocaleDateString('en-IN', { weekday: 'long', timeZone: 'UTC' });
  const month = d.toLocaleDateString('en-IN', { month: 'long', timeZone: 'UTC' });
  const day = d.getUTCDate();
  return `${weekday}, ${day}${ORDINAL(day)} ${month} ${d.getUTCFullYear()}`;
}

export const toDateInput = date => (date ? new Date(date).toISOString().slice(0, 10) : '');

const mapsLink = venue =>
  venue.mapsUrl ||
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([venue.name, venue.address].filter(Boolean).join(' '))}`;

/** API event -> the shape the pages render (labels, per-type fee info, age label). */
export function presentEvent(api) {
  if (!api) return null;
  const dateISO = toDateInput(api.date);
  return {
    id: api.id,
    name: api.name,
    title: api.name,
    year: dateISO.slice(0, 4),
    dateISO,
    dateLabel: formatEventDate(api.date),
    registrationOpen: Boolean(api.registrationOpen),
    venue: {
      name: api.venue?.name || '',
      address: api.venue?.address || '',
      short: api.venue?.name || '',
      mapsUrl: mapsLink(api.venue || {}),
    },
    ageLimit: { min: api.ageMin, max: api.ageMax, label: `${api.ageMin} - ${api.ageMax} years` },
    fees: {
      College: { amount: api.fees.college, label: 'Student Rate', hint: 'College student' },
      Working: { amount: api.fees.working, label: 'Professional Rate', hint: 'Others' },
    },
  };
}
