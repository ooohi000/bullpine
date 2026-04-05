'use client';

import React, { useState } from 'react';
import useKeyMetrics from '@/hooks/api/companies/financialAnalysis/useKeyMetrics';
import { KeyMetricsItem } from '@/types';
import { PeriodType } from '@/types';
import PeriodToggle from '../../statements/PeriodToggle';
import KeyMetricsLeverageLiquidityChart from './KeyMetricsLeverageLiquidityChart';
import KeyMetricsProfitabilityChart from './KeyMetricsProfitabilityChart';
import KeyMetricsTable from './KeyMetricsTable';
import KeyMetricsValuationMultiplesChart from './KeyMetricsValuationMultiplesChart';
import KeyMetricsValuationSizeChart from './KeyMetricsValuationSizeChart';
import KeyMetricsYieldChart from './KeyMetricsYieldChart';

export type KeyMetricsChartId =
  | 'valuationSize'
  | 'profitability'
  | 'valuationMultiples'
  | 'leverageLiquidity'
  | 'yield';

const CHART_TABS: { id: KeyMetricsChartId; label: string }[] = [
  { id: 'valuationSize', label: '가치·규모 추이' },
  { id: 'profitability', label: '수익성 지표 추이' },
  { id: 'valuationMultiples', label: '기업가치(EV) 배수 추이' },
  { id: 'leverageLiquidity', label: '레버리지·유동성' },
  { id: 'yield', label: '수익률 추이' },
];

interface KeyMetricsSectionProps {
  symbol: string;
}

const KeyMetricsSection = ({ symbol }: KeyMetricsSectionProps) => {
  const [period, setPeriod] = useState<PeriodType>('FY');
  const [activeChart, setActiveChart] =
    useState<KeyMetricsChartId>('valuationSize');

  const { data, isLoading } = useKeyMetrics({
    symbol,
    limit: period === 'FY' ? 6 : 28,
    period,
  });

  const keyMetricsData = (data?.data ?? []) as KeyMetricsItem[];

  const sortedData = keyMetricsData
    .filter((item) => parseInt(item.fiscalYear, 10) > 2020)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="flex flex-col gap-6">
      <PeriodToggle value={period} onChange={setPeriod} />
      {isLoading ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
          <p className="text-sm">분기별 데이터를 불러오는 중입니다.</p>
        </div>
      ) : (
        <>
          {sortedData.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/50 p-1 w-full max-w-4xl">
                {CHART_TABS.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveChart(id)}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                      activeChart === id
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {activeChart === 'valuationSize' && (
                <KeyMetricsValuationSizeChart sortedData={sortedData} />
              )}
              {activeChart === 'profitability' && (
                <KeyMetricsProfitabilityChart sortedData={sortedData} />
              )}
              {activeChart === 'valuationMultiples' && (
                <KeyMetricsValuationMultiplesChart sortedData={sortedData} />
              )}
              {activeChart === 'leverageLiquidity' && (
                <KeyMetricsLeverageLiquidityChart sortedData={sortedData} />
              )}
              {activeChart === 'yield' && (
                <KeyMetricsYieldChart sortedData={sortedData} />
              )}
            </div>
          )}
          <KeyMetricsTable sortedData={sortedData} />
        </>
      )}
    </div>
  );
};

export default KeyMetricsSection;
