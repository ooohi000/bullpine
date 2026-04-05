'use client';

import React, { useMemo } from 'react';
import useEnterpriseValues from '@/hooks/api/companies/chartsAnalysis/useEnterpriseValues';
import useStockPriceAndVolume from '@/hooks/api/companies/chartsAnalysis/useStockPriceAndVolume';
import StockPriceEnterpriseChart from './StockPriceEnterpriseChart';

interface StockPriceAndEnterpriseValuesSectionProps {
  symbol: string;
}

const StockPriceAndEnterpriseValuesSection = ({
  symbol,
}: StockPriceAndEnterpriseValuesSectionProps) => {
  const today = new Date().toISOString().split('T')[0];
  const { data: stockPriceAndVolume, isLoading: isStockPriceAndVolumeLoading } =
    useStockPriceAndVolume({
      symbol,
      from: '2021-01-01',
      to: today,
    });

  const { data: enterpriseValues, isLoading: isEnterpriseValuesLoading } =
    useEnterpriseValues({
      symbol,
      limit: 30,
      period: 'quarter',
    });

  const sortedStockPriceAndVolume = useMemo(() => {
    return stockPriceAndVolume?.data
      .filter((item) => item.date.split('-')[0] > '2020')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [stockPriceAndVolume]);

  const sortedEnterpriseValues = useMemo(() => {
    return enterpriseValues?.data
      .filter((item) => item.date.split('-')[0] > '2020')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [enterpriseValues]);

  return (
    <div className="flex flex-col gap-8">
      {isStockPriceAndVolumeLoading && isEnterpriseValuesLoading ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
          <p className="text-sm">주가 데이터를 불러오는 중입니다.</p>
        </div>
      ) : (
        <StockPriceEnterpriseChart
          sortedStockPriceAndVolume={sortedStockPriceAndVolume ?? []}
          sortedEnterpriseValues={sortedEnterpriseValues ?? []}
        />
      )}
    </div>
  );
};

export default StockPriceAndEnterpriseValuesSection;
