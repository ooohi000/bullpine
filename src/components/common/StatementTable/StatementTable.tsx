'use client';

import React from 'react';

const STICKY_SHADOW = 'shadow-[4px_0_8px_-2px_rgba(0,0,0,0.3)]';
const STICKY_PRIMARY_INSET =
  'shadow-[inset_4px_0_0_0_hsl(var(--primary)),4px_0_8px_-2px_rgba(0,0,0,0.3)]';

// --- Root (table wrapper)
interface RootProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Root = ({ children, className, ...props }: RootProps) => (
  <div className={`overflow-x-auto ${className ?? ''}`} {...props}>
    {children}
  </div>
);

// --- Table
interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
  className?: string;
  minWidth?: string;
}

const Table = ({
  children,
  className,
  minWidth = 'min-w-[320px]',
  ...props
}: TableProps) => (
  <table
    className={`w-full border-collapse text-sm ${minWidth} ${className ?? ''}`}
    {...props}
  >
    {children}
  </table>
);

// --- Header
interface HeaderProps {
  children: React.ReactNode;
  className?: string;
}

const Header = ({ children, className }: HeaderProps) => (
  <thead className={`border-b border-border bg-muted ${className ?? ''}`}>
    {children}
  </thead>
);

// --- Body
interface BodyProps {
  children: React.ReactNode;
  className?: string;
}

const Body = ({ children, className }: BodyProps) => (
  <tbody className={`bg-card ${className ?? ''}`}>{children}</tbody>
);

// --- Row
interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  className?: string;
  /** 총계/결과 행 배경 */
  isTotal?: boolean;
  /** 섹션 라벨 행 (유동자산 등) - 배경만 다름 */
  isSectionLabel?: boolean;
}

const Row = ({
  children,
  className,
  isTotal,
  isSectionLabel,
  ...props
}: RowProps) => {
  const base = 'border-b border-border/60 transition-colors hover:bg-muted/10';
  const variant = isSectionLabel
    ? 'border-b border-border bg-muted'
    : isTotal
    ? 'bg-muted/20'
    : '';
  return (
    <tr className={`${base} ${variant} ${className ?? ''}`} {...props}>
      {children}
    </tr>
  );
};

// --- Head
type HeadVariant = 'sticky-label' | 'year' | 'chart';

interface HeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
  className?: string;
  variant?: HeadVariant;
}

const Head = ({
  children,
  className,
  variant = 'year',
  ...props
}: HeadProps) => {
  const base = 'font-semibold text-foreground text-sm';
  const variants: Record<HeadVariant, string> = {
    'sticky-label': `sticky left-0 z-30 min-w-[120px] bg-muted px-3 py-2.5 text-left ${STICKY_SHADOW}`,
    year: 'min-w-[90px] px-4 py-2.5 text-right',
    chart: 'w-[200px] min-w-[180px] px-2 py-2.5 text-center',
  };
  return (
    <th
      className={`${base} ${variants[variant]} ${className ?? ''}`}
      {...props}
    >
      {children}
    </th>
  );
};

// --- Cell
type CellVariant =
  | 'sticky-label'
  | 'year'
  | 'chart'
  | 'section-label'
  | 'empty';

interface CellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
  className?: string;
  variant?: CellVariant;
  /** sticky-label / year 셀에서 총계 행 스타일 */
  isTotal?: boolean;
  /** year 셀에서 전년 대비 변동률 (%) */
  yoyPercent?: number | null;
}

const Cell = ({
  children,
  className,
  variant = 'year',
  isTotal,
  yoyPercent,
  ...props
}: CellProps) => {
  const base = 'text-sm';

  const variants: Record<CellVariant, string> = {
    'sticky-label': `sticky left-0 z-30 w-[120px] px-3 py-2.5 pl-4 ${STICKY_SHADOW} ${
      isTotal
        ? `bg-primary-tint font-semibold text-foreground ${STICKY_PRIMARY_INSET}`
        : 'bg-card text-muted-foreground'
    }`,
    year: `min-w-[90px] px-4 py-2 text-right tabular-nums align-top ${
      isTotal ? 'font-semibold text-foreground' : 'text-foreground'
    }`,
    chart: 'px-2 py-1 align-middle w-[200px] min-w-[180px]',
    'section-label': `sticky left-0 z-30  w-[120px] bg-muted px-3 py-2 pl-3 font-semibold text-foreground ${STICKY_SHADOW}`,
    empty: 'min-w-[90px] bg-muted px-4 py-2 aria-hidden',
  };

  const showYoy = variant === 'year' && yoyPercent !== undefined;
  const content = showYoy ? (
    <div className="flex flex-col items-end gap-1.5 py-2">
      <span className="leading-tight">{children}</span>
      <span
        className={`min-h-[14px] text-xs leading-tight font-medium ${
          yoyPercent != null
            ? yoyPercent > 0
              ? 'text-chart-up'
              : yoyPercent < 0
              ? 'text-chart-down'
              : 'text-muted-foreground'
            : 'text-muted-foreground'
        }`}
      >
        {yoyPercent != null ? (
          <>
            {yoyPercent > 0 ? '+' : ''}
            {yoyPercent.toFixed(1)}%
          </>
        ) : (
          '—'
        )}
      </span>
    </div>
  ) : (
    children
  );

  return (
    <td
      className={`${base} ${variants[variant]} ${className ?? ''}`}
      {...props}
    >
      {content}
    </td>
  );
};

// --- Export compound component
export const StatementTable = {
  Root,
  Table,
  Header,
  Body,
  Row,
  Head,
  Cell,
};
