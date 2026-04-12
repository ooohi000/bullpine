'use client';

import React, { useMemo, useState } from 'react';
import HighchartsChart from '@/components/common/HighchartsChart';
import type { StockPriceAndVolumeItem } from '@/types/chartsAnalysis';
import type { Options } from 'highcharts';
import { chartSeriesColor } from '@/constants/chartSeriesColors';

const toTs = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};

const SERIES_OPTIONS = [
  { key: 'stock-price' as const, name: '주가', color: chartSeriesColor(0) },
];

interface StockPriceEnterpriseChartProps {
  sortedStockPriceAndVolume: StockPriceAndVolumeItem[];
}

const StockPriceEnterpriseChart = ({
  sortedStockPriceAndVolume,
}: StockPriceEnterpriseChartProps) => {
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(
    () => new Set(SERIES_OPTIONS.map((s) => s.key)),
  );

  const toggleSeries = (key: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const { closePriceData } = useMemo(() => {
    const daily = sortedStockPriceAndVolume ?? [];
    const close: [number, number][] = daily.map((item) => [
      toTs(item.date),
      item.close,
    ]);

    return {
      closePriceData: close,
    };
  }, [sortedStockPriceAndVolume]);

  const options: Options = useMemo(
    () => ({
      chart: {
        height: 420,
        backgroundColor: 'transparent',
        spacing: [16, 4, 16, 4],
      },
      title: { text: '' },
      legend: { enabled: false },
      credits: { enabled: false },
      xAxis: [
        {
          type: 'datetime',
          crosshair: true,
          lineWidth: 0,
          lineColor: 'hsl(220, 15%, 18%)',
          tickLength: 0,
          tickAmount: 8,
          top: '100%',
          height: 0,
          offset: 0,
          dateTimeLabelFormats: {
            day: '%y.%m.%d',
            week: '%y.%m.%d',
            month: '%y.%m',
            year: '%Y',
          },
          labels: {
            style: {
              color: 'hsl(215, 20%, 70%)',
              fontSize: '11px',
            },
          },
        },
        {
          type: 'datetime',
          linkedTo: 0,
          offset: 0,
          lineWidth: 0,
          tickLength: 0,
          labels: { enabled: false },
          crosshair: true,
        },
      ],
      yAxis: [
        {
          title: { text: '' },
          gridLineColor: 'hsl(220, 15%, 18%)',
          height: '100%',
          resize: { enabled: true },
          tickAmount: 6,
          minPadding: 0.05,
          maxPadding: 0.05,
          opposite: true,
          labels: {
            align: 'left',
            x: 10,
            style: { color: 'hsl(215, 20%, 70%)', fontSize: '11px' },
            formatter: function () {
              return `$${Number(this.value).toFixed(2)}`;
            },
          },
        },
      ],
      tooltip: {
        backgroundColor: 'hsl(220, 23%, 10%)',
        borderColor: 'hsl(220, 15%, 20%)',
        style: { color: 'hsl(210, 20%, 96%)', fontSize: '11px' },
        shared: true,
        useHTML: true,
        formatter: function () {
          const points = (this.points ?? []).filter((p) => p.y != null);
          if (points.length === 0) return '';
          const xVal = this.x as number;
          const dateLabel =
            typeof xVal === 'number'
              ? new Date(xVal).toISOString().slice(0, 10)
              : '';
          const rows = points.map((p) => {
            const name = p.series.name;
            const y = Number(p.y);
            return `<span style="color:${p.color}">●</span> ${name}: <b>$${y.toFixed(2)}</b>`;
          });
          return `<div style="margin-bottom:6px; font-weight:600;">${dateLabel}</div><div style="line-height:1.6;">${rows.join('<br/>')}</div>`;
        },
      },
      plotOptions: {
        series: {
          states: {
            inactive: {
              opacity: 1,
            },
          },
        },
        line: {
          lineWidth: 1.5,
          marker: { radius: 3 },
        },
      },
      series: [
        {
          type: 'line',
          id: 'stock-price',
          name: '주가',
          data: closePriceData,
          xAxis: 0,
          yAxis: 0,
          color: SERIES_OPTIONS[0].color,
          zIndex: 2,
          visible: visibleKeys.has('stock-price'),
        },
      ],
      scrollbar: { enabled: false },
      responsive: { rules: [] },
    }),
    [closePriceData, visibleKeys],
  );

  const hasDaily = (sortedStockPriceAndVolume?.length ?? 0) > 0;
  if (!hasDaily) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border bg-muted/60 px-5 py-3">
          <h3 className="text-base font-semibold text-foreground">
            주가 · 기업가치
          </h3>
        </div>
        <div className="p-10 text-center text-muted-foreground text-sm">
          주가·거래량 또는 기업가치 데이터가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="border-b border-border bg-muted/60 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-foreground">
          주가 · 기업가치
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {SERIES_OPTIONS.map(({ key, name, color }) => {
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
      </div>
      <div className="p-4 md:p-5">
        <div
          className="min-h-[340px] w-full min-w-0 overflow-hidden"
          style={{ touchAction: 'none' }}
        >
          <HighchartsChart options={options} className="w-full" />
        </div>
      </div>
    </div>
  );
};

export default StockPriceEnterpriseChart;
