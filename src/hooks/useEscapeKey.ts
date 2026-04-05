import { useEffect, useRef } from 'react';

export function useEscapeKey(onEscape: () => void, enabled = true) {
  const saved = useRef(onEscape);
  saved.current = onEscape;

  useEffect(() => {
    if (!enabled) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') saved.current();
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [enabled]);
}
