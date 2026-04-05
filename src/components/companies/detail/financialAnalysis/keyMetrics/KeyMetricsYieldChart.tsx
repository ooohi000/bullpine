'use client';

import React, { useMemo, useState } from 'react';
import HighchartsChart from '@/components/common/HighchartsChart';
import { chartSeriesColor } from '@/constants/chartSeriesColors';
import type { KeyMetricsItem } from '@/types/financialAnalysis';
import type { Options } from 'highcharts';
import {
  chartTheme,
  createKeyMetricsSharedTooltipFormatter,
  getKeyMetricsCategories,
  keyMetricsResponsive,
  keyMetricsTooltipPositioner,
} from './chartUtils';

const SERIES = [
  { key: 'earningsYield', name: '이익수익률', color: chartSeriesColor(0) },
  { key: 'fcfYield', name: 'FCF 수익률', color: chartSeriesColor(1) },
];

interface KeyMetricsYieldChartProps {
  sortedData: KeyMetricsItem[];
}

export default function KeyMetricsYieldChart({
  sortedData,
}: KeyMetricsYieldChartProps) {
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
    () => getKeyMetricsCategories(sortedData),
    [sortedData],
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
        labels: { ...chartTheme.tooltip.style, format: '{value}%' },
        plotLines: [
          { value: 0, width: 1, color: 'hsl(220, 15%, 20%)', zIndex: 2 },
        ],
      },
      tooltip: {
        ...chartTheme.tooltip,
        positioner: keyMetricsTooltipPositioner,
        formatter: createKeyMetricsSharedTooltipFormatter(
          sortedData,
          categories,
          (y) => `${Number(y).toFixed(2)}%`,
        ),
      },
      responsive: keyMetricsResponsive,
      plotOptions: {
        line: { lineWidth: 2, marker: { radius: 3, symbol: 'circle' } },
      },
      series: [
        {
          type: 'line' as const,
          name: '이익수익률',
          data: sortedData.map((d) =>
            d.earningsYield != null ? d.earningsYield * 100 : null,
          ),
          color: chartSeriesColor(0),
          visible: visibleKeys.has('earningsYield'),
        },
        {
          type: 'line' as const,
          name: 'FCF 수익률',
          data: sortedData.map((d) =>
            d.freeCashFlowYield != null ? d.freeCashFlowYield * 100 : null,
          ),
          color: chartSeriesColor(1),
          visible: visibleKeys.has('fcfYield'),
        },
      ],
    }),
    [sortedData, categories, visibleKeys],
  );

  if (sortedData.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="border-b border-border bg-muted/60 px-5 py-3">
        <h3 className="text-base font-semibold text-foreground">
          수익률 추이 (이익수익률, FCF 수익률)
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
