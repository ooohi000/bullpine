import OwnerEarningsSection from '@/components/companies/detail/financialAnalysis/ownerEarnings/OwnerEarningsSection';
import { getExchangeRateService } from '@/services/exchangeRate/getExchangeRateService';
import React from 'react';

const OwnerEarningsPage = async ({
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
          {symbol.toUpperCase()} 주주잉여현금흐름
        </h1>
      </header>
      <OwnerEarningsSection
        symbol={symbol}
        exchangeRate={exchangeRate.data.price ?? null}
      />
    </div>
  );
};

export default OwnerEarningsPage;
