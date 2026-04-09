'use client';

import React from 'react';
import { StatementTable } from '@/components/common/StatementTable';
import { FINANCIAL_RATIOS_CONFIG } from '@/constants/financialAnalysis';
import { formatFinancialRatioValue } from '@/lib/companies/ratios';
import type { FinancialRatiosItem, PeriodType } from '@/types';
import MetricInfo from '../MetricInfo';

interface FinancialRatiosTableProps {
  sortedData: FinancialRatiosItem[];
  period: PeriodType;
}

const periodLabel = (item: FinancialRatiosItem, period: PeriodType) => {
  const [year, month] = item.date.split('-');
  return period === 'FY'
    ? `${year}년`
    : `${year}년 ${month.padStart(2, '0')}월`;
};

const FinancialRatiosTable = ({
  sortedData,
  period,
}: FinancialRatiosTableProps) => {
  if (sortedData.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
        <p className="text-sm">재무 비율 데이터가 없습니다.</p>
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
            {FINANCIAL_RATIOS_CONFIG.map(
              ({ key, label, description, formula }) => (
                <StatementTable.Row key={key}>
                  <StatementTable.Cell
                    variant="sticky-label"
                    className="!min-w-[160px] !w-[160px] !bg-muted font-medium text-foreground"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="flex items-center justify-between gap-1 !text-foreground/90">
                        {label}
                      </span>
                      <MetricInfo description={description} formula={formula} />
                    </div>
                  </StatementTable.Cell>
                  {sortedData.map((item) => {
                    const value = item[key];
                    const num = typeof value === 'number' ? value : null;
                    return (
                      <StatementTable.Cell
                        key={`${item.date}-${key}`}
                        variant="year"
                        className="!min-w-[200px] !w-[200px] py-4"
                      >
                        {formatFinancialRatioValue(key, num)}
                      </StatementTable.Cell>
                    );
                  })}
                </StatementTable.Row>
              ),
            )}
          </StatementTable.Body>
        </StatementTable.Table>
      </StatementTable.Root>
    </div>
  );
};

export default FinancialRatiosTable;
