import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

const InfoWithTooltip = ({ text }: { text: string }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    setPosition({
      top: rect.top,
      left: rect.right + 6,
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (wrapRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);

  return (
    <>
      <div
        ref={wrapRef}
        className="relative inline-flex align-middle"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setOpen((v) => !v);
          }}
          className="inline-flex rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none"
          aria-label="설명 보기"
        >
          <Info className="h-4 w-4" />
        </button>
      </div>
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed z-[100] min-w-[240px] max-w-[320px] rounded-md border border-border bg-foreground px-3 py-2 text-xs text-muted shadow-md"
            role="tooltip"
            style={{ top: position.top, left: position.left }}
          >
            {text}
          </div>,
          document.body,
        )}
    </>
  );
};

export default InfoWithTooltip;
