import React from 'react';
import GrowthAnalysisView from '@/components/companies/detail/bullpineAnalysis/growth/GrowthAnalysisView';

const GrowthAnalysisPage = async ({
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
          {symbol.toUpperCase()} 성장성 분석
        </h1>
      </header>
      <GrowthAnalysisView symbol={symbol} />
    </div>
  );
};

export default GrowthAnalysisPage;
