'use client';

import HighchartsChart from '@/components/common/HighchartsChart';
import { chartSeriesColor } from '@/constants/chartSeriesColors';
import useIncome from '@/hooks/api/companies/statements/useIncome';
import {
  computeRevenueGrowthMetrics,
  getOverallJudgment,
  getRevenueGrowthInsights,
  getRevenueGrowthJudgment,
  REVENUE_GROWTH_TERMS,
  type RevenueGrowthJudgment,
} from '@/lib/companies/bullpineAnalysis/revenueGrowth';
import type { IncomeItem } from '@/types/statements';
import type { Options } from 'highcharts';
import React, { useMemo } from 'react';

const CHART_THEME = {
  chart: {
    height: 280,
    backgroundColor: 'transparent' as const,
    type: 'column' as const,
  },
  xAxis: {
    lineColor: 'hsl(220, 15%, 20%)',
    tickColor: 'hsl(220, 15%, 20%)',
    labels: { style: { color: 'hsl(215, 20%, 70%)', fontSize: '11px' } },
  },
  tooltip: {
    backgroundColor: 'hsl(220, 23%, 10%)',
    borderColor: 'hsl(220, 15%, 20%)',
    style: { color: 'hsl(210, 20%, 96%)', fontSize: '11px' },
  },
};

const JUDGMENT_LABEL: Record<
  NonNullable<RevenueGrowthJudgment['cagr3']>,
  string
> = {
  green: '🟢 양호',
  yellow: '🟡 주의',
  red: '🔴 위험',
};

const OVERALL_LABEL = {
  green: '🟢 성장 가치 구간',
  yellow: '🟡 성장 둔화 주의 구간',
  red: '🔴 위험 구간',
} as const;

function formatPct(value: number): string {
  const pct = value * 100;
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

function formatRevenue(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toLocaleString();
}

interface RevenueGrowthSectionProps {
  symbol: string;
}

export default function RevenueGrowthSection({
  symbol,
}: RevenueGrowthSectionProps) {
  const { data: incomeData, isLoading } = useIncome({
    symbol,
    period: 'annual',
    limit: 7,
  });

  const items = useMemo(() => (incomeData ?? []) as IncomeItem[], [incomeData]);
  const metrics = useMemo(() => computeRevenueGrowthMetrics(items), [items]);
  const judgment = useMemo(() => getRevenueGrowthJudgment(metrics), [metrics]);
  const insights = useMemo(
    () => getRevenueGrowthInsights(metrics, judgment),
    [metrics, judgment],
  );
  const overall = useMemo(() => getOverallJudgment(judgment), [judgment]);

  /** 표시: 2021년부터 최근 5년만. 2021 YoY는 2020년 데이터로 계산(2020년은 화면에 미표시) */
  const displayYears = useMemo(
    () => metrics.revenueByYear.slice(-5),
    [metrics.revenueByYear],
  );
  const displayYoY = useMemo(
    () =>
      metrics.yoyByYear.filter((y) =>
        displayYears.some((d) => d.year === y.year),
      ),
    [metrics.yoyByYear, displayYears],
  );
  const latestYear = displayYears.at(-1)?.year ?? null;

  const chartOptions: Options = useMemo(() => {
    const categories = displayYears.map((r) => `${r.year}년`);
    const revenueData = displayYears.map((r) => r.revenue);
    const yoyData: (number | null)[] = displayYears.map((r) => {
      const yoy = displayYoY.find((y) => y.year === r.year);
      return yoy != null ? yoy.yoy * 100 : null;
    });

    return {
      ...CHART_THEME,
      title: { text: '' },
      legend: { enabled: true },
      credits: { enabled: false },
      xAxis: {
        ...CHART_THEME.xAxis,
        categories,
      },
      yAxis: [
        {
          title: { text: '' },
          gridLineColor: 'hsl(220, 15%, 18%)',
          labels: { style: CHART_THEME.xAxis.labels.style },
          opposite: false,
        },
        {
          title: { text: 'YoY (%)', style: CHART_THEME.xAxis.labels.style },
          gridLineColor: 'transparent',
          labels: {
            style: CHART_THEME.xAxis.labels.style,
            format: '{value}%',
          },
          opposite: true,
        },
      ],
      tooltip: {
        ...CHART_THEME.tooltip,
        shared: true,
        formatter: function () {
          const points =
            (
              this as {
                points?: Array<{
                  y?: number;
                  point?: { category: string };
                  series: { name: string };
                }>;
              }
            ).points ?? [];
          const revPoint = points.find((p) => p.series.name === '매출');
          const yoyPoint = points.find((p) => p.series.name === 'YoY');
          const category = revPoint?.point?.category ?? '';
          const rev = revPoint?.y ?? 0;
          const yoyPct =
            yoyPoint?.y != null ? Number(yoyPoint.y).toFixed(1) : '—';
          return `<b>${category}</b><br/>매출: ${formatRevenue(rev)}<br/>YoY: ${yoyPct}%`;
        },
      },
      plotOptions: {
        column: {
          borderRadius: 4,
          color: chartSeriesColor(0),
          dataLabels: { enabled: false },
        },
      },
      series: [
        {
          type: 'column',
          name: '매출',
          data: revenueData,
          yAxis: 0,
        },
        {
          type: 'line',
          name: 'YoY',
          data: yoyData,
          yAxis: 1,
          color: chartSeriesColor(1),
          marker: { radius: 3 },
          lineWidth: 2,
        },
      ],
    };
  }, [displayYears, displayYoY]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
        <p className="text-sm">매출 성장 데이터를 불러오는 중입니다.</p>
      </div>
    );
  }

  if (metrics.revenueByYear.length < 2) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
        <p className="text-sm">
          연도별 매출 데이터가 부족합니다. (최소 2년 필요)
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 용어 설명 (접기/펼치기) */}
      <details className="rounded-xl border border-border bg-muted/30 overflow-hidden group">
        <summary className="list-none cursor-pointer px-4 py-2.5 border-b border-border bg-muted/60 hover:bg-muted/80 transition-colors flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            📖 이 페이지에서 쓰는 용어
          </h3>
          <span className="text-muted-foreground text-xs group-open:rotate-180 transition-transform">
            ▼
          </span>
        </summary>
        <ul className="p-4 space-y-3">
          {REVENUE_GROWTH_TERMS.map(({ term, description }) => (
            <li key={term} className="text-sm">
              <span className="font-medium text-foreground">{term}</span>
              <span className="text-muted-foreground"> — {description}</span>
            </li>
          ))}
        </ul>
      </details>

      {/* 3년 CAGR / 5년 CAGR / 최근 YoY 카드 (모두 최신 연도 기준) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">
            3년 CAGR {latestYear && `(${latestYear}년 기준)`}
          </p>
          <p className="text-xl font-semibold text-foreground">
            {metrics.cagr3 != null ? formatPct(metrics.cagr3) : '—'}
          </p>
          {judgment.cagr3 && (
            <p className="text-xs mt-1.5">{JUDGMENT_LABEL[judgment.cagr3]}</p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">
            5년 CAGR {latestYear && `(${latestYear}년 기준)`}
          </p>
          <p className="text-xl font-semibold text-foreground">
            {metrics.cagr5 != null ? formatPct(metrics.cagr5) : '—'}
          </p>
          {judgment.cagr5 && (
            <p className="text-xs mt-1.5">{JUDGMENT_LABEL[judgment.cagr5]}</p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">
            최근 YoY {latestYear && `(${latestYear}년 기준)`}
          </p>
          <p className="text-xl font-semibold text-foreground">
            {metrics.recentYoY != null ? formatPct(metrics.recentYoY) : '—'}
          </p>
          {judgment.recentYoY && (
            <p className="text-xs mt-1.5">
              {JUDGMENT_LABEL[judgment.recentYoY]}
              {judgment.acceleration &&
                latestYear &&
                ` · ${latestYear}년 기준 ${judgment.acceleration}`}
            </p>
          )}
        </div>
      </div>

      {/* 연도별 매출 추이 */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border bg-muted/60 px-5 py-3">
          <h3 className="text-base font-semibold text-foreground">
            연도별 매출 추이
          </h3>
        </div>
        <div className="p-4 md:p-5">
          <div className="min-h-[280px]">
            <HighchartsChart options={chartOptions} className="w-full" />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
            {displayYoY.map(({ year, yoy }) => (
              <span key={year}>
                {year} YoY: {formatPct(yoy)}
              </span>
            ))}
            {judgment.acceleration && latestYear && (
              <span className="font-medium text-foreground">
                {judgment.acceleration === '가속' ? '📈 가속' : '📉 감속'} (
                {latestYear}년 기준)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 인사이트 + 판정 */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border bg-muted/60 px-5 py-3">
          <h3 className="text-base font-semibold text-foreground">
            🔍 인사이트
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            위 지표를 바탕으로 한 해석입니다. 참고용으로 활용해 주세요.
          </p>
        </div>
        <div className="p-4 md:p-5 space-y-3">
          {insights.map((line, i) => (
            <p key={i} className="text-sm text-foreground/90">
              {line}
            </p>
          ))}
          <p className="text-sm font-semibold text-foreground pt-2 border-t border-border">
            종합: {OVERALL_LABEL[overall]}
          </p>
        </div>
      </div>
    </div>
  );
}
