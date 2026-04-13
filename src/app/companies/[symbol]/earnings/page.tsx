import EarningsView from '@/components/companies/detail/earnings/EarningsView';
import { getExchangeRateService } from '@/services/exchangeRate/getExchangeRateService';
import React from 'react';

const EarningsPage = async ({
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
          {symbol.toUpperCase()} 실적
        </h1>
      </header>
      <EarningsView
        symbol={symbol}
        exchangeRate={exchangeRate.data.price ?? null}
      />
    </div>
  );
};

export default EarningsPage;
