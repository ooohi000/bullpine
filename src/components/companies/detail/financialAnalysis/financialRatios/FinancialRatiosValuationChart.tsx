'use client';

import HighchartsChart from '@/components/common/HighchartsChart';
import { chartSeriesColor } from '@/constants/chartSeriesColors';
import type { FinancialRatiosItem } from '@/types/financialAnalysis';
import type { Options } from 'highcharts';
import React, { useMemo, useState } from 'react';
import {
  chartTheme,
  createFinancialRatiosSharedTooltipFormatter,
  financialRatiosResponsive,
  financialRatiosTooltipPositioner,
  getFinancialRatiosCategories,
} from './chartUtils';
import { PeriodType } from '@/types';

const SERIES: {
  key: keyof FinancialRatiosItem;
  name: string;
  color: string;
}[] = [
  { key: 'priceToEarningsRatio', name: 'PER', color: chartSeriesColor(0) },
  { key: 'priceToBookRatio', name: 'PBR', color: chartSeriesColor(1) },
  { key: 'priceToSalesRatio', name: 'PSR', color: chartSeriesColor(2) },
  {
    key: 'priceToFreeCashFlowRatio',
    name: '주가/FCF',
    color: chartSeriesColor(3),
  },
];

interface Props {
  sortedData: FinancialRatiosItem[];
  period: PeriodType;
}

export default function FinancialRatiosValuationChart({
  sortedData,
  period,
}: Props) {
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(
    () => new Set(SERIES.map((s) => s.key)),
  );
  const toggle = (key: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const categories = useMemo(
    () => getFinancialRatiosCategories(sortedData, period),
    [sortedData, period],
  );

  const options: Options = useMemo(
    () => ({
      chart: { type: 'line', ...chartTheme.chart },
      title: { text: '' },
      legend: { enabled: false },
      credits: { enabled: false },
      xAxis: { ...chartTheme.xAxis, categories },
      yAxis: {
        title: { text: '' },
        gridLineColor: chartTheme.xAxisLine,
        labels: { ...chartTheme.tooltip.style, format: '{value}' },
        plotLines: [
          { value: 0, width: 1, color: 'hsl(220, 15%, 20%)', zIndex: 2 },
        ],
      },
      tooltip: {
        ...chartTheme.tooltip,
        positioner: financialRatiosTooltipPositioner,
        formatter: createFinancialRatiosSharedTooltipFormatter(
          sortedData,
          categories,
          (y) => Number(y).toFixed(2),
        ),
      },
      responsive: financialRatiosResponsive,
      plotOptions: {
        line: { lineWidth: 2, marker: { radius: 3, symbol: 'circle' } },
      },
      series: SERIES.map(({ key, name, color }) => ({
        type: 'line' as const,
        name,
        data: sortedData.map((d) => {
          const v = d[key];
          return typeof v === 'number' && !Number.isNaN(v) ? v : null;
        }),
        color,
        visible: visibleKeys.has(key),
      })),
    }),
    [sortedData, categories, visibleKeys],
  );

  if (sortedData.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="border-b border-border bg-muted/60 px-5 py-3">
        <h3 className="text-base font-semibold text-foreground">
          밸류에이션 배수 추이
        </h3>
      </div>
      <div className="p-4 md:p-5">
        <div className="flex flex-wrap gap-1.5 mb-4">
          {SERIES.map(({ key, name, color }) => {
            const isOn = visibleKeys.has(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggle(key)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors border ${
                  isOn
                    ? 'border-transparent text-white'
                    : 'border-border bg-muted/50 text-muted-foreground hover:text-foreground'
                }`}
                style={isOn ? { backgroundColor: color } : undefined}
              >
                {name}
              </button>
            );
          })}
        </div>
        <div className="min-h-[250px] md:min-h-[300px]">
          <div className="min-w-0 w-full">
            <HighchartsChart options={options} className="w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
