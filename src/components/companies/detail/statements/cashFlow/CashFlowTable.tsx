import React from 'react';
import { CashFlowItem, CashFlowSectionKey, PeriodType } from '@/types';
import CashFlowSectionTable from './CashFlowSectionTable';

const CASH_FLOW_SECTION_KEYS: CashFlowSectionKey[] = [
  'operating',
  'investing',
  'financing',
  'cash',
  'other',
];

interface CashFlowTableProps {
  sortedData: CashFlowItem[];
  exchangeRate: number | null;
  period: PeriodType;
}

const CashFlowTable = ({
  sortedData,
  exchangeRate,
  period,
}: CashFlowTableProps) => {
  const dates = sortedData.map((item) => ({
    year: item.date.split('-')[0],
    month: item.date.split('-')[1],
  }));
  const dataByYear = new Map(
    sortedData.map((item) => [
      `${item.date.split('-')[0]}-${item.date.split('-')[1]}`,
      item,
    ]),
  );

  if (sortedData.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
        <p className="text-sm">2020년 이후 현금흐름표 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <CashFlowSectionTable
          title="전체 항목"
          sectionKeys={CASH_FLOW_SECTION_KEYS}
          dates={dates}
          dataByYear={dataByYear}
          period={period}
          exchangeRate={exchangeRate}
        />
      </div>
    </div>
  );
};

export default CashFlowTable;
