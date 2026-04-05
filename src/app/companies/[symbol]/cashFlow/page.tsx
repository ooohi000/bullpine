import React from 'react';
import CashFlowView from '@/components/companies/detail/statements/cashFlow/CashFlowView';

interface CompanyCashFlowPageProps {
  params: Promise<{ symbol: string }> | { symbol: string };
}

const CompanyCashFlowPage = async ({ params }: CompanyCashFlowPageProps) => {
  const resolvedParams = await Promise.resolve(params);
  const { symbol } = resolvedParams;

  return (
    <div className="flex flex-col gap-10 pt-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {symbol.toUpperCase()} 현금흐름표
        </h1>
      </header>
      <CashFlowView symbol={symbol} />
    </div>
  );
};

export default CompanyCashFlowPage;
