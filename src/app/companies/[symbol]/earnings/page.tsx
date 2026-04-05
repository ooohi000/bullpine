import EarningsView from '@/components/companies/detail/earnings/EarningsView';
import React from 'react';

const EarningsPage = async ({
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
          {symbol.toUpperCase()} 실적
        </h1>
      </header>
      <EarningsView symbol={symbol} />
    </div>
  );
};

export default EarningsPage;
