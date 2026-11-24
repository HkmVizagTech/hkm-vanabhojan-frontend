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
    ? { status: 'unverified', role, userId: null, name: '', isSuperAdmin: false, canCollectCash: false, canScan: false, kind: null }
    : { status: 'anonymous', role: null, userId: null, name: '', isSuperAdmin: false, canCollectCash: false, canScan: false, kind: null };
};

export function AuthProvider({ children }) {
  const [state, setState] = useState(initialState);
  const inFlight = useRef(false);

  const logout = useCallback(() => {
    session.clear();
    setState({ status: 'anonymous', role: null, userId: null, name: '', isSuperAdmin: false, canCollectCash: false, canScan: false, kind: null });
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
      const { role, id, name, isSuperAdmin, canCollectCash, canScan, kind } = data.user;
      session.saveRole(role);
      setState({ status: 'authenticated', role, userId: id, name, isSuperAdmin: Boolean(isSuperAdmin), canCollectCash: Boolean(canCollectCash), canScan: Boolean(canScan), kind: kind || 'staff' });
    } catch {
      logout();
    } finally {
      inFlight.current = false;
    }
  }, [logout]);

  const login = useCallback(async credentials => {
    const data = await authApi.login(credentials);
    session.save({ token: data.token, role: data.role });
    setState({ status: 'authenticated', role: data.role, userId: data.id, name: data.name, isSuperAdmin: Boolean(data.isSuperAdmin), canCollectCash: Boolean(data.canCollectCash), canScan: Boolean(data.canScan), kind: 'staff' });
    return data.role;
  }, []);

  // Devotees sign in with a WhatsApp code instead of a password; the server answers with the same token shape.
  const loginWithToken = useCallback(data => {
    session.save({ token: data.token, role: data.role });
    setState({ status: 'authenticated', role: data.role, userId: data.id, name: data.name, isSuperAdmin: false, canCollectCash: false, canScan: false, kind: null });
  }, []);

  const value = useMemo(() => ({ ...state, login, loginWithToken, logout, verify }), [state, login, loginWithToken, logout, verify]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

/** Where each role lands after signing in. */
export const homeForRole = role => {
  if (role === 'admin' || role === 'viewer') return '/admin';
  if (role === 'user') return '/admin/AdminAttendanceScannedList';
  return '/';
};
