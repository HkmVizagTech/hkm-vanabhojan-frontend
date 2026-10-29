const TOKEN_KEY = 'token';
const ROLE_KEY = 'role';

const safe = fn => {
  try {
    return fn();
  } catch {
    return null; // storage can be blocked (private mode, disabled cookies)
  }
};

export const session = {
  getToken: () => safe(() => localStorage.getItem(TOKEN_KEY)),
  getRole: () => safe(() => localStorage.getItem(ROLE_KEY)),
  save: ({ token, role }) =>
    safe(() => {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(ROLE_KEY, role);
    }),
  saveRole: role => safe(() => localStorage.setItem(ROLE_KEY, role)),
  clear: () =>
    safe(() => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ROLE_KEY);
    }),
};
