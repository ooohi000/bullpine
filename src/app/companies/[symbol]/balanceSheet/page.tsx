import React from 'react';
import BalanceSheetView from '@/components/companies/detail/statements/balanceSheet/BalanceSheetView';
import { getExchangeRateService } from '@/services/exchangeRate/getExchangeRateService';

interface CompanyBalanceSheetPageProps {
  params: Promise<{ symbol: string }> | { symbol: string };
}

const CompanyBalanceSheetPage = async ({
  params,
}: CompanyBalanceSheetPageProps) => {
  const resolvedParams = await Promise.resolve(params);
  const { symbol } = resolvedParams;
  const exchangeRate = await getExchangeRateService();

  return (
    <div className="flex flex-col gap-10 pt-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {symbol.toUpperCase()} 대차대조표
        </h1>
      </header>
      <BalanceSheetView
        symbol={symbol}
        exchangeRate={exchangeRate.data.price ?? null}
      />
    </div>
  );
};

export default CompanyBalanceSheetPage;
