'use client';

import React from 'react';
import { StatementTable } from '@/components/common/StatementTable';
import { formatNumber, formatUsdNumber } from '@/lib/utils/format';
import type { EarningsItem } from '@/types';

interface EarningsTableProps {
  sortedData: EarningsItem[];
  exchangeRate: number | null;
}

const EarningsTable = ({ sortedData, exchangeRate }: EarningsTableProps) => {
  if (sortedData.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
        <p className="text-sm">2020년 이후 실적 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="border-b border-border bg-muted/60 px-5 py-3">
        <h3 className="text-base font-semibold text-foreground">실적 내역</h3>
      </div>
      <StatementTable.Root>
        <StatementTable.Table minWidth="min-w-[640px]">
          <StatementTable.Header>
            <StatementTable.Row>
              <StatementTable.Head variant="sticky-label">
                보고일
              </StatementTable.Head>
              <StatementTable.Head variant="year">EPS 실적</StatementTable.Head>
              <StatementTable.Head variant="year">EPS 추정</StatementTable.Head>
              <StatementTable.Head variant="year">
                매출 실적
              </StatementTable.Head>
              <StatementTable.Head variant="year">
                매출 추정
              </StatementTable.Head>
            </StatementTable.Row>
          </StatementTable.Header>
          <StatementTable.Body>
            {sortedData.map((item) => (
              <StatementTable.Row key={`${item.date}-${item.lastUpdated}`}>
                <StatementTable.Cell variant="sticky-label">
                  {item.date}
                </StatementTable.Cell>
                <StatementTable.Cell variant="year">
                  {item.epsActual != null ? formatNumber(item.epsActual) : '—'}
                </StatementTable.Cell>
                <StatementTable.Cell variant="year">
                  {item.epsEstimated != null
                    ? formatNumber(item.epsEstimated)
                    : '—'}
                </StatementTable.Cell>
                <StatementTable.Cell variant="year">
                  {item.revenueActual != null
                    ? exchangeRate
                      ? `${formatNumber(Math.round(Number(item.revenueActual) * exchangeRate))} 원`
                      : `${formatNumber(item.revenueActual)} 달러`
                    : '—'}
                </StatementTable.Cell>
                <StatementTable.Cell variant="year">
                  {item.revenueEstimated != null
                    ? exchangeRate
                      ? `${formatNumber(Math.round(Number(item.revenueEstimated) * exchangeRate))} 원`
                      : `${formatNumber(item.revenueEstimated)} 달러`
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

export default EarningsTable;
