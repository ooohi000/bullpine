import { StatementTable } from '@/components/common/StatementTable';
import {
  CASH_FLOW_DISPLAY_FIELDS,
  CASH_FLOW_KEY_MAP,
  CASH_FLOW_TOTAL_FIELDS,
} from '@/constants';
import { formatNumber } from '@/lib/utils/format';
import { CashFlowItem, PeriodType } from '@/types';
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
  dates: { year: string; month: string }[];
  dataByYear: Map<string, CashFlowItem>;
  period: PeriodType;
  exchangeRate: number | null;
}

const CashFlowSectionTable = ({
  title,
  sectionKeys,
  dates,
  dataByYear,
  period,
  exchangeRate,
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
              const fields = CASH_FLOW_DISPLAY_FIELDS[
                sectionKey
              ] as (keyof CashFlowItem)[];
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
                    const isTotal = CASH_FLOW_TOTAL_FIELDS.has(field);
                    return (
                      <StatementTable.Row key={field} isTotal={isTotal}>
                        <StatementTable.Cell
                          variant="sticky-label"
                          isTotal={isTotal}
                          className="!min-w-[160px] !w-[160px] !bg-muted !text-foreground/90"
                        >
                          <span className="inline-flex items-center gap-1.5">
                            {CASH_FLOW_KEY_MAP[field]}
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
                                ? exchangeRate
                                  ? `${formatNumber(Math.round(Number(value) * exchangeRate))} 원`
                                  : `${formatNumber(value as number)} 달러`
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
