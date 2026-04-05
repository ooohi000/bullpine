import { StatementTable } from '@/components/common/StatementTable';
import {
  CASH_FLOW_DISPLAY_FIELDS,
  CASH_FLOW_KEY_MAP,
  CASH_FLOW_TOTAL_FIELDS,
} from '@/constants';
import { formatNumber } from '@/lib/utils/format';
import { CashFlowItem } from '@/types';
import React from 'react';

const sectionLabels: Record<keyof typeof CASH_FLOW_DISPLAY_FIELDS, string> = {
  operating: '영업활동',
  investing: '투자활동',
  financing: '재무활동',
  cash: '현금 및 현금성자산',
  other: '기타',
};

interface CashFlowSectionTableProps {
  title: string;
  sectionKeys: (keyof typeof CASH_FLOW_DISPLAY_FIELDS)[];
  years: { year: string; date: string; period: string }[];
  dataByYear: Map<string, CashFlowItem>;
}

const CashFlowSectionTable = ({
  title,
  sectionKeys,
  years,
  dataByYear,
}: CashFlowSectionTableProps) => {
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
              const fields = CASH_FLOW_DISPLAY_FIELDS[
                sectionKey
              ] as (keyof CashFlowItem)[];
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
                    const isTotal = CASH_FLOW_TOTAL_FIELDS.has(field);
                    return (
                      <StatementTable.Row key={field} isTotal={isTotal}>
                        <StatementTable.Cell
                          variant="sticky-label"
                          isTotal={isTotal}
                          className="!bg-muted"
                        >
                          <span className="inline-flex items-center gap-1.5">
                            {CASH_FLOW_KEY_MAP[field]}
                          </span>
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

export default CashFlowSectionTable;
