import React from 'react';
import IncomeView from '@/components/companies/detail/statements/income/IncomeView';

interface CompanyIncomePageProps {
  params: Promise<{ symbol: string }> | { symbol: string };
}

const CompanyIncomePage = async ({ params }: CompanyIncomePageProps) => {
  const resolvedParams = await Promise.resolve(params);
  const { symbol } = resolvedParams;

  return (
    <div className="flex flex-col gap-10 pt-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {symbol.toUpperCase()} 손익계산서
        </h1>
      </header>
      <IncomeView symbol={symbol} />
    </div>
  );
};

export default CompanyIncomePage;
