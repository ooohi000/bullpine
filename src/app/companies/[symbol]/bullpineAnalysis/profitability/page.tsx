import React from 'react';
import ProfitabilityAnalysisView from '@/components/companies/detail/bullpineAnalysis/profitability/ProfitabilityAnalysisView';

const ProfitabilityAnalysisPage = async ({
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
          {symbol.toUpperCase()} 수익성 / 경쟁력 분석
        </h1>
      </header>
      <ProfitabilityAnalysisView symbol={symbol} />
    </div>
  );
};

export default ProfitabilityAnalysisPage;
