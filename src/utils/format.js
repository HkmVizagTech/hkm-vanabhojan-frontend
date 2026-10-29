const ORDINALS = { 1: 'st', 2: 'nd', 3: 'rd' };

export const ordinalYear = year => {
  if (!year) return '';
  return `${year}${ORDINALS[year] || 'th'} Year`;
};

export const formatDate = value => (value ? new Date(value).toLocaleDateString() : '');
export const formatDateTime = value => (value ? new Date(value).toLocaleString() : '');

export const onlyDigits = value => String(value ?? '').replace(/\D/g, '');

export const formatINR = value =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    Number(value) || 0
  );

/** Whole years between a YYYY-MM-DD birth date and `on`. */
export const ageOn = (dob, on = new Date()) => {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  let age = on.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    on.getMonth() < birth.getMonth() ||
    (on.getMonth() === birth.getMonth() && on.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return age;
};
