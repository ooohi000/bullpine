import React from 'react';
import { CashFlowItem, CashFlowSectionKey } from '@/types';
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
}

const CashFlowTable = ({ sortedData }: CashFlowTableProps) => {
  const years = sortedData.map((item) => ({
    year: item.fiscalYear,
    date: item.date,
    period: item.period,
  }));
  const dataByYear = new Map(sortedData.map((item) => [item.date, item]));

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
          years={years}
          dataByYear={dataByYear}
        />
      </div>
    </div>
  );
};

export default CashFlowTable;
