'use client';

import React from 'react';
import { StatementTable } from '@/components/common/StatementTable';
import type { DividendsItem } from '@/types';
import { formatNumber } from '@/lib/utils/format';

const FREQUENCY_LABEL: Record<string, string> = {
  quarterly: '분기',
  annual: '연간',
  monthly: '월간',
  semiAnnual: '반기',
};

interface DividendsTableProps {
  sortedData: DividendsItem[];
  exchangeRate: number | null;
}

const DividendsTable = ({ sortedData, exchangeRate }: DividendsTableProps) => {
  if (sortedData.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
        <p className="text-sm">2020년 이후 배당 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="border-b border-border bg-muted/60 px-5 py-3">
        <h3 className="text-base font-semibold text-foreground">배당 내역</h3>
      </div>
      <StatementTable.Root>
        <StatementTable.Table minWidth="min-w-[640px]">
          <StatementTable.Header>
            <StatementTable.Row>
              <StatementTable.Head variant="sticky-label">
                배당 기준일
              </StatementTable.Head>
              <StatementTable.Head variant="year">지급일</StatementTable.Head>
              <StatementTable.Head variant="year">
                주당 배당금
              </StatementTable.Head>
              <StatementTable.Head variant="year">
                배당 수익률
              </StatementTable.Head>
              <StatementTable.Head variant="year">
                배당 주기
              </StatementTable.Head>
            </StatementTable.Row>
          </StatementTable.Header>
          <StatementTable.Body>
            {sortedData.map((item) => (
              <StatementTable.Row key={`${item.recordDate}-${item.dividend}`}>
                <StatementTable.Cell variant="sticky-label">
                  {item.recordDate || item.date}
                </StatementTable.Cell>
                <StatementTable.Cell variant="year">
                  {item.paymentDate || '—'}
                </StatementTable.Cell>
                <StatementTable.Cell variant="year">
                  {item.dividend != null
                    ? exchangeRate
                      ? `${formatNumber(Math.round(Number(item.dividend) * exchangeRate))} 원`
                      : `${formatNumber(item.dividend)} 달러`
                    : '—'}
                </StatementTable.Cell>
                <StatementTable.Cell variant="year">
                  {item.yield != null
                    ? `${Number(item.yield).toFixed(2)}%`
                    : '—'}
                </StatementTable.Cell>
                <StatementTable.Cell variant="year">
                  {item.frequency
                    ? (FREQUENCY_LABEL[item.frequency.toLowerCase()] ??
                      item.frequency)
                    : '—'}
                </StatementTable.Cell>
              </StatementTable.Row>
            ))}
          </StatementTable.Body>
        </StatementTable.Table>
      </StatementTable.Root>
    </div>
  );
};

export default DividendsTable;
