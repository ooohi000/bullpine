'use client';

import React, { useMemo, useState } from 'react';
import HighchartsChart from '@/components/common/HighchartsChart';
import type { Options } from 'highcharts';
import { chartSeriesColor } from '@/constants/chartSeriesColors';
import { formatNumber } from '@/lib/utils/format';
import { EarningsItem } from '@/types';

const SERIES: {
  key: keyof Pick<
    EarningsItem,
    'epsActual' | 'epsEstimated' | 'revenueActual' | 'revenueEstimated'
  >;
  name: string;
  color: string;
}[] = [
  { key: 'epsActual', name: 'EPS 실적', color: chartSeriesColor(0) },
  { key: 'epsEstimated', name: 'EPS 추정', color: chartSeriesColor(1) },
  { key: 'revenueActual', name: '매출 실적', color: chartSeriesColor(2) },
  { key: 'revenueEstimated', name: '매출 추정', color: chartSeriesColor(3) },
];

const DEFAULT_VISIBLE_KEYS = ['epsActual', 'epsEstimated'];

function formatEarningsAxisCategory(dateStr: string): string {
  const [year, month] = dateStr.split('-');
  return `${year.slice(2)}.${month.padStart(2, '0')}`;
}

function formatEarningsTooltipTitle(item: EarningsItem): string {
  const [year, month] = item.date.split('-');
  return `${year}년 ${month.padStart(2, '0')}월`;
}

function earningsTooltipPositioner(
  this: unknown,
  labelWidth: number,
  labelHeight: number,
  point: { plotX?: number; plotY?: number },
) {
  const chart = (
    this as { chart: { plotLeft: number; plotWidth: number; plotTop: number } }
  ).chart;
  const plotLeft = chart.plotLeft;
  const plotRight = chart.plotLeft + chart.plotWidth;
  const plotTop = chart.plotTop;
  let x = (point.plotX ?? 0) + plotLeft - labelWidth / 2;
  const y = Math.max(4, (point.plotY ?? 0) + plotTop - labelHeight - 8);
  x = Math.max(plotLeft, Math.min(x, plotRight - labelWidth));
  return { x: Math.max(4, x), y };
}

interface EarningsSummaryChartProps {
  sortedData: EarningsItem[];
  exchangeRate: number | null;
}

const EarningsSummaryChart = ({
  sortedData,
  exchangeRate,
}: EarningsSummaryChartProps) => {
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(
    () => new Set(DEFAULT_VISIBLE_KEYS),
  );

  const toggleSeries = (key: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const categories = useMemo(
    () => sortedData.map((item) => formatEarningsAxisCategory(item.date)),
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
      yAxis: [
        {
          title: { text: '' },
          gridLineColor: 'hsl(220, 15%, 18%)',
          labels: {
            style: { color: 'hsl(215, 20%, 70%)', fontSize: '11px' },
            formatter: function () {
              return formatNumber(this.value as number);
            },
          },
        },
        {
          title: { text: '' },
          opposite: true,
          gridLineWidth: 1,
          gridLineColor: 'hsl(220, 14%, 22%)',
          gridLineDashStyle: 'Dash',
          labels: {
            style: { color: 'hsl(215, 20%, 70%)', fontSize: '11px' },
            formatter: function () {
              const v = this.value as number;
              const av = Math.abs(v);
              if (av >= 1e9) return `${v / 1e9}B`;
              if (av >= 1e6) return `${v / 1e6}M`;
              if (av >= 1e3) return `${v / 1e3}k`;
              return String(v);
            },
          },
        },
      ],
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
        positioner: earningsTooltipPositioner,
        formatter: function () {
          const points = (this.points ?? []).filter((p) => p.y != null);
          if (points.length === 0) return '';
          const idx = Number(this.x);
          const item = sortedData[idx];
          const dateLabel = item
            ? formatEarningsTooltipTitle(item)
            : (categories[idx] ?? '');
          const rows = points
            .map((p, i) => {
              const sep =
                i < points.length - 1
                  ? 'border-bottom:1px solid hsl(220,14%,18%);'
                  : '';
              const yStr =
                p.y != null
                  ? p.series.name.includes('매출')
                    ? exchangeRate
                      ? `${formatNumber(Math.round(Number(p.y) * exchangeRate))} 원`
                      : `${formatNumber(Number(p.y))} 달러`
                    : formatNumber(Number(p.y))
                  : '-';
              return `<div style="display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:14px;row-gap:2px;align-items:start;padding:8px 0;${sep}">
              <span style="color:hsl(215,14%,72%);font-size:11px;line-height:1.4;word-break:keep-all;overflow-wrap:break-word;">${p.series.name}</span>
              <span style="color:${p.color};font-weight:700;font-size:12px;line-height:1.35;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums;">${yStr}</span>
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
        data: sortedData.map((item) => item[key] ?? null),
        color,
        lineWidth: 2,
        visible: visibleKeys.has(key),
        yAxis: key.startsWith('revenue') ? 1 : 0,
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
    [sortedData, categories, visibleKeys, exchangeRate],
  );

  if (sortedData.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="border-b border-border bg-muted/60 px-5 py-3">
        <h3 className="text-base font-semibold text-foreground">실적 추이</h3>
      </div>
      <div className="p-4 md:p-5">
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
          EPS 실적·추정은 <span className="text-foreground/85">왼쪽 축</span>,
          매출 실적·추정은 <span className="text-foreground/85">오른쪽 축</span>
          을 사용합니다.
        </p>
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

export default EarningsSummaryChart;
