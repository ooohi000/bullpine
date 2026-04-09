import React from 'react';
import {
  BALANCE_SHEET_DISPLAY_FIELDS,
  BALANCE_SHEET_KEY_MAP,
  BALANCE_SHEET_TOTAL_FIELDS,
} from '@/constants/statements/balanceSheet';
import { StatementTable } from '@/components/common/StatementTable';
import { formatNumber } from '@/lib/utils/format';
import type { BalanceSheetItem, PeriodType } from '@/types';

const sectionLabels: Record<string, string> = {
  currentAssets: '유동자산',
  nonCurrentAssets: '비유동자산',
  currentLiabilities: '유동부채',
  nonCurrentLiabilities: '비유동부채',
  equity: '자본',
};

const BalanceSheetSectionTable = ({
  title,
  sectionKeys,
  dates,
  dataByYear,
  period,
  exchangeRate,
}: {
  title: string;
  sectionKeys: (keyof typeof BALANCE_SHEET_DISPLAY_FIELDS)[];
  dates: { year: string; month: string }[];
  dataByYear: Map<string, BalanceSheetItem>;
  period: PeriodType;
  exchangeRate: number | null;
}) => {
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
              const fields = BALANCE_SHEET_DISPLAY_FIELDS[
                sectionKey
              ] as (keyof BalanceSheetItem)[];
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
                    const isTotal = BALANCE_SHEET_TOTAL_FIELDS.has(field);
                    return (
                      <StatementTable.Row key={field} isTotal={isTotal}>
                        <StatementTable.Cell
                          variant="sticky-label"
                          isTotal={isTotal}
                          className="!min-w-[160px] !w-[160px] !bg-muted !text-foreground/90"
                        >
                          {BALANCE_SHEET_KEY_MAP[field]}
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
                                ? exchangeRate
                                  ? `${formatNumber(
                                      Math.round(Number(value) * exchangeRate),
                                    )} 원`
                                  : `${formatNumber(value as number)} 달러`
                                : (value ?? '-')}
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

export default BalanceSheetSectionTable;
