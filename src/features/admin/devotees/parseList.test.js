import { parseDevoteeList } from './parseList';

describe('parseDevoteeList', () => {
  it('reads name and number in either order, skipping blanks and a header', () => {
    expect(parseDevoteeList('Name, Phone\nHari Das, 9876543210\n\n9123456780;Ram\n"Sita", "+91 98765 11111"')).toEqual([
      { name: 'Hari Das', phone: '9876543210' },
      { name: 'Ram', phone: '9123456780' },
      { name: 'Sita', phone: '+91 98765 11111' },
    ]);
  });
});
