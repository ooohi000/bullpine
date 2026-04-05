'use client';

import React from 'react';
import type { IncomeItem } from '@/types/statements';
import HighchartsChart from '@/components/common/HighchartsChart';
import { StatementTable } from '@/components/common/StatementTable';
import { formatNumber } from '@/lib/utils/format';
import {
  INCOME_KEY_METRICS_SECTIONS,
  INCOME_RATIO_SECTIONS,
} from '@/constants/financialAnalysis';
import {
  getColumnChartOptions,
  getDisplayValue,
  getIncomeKeyMetricCellData,
  INCOME_RATIO_PERCENT_KEYS,
} from '@/lib/companies/financialAnalysis';

interface IncomeKeyMetricsTableProps {
  data: IncomeItem[];
}

export const IncomeKeyMetricsTable = ({ data }: IncomeKeyMetricsTableProps) => {
  const sortedData = [...(data ?? [])]
    .filter((item) => parseInt(item.fiscalYear, 10) >= 2020)
    .sort((a, b) => parseInt(a.fiscalYear, 10) - parseInt(b.fiscalYear, 10));

  const years = sortedData.map((item) => item.fiscalYear);
  const dataByYear = new Map(sortedData.map((item) => [item.fiscalYear, item]));

  if (sortedData.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
        <p className="text-sm">재무분석 데이터가 없습니다.</p>
      </div>
    );
  }

  const allSections = [
    ...INCOME_KEY_METRICS_SECTIONS,
    ...INCOME_RATIO_SECTIONS,
  ];

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        {allSections.map((section) => (
          <div
            key={section.title}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            <div className="border-b border-border bg-muted px-5 py-3">
              <h3 className="text-md font-semibold text-foreground">
                {section.title}
              </h3>
              {section.subtitle && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  ( {section.subtitle} )
                </p>
              )}
            </div>
            <StatementTable.Root>
              <StatementTable.Table minWidth="min-w-[350px]">
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
                  {section.rows.map(({ key, label, isResult }) => {
                    const chartValues = years.map((year) =>
                      getDisplayValue(dataByYear.get(year), key, !!isResult),
                    );
                    const chartOptions = getColumnChartOptions(
                      years,
                      chartValues.map((v) =>
                        typeof v === 'number' && !Number.isNaN(v) ? v : null,
                      ),
                      !!isResult,
                    );
                    return (
                      <StatementTable.Row key={key} isTotal={isResult}>
                        <StatementTable.Cell
                          variant="sticky-label"
                          isTotal={isResult}
                          className={!isResult ? '!bg-muted' : undefined}
                        >
                          {label}
                        </StatementTable.Cell>
                        {years.map((year, yearIdx) => {
                          const { displayValue, isNumber, yoyPercent } =
                            getIncomeKeyMetricCellData(
                              dataByYear,
                              years,
                              yearIdx,
                              key,
                              !!isResult,
                            );
                          return (
                            <StatementTable.Cell
                              key={`${year}-${key}`}
                              variant="year"
                              isTotal={isResult}
                              yoyPercent={yoyPercent}
                            >
                              {isNumber
                                ? (
                                    INCOME_RATIO_PERCENT_KEYS as string[]
                                  ).includes(key as string)
                                  ? `${formatNumber(displayValue as number)}%`
                                  : formatNumber(displayValue as number)
                                : displayValue != null
                                  ? String(displayValue)
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

export default IncomeKeyMetricsTable;
