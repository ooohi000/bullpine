import React from 'react';
import CashFlowView from '@/components/companies/detail/statements/cashFlow/CashFlowView';
import { getExchangeRateService } from '@/services/exchangeRate/getExchangeRateService';

interface CompanyCashFlowPageProps {
  params: { symbol: string };
}

const CompanyCashFlowPage = async ({ params }: CompanyCashFlowPageProps) => {
  const { symbol } = params;
  const exchangeRate = await getExchangeRateService();

  return (
    <div className="flex flex-col gap-10 pt-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {symbol.toUpperCase()} 현금흐름표
        </h1>
      </header>
      <CashFlowView
        symbol={symbol}
        exchangeRate={exchangeRate.data.price ?? null}
      />
    </div>
  );
};

export default CompanyCashFlowPage;
