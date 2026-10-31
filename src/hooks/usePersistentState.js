import { useEffect, useState } from 'react';

const resolve = (initial) => (typeof initial === 'function' ? initial() : initial);

/**
 * useState backed by localStorage. Also listens to the `storage` event so
 * separate tabs (e.g. guest menu and staff dashboard) stay in sync live.
 */
export function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : resolve(initial);
    } catch {
      return resolve(initial);
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable (private mode / quota) — keep in-memory state */
    }
  }, [key, value]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== key || e.newValue === null) return;
      try {
        setValue(JSON.parse(e.newValue));
      } catch {
        /* ignore malformed payloads */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);

  return [value, setValue];
}
