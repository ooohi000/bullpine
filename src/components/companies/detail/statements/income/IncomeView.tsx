'use client';

import useIncome from '@/hooks/api/companies/statements/useIncome';
import { IncomeItem, PeriodType } from '@/types';
import React, { useState } from 'react';
import PeriodToggle from '../PeriodToggle';
import IncomeSummaryChart from './IncomeSummaryChart';
import IncomeTable from './IncomeTable';

interface IncomeViewProps {
  symbol: string;
}

const IncomeView = ({ symbol }: IncomeViewProps) => {
  const [period, setPeriod] = useState<PeriodType>('FY');

  const { data, isLoading } = useIncome({
    period,
    symbol,
    limit: period === 'FY' ? 6 : 28,
  });

  const incomeData = (data?.data ?? []) as IncomeItem[];
  const sortedData = incomeData
    .filter((item) => parseInt(item.fiscalYear, 10) > 2020)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="flex flex-col gap-6">
      <PeriodToggle value={period} onChange={setPeriod} />
      {isLoading ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
          <p className="text-sm">분기별 데이터를 불러오는 중입니다.</p>
        </div>
      ) : (
        <>
          <IncomeSummaryChart sortedData={sortedData} />
          <IncomeTable sortedData={sortedData} />
        </>
      )}
    </div>
  );
};

export default IncomeView;
