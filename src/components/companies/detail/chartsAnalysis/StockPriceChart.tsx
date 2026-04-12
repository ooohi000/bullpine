'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import HighchartsChart from '@/components/common/HighchartsChart';
import { chartSeriesColor } from '@/constants/chartSeriesColors';
import type { StockPriceAndVolumeItem } from '@/types/chartsAnalysis';
import type { Options, Point } from 'highcharts';
import { StockDailyIndicatorItem } from '@/types/chartsAnalysis/stockDailyIndicator';

/** 상승 / 하락 — 공통 팔레트 4(적색 계열)·1(파랑 계열) */
const COLOR_UP = chartSeriesColor(4);
const COLOR_DOWN = chartSeriesColor(1);

/** 처음 보여줄 캔들 개수 (줌 아웃 시 전체 노출) */
const INITIAL_VISIBLE_BARS = 60;

/** 이동평균선 — 차트·상단 패널에서 동일 색·이름 사용 (`enableMouseTracking: false`) */
const MA_SERIES = [
  {
    id: 'stock-ma5',
    name: '5일 이동평균선',
    days: 5,
    field: 'ma5' as const,
    color: chartSeriesColor(0),
  },
  {
    id: 'stock-ma20',
    name: '20일 이동평균선',
    days: 20,
    field: 'ma20' as const,
    color: chartSeriesColor(9),
  },
  {
    id: 'stock-ma60',
    name: '60일 이동평균선',
    days: 60,
    field: 'ma60' as const,
    color: chartSeriesColor(8),
  },
  {
    id: 'stock-ma120',
    name: '120일 이동평균선',
    days: 120,
    field: 'ma120' as const,
    color: chartSeriesColor(5),
  },
  {
    id: 'stock-ma200',
    name: '200일 이동평균선',
    days: 200,
    field: 'ma200' as const,
    color: chartSeriesColor(7),
  },
] as const;

function formatTradeDateLabel(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    timeZone: 'UTC',
  });
}

/** 일봉 거래대금(VWAP×거래량) — 달러 정수, 천 단위 구분만 */
function formatUsdFull(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '—';
  return `$${Math.round(value).toLocaleString('ko-KR')}`;
}

interface StockPriceChartProps {
  mergedByDate: {
    date: string;
    price?: StockPriceAndVolumeItem;
    indicator?: StockDailyIndicatorItem;
  }[];
}

const StockPriceChart = ({ mergedByDate }: StockPriceChartProps) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [visibleMaIds, setVisibleMaIds] = useState(
    () => new Set(MA_SERIES.map((s) => s.id)),
  );
  const setHoverIndexRef = useRef(setHoverIndex);
  setHoverIndexRef.current = setHoverIndex;

  const toggleMa = useCallback((id: (typeof MA_SERIES)[number]['id']) => {
    setVisibleMaIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /** 차트·호버 인덱스 기준: `price`가 있는 행만 (같은 행의 `indicator`는 날짜로 대응) */
  const chartRows = useMemo(
    () => mergedByDate.filter((r) => r.price != null),
    [mergedByDate],
  );

  useEffect(() => {
    setHoverIndex(null);
  }, [mergedByDate]);

  const { ohlc, volume, ma5, ma20, ma60, ma120, ma200 } = useMemo(() => {
    const ohlc: [number, number, number, number, number][] = [];
    const volume: { x: number; y: number; color: string }[] = [];
    const ma5: { x: number; y: number }[] = [];
    const ma20: { x: number; y: number }[] = [];
    const ma60: { x: number; y: number }[] = [];
    const ma120: { x: number; y: number }[] = [];
    const ma200: { x: number; y: number }[] = [];
    for (let i = 0; i < chartRows.length; i++) {
      const row = chartRows[i];
      const item = row.price!;
      const prevItem = chartRows[i - 1]?.price;
      const isVolumeUp =
        item.volume > (prevItem?.volume ?? 0);
      const indicatorItem = row.indicator;

      const x = Date.UTC(
        +item.date.split('-')[0],
        +item.date.split('-')[1] - 1,
        +item.date.split('-')[2],
      );
      ohlc.push([x, item.open, item.high, item.low, item.close]);
      volume.push({
        x,
        y: Number(item.volume) || 0,
        color: isVolumeUp ? COLOR_UP : COLOR_DOWN,
      });
      ma5.push({
        x,
        y: Number(indicatorItem?.ma5) || 0,
      });
      ma20.push({
        x,
        y: Number(indicatorItem?.ma20) || 0,
      });
      ma60.push({
        x,
        y: Number(indicatorItem?.ma60) || 0,
      });
      ma120.push({
        x,
        y: Number(indicatorItem?.ma120) || 0,
      });
      ma200.push({
        x,
        y: Number(indicatorItem?.ma200) || 0,
      });
    }
    return { ohlc, volume, ma5, ma20, ma60, ma120, ma200 };
  }, [chartRows]);

  const options: Options = useMemo(() => {
    const maBundle = [ma5, ma20, ma60, ma120, ma200] as const;
    return {
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
      plotOptions: {
        series: {
          states: {
            inactive: {
              opacity: 1,
            },
          },
          stickyTracking: true,
          point: {
            events: {
              mouseOver: function (this: Point) {
                const idx = this.index;
                if (typeof idx === 'number' && idx >= 0) {
                  setHoverIndexRef.current(idx);
                }
              },
            },
          },
        },
      },
      tooltip: {
        enabled: false,
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
        ...MA_SERIES.map((s, i) => ({
          type: 'line' as const,
          id: s.id,
          name: s.name,
          color: s.color,
          data: maBundle[i],
          xAxis: 0,
          yAxis: 0,
          lineWidth: 2,
          visible: visibleMaIds.has(s.id),
          enableMouseTracking: false,
          marker: { enabled: false },
        })),
      ],
      scrollbar: {
        enabled: true,
      },
      responsive: {
        rules: [],
      },
    };
  }, [ohlc, volume, ma5, ma20, ma60, ma120, ma200, visibleMaIds]);

  if (chartRows.length === 0) return null;

  const lastIndex = chartRows.length - 1;
  const displayIndex =
    hoverIndex != null && hoverIndex >= 0 && hoverIndex <= lastIndex
      ? hoverIndex
      : lastIndex;
  const displayRow = chartRows[displayIndex];
  const row = displayRow.price!;
  const prevVol =
    displayIndex > 0 ? chartRows[displayIndex - 1]?.price?.volume : undefined;
  const volumeUp =
    prevVol != null ? row.volume > prevVol : row.close >= row.open;
  const volColor = volumeUp ? COLOR_UP : COLOR_DOWN;
  const closeUp = row.close >= row.open;
  const notionalUsd =
    Number.isFinite(row.vwap) &&
    Number.isFinite(row.volume) &&
    row.volume > 0 &&
    row.vwap > 0
      ? row.vwap * row.volume
      : NaN;

  const indicatorRow = displayRow.indicator;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="border-b border-border bg-muted/60 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-foreground">
          주가 · 거래량
        </h3>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="이동평균선 표시">
          {MA_SERIES.map((s) => {
            const isOn = visibleMaIds.has(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleMa(s.id)}
                aria-pressed={isOn}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors border ${
                  isOn
                    ? 'border-transparent text-white'
                    : 'border-border bg-muted/50 text-muted-foreground hover:text-foreground'
                }`}
                style={isOn ? { backgroundColor: s.color } : undefined}
              >
                {s.days}일
              </button>
            );
          })}
        </div>
      </div>
      <div
        className="p-4 md:p-5 space-y-3"
        onMouseLeave={(e) => {
          const next = e.relatedTarget;
          if (next && next instanceof Node && e.currentTarget.contains(next)) {
            return;
          }
          setHoverIndex(null);
        }}
      >
        <div
          className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 md:px-4 md:py-3"
          aria-live="polite"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2 gap-y-1 mb-2">
            <time
              className="text-sm font-semibold text-foreground tracking-tight"
              dateTime={row.date}
            >
              {formatTradeDateLabel(row.date)}
            </time>
            <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
              {hoverIndex != null ? '선택한 봉' : '최근 거래일'}
            </span>
          </div>
          <div className="mb-3 rounded-md border border-border/50 bg-background/40 px-2 py-2">
            <p className="text-[10px] font-medium text-muted-foreground mb-1.5">
              이동평균선 값 (상단 버튼으로 차트 표시 여부 전환)
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-2 text-[11px]">
              {MA_SERIES.map((s) => {
                const raw = indicatorRow?.[s.field];
                const val =
                  typeof raw === 'number' && Number.isFinite(raw)
                    ? `$${raw.toFixed(2)}`
                    : '—';
                const isOn = visibleMaIds.has(s.id);
                return (
                  <div
                    key={s.id}
                    className={`flex min-w-0 items-center gap-1.5 tabular-nums ${
                      isOn ? '' : 'opacity-45'
                    }`}
                  >
                    <span
                      className="h-1 w-4 shrink-0 rounded-sm"
                      style={{ backgroundColor: s.color }}
                      aria-hidden
                    />
                    <span className="text-muted-foreground whitespace-nowrap">
                      {s.days}일
                    </span>
                    <span
                      className="font-semibold truncate"
                      style={{ color: s.color }}
                    >
                      {val}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="space-y-3">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4 text-xs">
              <div className="min-w-0">
                <dt className="text-muted-foreground mb-0.5">시가</dt>
                <dd className="font-semibold tabular-nums text-foreground">
                  ${row.open.toFixed(2)}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-muted-foreground mb-0.5">고가</dt>
                <dd className="font-semibold tabular-nums text-foreground">
                  ${row.high.toFixed(2)}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-muted-foreground mb-0.5">저가</dt>
                <dd className="font-semibold tabular-nums text-foreground">
                  ${row.low.toFixed(2)}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-muted-foreground mb-0.5">종가</dt>
                <dd
                  className="font-semibold tabular-nums"
                  style={{ color: closeUp ? COLOR_UP : COLOR_DOWN }}
                >
                  ${row.close.toFixed(2)}
                </dd>
              </div>
            </dl>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div className="min-w-0">
                <dt className="text-muted-foreground mb-0.5">거래량</dt>
                <dd
                  className="font-semibold tabular-nums"
                  style={{ color: volColor }}
                >
                  {row.volume.toLocaleString('ko-KR')}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-muted-foreground mb-0.5">거래대금</dt>
                <dd className="font-semibold tabular-nums text-foreground break-all">
                  {formatUsdFull(notionalUsd)}
                </dd>
              </div>
            </dl>
          </div>
          <p className="mt-2 text-[10px] leading-snug text-muted-foreground">
            거래대금은 당일 VWAP×거래량으로 둔 근사치입니다.
          </p>
        </div>
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
