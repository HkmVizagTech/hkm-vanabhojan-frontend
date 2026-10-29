import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';

/**
 * Runs `fetcher(signal)` on mount and whenever `reload` is called.
 * Aborts in-flight requests on unmount so state is never set on a dead component.
 */
export function useAsyncData(fetcher, initialData = null, deps = []) {
  const [state, setState] = useState({ data: initialData, error: null, loading: true });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const controllerRef = useRef(null);

  const run = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetcherRef.current(controller.signal);
      if (!controller.signal.aborted) setState({ data, error: null, loading: false });
    } catch (error) {
      if (axios.isCancel(error) || controller.signal.aborted) return;
      setState(prev => ({ ...prev, error, loading: false }));
    }
  }, []);

  // `deps` (for example the selected event) restart the request when they change.
  const depsKey = JSON.stringify(deps);
  useEffect(() => {
    run();
    return () => controllerRef.current?.abort();
  }, [run, depsKey]);

  const setData = useCallback(
    updater =>
      setState(prev => ({
        ...prev,
        data: typeof updater === 'function' ? updater(prev.data) : updater,
      })),
    []
  );

  return { ...state, reload: run, setData };
}
