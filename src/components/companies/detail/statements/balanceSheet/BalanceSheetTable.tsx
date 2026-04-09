'use client';

import type { BalanceSheetItem, PeriodType } from '@/types';
import React from 'react';
import BalanceSheetSectionTable from './BalanceSheetSectionTable';

interface BalanceSheetTableProps {
  sortedData: BalanceSheetItem[];
  exchangeRate: number | null;
  period: PeriodType;
}

const BalanceSheetTable = ({
  sortedData,
  exchangeRate,
  period,
}: BalanceSheetTableProps) => {
  // 표시용 연도: 결산일(date) 기준. fiscalYear는 회사 회계연도라 2026 등 미래가 나올 수 있음
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
        <p className="text-sm">대차대조표 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {/* 대차대조표: 왼쪽 자산, 오른쪽 부채·자본 */}
      <div className="flex flex-col gap-6">
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> */}
        <div className="min-w-0 flex flex-col gap-6">
          <BalanceSheetSectionTable
            title="자본"
            sectionKeys={['equity']}
            dates={dates}
            dataByYear={dataByYear}
            period={period}
            exchangeRate={exchangeRate}
          />
          <BalanceSheetSectionTable
            title="부채"
            sectionKeys={['currentLiabilities', 'nonCurrentLiabilities']}
            dates={dates}
            dataByYear={dataByYear}
            period={period}
            exchangeRate={exchangeRate}
          />
        </div>

        <BalanceSheetSectionTable
          title="자산"
          sectionKeys={['currentAssets', 'nonCurrentAssets']}
          dates={dates}
          dataByYear={dataByYear}
          period={period}
          exchangeRate={exchangeRate}
        />
      </div>
      {/* </div> */}
    </div>
  );
};

export default BalanceSheetTable;
