import React from 'react';
import GrowthAnalysisView from '@/components/companies/detail/bullpineAnalysis/growth/GrowthAnalysisView';

const GrowthAnalysisPage = async ({
  params,
}: {
  params: { symbol: string };
}) => {
  const { symbol } = params;

  return (
    <div className="flex flex-col gap-10 pt-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {symbol.toUpperCase()} 성장성 분석
        </h1>
      </header>
      <GrowthAnalysisView symbol={symbol} />
    </div>
  );
};

export default GrowthAnalysisPage;
