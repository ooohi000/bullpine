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
  { key: 'marketCap' as const, name: '시가총액', color: chartSeriesColor(0) },
  {
    key: 'enterpriseValue' as const,
    name: '기업가치 (EV)',
    color: chartSeriesColor(1),
  },
];

interface KeyMetricsValuationSizeChartProps {
  sortedData: KeyMetricsItem[];
}

export default function KeyMetricsValuationSizeChart({
  sortedData,
}: KeyMetricsValuationSizeChartProps) {
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
      chart: { type: 'column', ...chartTheme.chart },
      title: { text: '' },
      legend: { enabled: false },
      credits: { enabled: false },
      xAxis: { ...chartTheme.xAxis, categories },
      yAxis: {
        title: { text: '' },
        gridLineColor: chartTheme.xAxisLine,
        labels: {
          ...chartTheme.tooltip.style,
          formatter: function () {
            const v = Math.abs(this.value as number);
            if (v >= 1e9) return `${(this.value as number) / 1e9}B`;
            if (v >= 1e6) return `${(this.value as number) / 1e6}M`;
            if (v >= 1e3) return `${(this.value as number) / 1e3}k`;
            return String(this.value);
          },
        },
      },
      tooltip: {
        ...chartTheme.tooltip,
        positioner: keyMetricsTooltipPositioner,
        formatter: createKeyMetricsSharedTooltipFormatter(
          sortedData,
          categories,
          (y) => Number(y).toLocaleString(),
        ),
      },
      responsive: keyMetricsResponsive,
      plotOptions: {
        column: {
          borderRadius: 4,
          pointPadding: 0.15,
          groupPadding: 0.2,
          borderWidth: 0,
        },
      },
      series: SERIES.map(({ key, name, color }) => ({
        type: 'column' as const,
        name,
        data: sortedData.map((d) =>
          key === 'marketCap'
            ? (d.marketCap ?? null)
            : (d.enterpriseValue ?? null),
        ),
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
          가치·규모 추이 (시가총액 / 기업가치)
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
