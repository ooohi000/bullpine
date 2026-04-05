import React from 'react';
import { StockPeerComparison as StockPeerComparisonType } from '@/types/profile';
import { formatNumber } from '@/lib';
import Link from 'next/link';

const StockPeerComparison = ({
  stockPeerComparison,
}: {
  stockPeerComparison: StockPeerComparisonType[];
}) => {
  return (
    <div className="flex flex-col flex-1 min-h-[250px] gap-2">
      <h2 className="text-lg font-bold text-foreground">비교 기업</h2>
      <div className="grid grid-cols-5 gap-3 text-sm text-muted-foreground">
        {stockPeerComparison.map((item) => (
          <Link
            key={item.symbol}
            href={`/companies/${item.symbol}`}
            target="_blank"
            className="flex flex-col rounded-lg border border-border bg-card px-3 py-2 hover:bg-muted/50 transition-colors text-foreground"
          >
            <div className="font-medium">{item.symbol}</div>
            <div>현재가: {formatNumber(item.price)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default StockPeerComparison;
