import React from 'react';
import {
  BALANCE_SHEET_DISPLAY_FIELDS,
  BALANCE_SHEET_KEY_MAP,
  BALANCE_SHEET_TOTAL_FIELDS,
} from '@/constants/statements/balanceSheet';
import { StatementTable } from '@/components/common/StatementTable';
import { formatNumber } from '@/lib/utils/format';
import type { BalanceSheetItem } from '@/types';

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
  years,
  dataByYear,
}: {
  title: string;
  sectionKeys: (keyof typeof BALANCE_SHEET_DISPLAY_FIELDS)[];
  years: { year: string; date: string; period: string }[];
  dataByYear: Map<string, BalanceSheetItem>;
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
              {years.map((year) => (
                <StatementTable.Head
                  key={`${title}-${year.year}-${year.date}`}
                  variant="year"
                >
                  {year.period.includes('Q')
                    ? `${year.year}년 ${year.period.split('').reverse().join('').replace('Q', '분기')}`
                    : `${year.year}년`}
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
                    <StatementTable.Cell variant="section-label">
                      {sectionLabel}
                    </StatementTable.Cell>
                    {years.map((year) => (
                      <StatementTable.Cell
                        key={`${title}-${year.year}-${year.date}`}
                        variant="empty"
                        aria-hidden
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
                          className="!bg-muted"
                        >
                          {BALANCE_SHEET_KEY_MAP[field]}
                        </StatementTable.Cell>
                        {years.map((year) => {
                          const row = dataByYear.get(year.date);
                          const value = row?.[field];
                          const isNumber = typeof value === 'number';
                          return (
                            <StatementTable.Cell
                              key={`${title}-${year.year}-${year.date}-${year.period}`}
                              variant="year"
                              isTotal={isTotal}
                            >
                              {isNumber
                                ? formatNumber(value as number)
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
