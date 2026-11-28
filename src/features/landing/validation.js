import { onlyDigits } from '../../utils/format';

export const initialValues = {
  serialNo: '',
  name: '',
  whatsappNumber: '',
  email: '',
  gender: '',
  collegeOrWorking: '',
  companyName: '',
  college: '',
  course: '',
  year: '',
  dob: '',
  area: '',
  familyMembers: [], // working professionals only: people covered by the same payment and QR
};

/** The payer plus up to this many more. */
export const MAX_FAMILY_MEMBERS = 9;

/** Number of people one payment covers. */
export const peopleCount = values => 1 + (values.collegeOrWorking === 'Working' ? values.familyMembers.length : 0);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns `{ field: message }`; an empty object means the form is valid. */
export function validateRegistration(values, { hasIdCard = true } = {}) {
  const e = {};
  const isCollege = values.collegeOrWorking === 'College';
  const isWorking = values.collegeOrWorking === 'Working';

  if (!values.name.trim()) e.name = 'Name is required';
  if (!values.dob) e.dob = 'Date of birth is required';

  if (!values.whatsappNumber.trim()) e.whatsappNumber = 'WhatsApp number is required';
  else if (!/^\d{10}$/.test(onlyDigits(values.whatsappNumber))) e.whatsappNumber = 'Enter a valid 10-digit number';

  if (!values.email) e.email = 'Email is required';
  else if (!EMAIL_RE.test(values.email)) e.email = 'Enter a valid email';

  if (!values.area.trim()) e.area = 'Area is required';

  if (!values.gender) e.gender = 'Please select gender';
  if (!values.collegeOrWorking) e.collegeOrWorking = 'Please select one option';

  if (isWorking && !values.companyName.trim()) e.companyName = 'Company name is required';

  if (isWorking && values.familyMembers.length) {
    const names = [values.name, ...values.familyMembers.map(m => m.name)].map(n => n.trim().toLowerCase());
    if (values.familyMembers.some(m => !m.name.trim())) e.familyMembers = 'Enter a name for every family member';
    else if (values.familyMembers.some(m => !m.gender)) e.familyMembers = 'Select gender for every family member';
    else if (new Set(names).size !== names.length) e.familyMembers = 'Each person needs a different name';
  }

  if (isCollege) {
    if (!values.college.trim()) e.college = 'College name is required';
    if (!values.course.trim()) e.course = 'Course is required';
    if (!values.year) e.year = 'Year is required';
    if (!hasIdCard) e.studentIdCard = 'Please upload your student ID card';
  }
  return e;
}

/** Field order on screen, used to focus the first invalid field. */
export const FIELD_ORDER = [
  'name', 'dob', 'whatsappNumber', 'email', 'area', 'gender', 'collegeOrWorking',
  'companyName', 'familyMembers', 'college', 'course', 'year', 'studentIdCard',
];

/** Fee in rupees for a candidate type in the given (presented) event, or null when not chosen yet. */
export const feeFor = (event, category) => event?.fees?.[category]?.amount ?? null;

/** Shape the backend expects (trimmed, digits-only phone). */
export function buildPayload(values) {
  return {
    ...values,
    name: values.name.trim(),
    whatsappNumber: onlyDigits(values.whatsappNumber),
    college: values.college.trim(),
    area: values.area.trim(),
    familyMembers: values.collegeOrWorking === 'Working' ? values.familyMembers.map(m => ({ name: m.name.trim(), gender: m.gender })) : [],
  };
}
