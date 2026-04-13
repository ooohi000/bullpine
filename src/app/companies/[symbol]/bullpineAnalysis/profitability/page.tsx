import React from 'react';
import ProfitabilityAnalysisView from '@/components/companies/detail/bullpineAnalysis/profitability/ProfitabilityAnalysisView';

const ProfitabilityAnalysisPage = async ({
  params,
}: {
  params: { symbol: string };
}) => {
  const { symbol } = params;

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
