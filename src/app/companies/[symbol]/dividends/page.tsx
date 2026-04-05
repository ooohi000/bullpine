import DividendsView from '@/components/companies/detail/dividends/DividendsView';
import React from 'react';

const DividendsPage = async ({
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
          {symbol.toUpperCase()} 배당
        </h1>
      </header>
      <DividendsView symbol={symbol} />
    </div>
  );
};

export default DividendsPage;
