'use client';

import type { BalanceSheetItem } from '@/types';
import React from 'react';
import BalanceSheetSummarySectionTable from './BalanceSheetSummarySectionTable';
import BalanceSheetSectionTable from './BalanceSheetSectionTable';

interface BalanceSheetTableProps {
  sortedData: BalanceSheetItem[];
}

const BalanceSheetTable = ({ sortedData }: BalanceSheetTableProps) => {
  // 표시용 연도: 결산일(date) 기준. fiscalYear는 회사 회계연도라 2026 등 미래가 나올 수 있음
  const years = sortedData.map((item) => ({
    year: item.fiscalYear,
    date: item.date,
    period: item.period,
  }));
  const dataByYear = new Map(sortedData.map((item) => [item.date, item]));

  if (sortedData.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
        <p className="text-sm">대차대조표 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {/* 합계 요약: 자산·부채·자본별 연도 비교 */}
      {/* <BalanceSheetSummarySectionTable years={years} dataByYear={dataByYear} /> */}

      {/* 대차대조표: 왼쪽 자산, 오른쪽 부채·자본 */}
      <div className="flex flex-col gap-6">
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> */}
        <div className="min-w-0 flex flex-col gap-6">
          <BalanceSheetSectionTable
            title="자본"
            sectionKeys={['equity']}
            years={years}
            dataByYear={dataByYear}
          />
          <BalanceSheetSectionTable
            title="부채"
            sectionKeys={['currentLiabilities', 'nonCurrentLiabilities']}
            years={years}
            dataByYear={dataByYear}
          />
        </div>

        <BalanceSheetSectionTable
          title="자산"
          sectionKeys={['currentAssets', 'nonCurrentAssets']}
          years={years}
          dataByYear={dataByYear}
        />
      </div>
      {/* </div> */}
    </div>
  );
};

export default BalanceSheetTable;
