'use client';

import HighchartsChart from '@/components/common/HighchartsChart';
import { chartSeriesColor } from '@/constants/chartSeriesColors';
import useIncome from '@/hooks/api/companies/statements/useIncome';
import {
  computeRevenueQoqMetrics,
  getRevenueQoqInsights,
  getRevenueQoqJudgment,
  getRevenueQoqOverallJudgment,
  type RevenueQoqJudgmentResult,
  type RevenueQoqMetrics,
} from '@/lib/companies/bullpineAnalysis/revenueQoq';
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
  NonNullable<RevenueQoqJudgmentResult['qoq']>,
  string
> = {
  green: '🟢 양호',
  yellow: '🟡 보통',
  red: '🔴 위험',
};

const MOMENTUM_LABEL = {
  green: '🟢 가속',
  yellow: '🟡 모니터링',
  red: '🔴 감속',
} as const;

const OVERALL_LABEL = {
  green: '🟢 매출 모멘텀 양호',
  yellow: '🟡 반등 확인 중 또는 둔화 모니터링',
  red: '🔴 분기 역성장·구조적 둔화 위험',
} as const;

/** 용어 설명 (접기) */
const REVENUE_QOQ_TERMS = [
  {
    term: 'QoQ (Quarter over Quarter)',
    description:
      '직전 분기 대비 해당 분기가 몇 % 늘었는지(또는 줄었는지)입니다. 예: Q2 매출 QoQ +5%면 Q1 대비 Q2 매출이 5% 증가한 것입니다. 분기마다 계절성이 있으면(예: 연말 Q4 매출이 항상 큼) QoQ만 보면 계절에 속할 수 있어, 전년 동기 대비 YoY(분기)와 함께 보는 것이 좋습니다.',
  },
  {
    term: 'YoY(분기) / 전년 동기 대비',
    description:
      '전년 같은 분기 대비 성장률입니다. 예: 2024 Q2 vs 2023 Q2. 계절성을 제거한 "진짜" 성장 신호로 쓰입니다. 15% 이상 유지 시 🟢, 5~15% 🟡, 0% 미만 🔴로 해석합니다.',
  },
  {
    term: '가속 / 감속',
    description:
      '직전 분기의 YoY(분기) 성장률 대비 이번 분기 YoY가 올랐으면 "가속", 내렸으면 "감속"입니다. 예: Q1 YoY +10%, Q2 YoY +14% → Q2는 가속. 2분기 연속 가속이면 모멘텀 개선, 2분기 연속 감속이면 둔화 초기 신호, 3분기 연속 감속이면 구조적 둔화 가능성을 봅니다.',
  },
  {
    term: '계절성',
    description:
      '연말·시즌 등으로 특정 분기 매출이 항상 크거나 작은 현상입니다. QoQ만 보면 "Q4가 Q3보다 크다"가 성장으로 오해될 수 있어, 전년 동기 대비 YoY(분기)를 함께 보면 진짜 성장 여부를 구분할 수 있습니다.',
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

interface RevenueQoqSectionProps {
  symbol: string;
}

export default function RevenueQoqSection({ symbol }: RevenueQoqSectionProps) {
  const { data: incomeData, isLoading } = useIncome({
    symbol,
    period: 'quarter',
    limit: 28,
  });

  const items = useMemo(() => (incomeData ?? []) as IncomeItem[], [incomeData]);

  const metrics = useMemo(() => computeRevenueQoqMetrics(items), [items]);
  const judgment = useMemo(() => getRevenueQoqJudgment(metrics), [metrics]);
  const insights = useMemo(
    () => getRevenueQoqInsights(metrics, judgment),
    [metrics, judgment],
  );
  const overall = useMemo(
    () => getRevenueQoqOverallJudgment(judgment, metrics),
    [judgment, metrics],
  );

  /** fiscalYear - 1 > 2020 인 분기만 표시 (즉 21년도 분기부터). 라벨 연도가 2021 이상일 때만 */
  const displayMetrics = useMemo(() => {
    const filtered = metrics.metrics.filter((m) => {
      const y = parseInt(m.fiscalYear, 10);
      return !Number.isNaN(y) && y - 1 > 2020;
    });
    return filtered.length > 0 ? filtered : metrics.metrics;
  }, [metrics.metrics]);

  const yoyChartOptions: Options = useMemo(
    () => ({
      ...CHART_THEME,
      chart: { ...CHART_THEME.chart, type: 'line' as const },
      title: { text: '' },
      legend: { enabled: false },
      credits: { enabled: false },
      xAxis: {
        ...CHART_THEME.xAxis,
        categories: displayMetrics.map((m) => m.label),
      },
      yAxis: {
        title: { text: 'YoY (%)', style: CHART_THEME.xAxis.labels.style },
        gridLineColor: 'hsl(220, 15%, 18%)',
        labels: {
          ...CHART_THEME.xAxis.labels,
          format: '{value}%',
        },
      },
      tooltip: {
        ...CHART_THEME.tooltip,
        pointFormat:
          '<b>{point.category}</b><br/>YoY(분기): <b>{point.y:.1f}%</b><br/>',
      },
      plotOptions: {
        line: { marker: { radius: 3 }, lineWidth: 2 },
      },
      series: [
        {
          type: 'line',
          name: 'YoY(분기)',
          data: displayMetrics.map((m) => m.yoyQuarterly * 100),
          color: chartSeriesColor(0),
        },
      ],
    }),
    [displayMetrics],
  );

  /** 모멘텀 방향 문구 */
  const momentumSummary = useMemo(() => {
    if (metrics.consecutiveDeceleration >= 3)
      return `${metrics.consecutiveDeceleration}분기 연속 감속`;
    if (metrics.consecutiveDeceleration >= 2) return '2분기 연속 감속';
    if (metrics.consecutiveAcceleration >= 2) return '2분기 연속 가속';
    if (metrics.recentMomentumSignal === '가속') return '가속';
    if (metrics.recentMomentumSignal === '감속') return '감속';
    return '—';
  }, [metrics]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
        <p className="text-sm">
          분기별 매출 가속/감속 데이터를 불러오는 중입니다.
        </p>
      </div>
    );
  }

  if (metrics.metrics.length < 2) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
        <p className="text-sm">
          분기 데이터가 부족합니다. (전년 동기 비교를 위해 최소 5분기 이상 필요)
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 용어 설명 (접기) */}
      <details className="rounded-xl border border-border bg-muted/30 overflow-hidden group">
        <summary className="list-none cursor-pointer px-4 py-2.5 border-b border-border bg-muted/60 hover:bg-muted/80 transition-colors flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            📖 QoQ·YoY(분기)·가속/감속 이해하기
          </h3>
          <span className="text-muted-foreground text-xs group-open:rotate-180 transition-transform">
            ▼
          </span>
        </summary>
        <ul className="p-4 space-y-3">
          {REVENUE_QOQ_TERMS.map(({ term, description }) => (
            <li key={term} className="text-sm">
              <span className="font-medium text-foreground">{term}</span>
              <span className="text-muted-foreground"> — {description}</span>
            </li>
          ))}
        </ul>
      </details>

      {/* 3카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">최근 QoQ</p>
          <p className="text-xl font-semibold text-foreground">
            {metrics.recentQoq != null ? formatPct(metrics.recentQoq) : '—'}
          </p>
          {judgment.qoq && (
            <p className="text-xs mt-1.5">{JUDGMENT_LABEL[judgment.qoq]}</p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">최근 YoY(분기)</p>
          <p className="text-xl font-semibold text-foreground">
            {metrics.recentYoyQuarterly != null
              ? formatPct(metrics.recentYoyQuarterly)
              : '—'}
          </p>
          {judgment.yoyQuarterly && (
            <p className="text-xs mt-1.5">
              {JUDGMENT_LABEL[judgment.yoyQuarterly]}
            </p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">모멘텀 방향</p>
          <p className="text-lg font-semibold text-foreground">
            {momentumSummary}
          </p>
          {judgment.momentum && (
            <p className="text-xs mt-1.5">
              {MOMENTUM_LABEL[judgment.momentum]}
            </p>
          )}
        </div>
      </div>

      {/* 분기별 YoY 성장률 추이 (차트만, 상세는 아래 QoQ vs YoY 비교에 통합) */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border bg-muted/60 px-5 py-3">
          <h3 className="text-base font-semibold text-foreground">
            분기별 YoY(분기) 성장률 추이 (계절성 제거)
          </h3>
        </div>
        <div className="p-4 md:p-5">
          <div className="min-h-[280px]">
            <HighchartsChart options={yoyChartOptions} className="w-full" />
          </div>
        </div>
      </div>

      {/* QoQ vs YoY 분기 비교 (YoY·신호 포함, 비교 결과 문구) */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border bg-muted/60 px-5 py-3">
          <h3 className="text-base font-semibold text-foreground">
            QoQ vs YoY(분기) 비교
          </h3>
        </div>
        <div className="p-4 md:p-5">
          {displayMetrics.length > 0 &&
            (() => {
              const latest = displayMetrics[displayMetrics.length - 1];
              const stateText =
                latest &&
                `현재 상태: 최근 분기(${latest.label})는 QoQ ${formatPct(latest.qoq)}, YoY(분기) ${formatPct(latest.yoyQuarterly)}로, 전분기 대비 ${latest.momentumSignal === '가속' ? '가속' : latest.momentumSignal === '감속' ? '감속' : '유지'} 중입니다.`;
              return (
                <p className="text-sm text-muted-foreground mb-4">
                  {stateText}
                </p>
              );
            })()}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 font-medium text-muted-foreground">
                    분기
                  </th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">
                    QoQ
                  </th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">
                    YoY(분기)
                  </th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">
                    신호
                  </th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {[...displayMetrics].reverse().map((m) => (
                  <tr
                    key={`${m.date}-${m.label}`}
                    className="border-b border-border/70"
                  >
                    <td className="py-2 pr-3 font-medium text-foreground">
                      {m.label}
                    </td>
                    <td className="text-right py-2 px-2 tabular-nums">
                      {formatPct(m.qoq)}
                    </td>
                    <td className="text-right py-2 px-2 tabular-nums">
                      {formatPct(m.yoyQuarterly)}
                    </td>
                    <td className="text-right py-2 px-2 text-xs">
                      {m.momentumSignal === '가속'
                        ? '🟢가속'
                        : m.momentumSignal === '감속'
                          ? '🔴감속'
                          : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground mt-4 pt-3 border-t border-border/70">
            <span className="font-medium text-foreground">
              이 비교로 얻는 결과:{' '}
            </span>
            QoQ만 보면 계절성(연말·시즌)에 따른 증감이 섞여 있어, 전년 동기
            대비인 YoY(분기)와 함께 보면 실질 성장 여부를 구분할 수 있습니다.
            QoQ는 낮은데 YoY는 높으면 계절적 하락, QoQ·YoY 모두 높으면 가속
            구간으로 해석할 수 있습니다.
          </p>
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
          {insights.map((line, i) => (
            <div key={i} className="flex gap-2 text-sm">
              <span className="text-muted-foreground shrink-0">•</span>
              <p className="text-foreground/90">{line}</p>
            </div>
          ))}
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">종합 판정</p>
            <p className="text-sm font-semibold text-foreground">
              {OVERALL_LABEL[overall]}
            </p>
            <p className="text-xs text-muted-foreground mt-1.5">
              {overall === 'green' &&
                '분기 YoY 성장률과 모멘텀이 양호한 구간입니다. 연간 CAGR과 함께 확인하시면 됩니다.'}
              {overall === 'yellow' &&
                '반등 여부 확인이 필요하거나, 성장 둔화가 감지된 구간입니다. 다음 분기 실적이 중요합니다.'}
              {overall === 'red' &&
                '분기 역성장 또는 3분기 연속 감속 등 구조적 둔화 신호가 있습니다. 원인과 연간 지표를 함께 점검하시는 것이 좋습니다.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
