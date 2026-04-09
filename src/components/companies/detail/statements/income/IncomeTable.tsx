'use client';

import React from 'react';
import type { IncomeItem, IncomeSectionKey, PeriodType } from '@/types';
import IncomeSectionTable from './IncomeSectionTable';

/** IncomeSectionKey 순서: 매출 → 영업 → 세전 → 세후 → 주당이익 */
const INCOME_SECTION_KEYS: IncomeSectionKey[] = [
  'revenue',
  'operating',
  'preTax',
  'netIncome',
  'perShare',
];

interface IncomeTableProps {
  sortedData: IncomeItem[];
  exchangeRate: number | null;
  period: PeriodType;
}

const IncomeTable = ({
  sortedData,
  exchangeRate,
  period,
}: IncomeTableProps) => {
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
        <p className="text-sm">2020년 이후 손익계산서 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <IncomeSectionTable
          title="전체 항목"
          sectionKeys={INCOME_SECTION_KEYS}
          dates={dates}
          dataByYear={dataByYear}
          period={period}
          exchangeRate={exchangeRate}
        />
      </div>
    </div>
  );
};

export default IncomeTable;
