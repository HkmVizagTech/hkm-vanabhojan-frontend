import { buildPayload, feeFor, initialValues, validateRegistration } from './validation';

const valid = {
  ...initialValues,
  name: 'Arjun',
  dob: '2004-05-01',
  whatsappNumber: '9876543210',
  email: 'arjun@example.com',
  gender: 'Male',
  collegeOrWorking: 'College',
  college: 'AU College',
  course: 'B.Tech',
  year: '2',
  howDidYouKnow: 'Instagram Reel',
};

describe('validateRegistration', () => {
  it('accepts a complete student registration', () => {
    expect(validateRegistration(valid)).toEqual({});
  });

  it('flags every required field on an empty form', () => {
    const errors = validateRegistration(initialValues);
    expect(Object.keys(errors)).toEqual(
      expect.arrayContaining(['name', 'dob', 'whatsappNumber', 'email', 'gender', 'howDidYouKnow', 'collegeOrWorking'])
    );
  });

  it('requires a company for working professionals but not course/year', () => {
    const errors = validateRegistration({ ...valid, collegeOrWorking: 'Working', college: '', course: '', year: '' });
    expect(errors).toEqual({ companyName: 'Company name is required' });
  });

  it('requires a college for students, whether picked from the list or typed in', () => {
    expect(validateRegistration({ ...valid, college: '  ' }).college).toBe('College name is required');
    expect(validateRegistration({ ...valid, college: 'A College Not In The List' })).toEqual({});
  });

  it('rejects malformed phone numbers and emails', () => {
    const errors = validateRegistration({ ...valid, whatsappNumber: '12345', email: 'nope' });
    expect(errors.whatsappNumber).toMatch(/10-digit/);
    expect(errors.email).toMatch(/valid email/);
  });
});

describe('buildPayload', () => {
  it('trims the typed college and strips non-digits from the phone', () => {
    const payload = buildPayload({ ...valid, college: ' XYZ Institute ', whatsappNumber: '98765 43210' });
    expect(payload.college).toBe('XYZ Institute');
    expect(payload.whatsappNumber).toBe('9876543210');
  });
});

describe('feeFor', () => {
  const event = { fees: { College: { amount: 99 }, Working: { amount: 1200 } } };
  it('maps categories to the fee of the given event', () => {
    expect(feeFor(event, 'College')).toBe(99);
    expect(feeFor(event, 'Working')).toBe(1200);
    expect(feeFor(event, '')).toBeNull();
    expect(feeFor(null, 'College')).toBeNull();
  });
});
