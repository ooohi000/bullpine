'use client';

import React, { useMemo, useState } from 'react';
import HighchartsChart from '@/components/common/HighchartsChart';
import { chartSeriesColor } from '@/constants/chartSeriesColors';
import type { DividendsItem } from '@/types';
import type { Options } from 'highcharts';
import { formatNumber } from '@/lib/utils/format';

type DividendsSeriesKey = keyof Pick<DividendsItem, 'dividend' | 'yield'>;

const SERIES_CONFIG: { key: DividendsSeriesKey; name: string }[] = [
  { key: 'dividend', name: '주당 배당금' },
  { key: 'yield', name: '배당 수익률' },
];

const SERIES = SERIES_CONFIG.map((s, i) => ({
  ...s,
  color: chartSeriesColor(i),
}));

function formatDividendsTooltipTitle(item: DividendsItem): string {
  const d = item.recordDate || item.date;
  const [y, m] = d.split('-');
  if (!y || !m) return d;
  return `${y}년 ${parseInt(m, 10)}월`;
}

function dividendsTooltipPositioner(
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

interface DividendsSummaryChartProps {
  sortedData: DividendsItem[];
  exchangeRate: number | null;
}

const DividendsSummaryChart = ({
  sortedData,
  exchangeRate,
}: DividendsSummaryChartProps) => {
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(
    () => new Set(SERIES.map((s) => s.key)),
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
    () =>
      sortedData.map((item) => {
        const [year, month] = item.date.split('-');
        return `${year.slice(2)}.${month.padStart(2, '0')}`;
      }),
    [sortedData],
  );

  const options: Options = useMemo(
    () => ({
      chart: {
        type: 'line',
        height: 340,
        backgroundColor: 'transparent',
        spacing: [16, 4, 16, 4],
        style: { fontFamily: 'inherit' },
      },
      title: { text: '' },
      legend: { enabled: false },
      credits: { enabled: false },
      xAxis: {
        categories,
        crosshair: {
          width: 1,
          color: 'hsl(220, 15%, 35%)',
          dashStyle: 'Dash',
        },
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
          min: 0,
          gridLineColor: 'hsl(220, 15%, 18%)',
          labels: {
            style: { color: 'hsl(215, 20%, 70%)', fontSize: '11px' },
            format: '${value}',
          },
        },
        {
          title: { text: '' },
          opposite: true,
          min: 0,
          gridLineWidth: 1,
          gridLineColor: 'hsl(220, 14%, 22%)',
          gridLineDashStyle: 'Dash',
          labels: {
            style: { color: 'hsl(215, 20%, 70%)', fontSize: '11px' },
            format: '{value}%',
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
        positioner: dividendsTooltipPositioner,
        formatter: function () {
          const points = (this.points ?? []).filter((p) => p.y != null);
          if (points.length === 0) return '';
          const idx = Number(this.x);
          const item = sortedData[idx];
          const dateLabel = item
            ? formatDividendsTooltipTitle(item)
            : (categories[idx] ?? '');
          const rows = points
            .map((p, i) => {
              const sep =
                i < points.length - 1
                  ? 'border-bottom:1px solid hsl(220,14%,18%);'
                  : '';
              const meta = SERIES[p.series.index];
              const isYield = meta?.key === 'yield';
              const yStr = isYield
                ? `${Number(p.y).toFixed(2)}%`
                : exchangeRate
                  ? `${formatNumber(Math.round(Number(p.y) * exchangeRate))} 원`
                  : `${formatNumber(Number(p.y))} 달러`;
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
      series: SERIES.map(({ key, name, color }, i) => ({
        type: 'line',
        name,
        data: sortedData.map((item) => item[key] ?? null),
        color,
        yAxis: i,
        lineWidth: 2,
        visible: visibleKeys.has(key),
      })),
      responsive: {
        rules: [
          {
            condition: { maxWidth: 680 },
            chartOptions: {
              chart: { height: 280 },
              xAxis: { labels: { enabled: false } },
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
        <h3 className="text-base font-semibold text-foreground">
          주당 배당금 · 배당 수익률 추이
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
        <div className="min-h-[340px] w-full min-w-0 overflow-x-auto overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch]">
          <div className="shrink-0">
            <HighchartsChart options={options} className="w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DividendsSummaryChart;
