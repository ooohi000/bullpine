'use client';

import React from 'react';
import {
  INCOME_DISPLAY_FIELDS,
  INCOME_KEY_MAP,
  INCOME_TOTAL_FIELDS,
} from '@/constants';
import { formatNumber } from '@/lib/utils/format';
import type { IncomeItem } from '@/types/statements';
import { StatementTable } from '@/components/common/StatementTable';
import { PeriodType } from '@/types';

const sectionLabels: Record<keyof typeof INCOME_DISPLAY_FIELDS, string> = {
  revenue: '매출',
  operating: '영업',
  preTax: '영업외·세전이익',
  netIncome: '세후이익',
  perShare: '주당이익',
};

interface IncomeSectionTableProps {
  title: string;
  sectionKeys: (keyof typeof INCOME_DISPLAY_FIELDS)[];
  dates: { year: string; month: string }[];
  dataByYear: Map<string, IncomeItem>;
  period: PeriodType;
  exchangeRate: number | null;
}

const IncomeSectionTable = ({
  title,
  sectionKeys,
  dates,
  dataByYear,
  period,
  exchangeRate,
}: IncomeSectionTableProps) => {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="border-b border-border bg-muted/60 px-5 py-3">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
      </div>
      <StatementTable.Root>
        <StatementTable.Table minWidth="min-w-[320px]">
          <StatementTable.Header>
            <StatementTable.Row>
              <StatementTable.Head variant="sticky-label">
                항목
              </StatementTable.Head>
              {dates.map((date) => (
                <StatementTable.Head
                  key={`${title}-${date.year}-${date.month}-head`}
                  variant="year"
                  className="!min-w-[200px] !w-[200px] py-4"
                >
                  {period === 'FY'
                    ? `${date.year}년`
                    : `${date.year}년 ${date.month}월`}
                </StatementTable.Head>
              ))}
            </StatementTable.Row>
          </StatementTable.Header>
          <StatementTable.Body>
            {sectionKeys.map((sectionKey) => {
              const fields = INCOME_DISPLAY_FIELDS[
                sectionKey
              ] as (keyof IncomeItem)[];
              const sectionLabel = sectionLabels[sectionKey];
              return (
                <React.Fragment key={sectionKey}>
                  <StatementTable.Row isSectionLabel>
                    <StatementTable.Cell
                      variant="section-label"
                      className="bg-muted-foreground/5"
                    >
                      {sectionLabel}
                    </StatementTable.Cell>
                    {dates.map((date) => (
                      <StatementTable.Cell
                        key={`${title}-${date.year}-${date.month}-cell`}
                        variant="empty"
                        aria-hidden
                        className="!min-w-[200px] !w-[200px] bg-muted-foreground/5"
                      />
                    ))}
                  </StatementTable.Row>
                  {fields.map((field) => {
                    const isTotal = INCOME_TOTAL_FIELDS.has(field);
                    return (
                      <StatementTable.Row key={field} isTotal={isTotal}>
                        <StatementTable.Cell
                          variant="sticky-label"
                          isTotal={isTotal}
                          className="!min-w-[160px] !w-[160px] !bg-muted !text-foreground/90"
                        >
                          <span className="inline-flex items-center gap-1.5">
                            {INCOME_KEY_MAP[field]}
                          </span>
                        </StatementTable.Cell>
                        {dates.map((date) => {
                          const row = dataByYear.get(
                            `${date.year}-${date.month}`,
                          );
                          const value = row?.[field];
                          const isNumber = typeof value === 'number';
                          return (
                            <StatementTable.Cell
                              key={`${title}-${date.year}-${date.month}-${field}`}
                              variant="year"
                              isTotal={isTotal}
                              className="!min-w-[200px] !w-[200px] py-4"
                            >
                              {isNumber
                                ? field !== 'eps' && field !== 'epsDiluted'
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
                    );
                  })}
                </React.Fragment>
              );
            })}
          </StatementTable.Body>
        </StatementTable.Table>
      </StatementTable.Root>
    </div>
  );
};

export default IncomeSectionTable;
