'use client';

import React, { useMemo, useState } from 'react';
import HighchartsChart from '@/components/common/HighchartsChart';
import { chartSeriesColor } from '@/constants/chartSeriesColors';
import type { IncomeItem } from '@/types';
import type { Options } from 'highcharts';

const SERIES: {
  key: keyof IncomeItem;
  name: string;
  color: string;
  group:
    | 'revenue'
    | 'costOfRevenue'
    | 'grossProfit'
    | 'operatingIncome'
    | 'netIncome';
}[] = [
  {
    key: 'revenue',
    name: '매출액',
    color: chartSeriesColor(0),
    group: 'revenue',
  },
  {
    key: 'costOfRevenue',
    name: '매출원가',
    color: chartSeriesColor(1),
    group: 'costOfRevenue',
  },
  {
    key: 'grossProfit',
    name: '매출총이익',
    color: chartSeriesColor(2),
    group: 'grossProfit',
  },
  {
    key: 'operatingIncome',
    name: '영업이익',
    color: chartSeriesColor(3),
    group: 'operatingIncome',
  },
  {
    key: 'netIncome',
    name: '당기순이익',
    color: chartSeriesColor(4),
    group: 'netIncome',
  },
];

const DEFAULT_VISIBLE_KEYS: (keyof IncomeItem)[] = [
  'grossProfit',
  'operatingIncome',
  'netIncome',
];

function isQuarterPeriod(period: string | undefined): boolean {
  return /Q/i.test(period ?? '');
}

/** Q1 → 1분기 (축·툴팁 공통) */
function quarterKoreanLabel(period: string): string {
  return period.split('').reverse().join('').replace(/Q/gi, '분기');
}

/** 툴팁 상단: FY·연간은 년도만, 분기는 회계연도 + 분기 한 줄 */
function formatTooltipPeriodTitle(item: IncomeItem): string {
  const year = item.fiscalYear;
  const p = (item.period ?? '').trim();
  if (isQuarterPeriod(p)) {
    return `${year}년 ${quarterKoreanLabel(p)}`;
  }
  return `${year}년`;
}

interface IncomeSummaryChartProps {
  sortedData: IncomeItem[];
}

const IncomeSummaryChart = ({ sortedData }: IncomeSummaryChartProps) => {
  const [visibleKeys, setVisibleKeys] = useState<Set<keyof IncomeItem>>(
    () => new Set(DEFAULT_VISIBLE_KEYS),
  );

  const toggleSeries = (key: keyof IncomeItem) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const categories = useMemo(
    () =>
      sortedData.map((item) => {
        const year = item.fiscalYear;
        return item.period?.includes('Q')
          ? item.period === 'Q1'
            ? `${year}년<br/>${item.period.split('').reverse().join('').replace('Q', '분기')}`
            : item.period.split('').reverse().join('').replace('Q', '분기')
          : `${year}년`;
      }),
    [sortedData],
  );

  const options: Options = useMemo(
    () => ({
      chart: {
        type: 'line',
        height: 300,
        backgroundColor: 'transparent',
        spacing: [16, 4, 16, 4],
        style: { fontFamily: 'inherit' },
      },
      title: { text: '' },
      legend: { enabled: false },
      credits: { enabled: false },
      xAxis: {
        categories,
        crosshair: { width: 1, color: 'hsl(220, 15%, 35%)', dashStyle: 'Dash' },
        labels: {
          useHTML: true,
          rotation: 0,
          overflow: 'allow',
          style: {
            color: 'hsl(215, 20%, 70%)',
            fontSize: '10px',
          },
        },
        tickLength: 4,
        lineWidth: 1,
        lineColor: 'hsl(220, 15%, 20%)',
      },
      yAxis: {
        title: { text: '' },
        gridLineColor: 'hsl(220, 15%, 18%)',
        plotBands: [
          {
            from: -Infinity,
            to: 0,
            color: 'hsla(0, 66%, 37%, 0.12)',
            zIndex: 0,
          },
        ],
        plotLines: [
          {
            value: 0,
            width: 1,
            color: 'hsl(220, 15%, 20%)',
            zIndex: 2,
          },
        ],
        labels: {
          style: { color: 'hsl(215, 20%, 70%)', fontSize: '11px' },
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
        backgroundColor: 'hsl(220, 22%, 11%)',
        borderColor: 'hsl(220, 14%, 24%)',
        borderRadius: 8,
        padding: 12,
        shadow: false,
        style: {
          color: 'hsl(210, 20%, 96%)',
          fontSize: '11px',
        },
        shared: true,
        useHTML: true,
        outside: false,
        positioner: function (labelWidth, labelHeight, point) {
          const chart = (
            this as unknown as {
              chart: { plotLeft: number; plotWidth: number; plotTop: number };
            }
          ).chart;
          const plotLeft = chart.plotLeft;
          const plotRight = chart.plotLeft + chart.plotWidth;
          const plotTop = chart.plotTop;
          let x = (point.plotX ?? 0) + plotLeft - labelWidth / 2;
          const y = Math.max(4, (point.plotY ?? 0) + plotTop - labelHeight - 8);
          x = Math.max(plotLeft, Math.min(x, plotRight - labelWidth));
          return { x: Math.max(4, x), y };
        },
        formatter: function () {
          const points = (this.points ?? []).filter((p) => p.y != null);
          if (points.length === 0) return '';
          const idx = Number(this.x);
          const item = sortedData[idx];
          const dateLabel = item
            ? formatTooltipPeriodTitle(item)
            : (categories[idx] ?? '').replace(/<br\s*\/?>/gi, ' ');
          const rows = points
            .map((p, i) => {
              const sep =
                i < points.length - 1
                  ? 'border-bottom:1px solid hsl(220,14%,18%);'
                  : '';
              return `<div style="display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:14px;row-gap:2px;align-items:start;padding:8px 0;${sep}">
              <span style="color:hsl(215,14%,72%);font-size:11px;line-height:1.4;word-break:keep-all;overflow-wrap:break-word;">${p.series.name}</span>
              <span style="color:${p.color};font-weight:700;font-size:12px;line-height:1.35;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums;">${Number(p.y).toLocaleString()}</span>
            </div>`;
            })
            .join('');
          return `<div style="width:max-content;min-width:200px;max-width:min(300px,calc(100vw - 24px));box-sizing:border-box;">
            <div style="margin:0 0 4px;padding-bottom:10px;border-bottom:1px solid hsl(220,14%,22%);font-weight:600;font-size:12px;line-height:1.35;color:hsl(210,20%,96%);word-break:keep-all;">${dateLabel}</div>
            <div style="display:block;">${rows}</div>
          </div>`;
        },
      },
      plotOptions: {
        line: {
          lineWidth: 2,
          marker: { radius: 3, symbol: 'circle' },
        },
      },
      series: SERIES.map(({ key, name, color }) => ({
        type: 'line',
        name,
        data: sortedData.map((item) => item[key] as number),
        color,
        lineWidth: 2,
        visible: visibleKeys.has(key),
      })),
      responsive: {
        rules: [
          {
            condition: { maxWidth: 680 },
            chartOptions: {
              chart: { height: 250 },
              xAxis: {
                labels: { enabled: false },
              },
            },
          },
        ],
      },
    }),
    [sortedData, categories, visibleKeys],
  );

  if (sortedData.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="border-b border-border bg-muted/60 px-5 py-3">
        <h3 className="text-base font-semibold text-foreground">손익 추이</h3>
      </div>
      <div className="p-4 md:p-5">
        <div className="flex flex-wrap gap-1.5 mb-4">
          {SERIES.map(({ key, name, color }) => {
            const isOn = visibleKeys.has(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleSeries(key)}
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
};

export default IncomeSummaryChart;
