'use client';

import { StatementTable } from '@/components/common/StatementTable';
import { KEY_METRICS_CONFIG } from '@/constants/financialAnalysis';
import { formatMetricValue } from '@/lib/companies/ratios';
import { KeyMetricsItem, PeriodType } from '@/types';
import React from 'react';
import MetricInfo from '../MetricInfo';

interface KeyMetricsTableProps {
  sortedData: KeyMetricsItem[];
  exchangeRate: number | null;
  period: PeriodType;
}

const periodLabel = (item: KeyMetricsItem, period: PeriodType) => {
  const [year, month] = item.date.split('-');
  return period === 'FY'
    ? `${year}년`
    : `${year}년 ${month.padStart(2, '0')}월`;
};

const KeyMetricsTable = ({
  sortedData,
  exchangeRate,
  period,
}: KeyMetricsTableProps) => {
  if (sortedData.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
        <p className="text-sm">핵심 지표 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <StatementTable.Root>
        <StatementTable.Table minWidth="min-w-[600px]">
          <StatementTable.Header>
            <StatementTable.Row>
              <StatementTable.Head
                variant="sticky-label"
                className="!min-w-[160px] !w-[160px]"
              >
                지표
              </StatementTable.Head>
              {sortedData.map((item) => (
                <StatementTable.Head
                  key={item.date}
                  variant="year"
                  className="!min-w-[200px] !w-[200px] py-4"
                >
                  {periodLabel(item, period)}
                </StatementTable.Head>
              ))}
            </StatementTable.Row>
          </StatementTable.Header>
          <StatementTable.Body>
            {KEY_METRICS_CONFIG.map(({ key, label, description, formula }) => (
              <StatementTable.Row key={key}>
                <StatementTable.Cell
                  variant="sticky-label"
                  className="!min-w-[160px] !w-[160px] !bg-muted font-medium text-foreground"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="inline-flex items-center gap-1 !text-foreground/90">
                      {label}
                    </span>
                    <MetricInfo description={description} formula={formula} />
                  </div>
                </StatementTable.Cell>
                {sortedData.map((item) => {
                  const value = item[key as keyof KeyMetricsItem];
                  const num = typeof value === 'number' ? value : null;
                  return (
                    <StatementTable.Cell
                      key={`${item.date}-${key}`}
                      variant="year"
                      className="!min-w-[200px] !w-[200px] py-4"
                    >
                      {formatMetricValue(key, num, exchangeRate)}
                    </StatementTable.Cell>
                  );
                })}
              </StatementTable.Row>
            ))}
          </StatementTable.Body>
        </StatementTable.Table>
      </StatementTable.Root>
    </div>
  );
};

export default KeyMetricsTable;
