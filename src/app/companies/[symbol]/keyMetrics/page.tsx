import KeyMetricsSection from '@/components/companies/detail/financialAnalysis/keyMetrics/KeyMetricsSection';
import React from 'react';

const KeyMetricsPage = async ({
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
          {symbol.toUpperCase()} 핵심 지표
        </h1>
      </header>
      <KeyMetricsSection symbol={symbol} />
    </div>
  );
};

export default KeyMetricsPage;
