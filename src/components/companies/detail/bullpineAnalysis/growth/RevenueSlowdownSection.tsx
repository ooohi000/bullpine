'use client';

import useIncome from '@/hooks/api/companies/statements/useIncome';
import { computeEpsVsRevenueGrowthMetrics } from '@/lib/companies/bullpineAnalysis/epsVsRevenueGrowth';
import { computeOperatingIncomeGrowthMetrics } from '@/lib/companies/bullpineAnalysis/operatingIncomeGrowth';
import {
  computeRevenueSlowdownWarning,
  getGrowthSummaryForSlowdown,
  type RevenueSlowdownWarningResult,
} from '@/lib/companies/bullpineAnalysis/revenueSlowdownWarning';
import {
  computeRevenueGrowthMetrics,
  getRevenueGrowthJudgment,
  getYoYJudgment,
} from '@/lib/companies/bullpineAnalysis/revenueGrowth';
import { computeRevenueQoqMetrics } from '@/lib/companies/bullpineAnalysis/revenueQoq';
import type { IncomeItem } from '@/types/statements';
import React, { useMemo } from 'react';

const LEVEL_EMOJI: Record<RevenueSlowdownWarningResult['level'], string> = {
  green: '🟢',
  yellow: '🟡',
  orange: '🟠',
  red: '🔴',
};

const JUDGMENT_EMOJI: Record<'green' | 'yellow' | 'red', string> = {
  green: '🟢',
  yellow: '🟡',
  red: '🔴',
};

const LEVEL_DESC: Record<RevenueSlowdownWarningResult['level'], string> = {
  green: '정상',
  yellow: 'Level 1 초기 경고',
  orange: 'Level 2 경고',
  red: 'Level 3 강한 경고',
};

const ZONE_LABEL: Record<string, string> = {
  green: '정상 구간',
  yellow: '주의 구간',
  orange: '경고 구간',
  red: '강한 경고 구간',
};

function formatPct(value: number): string {
  const pct = value * 100;
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

function formatPctPoint(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%p`;
}

interface RevenueSlowdownSectionProps {
  symbol: string;
}

export default function RevenueSlowdownSection({
  symbol,
}: RevenueSlowdownSectionProps) {
  const { data: annualData, isLoading: annualLoading } = useIncome({
    symbol,
    period: 'annual',
    limit: 7,
  });
  const { data: quarterData, isLoading: quarterLoading } = useIncome({
    symbol,
    period: 'quarter',
    limit: 28,
  });

  const annualItems = useMemo(
    () => (annualData ?? []) as IncomeItem[],
    [annualData],
  );
  const quarterItems = useMemo(
    () => (quarterData ?? []) as IncomeItem[],
    [quarterData],
  );

  const revenueGrowth = useMemo(
    () => computeRevenueGrowthMetrics(annualItems),
    [annualItems],
  );
  const operatingIncome = useMemo(
    () => computeOperatingIncomeGrowthMetrics(annualItems),
    [annualItems],
  );
  const epsVsRevenue = useMemo(
    () => computeEpsVsRevenueGrowthMetrics(annualItems),
    [annualItems],
  );
  const revenueQoq = useMemo(
    () => computeRevenueQoqMetrics(quarterItems),
    [quarterItems],
  );

  const warning = useMemo(() => {
    if (revenueGrowth.yoyByYear.length < 2 || revenueQoq.metrics.length < 2) {
      return null;
    }
    return computeRevenueSlowdownWarning({
      revenueGrowth,
      operatingIncome,
      epsVsRevenue,
      revenueQoq,
    });
  }, [revenueGrowth, operatingIncome, epsVsRevenue, revenueQoq]);

  const summary = useMemo(
    () =>
      warning
        ? getGrowthSummaryForSlowdown({
            revenueGrowth,
            operatingIncome,
            epsVsRevenue,
            revenueQoq,
          })
        : null,
    [warning, revenueGrowth, operatingIncome, epsVsRevenue, revenueQoq],
  );

  const growthJudgment = useMemo(
    () => getRevenueGrowthJudgment(revenueGrowth),
    [revenueGrowth],
  );

  /** 성장률 한눈에 보기용 기준 연도/기간 (최근 결산 기준) */
  const growthSummaryLabels = useMemo(() => {
    const ry = revenueGrowth.revenueByYear;
    const yoy = revenueGrowth.yoyByYear;
    const lastMetric = revenueQoq.metrics[revenueQoq.metrics.length - 1];
    const annual =
      yoy.length >= 2
        ? `${yoy[yoy.length - 2]!.year}→${yoy[yoy.length - 1]!.year}`
        : yoy.length === 1
          ? yoy[0]!.year
          : null;
    const cagr3 =
      ry.length >= 4
        ? `${ry[ry.length - 4]!.year}~${ry[ry.length - 1]!.year}`
        : null;
    const cagr5 =
      ry.length >= 6
        ? `${ry[ry.length - 6]!.year}~${ry[ry.length - 1]!.year}`
        : null;
    return {
      annualYear: annual,
      quarterLabel: lastMetric?.label ?? null,
      cagr3Range: cagr3,
      cagr5Range: cagr5,
    };
  }, [revenueGrowth.revenueByYear, revenueGrowth.yoyByYear, revenueQoq.metrics]);

  const isLoading = annualLoading || quarterLoading;

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
        <p className="text-sm">둔화 경고 지표를 불러오는 중입니다.</p>
      </div>
    );
  }

  if (!warning) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
        <p className="text-sm">
          연간·분기 데이터가 부족해 둔화 경고를 산출할 수 없습니다. (연도 2년
          이상, 분기 5개 이상 필요)
        </p>
      </div>
    );
  }

  const signalsByLevel = (level: 1 | 2 | 3) =>
    warning.signals.filter((s) => s.level === level);

  const quarterYoyJudgment =
    summary?.recentQuarterYoy != null
      ? getYoYJudgment(summary.recentQuarterYoy)
      : null;

  return (
    <div className="flex flex-col gap-6">
      {/* 3카드: 경고 점수, 등급, 감지 신호 수 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">경고 점수</p>
          <p className="text-xl font-semibold text-foreground tabular-nums">
            {warning.totalPoints} / {warning.maxPoints}
          </p>
          <p className="text-xs mt-1.5 text-muted-foreground">
            {ZONE_LABEL[warning.level]}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">경고 등급</p>
          <p className="text-lg font-semibold text-foreground">
            {LEVEL_EMOJI[warning.level]} {warning.levelLabel}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">감지 신호 수</p>
          <p className="text-xl font-semibold text-foreground tabular-nums">
            {warning.detectedCount} / {warning.signals.length}
          </p>
          <p className="text-xs mt-1.5 text-muted-foreground">
            11개 조건 중 몇 개가 둔화 신호로 감지되었는지
          </p>
        </div>
      </div>

      {/* 신호 체크리스트 */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border bg-muted/60 px-5 py-3">
          <h3 className="text-base font-semibold text-foreground">
            신호 체크리스트
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            11가지 둔화·역성장 조건을 점수화한 지표입니다. 해당하는 항목이
            체크되고, 체크될수록 경고 점수가 누적됩니다. 점수가 높을수록 주의가
            필요합니다.
          </p>
        </div>
        <div className="p-4 md:p-5 space-y-4">
          {([1, 2, 3] as const).map((level) => (
            <div key={level}>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Level {level} 신호
              </p>
              <ul className="space-y-1.5">
                {signalsByLevel(level).map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between text-sm gap-2"
                  >
                    <span
                      className={
                        s.detected ? 'text-foreground' : 'text-muted-foreground'
                      }
                    >
                      {s.detected ? '✅' : '⬜'} {s.label}
                    </span>
                    <span className="text-muted-foreground tabular-nums shrink-0">
                      +{s.detected ? s.points : 0}점
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 성장률 추이 한눈에 보기 */}
      {summary && (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="border-b border-border bg-muted/60 px-5 py-3">
            <h3 className="text-base font-semibold text-foreground">
              성장률 추이 한눈에 보기
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              연간·분기·CAGR 등 핵심 성장 지표와 판정(🟢 정상 / 🟡 주의 / 🔴 경고)입니다. 아래는 모두 최근 결산 기준입니다.
            </p>
          </div>
          <div className="p-4 md:p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">
                  연간 YoY {growthSummaryLabels.annualYear && `(${growthSummaryLabels.annualYear})`}
                </p>
                <p className="font-medium tabular-nums">
                  {summary.annualYoY != null
                    ? formatPct(summary.annualYoY)
                    : '—'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {growthJudgment.recentYoY != null
                    ? JUDGMENT_EMOJI[growthJudgment.recentYoY]
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">
                  분기 YoY {growthSummaryLabels.quarterLabel && `(${growthSummaryLabels.quarterLabel})`}
                </p>
                <p className="font-medium tabular-nums">
                  {summary.recentQuarterYoy != null
                    ? formatPct(summary.recentQuarterYoy)
                    : '—'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {quarterYoyJudgment != null
                    ? `${JUDGMENT_EMOJI[quarterYoyJudgment]}${revenueQoq.recentMomentumSignal ? ` ${revenueQoq.recentMomentumSignal}` : ''}`
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">
                  3년 CAGR {growthSummaryLabels.cagr3Range && `(${growthSummaryLabels.cagr3Range})`}
                </p>
                <p className="font-medium tabular-nums">
                  {summary.cagr3 != null ? formatPct(summary.cagr3) : '—'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {growthJudgment.cagr3 != null
                    ? JUDGMENT_EMOJI[growthJudgment.cagr3]
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">
                  5년 CAGR {growthSummaryLabels.cagr5Range && `(${growthSummaryLabels.cagr5Range})`}
                </p>
                <p className="font-medium tabular-nums">
                  {summary.cagr5 != null ? formatPct(summary.cagr5) : '—'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {growthJudgment.cagr5 != null
                    ? JUDGMENT_EMOJI[growthJudgment.cagr5]
                    : '—'}
                </p>
              </div>
            </div>
            {summary.cagrGapPct != null && (
              <p className="text-sm text-muted-foreground mt-3">
                3년 vs 5년 CAGR 괴리: {formatPctPoint(summary.cagrGapPct)}
                {summary.cagrGapPct >= 3 && ' ⚠️'}
              </p>
            )}
            {summary.quarterYoyDirection && (
              <p className="text-sm text-muted-foreground mt-1">
                분기 YoY 최근 방향: {summary.quarterYoyDirection === '상승' ? '상승 중' : '하락 중'}
                {summary.quarterYoyDirection === '하락' && ' ⚠️'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 인사이트 + 경고 해제 조건 + 판정 */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border bg-muted/60 px-5 py-3">
          <h3 className="text-base font-semibold text-foreground">
            🔍 인사이트
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            위 지표를 바탕으로 한 해석입니다. 참고용으로 활용해 주세요.
          </p>
        </div>
        <div className="p-4 md:p-5 space-y-4">
          {warning.detectedCount > 0 && (
            <p className="text-sm text-foreground/90">
              <span className="font-medium">
                ⚠️ {LEVEL_DESC[warning.level]} 구간 진입
              </span>
              <br />
              {warning.detectedCount}개 신호가 동시에 감지되었습니다.
            </p>
          )}
          {warning.insights.map((line, i) => (
            <div key={i} className="flex gap-2 text-sm">
              <span className="text-muted-foreground shrink-0">•</span>
              <p className="text-foreground/90">{line}</p>
            </div>
          ))}

          {/* 경고 해제 조건 (처음 보는 사람도 이해할 수 있도록) */}
          {(warning.level === 'yellow' || warning.level === 'orange') && (
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-sm font-medium text-foreground mb-2">
                💡 경고 해제 조건
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                아래 중 하나 이상 충족되면 경고가 완화될 수 있습니다.
              </p>
              <ul className="text-sm text-foreground/90 space-y-1">
                <li>□ 분기 YoY 2분기 연속 반등</li>
                <li>□ 연간 YoY 전년 수준 회복</li>
                <li>□ 3년 CAGR과 5년 CAGR 괴리 2%p 이내</li>
              </ul>
            </div>
          )}

          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">판정</p>
            <p className="text-sm font-semibold text-foreground">
              {LEVEL_EMOJI[warning.level]} {LEVEL_DESC[warning.level]}
            </p>
            <p className="text-xs text-muted-foreground mt-1.5">
              {warning.level === 'green' &&
                '즉각적인 조치 없이 모니터링만 유지해도 됩니다.'}
              {warning.level === 'yellow' &&
                '즉각 매도까지는 아니나, 모니터링을 강화하는 구간입니다. 신규 비중 확대는 경고 해제 후 검토를 권합니다.'}
              {warning.level === 'orange' &&
                '연간·분기 지표가 동시에 둔화하고 있어, 밸류에이션과 비중 재검토를 권합니다.'}
              {warning.level === 'red' &&
                '복합 둔화 신호가 많아 투자 비중 축소 검토를 권합니다.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
