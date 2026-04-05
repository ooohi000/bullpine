'use client';

import type { PeriodType } from '@/types';

const PERIOD_OPTIONS: { value: PeriodType; label: string }[] = [
  { value: 'FY', label: '년도별' },
  { value: 'Q', label: '분기별' },
];

interface PeriodToggleProps {
  value: PeriodType;
  onChange: (value: PeriodType) => void;
}

const PeriodToggle = ({ value, onChange }: PeriodToggleProps) => (
  <div className="flex items-center gap-2">
    {PERIOD_OPTIONS.map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          value === opt.value
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

export default PeriodToggle;
