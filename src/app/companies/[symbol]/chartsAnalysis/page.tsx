import React from 'react';
import ChartsAnalysisView from '@/components/companies/detail/chartsAnalysis/ChartsAnalysisView';
import { getStockPriceAndVolume } from '@/services/companies/chartsAnalysis';

const ChartsAnalysisPage = async ({
  params,
}: {
  params: Promise<{ symbol: string }> | { symbol: string };
}) => {
  const resolvedParams = await Promise.resolve(params);
  const { symbol } = resolvedParams;

  return (
    <div className="flex flex-col gap-10 pt-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {symbol.toUpperCase()} 차트분석
        </h1>
      </header>
      <ChartsAnalysisView symbol={symbol} />
    </div>
  );
};

export default ChartsAnalysisPage;
