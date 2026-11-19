import { useCallback, useEffect, useState } from 'react';

export const MAX_COMPARE = 3;
const KEY = 'si_wallet_compare';

function read(validIds: Set<string>): string[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string' && validIds.has(id)).slice(0, MAX_COMPARE);
  } catch {
    return [];
  }
}

/** Compare selection (max 3), remembered for the browser session so it survives opening a detail page. */
export function useCompareSelection(validIds: string[]) {
  const [ids, setIds] = useState<string[]>(() => read(new Set(validIds)));

  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
      // Storage can be unavailable (private mode); selection still works for this page view.
    }
  }, [ids]);

  const toggle = useCallback((id: string) => {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= MAX_COMPARE ? prev : [...prev, id]));
  }, []);

  const remove = useCallback((id: string) => setIds((prev) => prev.filter((x) => x !== id)), []);
  const clear = useCallback(() => setIds([]), []);

  return { ids, toggle, remove, clear, isFull: ids.length >= MAX_COMPARE };
}
