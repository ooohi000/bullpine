'use client';

import HighchartsChart from '@/components/common/HighchartsChart';
import { chartSeriesColor } from '@/constants/chartSeriesColors';
import useIncome from '@/hooks/api/companies/statements/useIncome';
import {
  computeEpsVsRevenueGrowthMetrics,
  getEpsGapCause,
  getEpsVsRevenueGrowthInsights,
  getEpsVsRevenueGrowthJudgment,
  getEpsVsRevenueOverallJudgment,
  type EpsVsRevenueGrowthJudgment,
} from '@/lib/companies/bullpineAnalysis/epsVsRevenueGrowth';
import type { IncomeItem } from '@/types/statements';
import type { Options } from 'highcharts';
import React, { useMemo } from 'react';

const CHART_THEME = {
  chart: { height: 260, backgroundColor: 'transparent' as const },
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
  NonNullable<EpsVsRevenueGrowthJudgment['epsYoY']>,
  string
> = {
  green: '🟢 양호',
  yellow: '🟡 주의',
  red: '🔴 위험',
};

const SHARES_LABEL: Record<
  NonNullable<EpsVsRevenueGrowthJudgment['shares']>,
  string
> = {
  green: '🟢 자사주',
  yellow: '🟡 유지',
  red: '🔴 희석',
};

const OVERALL_LABEL = {
  green: '🟢 주주 친화적 우량주 패턴',
  yellow: '🟡 성숙 구간 또는 자사주 의존',
  red: '🔴 희석·수익성 위험',
} as const;

/** 이 페이지에서 쓰는 용어 (접기용) — EPS·괴리 등 처음 보는 사람도 이해할 수 있도록 설명 */
const EPS_VS_REVENUE_TERMS = [
  {
    term: 'EPS (Earnings Per Share) / 주당순이익',
    description:
      '당기순이익을 발행 주식 수로 나눈 값입니다. "주식 1주당 얼마를 벌었는지"를 나타내므로, 주주 입장에서는 매출이나 순이익 총액보다 EPS가 더 직관적입니다. 매출이 늘어도 비용이 늘거나 주식 수가 늘면 EPS는 오히려 줄어들 수 있어, EPS 성장률과 매출 성장률이 다르게 움직일 수 있습니다. 여기서는 희석 주당순이익(epsDiluted)을 사용해, 전환사채·스톡옵션 등으로 주식이 늘어난 경우까지 반영한 수치입니다.',
  },
  {
    term: '괴리 (EPS 성장률 − 매출 성장률)',
    description:
      '"괴리"는 두 지표 사이의 "차이"를 뜻하는 말입니다(올바른 표기는 "괴리"입니다). 여기서는 "EPS 전년 대비 성장률에서 매출 전년 대비 성장률을 뺀 값"을 말합니다. 예: 매출 YoY +6%, EPS YoY +13%이면 괴리는 +7%p입니다. 괴리가 양수면 EPS가 매출보다 더 빠르게 성장한다는 뜻이고, 음수면 매출은 늘었는데 EPS는 더 느리게 늘거나 줄었다는 뜻입니다. 왜 이런 차이가 나는지(마진 개선, 자사주 매입, 희석, 일회성 이익 등)를 아래 "괴리 원인 분해"에서 살펴봅니다.',
  },
  {
    term: 'YoY (Year over Year)',
    description:
      '전년 같은 기간 대비 몇 % 늘었는지(또는 줄었는지)를 나타냅니다. 예: 2024년 매출 YoY +10%면 2023년 대비 2024년 매출이 10% 증가한 것입니다. -5%면 5% 감소한 것입니다.',
  },
  {
    term: '%p (퍼센트포인트)',
    description:
      '성장률(%)끼리 뺀 "차이"를 나타낼 때 씁니다. 예: EPS 성장률 +13%, 매출 성장률 +6%이면 차이는 7입니다. 이걸 그냥 "7%"라고 쓰면 7% 성장인지 오해할 수 있으므로, "7%p"라고 써서 "성장률 차이가 7퍼센트포인트"라고 구분합니다.',
  },
  {
    term: '희석 주식수 / 주식 희석',
    description:
      '희석 주식수는 전환사채, 스톡옵션, 신주 발행 등으로 "이론상 늘어날 수 있는 주식"까지 반영한 가중평균 주식 수입니다. 주식 수가 전년보다 늘어나면(희석) 같은 순이익이라도 주당순이익(EPS)은 줄어듭니다. 반대로 주식 수가 줄어들면(자사주 매입 등) EPS는 올라갑니다. 연간 3% 이상 주식 수가 늘어나면 "희석"으로 보고 주주 몫이 줄어드는지 확인하는 것이 좋습니다.',
  },
  {
    term: '자사주 매입',
    description:
      '회사가 시장에서 자기 회사 주식을 사들여 소각하거나 보유하는 행위입니다. 주식 수가 줄어들므로 같은 순이익이라도 EPS는 올라갑니다. 매출이나 이익이 안 늘어도 EPS만 올라가는 "숫자상 성장"이 될 수 있어, EPS 상승이 자사주 매입 때문인지 실질 수익 개선 때문인지 구분해 보는 것이 중요합니다.',
  },
  {
    term: '일회성 요인 / 일회성 이익',
    description:
      '매년 반복되지 않고 그해에만 생기는 수익을 말합니다. 예: 세금 환급, 부동산·자산 매각 이익, 소송 배상금, 특별 배당 수취 등입니다. 이런 이익이 크면 당기 순이익과 EPS가 한 해만 부풀려져서, 다음 해에는 같은 수준이 나오지 않을 수 있습니다. 그래서 "순이익이 영업이익보다 비정상적으로 크다"면 일회성 이익 가능성을 의심하고, 실적의 "지속 가능성"을 별도로 확인하는 것이 좋습니다.',
  },
  {
    term: '순이익률 (Net Margin)',
    description:
      '매출액 대비 당기순이익이 얼마나 되는지를 %로 나타낸 것입니다. 순이익 ÷ 매출로 계산합니다. 순이익률이 올라가면 같은 매출로 더 많은 이익이 남는다는 뜻이라, EPS가 매출보다 빠르게 성장하는 "건강한" 원인 중 하나입니다. 반대로 순이익률이 떨어지면 비용 증가 등으로 수익성이 나빠진 것이어서, 매출은 늘어도 EPS 성장이 둔화될 수 있습니다.',
  },
] as const;

function formatPct(value: number): string {
  const pct = value * 100;
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

function formatPctPoint(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%p`;
}

interface EpsVsRevenueGrowthSectionProps {
  symbol: string;
}

export default function EpsVsRevenueGrowthSection({
  symbol,
}: EpsVsRevenueGrowthSectionProps) {
  const { data: incomeData, isLoading } = useIncome({
    symbol,
    period: 'annual',
    limit: 7,
  });

  const items = useMemo(() => (incomeData ?? []) as IncomeItem[], [incomeData]);
  const metrics = useMemo(
    () => computeEpsVsRevenueGrowthMetrics(items),
    [items],
  );
  const judgment = useMemo(
    () => getEpsVsRevenueGrowthJudgment(metrics),
    [metrics],
  );
  const insights = useMemo(
    () => getEpsVsRevenueGrowthInsights(metrics, judgment),
    [metrics, judgment],
  );
  const overall = useMemo(
    () => getEpsVsRevenueOverallJudgment(judgment),
    [judgment],
  );
  const cause = useMemo(() => getEpsGapCause(metrics), [metrics]);

  const displayYears = useMemo(() => metrics.byYear.slice(-5), [metrics.byYear]);
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
      const revenueYoYData = displayYears.map((r) => {
        const y = displayYoY.find((yoy) => yoy.year === r.year);
        return y != null ? y.revenueYoY * 100 : null;
      });
      const epsYoYData = displayYears.map((r) => {
        const y = displayYoY.find((yoy) => yoy.year === r.year);
        return y != null ? y.epsYoY * 100 : null;
      });
      return {
        ...CHART_THEME,
        chart: { ...CHART_THEME.chart, type: 'line' as const },
        title: { text: '' },
        legend: { enabled: true },
        credits: { enabled: false },
        xAxis: { ...CHART_THEME.xAxis, categories },
        yAxis: {
          title: { text: 'YoY (%)', style: CHART_THEME.xAxis.labels.style },
          gridLineColor: 'hsl(220, 15%, 18%)',
          labels: { style: CHART_THEME.xAxis.labels.style, format: '{value}%' },
        },
        tooltip: {
          ...CHART_THEME.tooltip,
          shared: true,
          pointFormat:
            '<span style="color:{point.color}">●</span> {series.name}: <b>{point.y:.1f}%</b><br/>',
        },
        plotOptions: {
          line: { marker: { radius: 3 }, lineWidth: 2 },
        },
        series: [
          {
            type: 'line',
            name: '매출 YoY',
            data: revenueYoYData,
            color: chartSeriesColor(0),
          },
          {
            type: 'line',
            name: 'EPS YoY',
            data: epsYoYData,
            color: chartSeriesColor(1),
          },
        ],
      };
    },
    [displayYears, displayYoY],
  );

  const sharesChartOptions: Options = useMemo(
    () => ({
      ...CHART_THEME,
      chart: { ...CHART_THEME.chart, type: 'column' as const, height: 220 },
      title: { text: '' },
      legend: { enabled: false },
      credits: { enabled: false },
      xAxis: {
        ...CHART_THEME.xAxis,
        categories: displayYears.map((r) => `${r.year}년`),
      },
      yAxis: {
        title: { text: '' },
        gridLineColor: 'hsl(220, 15%, 18%)',
        labels: { style: CHART_THEME.xAxis.labels.style },
      },
      tooltip: {
        ...CHART_THEME.tooltip,
        pointFormat: '<b>{point.category}</b><br/>주식수: {point.y:,.0f}<br/>',
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
          name: '희석 주식수',
          data: displayYears.map((r) => r.shares),
        },
      ],
    }),
    [displayYears],
  );

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
        <p className="text-sm">EPS·매출 괴리 데이터를 불러오는 중입니다.</p>
      </div>
    );
  }

  if (metrics.byYear.length < 2) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
        <p className="text-sm">연도별 데이터가 부족합니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 용어 설명 (접기/펼치기) */}
      <details className="rounded-xl border border-border bg-muted/30 overflow-hidden group">
        <summary className="list-none cursor-pointer px-4 py-2.5 border-b border-border bg-muted/60 hover:bg-muted/80 transition-colors flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            📖 EPS·괴리 이해하기 (용어 설명)
          </h3>
          <span className="text-muted-foreground text-xs group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <ul className="p-4 space-y-3">
          {EPS_VS_REVENUE_TERMS.map(({ term, description }) => (
            <li key={term} className="text-sm">
              <span className="font-medium text-foreground">{term}</span>
              <span className="text-muted-foreground"> — {description}</span>
            </li>
          ))}
        </ul>
      </details>

      {/* 4카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">
            매출 YoY {latestYear && `(${latestYear}년 기준)`}
          </p>
          <p className="text-xl font-semibold text-foreground">
            {metrics.recentRevenueYoY != null
              ? formatPct(metrics.recentRevenueYoY)
              : '—'}
          </p>
          {judgment.revenueYoY && (
            <p className="text-xs mt-1.5">
              {JUDGMENT_LABEL[judgment.revenueYoY]}
            </p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">
            EPS YoY {latestYear && `(${latestYear}년 기준)`}
          </p>
          <p className="text-xl font-semibold text-foreground">
            {metrics.recentEpsYoY != null
              ? formatPct(metrics.recentEpsYoY)
              : '—'}
          </p>
          {judgment.epsYoY && (
            <p className="text-xs mt-1.5">{JUDGMENT_LABEL[judgment.epsYoY]}</p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">
            괴리 (EPS−매출 성장률 차이) {latestYear && `(${latestYear}년 기준)`}
          </p>
          <p className="text-xl font-semibold text-foreground">
            {metrics.recentGap != null
              ? formatPctPoint(metrics.recentGap)
              : '—'}
          </p>
          {judgment.gap && (
            <p className="text-xs mt-1.5">{JUDGMENT_LABEL[judgment.gap]}</p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">
            주식수 변화 {latestYear && `(${latestYear}년 기준)`}
          </p>
          <p className="text-xl font-semibold text-foreground">
            {metrics.recentSharesYoY != null
              ? formatPct(metrics.recentSharesYoY)
              : '—'}
          </p>
          {judgment.shares && (
            <p className="text-xs mt-1.5">{SHARES_LABEL[judgment.shares]}</p>
          )}
        </div>
      </div>

      {/* 연도별 매출 YoY vs EPS YoY */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border bg-muted/60 px-5 py-3">
          <h3 className="text-base font-semibold text-foreground">
            연도별 매출 YoY vs EPS YoY
          </h3>
        </div>
        <div className="p-4 md:p-5">
          <div className="min-h-[260px]">
            <HighchartsChart options={chartOptions} className="w-full" />
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[320px] text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
                    연도
                  </th>
                  {displayYears.map((r) => (
                    <th
                      key={r.year}
                      className="text-right py-2 px-2 font-medium text-muted-foreground"
                    >
                      {r.year}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/70">
                  <td className="py-2 pr-4 font-medium text-foreground">
                    매출 YoY
                  </td>
                  {displayYears.map((r) => {
                    const y = displayYoY.find((yoy) => yoy.year === r.year);
                    return (
                      <td
                        key={r.year}
                        className="text-right py-2 px-2 tabular-nums"
                      >
                        {y != null ? formatPct(y.revenueYoY) : '—'}
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b border-border/70">
                  <td className="py-2 pr-4 font-medium text-foreground">
                    EPS YoY
                  </td>
                  {displayYears.map((r) => {
                    const y = displayYoY.find((yoy) => yoy.year === r.year);
                    return (
                      <td
                        key={r.year}
                        className="text-right py-2 px-2 tabular-nums"
                      >
                        {y != null ? formatPct(y.epsYoY) : '—'}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-foreground">
                    괴리 (EPS−매출)
                  </td>
                  {displayYears.map((r) => {
                    const y = displayYoY.find((yoy) => yoy.year === r.year);
                    return (
                      <td
                        key={r.year}
                        className="text-right py-2 px-2 tabular-nums"
                      >
                        {y != null ? formatPctPoint(y.gap) : '—'}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 괴리 원인 분해 */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border bg-muted/60 px-5 py-3">
          <h3 className="text-base font-semibold text-foreground">
            괴리 원인 분해
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {latestYear}년 기준
          </p>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            EPS 성장률과 매출 성장률이 다르게 나오는 이유는 크게 세 가지로 나눌 수 있습니다. (1) 매출 대비 순이익 비중이 바뀐 경우(순이익률 변화), (2) 주식 수가 줄거나 늘어난 경우(자사주 매입 또는 희석), (3) 그해에만 생기는 일회성 이익이 끼어든 경우입니다. 아래는 최근 연도 기준으로 각 요인이 얼마나 기여했는지 정리한 것입니다.
          </p>
        </div>
        <div className="p-4 md:p-5 space-y-4">
          <div className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-1.5">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="font-medium text-foreground">순이익률 변화</span>
              <span className="text-muted-foreground tabular-nums">
                {cause.netMarginChange != null
                  ? `${cause.netMarginChange >= 0 ? '+' : ''}${cause.netMarginChange.toFixed(1)}%p`
                  : '—'}
              </span>
              <span className="text-muted-foreground">
                {cause.likelyMargin
                  ? '→ 마진 개선 기여'
                  : cause.netMarginChange != null && cause.netMarginChange < 0
                    ? '→ 마진 악화'
                    : cause.netMarginChange != null && cause.netMarginChange === 0
                      ? '→ 전년과 유사'
                      : ''}
              </span>
            </div>
            <p className="text-xs text-muted-foreground pl-0">
              매출 100원당 순이익이 전년 대비 몇 %p 늘었는지(또는 줄었는지)입니다. 양수면 수익성이 좋아져서 같은 매출 성장이라도 EPS가 더 빠르게 늘 수 있고, 음수면 비용 증가 등으로 EPS 성장이 매출보다 뒤처질 수 있습니다.
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-1.5">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="font-medium text-foreground">주식수 변화</span>
              <span className="text-muted-foreground tabular-nums">
                {cause.sharesYoY != null ? formatPct(cause.sharesYoY) : '—'}
              </span>
              <span className="text-muted-foreground">
                {cause.likelyBuyback
                  ? '→ 자사주 매입 기여'
                  : cause.sharesYoY != null && cause.sharesYoY > 0.03
                    ? '→ 희석 요인'
                    : cause.sharesYoY != null && cause.sharesYoY > 0
                      ? '→ 소폭 증가'
                      : cause.sharesYoY != null && cause.sharesYoY < 0
                        ? '→ 주식 수 감소'
                        : ''}
              </span>
            </div>
            <p className="text-xs text-muted-foreground pl-0">
              전년 대비 발행 주식 수가 몇 % 줄었는지(또는 늘었는지)입니다. 음수면 자사주 매입 등으로 주식 수가 줄어든 것이어서, 같은 순이익이라도 EPS가 올라가는 요인입니다. 반대로 3% 이상 양수면 신주 발행·옵션 전환 등으로 희석되어 EPS가 눌리는 요인입니다.
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-1.5">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="font-medium text-foreground">일회성 요인</span>
              <span className="text-muted-foreground">
                {cause.likelyOneTime ? '가능성 있음 → 이익 품질 확인 필요' : '없음 → 이익 품질 양호'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground pl-0">
              당기 순이익이 영업이익보다 비정상적으로 클 때(예: 영업이익 대비 120% 초과) 일회성 이익(세금 환급, 자산 매각, 소송 배상 등)이 끼어들었을 가능성을 봅니다. 있으면 해당 연도 EPS는 부풀려졌을 수 있어, 다음 해 실적이 같은 수준으로 나오지 않을 수 있으므로 재무제표 주석이나 실적 발표를 통해 원인을 확인하는 것이 좋습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 주식수 추이 */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border bg-muted/60 px-5 py-3">
          <h3 className="text-base font-semibold text-foreground">
            주식수 추이 (희석 여부 확인)
          </h3>
        </div>
        <div className="p-4 md:p-5">
          <div className="min-h-[220px]">
            <HighchartsChart options={sharesChartOptions} className="w-full" />
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[280px] text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 font-medium text-muted-foreground">
                    연도
                  </th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">
                    주식수 변화
                  </th>
                  <th className="text-left py-2 pl-2 font-medium text-muted-foreground">
                    비고
                  </th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {displayYoY.map(({ year, sharesYoY }) => (
                  <tr key={year} className="border-b border-border/70">
                    <td className="py-2 pr-3 font-medium text-foreground">
                      {year}년
                    </td>
                    <td className="text-right py-2 px-2 tabular-nums">
                      {formatPct(sharesYoY)}
                    </td>
                    <td className="py-2 pl-2 text-xs">
                      {sharesYoY < 0
                        ? '감소 (자사주 매입 등)'
                        : sharesYoY > 0.03
                          ? '희석'
                          : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 인사이트 */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border bg-muted/60 px-5 py-3">
          <h3 className="text-base font-semibold text-foreground">
            🔍 인사이트
          </h3>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
            아래는 위 지표를 바탕으로 한 해석입니다. 참고용으로 활용해 주세요.
          </p>
        </div>
        <div className="p-4 md:p-5 space-y-4">
          {insights.length > 0 ? (
            insights.map((line, i) => (
              <div key={i} className="flex gap-2 text-sm">
                <span className="text-muted-foreground shrink-0">•</span>
                <p className="text-foreground/90">{line}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              최근 연도 기준 요약이 위 카드와 표에 반영되어 있습니다. 괴리 원인 분해와 주식수 추이를 함께 보시면 됩니다.
            </p>
          )}
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">
              종합 판정
            </p>
            <p className="text-sm font-semibold text-foreground">
              {OVERALL_LABEL[overall]}
            </p>
            <p className="text-xs text-muted-foreground mt-1.5">
              {overall === 'green' &&
                'EPS가 매출보다 건강하게 성장하고 있고, 희석보다는 마진 개선·자사주 매입 등 주주 친화적 요인이 있는 패턴입니다.'}
              {overall === 'yellow' &&
                '성장 둔화 구간이거나 EPS 상승이 자사주 매입에 많이 의존하는 경우입니다. 사업 성장과 자본 배분 정책을 함께 보는 것이 좋습니다.'}
              {overall === 'red' &&
                '주식 희석이나 수익성 악화로 주주 가치가 줄어드는 구간일 수 있습니다. 원인(희석 속도, 비용 구조)을 확인하는 것이 좋습니다.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
