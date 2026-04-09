import DividendsView from '@/components/companies/detail/dividends/DividendsView';
import { getExchangeRateService } from '@/services/exchangeRate/getExchangeRateService';
import React from 'react';

const DividendsPage = async ({
  params,
}: {
  params: Promise<{ symbol: string }> | { symbol: string };
}) => {
  const resolvedParams = await Promise.resolve(params);
  const { symbol } = resolvedParams;
  const exchangeRate = await getExchangeRateService();

  return (
    <div className="flex flex-col gap-10 pt-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {symbol.toUpperCase()} 배당
        </h1>
      </header>
      <DividendsView
        symbol={symbol}
        exchangeRate={exchangeRate.data.price ?? null}
      />
    </div>
  );
};

export default DividendsPage;
