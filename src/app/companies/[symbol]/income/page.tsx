import React from 'react';
import IncomeView from '@/components/companies/detail/statements/income/IncomeView';
import { getExchangeRateService } from '@/services/exchangeRate/getExchangeRateService';

interface CompanyIncomePageProps {
  params: { symbol: string };
}

const CompanyIncomePage = async ({ params }: CompanyIncomePageProps) => {
  const { symbol } = params;
  const exchangeRate = await getExchangeRateService();

  return (
    <div className="flex flex-col gap-10 pt-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {symbol.toUpperCase()} 손익계산서
        </h1>
      </header>
      <IncomeView
        symbol={symbol}
        exchangeRate={exchangeRate.data.price ?? null}
      />
    </div>
  );
};

export default CompanyIncomePage;
