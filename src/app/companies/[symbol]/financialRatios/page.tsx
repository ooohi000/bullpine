import FinancialRatiosSection from '@/components/companies/detail/financialAnalysis/financialRatios/FinancialRatiosSection';
import React from 'react';

const FinancialRatiosPage = async ({
  params,
}: {
  params: { symbol: string };
}) => {
  const { symbol } = params;

  return (
    <div className="flex flex-col gap-10 pt-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {symbol.toUpperCase()} 재무 비율
        </h1>
      </header>
      <FinancialRatiosSection symbol={symbol} />
    </div>
  );
};

export default FinancialRatiosPage;
