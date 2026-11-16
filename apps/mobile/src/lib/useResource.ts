import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react';

import { isApiError, messageOf } from '@/api/client';

export interface Resource<T> {
  data: T | null;
  /** Error from the latest attempt. Previous data is kept so screens can show stale content. */
  error: string | null;
  /** True during the first load (no data yet). */
  loading: boolean;
  /** True during a pull-to-refresh. */
  refreshing: boolean;
  /** Full reload with the loading state. */
  reload: () => void;
  /** Pull-to-refresh handler. */
  refresh: () => void;
}

interface Options {
  /** Silently re-fetch whenever the screen regains focus (e.g. after returning from a purchase). */
  refetchOnFocus?: boolean;
}

/**
 * Loads async data with cancellation, stale-response protection and pull-to-refresh.
 * `loader` is re-run whenever `deps` change.
 */
export function useResource<T>(
  loader: (signal: AbortSignal) => Promise<T>,
  deps: DependencyList,
  { refetchOnFocus = false }: Options = {},
): Resource<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loaderRef = useRef(loader);
  // Keep the latest loader without re-running the effect below whenever its identity changes.
  useEffect(() => {
    loaderRef.current = loader;
  });
  const latest = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);

  const run = useCallback(async (mode: 'initial' | 'refresh' | 'silent') => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const id = ++latest.current;

    if (mode === 'initial') {
      setLoading(true);
      setError(null);
    } else if (mode === 'refresh') {
      setRefreshing(true);
    }

    try {
      const result = await loaderRef.current(controller.signal);
      if (id !== latest.current) return;
      setData(result);
      setError(null);
    } catch (e) {
      if (id !== latest.current) return;
      if (isApiError(e) && e.code === 'CANCELLED') return;
      setError(messageOf(e));
    } finally {
      if (id === latest.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    // Fetch-on-mount / on dependency change: resetting the loading state here is intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void run('initial');
    return () => {
      latest.current += 1;
      controllerRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const mounted = useRef(false);
  useFocusEffect(
    useCallback(() => {
      // The first focus coincides with the initial load above.
      if (mounted.current && refetchOnFocus) void run('silent');
      mounted.current = true;
    }, [refetchOnFocus, run]),
  );

  const reload = useCallback(() => void run('initial'), [run]);
  const refresh = useCallback(() => void run('refresh'), [run]);

  return { data, error, loading, refreshing, reload, refresh };
}
