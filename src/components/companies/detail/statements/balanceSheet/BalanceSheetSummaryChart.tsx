'use client';

import React, { useMemo, useState } from 'react';
import HighchartsChart from '@/components/common/HighchartsChart';
import { chartSeriesColor } from '@/constants/chartSeriesColors';
import type { BalanceSheetItem, PeriodType } from '@/types';
import type { Options } from 'highcharts';
import { formatNumber } from '@/lib';

/** group: 자산·부채·자본 구분. 시리즈 색은 `chartSeriesColor(0…)` 공통 팔레트 순서. */
const SERIES: {
  key: keyof BalanceSheetItem;
  name: string;
  color: string;
  group: 'equity' | 'assets' | 'liabilities';
}[] = [
  {
    key: 'totalEquity',
    name: '자본 총계',
    color: chartSeriesColor(0),
    group: 'equity',
  },
  {
    key: 'totalAssets',
    name: '자산 총계',
    color: chartSeriesColor(1),
    group: 'assets',
  },
  {
    key: 'totalCurrentAssets',
    name: '유동자산 합계',
    color: chartSeriesColor(2),
    group: 'assets',
  },
  {
    key: 'totalNonCurrentAssets',
    name: '비유동자산 합계',
    color: chartSeriesColor(3),
    group: 'assets',
  },
  {
    key: 'totalLiabilities',
    name: '부채 총계',
    color: chartSeriesColor(4),
    group: 'liabilities',
  },
  {
    key: 'totalCurrentLiabilities',
    name: '유동부채 합계',
    color: chartSeriesColor(5),
    group: 'liabilities',
  },
  {
    key: 'totalNonCurrentLiabilities',
    name: '비유동부채 합계',
    color: chartSeriesColor(6),
    group: 'liabilities',
  },
];

const DEFAULT_VISIBLE_KEYS: (keyof BalanceSheetItem)[] = [
  'totalEquity',
  'totalAssets',
  'totalLiabilities',
];

/** 툴팁 상단: FY·연간은 년도만, 분기는 년도 + 분기 한 줄 */
function formatTooltipPeriodTitle(
  item: BalanceSheetItem,
  period: PeriodType,
): string {
  const [year, month] = item.date.split('-');
  return period === 'FY'
    ? `${year}년`
    : `${year}년 ${month.padStart(2, '0')}월`;
}

interface BalanceSheetSummaryChartProps {
  sortedData: BalanceSheetItem[];
  exchangeRate: number | null;
  period: PeriodType;
}

const BalanceSheetSummaryChart = ({
  sortedData,
  exchangeRate,
  period,
}: BalanceSheetSummaryChartProps) => {
  const [visibleKeys, setVisibleKeys] = useState<Set<keyof BalanceSheetItem>>(
    () => new Set(DEFAULT_VISIBLE_KEYS),
  );

  const toggleSeries = (key: keyof BalanceSheetItem) => {
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
        const [year, month] = item.date.split('-');
        return period === 'FY'
          ? `${year}`
          : `${year.slice(2)}.${month.padStart(2, '0')}`;
      }),
    [sortedData, period],
  );

  const options: Options = useMemo(
    () => ({
      chart: {
        type: 'line',
        height: 300,
        backgroundColor: 'transparent',
        spacing: [20, 12, 20, 12],
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
            color: 'hsl(215, 16%, 68%)',
            fontSize: '11px',
            fontWeight: '500',
          },
        },
        tickLength: 6,
        lineWidth: 1,
        lineColor: 'hsl(220, 15%, 22%)',
        tickColor: 'hsl(220, 15%, 28%)',
      },
      yAxis: {
        title: { text: '' },
        gridLineColor: 'hsl(220, 14%, 16%)',
        gridLineWidth: 1,
        gridLineDashStyle: 'Dash',
        plotBands: [
          {
            from: -Infinity,
            to: 0,
            color: 'hsla(0, 50%, 40%, 0.08)',
            zIndex: 0,
          },
        ],
        plotLines: [
          {
            value: 0,
            width: 1,
            color: 'hsl(220, 12%, 28%)',
            zIndex: 2,
          },
        ],
        labels: {
          style: { color: 'hsl(215, 14%, 62%)', fontSize: '11px' },
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
            ? formatTooltipPeriodTitle(item, period)
            : (categories[idx] ?? '').replace(/<br\s*\/?>/gi, ' ');
          const rows = points
            .map((p, i) => {
              const sep =
                i < points.length - 1
                  ? 'border-bottom:1px solid hsl(220,14%,18%);'
                  : '';
              return `<div style="display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:14px;row-gap:2px;align-items:start;padding:8px 0;${sep}">
              <span style="color:hsl(215,14%,72%);font-size:11px;line-height:1.4;word-break:keep-all;overflow-wrap:break-word;">${p.series.name}</span>
              <span style="color:${p.color};font-weight:700;font-size:12px;line-height:1.35;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums;">${exchangeRate ? `${formatNumber(Math.round(Number(p.y) * exchangeRate))} 원` : `${formatNumber(Number(p.y))} 달러`}</span>
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
          lineWidth: 2.5,
          marker: {
            radius: 4,
            symbol: 'circle',
            lineWidth: 1,
            lineColor: 'hsl(220, 23%, 8%)',
          },
          states: {
            hover: { lineWidthPlus: 1 },
          },
        },
      },
      series: SERIES.map(({ key, name, color }) => ({
        type: 'line',
        name,
        data: sortedData.map((item) => item[key] as number),
        color,
        lineWidth: 2.5,
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
    [sortedData, categories, visibleKeys, exchangeRate, period],
  );

  if (sortedData.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="border-b border-border bg-muted/40 px-5 py-3.5">
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          자산·부채·자본 추이
        </h3>
      </div>
      <div className="p-4 md:p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          {SERIES.map(({ key, name, color }) => {
            const isOn = visibleKeys.has(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleSeries(key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all border ${
                  isOn
                    ? 'border-transparent text-white shadow-sm'
                    : 'border-border bg-muted/40 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                }`}
                style={isOn ? { backgroundColor: color } : undefined}
                aria-pressed={isOn}
              >
                <span
                  className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle"
                  style={{
                    backgroundColor: isOn ? 'rgba(255,255,255,0.85)' : color,
                  }}
                />
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

export default BalanceSheetSummaryChart;
