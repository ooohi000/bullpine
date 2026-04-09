'use client';

import React from 'react';
import { StatementTable } from '@/components/common/StatementTable';
import { formatNumber } from '@/lib/utils/format';
import { OwnerEarningsItem } from '@/types/financialAnalysis';
import { PeriodType } from '@/types';

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
  const [year, month] = item.date.split('-');
  return `${year}년 ${month.padStart(2, '0')}월`;
}

interface OwnerEarningsTableProps {
  sortedData: OwnerEarningsItem[];
  exchangeRate: number | null;
}

const OwnerEarningsTable = ({
  sortedData,
  exchangeRate,
}: OwnerEarningsTableProps) => {
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
                    className="!min-w-[200px] !w-[200px] py-4"
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
                    className="!min-w-[160px] !w-[160px] !bg-muted !text-foreground/90"
                  >
                    {label}
                  </StatementTable.Cell>
                  {sortedData.map((item) => {
                    const value = item[key];
                    return (
                      <StatementTable.Cell
                        key={`${item.date}-${item.period}-${key}`}
                        variant="year"
                        className="!min-w-[200px] !w-[200px] py-4"
                      >
                        {isNumber
                          ? label === '주주잉여현금흐름'
                            ? exchangeRate
                              ? `${formatNumber(Math.round(Number(value) * exchangeRate))} 원`
                              : `${formatNumber(value as number)} 달러`
                            : formatNumber(value as number)
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
