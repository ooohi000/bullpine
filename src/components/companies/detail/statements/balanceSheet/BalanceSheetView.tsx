'use client';

import React, { useState } from 'react';
import type { BalanceSheetItem, PeriodType } from '@/types';
import useBalanceSheet from '@/hooks/api/companies/statements/useBalanceSheet';
import PeriodToggle from '../PeriodToggle';
import BalanceSheetTable from './BalanceSheetTable';
import BalanceSheetSummaryChart from './BalanceSheetSummaryChart';

interface BalanceSheetViewProps {
  symbol: string;
  exchangeRate: number | null;
}

const BalanceSheetView = ({ symbol, exchangeRate }: BalanceSheetViewProps) => {
  const [period, setPeriod] = useState<PeriodType>('FY');

  const { data, isLoading } = useBalanceSheet({
    period,
    symbol,
    limit: period === 'FY' ? 6 : 28,
  });

  const sheetData = (data?.data ?? []) as BalanceSheetItem[];
  const sortedData = sheetData
    .filter((item) => parseInt(item.date.split('-')[0]) > 2020)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="flex flex-col gap-6">
      <PeriodToggle value={period} onChange={setPeriod} />
      {isLoading ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
          <p className="text-sm">대차대조표 데이터를 불러오는 중입니다.</p>
        </div>
      ) : (
        <>
          {sheetData.length > 0 && (
            <BalanceSheetSummaryChart
              sortedData={sortedData}
              exchangeRate={exchangeRate}
              period={period}
            />
          )}
          <BalanceSheetTable
            sortedData={sortedData}
            exchangeRate={exchangeRate}
            period={period}
          />
        </>
      )}
    </div>
  );
};

export default BalanceSheetView;
