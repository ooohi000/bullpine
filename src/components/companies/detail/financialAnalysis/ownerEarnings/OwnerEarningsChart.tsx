'use client';

import React, { useMemo, useState } from 'react';
import HighchartsChart from '@/components/common/HighchartsChart';
import { chartSeriesColor } from '@/constants/chartSeriesColors';
import type { Options } from 'highcharts';
import { OwnerEarningsItem } from '@/types/financialAnalysis';
import { formatNumber } from '@/lib/utils/format';

interface OwnerEarningsChartProps {
  sortedData: OwnerEarningsItem[];
  exchangeRate: number | null;
}

const SERIES = [
  {
    key: 'ownersEarnings',
    name: '주주잉여현금흐름',
    color: chartSeriesColor(0),
  },
  {
    key: 'ownersEarningsPerShare',
    name: '주당 주주잉여현금흐름',
    color: chartSeriesColor(1),
  },
] as const;

function formatOwnerEarningsAxisCategory(date: string): string {
  const [year, month] = date.split('-');
  if (!year || !month) return date;
  return `${year.slice(2)}.${parseInt(month, 10).toString().padStart(2, '0')}`;
}

function formatOwnerEarningsTooltipTitle(date: string): string {
  const [year, month] = date.split('-');
  if (!year || !month) return date;
  return `${year}년 ${parseInt(month, 10)}월`;
}

function ownerEarningsTooltipPositioner(
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

const OwnerEarningsChart = ({
  sortedData,
  exchangeRate,
}: OwnerEarningsChartProps) => {
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
    () => sortedData.map((item) => formatOwnerEarningsAxisCategory(item.date)),
    [sortedData],
  );
  const ownersEarningsData = useMemo(
    () => sortedData.map((item) => item.ownersEarnings ?? null),
    [sortedData],
  );
  const perShareData = useMemo(
    () => sortedData.map((item) => item.ownersEarningsPerShare ?? null),
    [sortedData],
  );

  const options: Options = useMemo(
    () => ({
      chart: {
        type: 'column',
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
          style: { color: 'hsl(215, 20%, 70%)', fontSize: '10px' },
        },
        tickLength: 4,
        lineWidth: 1,
        lineColor: 'hsl(220, 15%, 20%)',
      },
      yAxis: [
        {
          title: { text: '' },
          opposite: false,
          gridLineColor: 'hsl(220, 15%, 18%)',
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
              const v = this.value as number;
              const av = Math.abs(v);
              if (av >= 1e9) return `${v / 1e9}B`;
              if (av >= 1e6) return `${v / 1e6}M`;
              if (av >= 1e3) return `${v / 1e3}k`;
              return Number(v).toLocaleString();
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
              return Number(this.value as number).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });
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
        style: { color: 'hsl(210, 20%, 96%)', fontSize: '11px' },
        shared: true,
        useHTML: true,
        outside: false,
        positioner: ownerEarningsTooltipPositioner,
        formatter: function () {
          const points = (this.points ?? []).filter((p) => p.y != null);
          if (points.length === 0) return '';
          const idx = Number(this.x);
          const item = sortedData[idx];
          const dateLabel = item
            ? formatOwnerEarningsTooltipTitle(item.date)
            : (categories[idx] ?? '');

          const rows = points
            .map((p, i) => {
              const sep =
                i < points.length - 1
                  ? 'border-bottom:1px solid hsl(220,14%,18%);'
                  : '';
              const isPerShare = p.series.name === '주당 주주잉여현금흐름';
              const yStr = isPerShare
                ? Number(p.y).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
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
        column: {
          borderRadius: 4,
          pointPadding: 0.12,
          groupPadding: 0.2,
          borderWidth: 0,
          shadow: false,
          dataLabels: { enabled: false },
        },
        line: {
          lineWidth: 2,
          marker: { radius: 3, symbol: 'circle' },
          dataLabels: { enabled: false },
        },
      },
      series: [
        {
          type: 'column',
          name: '주주잉여현금흐름',
          data: ownersEarningsData,
          color: chartSeriesColor(0),
          yAxis: 0,
          visible: visibleKeys.has('ownersEarnings'),
        },
        {
          type: 'line',
          name: '주당 주주잉여현금흐름',
          data: perShareData,
          color: chartSeriesColor(1),
          yAxis: 1,
          visible: visibleKeys.has('ownersEarningsPerShare'),
        },
      ],
      responsive: {
        rules: [
          {
            condition: { maxWidth: 680 },
            chartOptions: {
              chart: { height: 250 },
              xAxis: { labels: { enabled: false } },
            },
          },
        ],
      },
    }),
    [
      categories,
      ownersEarningsData,
      perShareData,
      sortedData,
      visibleKeys,
      exchangeRate,
    ],
  );

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="border-b border-border bg-muted/60 px-5 py-3">
        <h3 className="text-base font-semibold text-foreground">
          주주잉여현금흐름
        </h3>
      </div>
      <div className="p-4 md:p-5">
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

export default OwnerEarningsChart;
