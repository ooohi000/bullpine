'use client';

import React, { useMemo } from 'react';
import useEnterpriseValues from '@/hooks/api/companies/chartsAnalysis/useEnterpriseValues';
import useStockPriceAndVolume from '@/hooks/api/companies/chartsAnalysis/useStockPriceAndVolume';
import StockPriceEnterpriseChart from './StockPriceEnterpriseChart';
import useStockDailyIndicator from '@/hooks/api/companies/chartsAnalysis/useStockDailyIndicator';
import useEarnings from '@/hooks/api/companies/earnings/useEarnings';
import { useFinancialRatios } from '@/hooks/api/companies/financialAnalysis/useFinancialRatios';
import useIncome from '@/hooks/api/companies/statements/useIncome';

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
    });

  const { data: enterpriseValues, isLoading: isEnterpriseValuesLoading } =
    useEnterpriseValues({
      symbol,
    });

  const { data: earnings, isLoading: isEarningsLoading } = useEarnings({
    symbol,
  });

  const { data: financialRatios, isLoading: isFinancialRatiosLoading } =
    useFinancialRatios({
      symbol,
      limit: 28,
      period: 'Q',
    });

  const { data: income, isLoading: isIncomeLoading } = useIncome({
    symbol,
    limit: 28,
    period: 'Q',
  });

  const sortedStockPriceAndVolume = useMemo(() => {
    return stockPriceAndVolume?.data.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [stockPriceAndVolume]);

  const sortedEnterpriseValues = useMemo(() => {
    return enterpriseValues?.data
      ?.filter((item) => item.date.split('-')[0] >= '2020')
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
        />
      )}
    </div>
  );
};

export default StockPriceAndEnterpriseValuesSection;
