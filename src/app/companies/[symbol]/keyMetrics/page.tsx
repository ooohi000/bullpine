import KeyMetricsSection from '@/components/companies/detail/financialAnalysis/keyMetrics/KeyMetricsSection';
import { getExchangeRateService } from '@/services/exchangeRate/getExchangeRateService';
import React from 'react';

const KeyMetricsPage = async ({
  params,
}: {
  params: { symbol: string };
}) => {
  const { symbol } = params;
  const exchangeRate = await getExchangeRateService();

  return (
    <div className="flex flex-col gap-10 pt-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {symbol.toUpperCase()} 핵심 지표
        </h1>
      </header>
      <KeyMetricsSection
        symbol={symbol}
        exchangeRate={exchangeRate.data.price ?? null}
      />
    </div>
  );
};

export default KeyMetricsPage;
