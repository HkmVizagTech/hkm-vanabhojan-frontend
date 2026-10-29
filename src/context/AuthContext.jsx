import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { authApi } from '../services/auth';
import { setUnauthorizedHandler } from '../services/http';
import { session } from '../utils/session';

/**
 * status: 'anonymous' | 'unverified' (token found, not yet checked) | 'checking' | 'authenticated'
 * Verification is lazy: public pages never hit the validate-token endpoint.
 */
const AuthContext = createContext(null);

const initialState = () => {
  const token = session.getToken();
  const role = session.getRole();
  return token && role
    ? { status: 'unverified', role, userId: null, isSuperAdmin: false, canCollectCash: false }
    : { status: 'anonymous', role: null, userId: null, isSuperAdmin: false, canCollectCash: false };
};

export function AuthProvider({ children }) {
  const [state, setState] = useState(initialState);
  const inFlight = useRef(false);

  const logout = useCallback(() => {
    session.clear();
    setState({ status: 'anonymous', role: null, userId: null, isSuperAdmin: false, canCollectCash: false });
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const verify = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setState(prev => ({ ...prev, status: 'checking' }));
    try {
      const data = await authApi.validateToken();
      const { role, id, isSuperAdmin, canCollectCash } = data.user;
      session.saveRole(role);
      setState({ status: 'authenticated', role, userId: id, isSuperAdmin: Boolean(isSuperAdmin), canCollectCash: Boolean(canCollectCash) });
    } catch {
      logout();
    } finally {
      inFlight.current = false;
    }
  }, [logout]);

  const login = useCallback(async credentials => {
    const data = await authApi.login(credentials);
    session.save({ token: data.token, role: data.role });
    setState({ status: 'authenticated', role: data.role, userId: data.id, isSuperAdmin: Boolean(data.isSuperAdmin), canCollectCash: Boolean(data.canCollectCash) });
    return data.role;
  }, []);

  const value = useMemo(() => ({ ...state, login, logout, verify }), [state, login, logout, verify]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

/** Where each role lands after signing in. */
export const homeForRole = role => {
  if (role === 'admin') return '/admin';
  if (role === 'user') return '/admin/AdminAttendanceScannedList';
  return '/';
};
