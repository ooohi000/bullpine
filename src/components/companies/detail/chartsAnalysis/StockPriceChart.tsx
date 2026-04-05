'use client';

import React, { useMemo } from 'react';
import HighchartsChart from '@/components/common/HighchartsChart';
import { chartSeriesColor } from '@/constants/chartSeriesColors';
import type { StockPriceAndVolumeItem } from '@/types/chartsAnalysis';
import type { Options } from 'highcharts';

/** 상승 / 하락 — 공통 팔레트 4(적색 계열)·1(파랑 계열) */
const COLOR_UP = chartSeriesColor(4);
const COLOR_DOWN = chartSeriesColor(1);

/** 처음 보여줄 캔들 개수 (줌 아웃 시 전체 노출) */
const INITIAL_VISIBLE_BARS = 60;

interface StockPriceChartProps {
  sortedStockPriceAndVolumeData: StockPriceAndVolumeItem[];
}

const StockPriceChart = ({
  sortedStockPriceAndVolumeData,
}: StockPriceChartProps) => {
  const { ohlc, volume } = useMemo(() => {
    const o: [number, number, number, number, number][] = [];
    const v: { x: number; y: number; color: string }[] = [];
    for (let i = 0; i < sortedStockPriceAndVolumeData.length; i++) {
      const item = sortedStockPriceAndVolumeData[i];
      const isVolumeUp =
        item.volume > (sortedStockPriceAndVolumeData[i - 1]?.volume ?? 0);

      const x = Date.UTC(
        +item.date.split('-')[0],
        +item.date.split('-')[1] - 1,
        +item.date.split('-')[2],
      );
      o.push([x, item.open, item.high, item.low, item.close]);
      // x는 인덱스로 둠. Highcharts category 축은 미리 정의된 categories일 때 x를 인덱스로만 배치함.
      // 순서가 ohlc·categories와 같으므로 인덱스 i = item.date(같은 날짜) 대응.
      v.push({
        x,
        y: Number(item.volume) || 0,
        color: isVolumeUp ? COLOR_UP : COLOR_DOWN,
      });
    }
    return { ohlc: o, volume: v };
  }, [sortedStockPriceAndVolumeData]);

  const options: Options = useMemo(
    () => ({
      chart: {
        height: 550,
        backgroundColor: 'transparent',
        spacing: [16, 4, 16, 4],
        zooming: {
          type: undefined,
          mouseWheel: {
            enabled: true,
            type: 'x',
          },
        },
        pinchType: 'x',
        panning: {
          enabled: true,
          type: 'x',
        },
        events: {
          selection: () => false,
        },
      },
      title: { text: '' },
      legend: { enabled: false },
      credits: { enabled: false },
      xAxis: [
        {
          type: 'datetime',
          min: ohlc[0]?.[0]
            ? ohlc[Math.max(0, ohlc.length - INITIAL_VISIBLE_BARS)][0]
            : undefined,
          max: ohlc[0]?.[0] ? ohlc[ohlc.length - 1][0] : undefined,
          crosshair: true,
          lineWidth: 30,
          lineColor: 'hsl(220, 15%, 18%)',
          tickLength: 0,
          top: '75%',
          height: 0,
          offset: 14,
          dateTimeLabelFormats: {
            day: '%y.%m.%d',
            week: '%y.%m.%d',
            month: '%y.%m',
            year: '%Y',
          },
          labels: {
            y: 4,
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
          height: '75%',
          resize: { enabled: true },
          tickAmount: 7,
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
        {
          title: { text: '' },
          gridLineColor: 'hsl(220, 15%, 18%)',
          top: '85%',
          height: '15%',
          offset: 0,
          tickAmount: 3,
          minPadding: 0.05,
          maxPadding: 0.05,
          opposite: true,
          labels: {
            align: 'left',
            x: 10,
            style: { color: 'hsl(215, 20%, 70%)', fontSize: '11px' },
            formatter: function () {
              const v = this.value as number;
              if (v >= 1e6) return `${(v / 1e6).toFixed(0)}M`;
              if (v >= 1e3) return `${(v / 1e3).toFixed(0)}k`;
              return String(v);
            },
          },
        },
      ],
      tooltip: {
        backgroundColor: 'hsl(220, 23%, 10%)',
        borderColor: 'hsl(220, 15%, 20%)',
        style: {
          color: 'hsl(210, 20%, 96%)',
          fontSize: '11px',
        },
        shared: true,
        useHTML: true,
        formatter: function () {
          const points = (this.points ?? []).filter((p) => p.y != null);
          if (points.length === 0) return '';
          const chart = (
            this as unknown as { chart: { xAxis: { categories: string[] }[] } }
          ).chart;
          const dateLabel =
            chart?.xAxis?.[0]?.categories?.[this.x as number] ?? '';
          const rows = points.map((p) => {
            const isVolume = p.series.name === '거래량';
            const val = isVolume
              ? Number(p.y).toLocaleString()
              : `$${Number(p.y).toFixed(2)}`;
            return `<span style="color:${p.color}">●</span> ${p.series.name}: <b>${val}</b>`;
          });
          return `<div style="margin-bottom:6px; font-weight:600;">${dateLabel}</div><div style="line-height:1.6;">${rows.join('<br/>')}</div>`;
        },
      },
      series: [
        {
          type: 'candlestick',
          id: 'stock-ohlc',
          name: '주가',
          data: ohlc,
          upColor: COLOR_UP,
          upLineColor: COLOR_UP,
          color: COLOR_DOWN,
          lineColor: COLOR_DOWN,
          xAxis: 0,
          yAxis: 0,
          lineWidth: 2,
        },
        {
          type: 'column',
          id: 'stock-volume',
          name: '거래량',
          data: volume,
          borderColor: 'transparent',
          xAxis: 0,
          yAxis: 1,
        },
      ],
      scrollbar: {
        enabled: true,
      },
      responsive: {
        rules: [],
      },
    }),

    [ohlc, volume],
  );

  if (sortedStockPriceAndVolumeData.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="border-b border-border bg-muted/60 px-5 py-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">
          주가 · 거래량
        </h3>
      </div>
      <div className="p-4 md:p-5">
        {/* overflow-x-auto 제거 → 드래그가 컨테이너 스크롤이 아니라 차트 패닝(x축 이동)에 사용됨 */}
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

export default StockPriceChart;
