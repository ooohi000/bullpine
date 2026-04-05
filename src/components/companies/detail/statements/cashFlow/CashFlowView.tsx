'use client';

import useCashFlow from '@/hooks/api/companies/statements/useCashFlow';
import { CashFlowItem, PeriodType } from '@/types';
import React, { useState } from 'react';
import PeriodToggle from '../PeriodToggle';
import CashFlowSummaryChart from './CashFlowSummaryChart';
import CashFlowTable from './CashFlowTable';

interface CashFlowViewProps {
  symbol: string;
}

const CashFlowView = ({ symbol }: CashFlowViewProps) => {
  const [period, setPeriod] = useState<PeriodType>('FY');

  const { data, isLoading } = useCashFlow({
    period,
    symbol,
    limit: period === 'FY' ? 6 : 28,
  });

  const cashFlowData = (data?.data ?? []) as CashFlowItem[];
  const sortedData = cashFlowData
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
          <CashFlowSummaryChart sortedData={sortedData} />
          <CashFlowTable sortedData={sortedData} />
        </>
      )}
    </div>
  );
};

export default CashFlowView;
