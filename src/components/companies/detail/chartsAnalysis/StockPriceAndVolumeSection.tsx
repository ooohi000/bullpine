'use client';

import React, { useMemo } from 'react';
import useStockPriceAndVolume from '@/hooks/api/companies/chartsAnalysis/useStockPriceAndVolume';
import StockPriceChart from './StockPriceChart';

interface StockPriceAndVolumeSectionProps {
  symbol: string;
}

const StockPriceAndVolumeSection = ({
  symbol,
}: StockPriceAndVolumeSectionProps) => {
  const today = new Date().toISOString().split('T')[0];
  const { data, isLoading } = useStockPriceAndVolume({
    symbol,
    from: '2021-01-01',
    to: today,
  });

  const sortedStockPriceAndVolume = useMemo(() => {
    return data?.data.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [data]);

  return (
    <div className="flex flex-col gap-8">
      {isLoading ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
          <p className="text-sm">주가 데이터를 불러오는 중입니다.</p>
        </div>
      ) : (
        <StockPriceChart
          sortedStockPriceAndVolumeData={sortedStockPriceAndVolume ?? []}
        />
      )}
    </div>
  );
};

export default StockPriceAndVolumeSection;
