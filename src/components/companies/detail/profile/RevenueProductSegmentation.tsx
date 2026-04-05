import { formatNumber } from '@/lib';
import { RevenueProductSegmentation as RevenueProductSegmentationType } from '@/types/profile/revenueProductSegmentation';
import React from 'react';

const RevenueProductSegmentation = ({
  revenueProductSegmentation,
}: {
  revenueProductSegmentation: RevenueProductSegmentationType[];
}) => {
  const sorted = [...revenueProductSegmentation]
    .filter((item) => parseInt(item.fiscalYear) > 2020)
    .sort((a, b) => parseInt(b.fiscalYear) - parseInt(a.fiscalYear));

  return (
    <div className="flex min-h-[250px] min-w-0 flex-1 flex-col gap-3">
      <h2 className="text-lg font-bold text-foreground">제품별 매출</h2>
      <div className="flex min-w-0 flex-col gap-3">
        {sorted.map((item) => (
          <div
            key={`${item.symbol}-${item.date}`}
            className="min-w-0 rounded-lg border border-border bg-card px-4 py-3"
          >
            <div className="mb-2 text-sm font-medium text-foreground">
              {item.fiscalYear}년
            </div>
            <div className="flex min-w-0 flex-col gap-2 text-sm">
              {Object.entries(item.data).map(([key, value], index) => (
                <div
                  key={`${item.symbol}-${item.date}-product-${index}`}
                  className="min-w-0"
                >
                  <span className="text-muted-foreground">{key}</span>
                  <span className="ml-1 font-medium text-foreground break-all">
                    {formatNumber(value as number)} 달러
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueProductSegmentation;
