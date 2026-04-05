import { Info } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const TOOLTIP_ESTIMATE_HEIGHT = 220;

/** 지표 설명·계산식 툴팁 (아이콘 클릭 시 표시, 화면 아래면 위로 표시) */
const MetricInfo = ({
  description,
  formula,
}: {
  description: string;
  formula: string;
}) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const spaceBelow =
      typeof window !== 'undefined'
        ? window.innerHeight - rect.bottom
        : TOOLTIP_ESTIMATE_HEIGHT;
    const showAbove = spaceBelow < TOOLTIP_ESTIMATE_HEIGHT;
    setPosition({
      top: showAbove ? rect.top - TOOLTIP_ESTIMATE_HEIGHT : rect.top,
      left: rect.right + 8,
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
      <div ref={wrapRef} className="relative inline-flex ml-1 align-middle">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setOpen((v) => !v);
          }}
          className="inline-flex rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none"
          aria-label="지표 설명 및 계산 방법"
        >
          <Info className="h-4 w-4" />
        </button>
      </div>
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed z-[100] w-[320px] max-h-[280px] overflow-y-auto rounded-lg border border-border bg-card px-3 py-3 text-xs text-foreground shadow-lg"
            role="dialog"
            aria-label="지표 설명"
            style={{ top: position.top, left: position.left }}
          >
            <p className="font-medium text-foreground mb-1.5">설명</p>
            <p className="text-muted-foreground mb-3 leading-relaxed">
              {description}
            </p>
            <p className="font-medium text-foreground mb-1.5">계산</p>
            <p className="text-muted-foreground font-mono text-[11px] leading-relaxed break-words">
              {formula}
            </p>
          </div>,
          document.body,
        )}
    </>
  );
};

export default MetricInfo;
