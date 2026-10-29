import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { eventsApi } from '../services/events';
import { useAuth } from './AuthContext';

const KEY = 'adminEvent';
const read = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

/**
 * Admin-wide "which edition am I looking at". `selected` is an event id or 'all'.
 * Defaults to the current event; the choice is remembered between visits.
 */
const AdminEventContext = createContext(null);

export function AdminEventProvider({ children }) {
  const { status } = useAuth();
  const [events, setEvents] = useState([]);
  const [legacy, setLegacy] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelectedState] = useState(read);

  const refresh = useCallback(async () => {
    const { events: list, legacyRegistrations } = await eventsApi.list();
    setEvents(list);
    setLegacy(legacyRegistrations);
    setLoaded(true);
    return list;
  }, []);

  useEffect(() => {
    if (status !== 'authenticated') return;
    refresh().catch(() => setLoaded(true));
  }, [status, refresh]);

  const setSelected = useCallback(value => {
    setSelectedState(value);
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* private mode: the choice just isn't remembered */
    }
  }, []);

  const current = events.find(e => e.isCurrent) || null;
  // Fall back to the current event when nothing (or a deleted event) is selected.
  const valid = selected === 'all' || events.some(e => e._id === selected);
  const effective = valid && selected ? selected : current?._id || 'all';

  const value = useMemo(
    () => ({ events, legacy, loaded, current, selected: effective, setSelected, refresh }),
    [events, legacy, loaded, current, effective, setSelected, refresh]
  );
  return <AdminEventContext.Provider value={value}>{children}</AdminEventContext.Provider>;
}

export const useAdminEvent = () => {
  const ctx = useContext(AdminEventContext);
  if (!ctx) throw new Error('useAdminEvent must be used inside <AdminEventProvider>');
  return ctx;
};
