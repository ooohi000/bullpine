'use client';

import { useFinancialRatios } from '@/hooks/api/companies/financialAnalysis/useFinancialRatios';
import type { FinancialRatiosItem } from '@/types';
import type { PeriodType } from '@/types';
import React, { useState } from 'react';
import PeriodToggle from '../../statements/PeriodToggle';
import FinancialRatiosDividendChart from './FinancialRatiosDividendChart';
import FinancialRatiosLeverageChart from './FinancialRatiosLeverageChart';
import FinancialRatiosLiquidityChart from './FinancialRatiosLiquidityChart';
import FinancialRatiosPerShareChart from './FinancialRatiosPerShareChart';
import FinancialRatiosProfitabilityChart from './FinancialRatiosProfitabilityChart';
import FinancialRatiosTable from './FinancialRatiosTable';
import FinancialRatiosValuationChart from './FinancialRatiosValuationChart';

export type FinancialRatiosChartId =
  | 'profitability'
  | 'valuation'
  | 'liquidity'
  | 'leverage'
  | 'dividend'
  | 'perShare';

const CHART_TABS: { id: FinancialRatiosChartId; label: string }[] = [
  { id: 'profitability', label: '수익성 마진 추이' },
  { id: 'valuation', label: '밸류에이션 배수 추이' },
  { id: 'liquidity', label: '유동성 추이' },
  { id: 'leverage', label: '레버리지·이자 부담 추이' },
  { id: 'dividend', label: '배당 추이' },
  { id: 'perShare', label: '주당 지표 추이' },
];

interface FinancialRatiosSectionProps {
  symbol: string;
}

const FinancialRatiosSection = ({ symbol }: FinancialRatiosSectionProps) => {
  const [period, setPeriod] = useState<PeriodType>('FY');
  const [activeChart, setActiveChart] =
    useState<FinancialRatiosChartId>('profitability');

  const { data, isLoading } = useFinancialRatios({
    symbol,
    limit: period === 'FY' ? 6 : 28,
    period,
  });

  const financialRatiosData = (data?.data ?? []) as FinancialRatiosItem[];

  const sortedData = financialRatiosData
    .filter((item) => parseInt(item.fiscalYear, 10) > 2020)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="flex flex-col gap-6">
      <PeriodToggle value={period} onChange={setPeriod} />
      {isLoading ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
          <p className="text-sm">재무 비율을 불러오는 중입니다.</p>
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
              {activeChart === 'profitability' && (
                <FinancialRatiosProfitabilityChart sortedData={sortedData} />
              )}
              {activeChart === 'valuation' && (
                <FinancialRatiosValuationChart sortedData={sortedData} />
              )}
              {activeChart === 'liquidity' && (
                <FinancialRatiosLiquidityChart sortedData={sortedData} />
              )}
              {activeChart === 'leverage' && (
                <FinancialRatiosLeverageChart sortedData={sortedData} />
              )}
              {activeChart === 'dividend' && (
                <FinancialRatiosDividendChart sortedData={sortedData} />
              )}
              {activeChart === 'perShare' && (
                <FinancialRatiosPerShareChart sortedData={sortedData} />
              )}
            </div>
          )}
          <FinancialRatiosTable sortedData={sortedData} />
        </>
      )}
    </div>
  );
};

export default FinancialRatiosSection;
