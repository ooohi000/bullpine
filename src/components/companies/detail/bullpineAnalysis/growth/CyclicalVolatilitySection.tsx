'use client';

import useCompanyProfile from '@/hooks/api/companies/profile/useCompanyProfile';
import useIncome from '@/hooks/api/companies/statements/useIncome';
import {
  computeCyclicalVolatilityResult,
  GROUP_BENCHMARK_NOTE,
  GROUP_DESCRIPTION,
  GROUP_LABEL,
  type CyclicalJudgment,
  type CyclicalVolatilityResult,
  type SectorGroup,
} from '@/lib/companies/bullpineAnalysis/cyclicalRevenueVolatility';
import { formatNumber } from '@/lib';
import type { IncomeItem } from '@/types/statements';
import React, { useMemo } from 'react';

const JUDGMENT_EMOJI: Record<CyclicalJudgment, string> = {
  green: '🟢',
  yellow: '🟡',
  red: '🔴',
};

const CYCLE_POSITION_LABEL: Record<CyclicalJudgment, string> = {
  green: '저점 근처',
  yellow: '중간',
  red: '고점 근처',
};

const VOL_RATIO_LABEL: Record<CyclicalJudgment, string> = {
  green: '업종 내 안정',
  yellow: '업종 평균 수준',
  red: '변동성 과다',
};

const SECTOR_GROUP_ORDER: SectorGroup[] = ['A', 'B', 'C'];

/** 10억 단위로 짧게 표시 (예: 44.1B) */
function formatRevenueB(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  return formatNumber(value);
}

interface CyclicalVolatilitySectionProps {
  symbol: string;
}

export default function CyclicalVolatilitySection({
  symbol,
}: CyclicalVolatilitySectionProps) {
  const { data: profile, isLoading: profileLoading } = useCompanyProfile({
    symbol,
  });
  const { data: quarterData, isLoading: incomeLoading } = useIncome({
    symbol,
    period: 'quarter',
    limit: 28,
  });

  const incomeItems = useMemo(
    () => (quarterData ?? []) as IncomeItem[],
    [quarterData],
  );
  const sector = profile?.sector ?? '';
  const industry = profile?.industry ?? '';

  const result = useMemo<CyclicalVolatilityResult | null>(() => {
    if (incomeItems.length < 5) return null;
    return computeCyclicalVolatilityResult(incomeItems, sector, industry);
  }, [incomeItems, sector, industry]);

  const isLoading = profileLoading || incomeLoading;

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
        <p className="text-sm">경기민감 업종 매출 변동성 분석 데이터를 불러오는 중입니다.</p>
      </div>
    );
  }

  if (!result || result.metrics.metrics.length < 2) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
        <p className="text-sm font-medium text-foreground mb-2">
          분석할 수 없습니다.
        </p>
        <p className="text-sm">
          분기 손익 데이터가 5분기 이상 필요합니다. 동일 종목의 분기(FQ) 손익계산서를 확인해 주세요.
        </p>
      </div>
    );
  }

  const { metrics, cyclePositionJudgment, volatilityRatioJudgment, overallJudgment, insights, verdict } = result;
  const group = metrics.sectorGroup;
  const desc = GROUP_DESCRIPTION[group];

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        업종마다 다른 기준으로 매출 변동성·사이클 위치를 해석합니다. 고경기민감 업종은 연간 YoY만으로 판단하면 왜곡될 수 있어, 분기 추이와 사이클 위치를 함께 봅니다.
      </p>

      {/* 이해하기: 고경기민감 / 중경기민감 / 저경기민감 업종 설명 (그룹 A/B/C 표현 없음) */}
      <details className="rounded-xl border border-border bg-muted/30 overflow-hidden group">
        <summary className="list-none cursor-pointer px-4 py-3 border-b border-border bg-muted/60 hover:bg-muted/80 transition-colors flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            📖 고경기민감·중경기민감·저경기민감 업종이란?
          </h3>
          <span className="text-muted-foreground text-xs group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="p-4 space-y-4">
          {SECTOR_GROUP_ORDER.map((g) => {
            const d = GROUP_DESCRIPTION[g];
            return (
              <div key={g} className="space-y-1.5">
                <p className="font-medium text-foreground">{d.name}</p>
                <p className="text-sm text-muted-foreground">
                  <span className="text-foreground/80">포함 업종: </span>
                  {d.sectors}
                </p>
                <p className="text-sm text-muted-foreground">{d.characteristics}</p>
              </div>
            );
          })}
        </div>
      </details>

      {/* 3카드: 업종 유형명(고/중/저 경기민감), 사이클 위치, 변동성 비율 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">업종 유형</p>
          <p className="text-lg font-semibold text-foreground">
            {GROUP_LABEL[group]}
          </p>
          {(metrics.sector || metrics.industry) && (
            <p className="text-xs text-muted-foreground mt-1 truncate" title={`${metrics.sector} / ${metrics.industry}`}>
              {metrics.sector} · {metrics.industry}
            </p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">사이클 위치</p>
          <p className="text-xl font-semibold tabular-nums text-foreground">
            {metrics.cyclePositionPct.toFixed(0)}%
          </p>
          <p className="text-xs mt-1">
            {JUDGMENT_EMOJI[cyclePositionJudgment]} {CYCLE_POSITION_LABEL[cyclePositionJudgment]}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">변동성 비율</p>
          <p className="text-xl font-semibold tabular-nums text-foreground">
            {metrics.volatilityRatio.toFixed(1)}배
          </p>
          <p className="text-xs mt-1">
            {JUDGMENT_EMOJI[volatilityRatioJudgment]} {VOL_RATIO_LABEL[volatilityRatioJudgment]}
          </p>
        </div>
      </div>

      {/* 사이클 위치: 의미 설명 + 시각화 + 계산 근거 + 판단 이유 */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border bg-muted/60 px-5 py-3">
          <h3 className="text-base font-semibold text-foreground">
            사이클 위치
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            &quot;지금 매출이 5년 동안 나왔던 최고 수준의 몇 %에 해당하는지&quot;를 보는 지표입니다. 100%에 가까우면 과거 5년 기준 고점 근처, 0%에 가까우면 저점 근처입니다. (5년은 과거 데이터이므로 고점 근처라고 해서 반드시 매출이 줄어든다는 뜻은 아니며, 더 우상향할 수도 있습니다. 다만 고경기민감 업종에서는 과거에 고점 부근 이후 조정이 온 경우가 많아 참고하시라는 의미입니다.)
          </p>
        </div>
        <div className="p-4 md:p-5 space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">시각화 (0% = 과거 최저, 100% = 과거 최고)</p>
            <div className="relative h-12 w-full mt-1 overflow-visible">
              <div className="absolute bottom-0 left-0 right-0 h-8 rounded-full bg-muted overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all bg-primary/80"
                  style={{ width: `${Math.min(100, Math.max(0, metrics.cyclePositionPct))}%` }}
                />
              </div>
              <div
                className="absolute bottom-2 flex flex-col items-center gap-1 z-10 -translate-x-1/2"
                style={{ left: `${Math.min(98, Math.max(2, metrics.cyclePositionPct))}%` }}
              >
                <span className="text-xs font-semibold tabular-nums text-foreground bg-background border border-border rounded px-1.5 py-0.5 shadow-sm whitespace-nowrap">
                  {metrics.cyclePositionPct.toFixed(0)}%
                </span>
                <div className="w-0.5 h-5 rounded-full bg-foreground border border-background shadow" />
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2 tabular-nums">
              <span>0% (저점)</span>
              <span>50%</span>
              <span>100% (고점)</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">5년 최고 매출</p>
              <p className="font-medium tabular-nums">{formatRevenueB(metrics.peakRevenue)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">현재(4분기 평균)</p>
              <p className="font-medium tabular-nums">{formatRevenueB(metrics.currentRevenueAvg)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">5년 최저 매출</p>
              <p className="font-medium tabular-nums">{formatRevenueB(metrics.troughRevenue)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">낙폭 회복률</p>
              <p className="font-medium tabular-nums">{metrics.recoveryRatePct.toFixed(0)}%</p>
            </div>
          </div>
          <div className="pt-2 border-t border-border/70">
            <p className="text-xs font-medium text-muted-foreground mb-1">계산 근거 (사이클 위치)</p>
            <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 rounded-md px-2.5 py-2">
              {metrics.calculationDetailCyclePosition}
            </p>
          </div>
          <div className="pt-2 border-t border-border/70">
            <p className="text-xs font-medium text-muted-foreground mb-1">계산 근거 (낙폭 회복률)</p>
            <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 rounded-md px-2.5 py-2">
              {metrics.calculationDetailRecoveryRate}
            </p>
          </div>
          <div className="pt-2 border-t border-border/70">
            <p className="text-xs font-medium text-muted-foreground mb-1">사이클 위치 자동 판단 이유</p>
            <p className="text-xs text-foreground/90 leading-relaxed bg-muted/30 rounded-md px-2.5 py-2">
              {metrics.cyclePositionReason}
            </p>
          </div>
        </div>
      </div>

      {/* 변동성 분석 + 계산 근거 */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border bg-muted/60 px-5 py-3">
          <h3 className="text-base font-semibold text-foreground">
            변동성 분석
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            <strong className="text-foreground/90">분기별</strong> 매출 YoY(전년 동기 대비 성장률)가 얼마나 들쭉날쭉한지를 표준편차로 봅니다. 성장 지속 가능성 점수에서 쓰는 <strong className="text-foreground/90">연간</strong> 매출 YoY 표준편차(연도별 5개 값)와는 계산 단위가 달라, 여기서 나오는 수치가 더 클 수 있습니다. 같은 업종 유형 기준값과 비교한 비율로 &quot;이 기업이 동종 대비 더 안정적인지, 더 변동이 큰지&quot;를 판단합니다.
          </p>
        </div>
        <div className="p-4 md:p-5 space-y-4">
          <div className="space-y-2 text-sm">
            <p className="flex justify-between">
              <span className="text-muted-foreground">해당 기업 매출 YoY 표준편차 (분기 기준)</span>
              <span className="font-medium tabular-nums">{metrics.revenueVolatilityPct.toFixed(1)}%</span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted-foreground">{desc.name} 벤치마크 변동성</span>
              <span className="tabular-nums">{metrics.groupBenchmarkPct.toFixed(1)}%</span>
            </p>
            <p className="text-xs text-muted-foreground bg-muted/20 rounded px-2 py-1.5">
              {GROUP_BENCHMARK_NOTE[group]}
            </p>
            <p className="flex justify-between">
              <span className="text-muted-foreground">변동성 비율</span>
              <span className="font-medium tabular-nums">
                {metrics.volatilityRatio.toFixed(1)}배 {JUDGMENT_EMOJI[volatilityRatioJudgment]} {VOL_RATIO_LABEL[volatilityRatioJudgment]}
              </span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted-foreground">최대 낙폭 (Peak-to-Trough)</span>
              <span className="tabular-nums">{metrics.peakToTroughPct.toFixed(1)}%</span>
            </p>
          </div>

          <p className="text-sm font-medium text-foreground pt-2 border-t border-border">
            계산 근거
          </p>
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
              <p className="text-sm font-medium text-foreground">① 매출 변동성 (분기 YoY 표준편차)</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                최근 5년 분기별 매출 YoY(전년 동기 대비 성장률)를 구한 뒤, 그 값들의 표준편차를 계산합니다. 표준편차가 클수록 분기마다 매출이 들쭉날쭉하다는 뜻입니다.
              </p>
              <p className="text-sm text-foreground/90 leading-relaxed tabular-nums">
                → 이 종목: 표준편차 = {metrics.revenueVolatilityPct.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-border/50">
                참고: 이 값은 분기 단위입니다. 성장 지속 가능성 점수에서 쓰는 연간 매출 YoY 표준편차(연도별 5개 값)와는 계산 단위가 달라 수치가 다르게 나옵니다.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
              <p className="text-sm font-medium text-foreground">② 변동성 비율</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                해당 기업 매출 변동성 ÷ 업종 벤치마크 변동성으로, 동종 업종 대비 이 기업이 더 안정적인지(1배 미만), 더 변동이 큰지(1.5배 이상) 봅니다.
              </p>
              <p className="text-sm text-foreground/90 leading-relaxed tabular-nums">
                → {metrics.revenueVolatilityPct.toFixed(1)}% ÷ {metrics.groupBenchmarkPct.toFixed(0)}% = {metrics.volatilityRatio.toFixed(2)}배
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-border/50">
                {GROUP_BENCHMARK_NOTE[group]}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
              <p className="text-sm font-medium text-foreground">③ 최대 낙폭 (Peak-to-Trough)</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {metrics.calculationDetailPeakToTrough}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 인사이트 + 판정 */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border bg-muted/60 px-5 py-3">
          <h3 className="text-base font-semibold text-foreground">
            🔍 인사이트
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            위 지표와 업종 유형을 바탕으로 한 해석과 행동 제안입니다.
          </p>
        </div>
        <div className="p-4 md:p-5 space-y-4">
          {insights.map((line, i) => (
            <div key={i} className="flex gap-2 text-sm">
              <span className="text-muted-foreground shrink-0">•</span>
              <p className="text-foreground/90 leading-relaxed">{line}</p>
            </div>
          ))}
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">판정</p>
            <p className="text-sm font-semibold text-foreground">
              {JUDGMENT_EMOJI[overallJudgment]} {verdict}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
