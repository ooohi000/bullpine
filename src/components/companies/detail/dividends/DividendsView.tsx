'use client';

import useDividends from '@/hooks/api/companies/dividends/useDividends';
import React, { useMemo } from 'react';
import DividendsSummaryChart from './DividendsSummaryChart';
import DividendsTable from './DividendsTable';
import { DividendsItem } from '@/types';

interface DividendsViewProps {
  symbol: string;
}

const DividendsView = ({ symbol }: DividendsViewProps) => {
  const { data, isLoading } = useDividends({ symbol });
  const dividendsData = (data?.data ?? []) as DividendsItem[];

  const sortedData = dividendsData
    .filter((item) => Number(item.date.split('-')[0]) > 2020)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="flex flex-col gap-6">
      {isLoading ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
          <p className="text-sm">배당 데이터를 불러오는 중입니다.</p>
        </div>
      ) : (
        <>
          <DividendsSummaryChart sortedData={sortedData} />
          <DividendsTable
            sortedData={[...sortedData].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            )}
          />
        </>
      )}
    </div>
  );
};

export default DividendsView;
