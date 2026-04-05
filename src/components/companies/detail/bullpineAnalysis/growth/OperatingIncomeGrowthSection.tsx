'use client';

import HighchartsChart from '@/components/common/HighchartsChart';
import { chartSeriesColor } from '@/constants/chartSeriesColors';
import useIncome from '@/hooks/api/companies/statements/useIncome';
import {
  computeOperatingIncomeGrowthMetrics,
  getOperatingIncomeGrowthInsights,
  getOperatingIncomeGrowthJudgment,
  getOperatingIncomeOverallJudgment,
  type OperatingIncomeGrowthJudgment,
} from '@/lib/companies/bullpineAnalysis/operatingIncomeGrowth';
import type { IncomeItem } from '@/types/statements';
import type { Options } from 'highcharts';
import React, { useMemo } from 'react';

const CHART_THEME = {
  chart: { height: 280, backgroundColor: 'transparent' as const },
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
  NonNullable<OperatingIncomeGrowthJudgment['operatingIncomeYoY']>,
  string
> = {
  green: '🟢 양호',
  yellow: '🟡 주의',
  red: '🔴 위험',
};

const LEVERAGE_LABEL: Record<
  NonNullable<OperatingIncomeGrowthJudgment['leverage']>,
  string
> = {
  green: '🟢 레버리지',
  yellow: '🟡 유사',
  red: '🔴 마진 압박',
};

const OVERALL_LABEL = {
  green: '🟢 수익성·레버리지 양호',
  yellow: '🟡 수익성 우수하나 성장 둔화 모니터링 필요',
  red: '🔴 위험 구간',
} as const;

/** 이 페이지에서 쓰는 용어 (접기용) */
const OPERATING_INCOME_TERMS = [
  {
    term: 'YoY (Year over Year)',
    description:
      '전년 대비 해당 연도가 몇 % 늘었는지(또는 줄었는지)를 나타냅니다. 예: 2025년 영업이익 YoY +12%면 2024년 대비 2025년 영업이익이 12% 증가한 것이고, -57.9%면 57.9% 줄어든 것입니다.',
  },
  {
    term: 'OPM (Operating Profit Margin) / 영업이익률',
    description:
      '매출액 대비 영업이익이 얼마나 되는지를 %로 나타낸 것입니다. 영업이익 ÷ 매출로 계산합니다. 높을수록 매출에서 비용을 빼고 더 많이 남기는 구조입니다.',
  },
  {
    term: '%p (퍼센트포인트)',
    description:
      '성장률처럼 %인 값끼리 뺀 결과를 나타낼 때 씁니다. 예: 영업이익 성장률 +10%, 매출 성장률 +6%이면 "차이"는 4입니다. 이걸 %라고 쓰면 4%인지 헷갈리니까, "4%p"라고 써서 "성장률 차이 4퍼센트포인트"라고 구분합니다. 아래 "매출 대비 괴리"가 %p로 나오는 이유입니다.',
  },
  {
    term: '레버리지 (이익 레버리지)',
    description:
      '여기서는 "영업이익 YoY − 매출 YoY"를 말합니다. 양수면 매출보다 영업이익이 더 빠르게 성장한다는 뜻입니다. 임대료·인건비처럼 매출이 늘어도 크게 안 늘어나는 비용이 많을수록 이익이 매출보다 더 잘 늘어나고, 이걸 "레버리지가 작동한다"고 합니다.',
  },
  {
    term: '마진 압박',
    description:
      '매출은 늘었거나 전년과 비슷한데, 영업이익이 더 느리게 늘거나 줄어드는 상황입니다. 예: 매출이 +0.2%로 거의 전년과 같은데 영업이익이 -57.9%로 크게 줄었다면, 매출은 그대로인데 이익만 크게 줄어든 것이므로 마진 압박입니다. 비용이 급증했거나 가격이 떨어졌을 가능성이 있습니다.',
  },
  {
    term: '매출 대비 괴리',
    description:
      '영업이익 성장률에서 매출 성장률을 뺀 값입니다. 성장률끼리 뺀 것이므로 %가 아니라 %p로 표시합니다. 예: 영업이익 +10%, 매출 +6%이면 괴리 +4%p(레버리지). 영업이익 -57.9%, 매출 +0.2%이면 괴리 약 -58%p(마진 압박).',
  },
] as const;

function formatPct(value: number): string {
  const pct = value * 100;
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

function formatPctPoint(value: number): string {
  const pct = value * 100;
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%p`;
}

function formatMoney(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toLocaleString();
}

interface OperatingIncomeGrowthSectionProps {
  symbol: string;
}

export default function OperatingIncomeGrowthSection({
  symbol,
}: OperatingIncomeGrowthSectionProps) {
  const { data: incomeData, isLoading } = useIncome({
    symbol,
    period: 'annual',
    limit: 7,
  });

  const items = useMemo(() => (incomeData ?? []) as IncomeItem[], [incomeData]);
  const metrics = useMemo(
    () => computeOperatingIncomeGrowthMetrics(items),
    [items],
  );
  const judgment = useMemo(
    () => getOperatingIncomeGrowthJudgment(metrics),
    [metrics],
  );
  const insights = useMemo(
    () => getOperatingIncomeGrowthInsights(metrics, judgment),
    [metrics, judgment],
  );
  const overall = useMemo(
    () => getOperatingIncomeOverallJudgment(judgment),
    [judgment],
  );

  const displayYears = useMemo(
    () => metrics.byYear.slice(-5),
    [metrics.byYear],
  );
  const displayYoY = useMemo(
    () =>
      metrics.yoyByYear.filter((y) =>
        displayYears.some((d) => d.year === y.year),
      ),
    [metrics.yoyByYear, displayYears],
  );
  const latestYear = displayYears.at(-1)?.year ?? null;

  const chartOptions: Options = useMemo(
    () => {
      const categories = displayYears.map((r) => `${r.year}년`);
      const opIncomeData = displayYears.map((r) => r.operatingIncome);
      const ratioData = displayYears.map((r) =>
        r.revenue > 0 ? r.operatingIncomeRatio * 100 : null,
      );

      return {
        ...CHART_THEME,
        chart: { ...CHART_THEME.chart, type: 'column' as const },
        title: { text: '' },
        legend: { enabled: true },
        credits: { enabled: false },
        xAxis: { ...CHART_THEME.xAxis, categories },
        yAxis: [
          {
            title: { text: '' },
            gridLineColor: 'hsl(220, 15%, 18%)',
            labels: { style: CHART_THEME.xAxis.labels.style },
            opposite: false,
          },
          {
            title: {
              text: '영업이익률 (%)',
              style: CHART_THEME.xAxis.labels.style,
            },
            gridLineColor: 'transparent',
            labels: {
              style: CHART_THEME.xAxis.labels.style,
              format: '{value}%',
            },
            opposite: true,
            min: 0,
            max: 100,
          },
        ],
        tooltip: {
          ...CHART_THEME.tooltip,
          shared: true,
          formatter: function () {
            const points = (this as { points?: Array<{ y?: number; point?: { category: string }; series: { name: string } }> }).points ?? [];
            const opPoint = points.find((p) => p.series.name === '영업이익');
            const ratioPoint = points.find((p) => p.series.name === '영업이익률');
            const category = opPoint?.point?.category ?? '';
            const op = opPoint?.y ?? 0;
            const ratio = ratioPoint?.y != null ? Number(ratioPoint.y).toFixed(1) : '—';
            return `<b>${category}</b><br/>영업이익: ${formatMoney(op)}<br/>영업이익률: ${ratio}%`;
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
            name: '영업이익',
            data: opIncomeData,
            yAxis: 0,
          },
          {
            type: 'line',
            name: '영업이익률',
            data: ratioData,
            yAxis: 1,
            color: chartSeriesColor(1),
            marker: { radius: 3 },
            lineWidth: 2,
          },
        ],
      };
    },
    [displayYears],
  );

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
        <p className="text-sm">영업이익 성장 데이터를 불러오는 중입니다.</p>
      </div>
    );
  }

  if (metrics.byYear.length < 2) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
        <p className="text-sm">연도별 영업이익 데이터가 부족합니다.</p>
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
          <span className="text-muted-foreground text-xs group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <ul className="p-4 space-y-3">
          {OPERATING_INCOME_TERMS.map(({ term, description }) => (
            <li key={term} className="text-sm">
              <span className="font-medium text-foreground">{term}</span>
              <span className="text-muted-foreground"> — {description}</span>
            </li>
          ))}
        </ul>
      </details>

      {/* 3카드: 영업이익 YoY, 영업이익률, 매출 대비 괴리 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">
            영업이익 YoY {latestYear && `(${latestYear}년 기준)`}
          </p>
          <p className="text-xl font-semibold text-foreground">
            {metrics.recentOperatingIncomeYoY != null
              ? formatPct(metrics.recentOperatingIncomeYoY)
              : '—'}
          </p>
          {judgment.operatingIncomeYoY && (
            <p className="text-xs mt-1.5">
              {JUDGMENT_LABEL[judgment.operatingIncomeYoY]}
            </p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">
            영업이익률 {latestYear && `(${latestYear}년 기준)`}
          </p>
          <p className="text-xl font-semibold text-foreground">
            {metrics.recentOperatingIncomeRatio != null
              ? `${(metrics.recentOperatingIncomeRatio * 100).toFixed(1)}%`
              : '—'}
          </p>
          {judgment.operatingIncomeRatio && (
            <p className="text-xs mt-1.5">
              {JUDGMENT_LABEL[judgment.operatingIncomeRatio]}
            </p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">
            매출 대비 괴리 {latestYear && `(${latestYear}년 기준)`}
          </p>
          <p className="text-xl font-semibold text-foreground">
            {metrics.recentLeverageEffect != null
              ? formatPctPoint(metrics.recentLeverageEffect)
              : '—'}
          </p>
          {judgment.leverage && (
            <p className="text-xs mt-1.5">{LEVERAGE_LABEL[judgment.leverage]}</p>
          )}
        </div>
      </div>

      {/* 연도별 영업이익 & 영업이익률 추이 */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border bg-muted/60 px-5 py-3">
          <h3 className="text-base font-semibold text-foreground">
            연도별 영업이익 & 영업이익률 추이
          </h3>
        </div>
        <div className="p-4 md:p-5">
          <div className="min-h-[280px]">
            <HighchartsChart options={chartOptions} className="w-full" />
          </div>
          {/* YoY·OPM 연도별 요약 테이블 */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[280px] text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">연도</th>
                  {displayYears.map((r) => (
                    <th key={r.year} className="text-right py-2 px-2 font-medium text-muted-foreground">
                      {r.year}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/70">
                  <td className="py-2 pr-4 font-medium text-foreground">YoY</td>
                  {displayYears.map((r) => {
                    const yoy = displayYoY.find((y) => y.year === r.year);
                    return (
                      <td key={r.year} className="text-right py-2 px-2 tabular-nums">
                        {yoy != null ? formatPct(yoy.operatingIncomeYoY) : '—'}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-foreground">OPM</td>
                  {displayYears.map((r) => (
                    <td key={r.year} className="text-right py-2 px-2 tabular-nums">
                      {(r.operatingIncomeRatio * 100).toFixed(1)}%
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 매출 vs 영업이익 성장 비교 */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border bg-muted/60 px-5 py-3">
          <h3 className="text-base font-semibold text-foreground">
            매출 vs 영업이익 성장 비교
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            영업이익이 매출보다 더 빠르게 늘면 레버리지 O, 더 느리게 늘거나 줄어들면 마진 압박입니다. 예: 매출이 0.2%만 늘었는데 영업이익이 -57.9%로 크게 줄었다면, 매출은 거의 그대로인데 이익만 크게 줄어든 것이므로 마진 압박입니다.
          </p>
        </div>
        <div className="p-4 md:p-5 space-y-3">
          {displayYoY.map(({ year, revenueYoY, operatingIncomeYoY, leverageEffect }) => {
            const levLabel =
              leverageEffect > 0.05
                ? '📈 레버리지 O'
                : leverageEffect < -0.05
                  ? '📉 마진 압박'
                  : '≈ 동일';
            return (
              <div
                key={year}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
              >
                <span className="font-medium text-foreground w-12">{year}</span>
                <span className="text-muted-foreground">
                  매출 YoY {formatPct(revenueYoY)}
                </span>
                <span className="text-muted-foreground">
                  영업 YoY {formatPct(operatingIncomeYoY)}
                </span>
                <span className="font-medium text-foreground">{levLabel}</span>
              </div>
            );
          })}
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
