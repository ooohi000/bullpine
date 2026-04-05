'use client';

import React from 'react';
import OwnerEarningsChart from './OwnerEarningsChart';
import OwnerEarningsTable from './OwnerEarningsTable';
import useOwnerEarnings from '@/hooks/api/companies/financialAnalysis/useOwnerEarnings';

interface OwnerEarningsSectionProps {
  symbol: string;
}

const OwnerEarningsSection = ({ symbol }: OwnerEarningsSectionProps) => {
  const { data } = useOwnerEarnings({ symbol, limit: 30 });
  const sortedData = data?.data
    ?.filter((item) => Number(item.fiscalYear) > 2021)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <section className="flex flex-col gap-8">
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border bg-muted/60 px-5 py-3">
          <h2 className="text-base font-semibold text-foreground">
            주주잉여현금흐름
          </h2>
        </div>
        <div className="p-4 md:p-5">
          <OwnerEarningsChart sortedData={sortedData ?? []} />
        </div>
      </div>
      <OwnerEarningsTable sortedData={sortedData ?? []} />
    </section>
  );
};

export default OwnerEarningsSection;
