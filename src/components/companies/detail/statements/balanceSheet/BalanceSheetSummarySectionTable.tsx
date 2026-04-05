'use client';

import HighchartsChart from '@/components/common/HighchartsChart';
import { StatementTable } from '@/components/common/StatementTable';
import {
  BALANCE_SHEET_KEY_MAP,
  BALANCE_SHEET_SUMMARY_SECTIONS,
  BALANCE_SHEET_SUMMARY_TOTAL_FIELDS,
} from '@/constants/statements/balanceSheet';
import { getColumnChartOptions } from '@/lib/companies/financialAnalysis';
import { formatNumber } from '@/lib/utils/format';
import { getYoYPercent } from '@/lib/utils/math';
import type { BalanceSheetItem } from '@/types/statements';
import React from 'react';

const BalanceSheetSummarySectionTable = ({
  years,
  dataByYear,
}: {
  years: string[];
  dataByYear: Map<string, BalanceSheetItem>;
}) => {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-base font-semibold text-foreground">
        합계 요약 (연도별)
      </h3>
      <div className="flex flex-col gap-6">
        {BALANCE_SHEET_SUMMARY_SECTIONS.map(({ title, formula, fields }) => (
          <div
            key={title}
            className="rounded-xl border border-border bg-card overflow-hidden min-w-0"
          >
            <div className="border-b border-border bg-muted/60 px-4 py-2.5">
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{formula}</p>
            </div>
            <StatementTable.Root>
              <StatementTable.Table minWidth="min-w-[400px]">
                <StatementTable.Header>
                  <StatementTable.Row>
                    <StatementTable.Head variant="sticky-label">
                      항목
                    </StatementTable.Head>
                    {years.map((year) => (
                      <StatementTable.Head key={year} variant="year">
                        {year}년
                      </StatementTable.Head>
                    ))}
                    <StatementTable.Head variant="chart">
                      연도별 추이
                    </StatementTable.Head>
                  </StatementTable.Row>
                </StatementTable.Header>
                <StatementTable.Body>
                  {fields.map((field) => {
                    const isSummaryTotal =
                      BALANCE_SHEET_SUMMARY_TOTAL_FIELDS.has(field);
                    const chartValues = years.map((year) => {
                      const row = dataByYear.get(year);
                      const v = row?.[field];
                      return typeof v === 'number' && !Number.isNaN(v)
                        ? v
                        : null;
                    });
                    const chartOptions = getColumnChartOptions(
                      years,
                      chartValues,
                      isSummaryTotal,
                    );
                    return (
                      <StatementTable.Row key={field} isTotal={isSummaryTotal}>
                        <StatementTable.Cell
                          variant="sticky-label"
                          isTotal={isSummaryTotal}
                          className={!isSummaryTotal ? '!bg-muted' : undefined}
                        >
                          {BALANCE_SHEET_KEY_MAP[field]}
                        </StatementTable.Cell>
                        {years.map((year, yearIdx) => {
                          const row = dataByYear.get(year);
                          const value = row?.[field];
                          const isNumber =
                            typeof value === 'number' &&
                            !Number.isNaN(value as number);
                          const prevRow =
                            yearIdx > 0
                              ? dataByYear.get(years[yearIdx - 1])
                              : undefined;
                          const prevValue = prevRow?.[field];
                          const numCurrent =
                            isNumber && typeof value === 'number'
                              ? value
                              : null;
                          const numPrev =
                            prevValue != null &&
                            typeof prevValue === 'number' &&
                            !Number.isNaN(prevValue)
                              ? prevValue
                              : null;
                          const yoyPercent = getYoYPercent(numCurrent, numPrev);
                          return (
                            <StatementTable.Cell
                              key={`${year}-${String(field)}`}
                              variant="year"
                              isTotal={isSummaryTotal}
                              yoyPercent={yoyPercent}
                            >
                              {isNumber
                                ? formatNumber(value as number)
                                : value != null
                                  ? String(value)
                                  : '-'}
                            </StatementTable.Cell>
                          );
                        })}
                        <StatementTable.Cell variant="chart">
                          <div className="h-[52px] w-full min-w-[160px]">
                            <HighchartsChart
                              options={chartOptions}
                              className="h-full w-full"
                            />
                          </div>
                        </StatementTable.Cell>
                      </StatementTable.Row>
                    );
                  })}
                </StatementTable.Body>
              </StatementTable.Table>
            </StatementTable.Root>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BalanceSheetSummarySectionTable;
