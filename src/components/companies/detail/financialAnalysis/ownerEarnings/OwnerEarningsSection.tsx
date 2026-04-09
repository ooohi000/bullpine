'use client';

import React from 'react';
import OwnerEarningsChart from './OwnerEarningsChart';
import OwnerEarningsTable from './OwnerEarningsTable';
import useOwnerEarnings from '@/hooks/api/companies/financialAnalysis/useOwnerEarnings';

interface OwnerEarningsSectionProps {
  symbol: string;
  exchangeRate: number | null;
}

const OwnerEarningsSection = ({
  symbol,
  exchangeRate,
}: OwnerEarningsSectionProps) => {
  const { data } = useOwnerEarnings({ symbol });
  const sortedData = data?.data
    ?.filter((item) => Number(item.date.split('-')[0]) > 2020)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <section className="flex flex-col gap-8">
      <OwnerEarningsChart
        sortedData={sortedData ?? []}
        exchangeRate={exchangeRate}
      />
      <OwnerEarningsTable
        sortedData={sortedData ?? []}
        exchangeRate={exchangeRate}
      />
    </section>
  );
};

export default OwnerEarningsSection;
