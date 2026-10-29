import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { eventsApi } from '../services/events';
import { presentEvent } from '../utils/event';

/**
 * The edition the public site is about. Loaded once from the backend, so a new year only needs
 * a new event in the admin console. status: 'loading' | 'ready' | 'error'; event is null when none is set up.
 */
const CurrentEventContext = createContext({ event: null, status: 'loading' });

export function CurrentEventProvider({ children }) {
  const [state, setState] = useState({ event: null, status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    eventsApi
      .current(controller.signal)
      .then(api => setState({ event: presentEvent(api), status: 'ready' }))
      .catch(() => !controller.signal.aborted && setState({ event: null, status: 'error' }));
    return () => controller.abort();
  }, []);

  const value = useMemo(() => state, [state]);
  return <CurrentEventContext.Provider value={value}>{children}</CurrentEventContext.Provider>;
}

export const useCurrentEvent = () => useContext(CurrentEventContext);
