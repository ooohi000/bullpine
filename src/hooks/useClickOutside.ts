import { RefObject, useEffect, useRef } from 'react';

/**
 * `ref` 바깥을 마우스/터치하면 `onOutside` 호출. 드롭다운 닫기 등에 사용.
 */
export function useClickOutside<E extends HTMLElement = HTMLElement>(
  ref: RefObject<E | null>,
  onOutside: () => void,
  enabled = true,
) {
  const saved = useRef(onOutside);
  saved.current = onOutside;

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const handle = (e: MouseEvent | TouchEvent) => {
      const target = e.target;
      if (!(target instanceof Node) || el.contains(target)) return;
      saved.current();
    };

    document.addEventListener('mousedown', handle);
    document.addEventListener('touchstart', handle);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('touchstart', handle);
    };
  }, [enabled, ref]);
}
