'use client';

import React, { useId, useRef } from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useEscapeKey } from '@/hooks/useEscapeKey';

export type SelectOption = { label: string; value: string };

interface SelectProps {
  selectedValue: SelectOption;
  onSelect: (value: SelectOption) => void;
  /** `as const` 폴백 배열 등 readonly 튜플도 허용 */
  options: ReadonlyArray<SelectOption>;
  /** 루트 컨테이너 (너비·그리드 셀 등) */
  className?: string;
}

const Select = ({
  selectedValue,
  onSelect,
  options,
  className = '',
}: SelectProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const { isOpen, toggle, close } = useDisclosure(false);
  const listboxId = `${useId()}-listbox`;

  useClickOutside(rootRef, close, isOpen);
  useEscapeKey(close, isOpen);

  const handleSelect = (option: SelectOption) => {
    onSelect(option);
    close();
  };

  return (
    <div ref={rootRef} className={`relative w-full min-w-0 ${className}`}>
      <button
        type="button"
        id={`${listboxId}-trigger`}
        className={`flex h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-xl border bg-card/80 px-3.5 text-left text-sm text-foreground shadow-sm outline-none ring-offset-background backdrop-blur-sm transition-[border-color,box-shadow,background-color] hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          isOpen
            ? 'border-primary/45 ring-2 ring-primary/20'
            : 'border-input'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        onClick={toggle}
      >
        <span className="min-w-0 flex-1 truncate">{selectedValue.label}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen ? (
        <ul
          id={listboxId}
          className="absolute left-0 top-full z-50 mt-1.5 max-h-[min(280px,55vh)] w-full overflow-y-auto overflow-x-hidden rounded-xl border-2 border-primary/35 bg-muted py-1.5 text-foreground shadow-[0_18px_40px_-12px_rgba(0,0,0,0.75)] ring-1 ring-white/10"
          role="listbox"
          aria-labelledby={`${listboxId}-trigger`}
        >
          {options.map((option) => {
            const selected = selectedValue.value === option.value;
            return (
              <li
                key={option.value || option.label}
                role="option"
                aria-selected={selected}
                onClick={() => handleSelect(option)}
                className={`cursor-pointer px-3.5 py-2.5 text-sm transition-colors ${
                  selected
                    ? 'bg-primary/25 font-medium text-foreground'
                    : 'text-foreground/90 hover:bg-primary/20 hover:text-foreground'
                }`}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
};

export default Select;
