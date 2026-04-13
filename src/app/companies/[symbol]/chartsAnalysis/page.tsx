import React from 'react';
import ChartsAnalysisView from '@/components/companies/detail/chartsAnalysis/ChartsAnalysisView';

const ChartsAnalysisPage = async ({
  params,
}: {
  params: { symbol: string };
}) => {
  const { symbol } = params;

  return (
    <div className="flex flex-col gap-10 pt-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {symbol.toUpperCase()} 차트 분석
        </h1>
      </header>
      <ChartsAnalysisView symbol={symbol} />
    </div>
  );
};

export default ChartsAnalysisPage;
