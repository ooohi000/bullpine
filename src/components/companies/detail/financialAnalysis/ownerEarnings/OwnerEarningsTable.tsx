'use client';

import React from 'react';
import { StatementTable } from '@/components/common/StatementTable';
import { formatNumber } from '@/lib/utils/format';
import { OwnerEarningsItem } from '@/types/financialAnalysis';

const ROWS: {
  key: keyof OwnerEarningsItem;
  label: string;
  isNumber: boolean;
}[] = [
  { key: 'ownersEarnings', label: '주주잉여현금흐름', isNumber: true },
  {
    key: 'ownersEarningsPerShare',
    label: '주당 주주잉여현금흐름',
    isNumber: true,
  },
];

function periodLabel(item: OwnerEarningsItem): string {
  const year = Number(item.date.split('-')[0]);
  if (item.period?.includes('Q')) {
    const q = item.period.split('').reverse().join('').replace('Q', '분기');
    return `${year}년 ${q}`;
  }
  return `${year}년`;
}

interface OwnerEarningsTableProps {
  sortedData: OwnerEarningsItem[];
}

const OwnerEarningsTable = ({ sortedData }: OwnerEarningsTableProps) => {
  if (sortedData.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
        <p className="text-sm">오너이익 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <StatementTable.Root>
          <StatementTable.Table minWidth="min-w-[320px]">
            <StatementTable.Header>
              <StatementTable.Row>
                <StatementTable.Head variant="sticky-label">
                  항목
                </StatementTable.Head>
                {sortedData.map((item) => (
                  <StatementTable.Head
                    key={`${item.date}-${item.period}`}
                    variant="year"
                  >
                    {periodLabel(item)}
                  </StatementTable.Head>
                ))}
              </StatementTable.Row>
            </StatementTable.Header>
            <StatementTable.Body>
              {ROWS.map(({ key, label, isNumber }) => (
                <StatementTable.Row key={key}>
                  <StatementTable.Cell
                    variant="sticky-label"
                    className="!bg-muted"
                  >
                    {label}
                  </StatementTable.Cell>
                  {sortedData.map((item) => {
                    const value = item[key];
                    return (
                      <StatementTable.Cell
                        key={`${item.date}-${item.period}-${key}`}
                        variant="year"
                      >
                        {isNumber && typeof value === 'number'
                          ? formatNumber(value)
                          : value != null
                            ? String(value)
                            : '-'}
                      </StatementTable.Cell>
                    );
                  })}
                </StatementTable.Row>
              ))}
            </StatementTable.Body>
          </StatementTable.Table>
        </StatementTable.Root>
      </div>
    </div>
  );
};

export default OwnerEarningsTable;
