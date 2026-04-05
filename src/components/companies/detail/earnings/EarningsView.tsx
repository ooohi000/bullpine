'use client';

import useEarnings from '@/hooks/api/companies/earnings/useEarnings';
import React, { useMemo } from 'react';
import EarningsSummaryChart from './EarningsSummaryChart';
import EarningsTable from './EarningsTable';
import { EarningsItem } from '@/types';

interface EarningsViewProps {
  symbol: string;
}

const EarningsView = ({ symbol }: EarningsViewProps) => {
  const { data, isLoading } = useEarnings({ symbol });
  const earningsData = (data?.data ?? []) as EarningsItem[];
  const sortedData = earningsData
    .filter((item) => Number(item.date.split('-')[0]) > 2020)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="flex flex-col gap-6">
      {isLoading ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
          <p className="text-sm">실적 데이터를 불러오는 중입니다.</p>
        </div>
      ) : (
        <>
          <EarningsSummaryChart sortedData={sortedData} />
          <EarningsTable
            sortedData={[...sortedData].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            )}
          />
        </>
      )}
    </div>
  );
};

export default EarningsView;
