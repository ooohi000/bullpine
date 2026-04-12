'use client';

import React, { useMemo } from 'react';
import useStockPriceAndVolume from '@/hooks/api/companies/chartsAnalysis/useStockPriceAndVolume';
import StockPriceChart from './StockPriceChart';
import useStockDailyIndicator from '@/hooks/api/companies/chartsAnalysis/useStockDailyIndicator';
import type { StockDailyIndicatorItem } from '@/types/chartsAnalysis/stockDailyIndicator';
import type { StockPriceAndVolumeItem } from '@/types/chartsAnalysis/stockPriceAndVolume';

interface StockPriceAndVolumeSectionProps {
  symbol: string;
}

export type StockPriceAndIndicatorByDate = {
  date: string;
  price?: StockPriceAndVolumeItem;
  indicator?: StockDailyIndicatorItem;
};

const StockPriceAndVolumeSection = ({
  symbol,
}: StockPriceAndVolumeSectionProps) => {
  const { data, isLoading } = useStockPriceAndVolume({
    symbol,
  });

  const { data: stockDailyIndicator, isLoading: isStockDailyIndicatorLoading } =
    useStockDailyIndicator({
      symbol,
    });

  const mergedByDate = useMemo((): StockPriceAndIndicatorByDate[] => {
    const stockDataMap = new Map<
      string,
      { price?: StockPriceAndVolumeItem; indicator?: StockDailyIndicatorItem }
    >();

    for (const item of data?.data ?? []) {
      stockDataMap.set(item.date, {
        price: item,
        indicator: stockDataMap.get(item.date)?.indicator,
      });
    }

    for (const item of stockDailyIndicator?.data ?? []) {
      stockDataMap.set(item.date, {
        price: stockDataMap.get(item.date)?.price,
        indicator: item,
      });
    }

    return Array.from(stockDataMap.entries())
      .map(([date, row]) => ({
        date,
        price: row.price,
        indicator: row.indicator,
      }))
      .filter((item) => item.date.split('-')[0] > '2020')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data, stockDailyIndicator]);

  const isBusy = isLoading || isStockDailyIndicatorLoading;

  return (
    <div className="flex flex-col gap-8">
      {isBusy ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
          <p className="text-sm">주가 데이터를 불러오는 중입니다.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <StockPriceChart mergedByDate={mergedByDate} />
        </div>
      )}
    </div>
  );
};

export default StockPriceAndVolumeSection;
