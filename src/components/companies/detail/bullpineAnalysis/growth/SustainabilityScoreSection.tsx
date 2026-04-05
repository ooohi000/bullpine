'use client';

import useBalanceSheet from '@/hooks/api/companies/statements/useBalanceSheet';
import useCashFlow from '@/hooks/api/companies/statements/useCashFlow';
import useIncome from '@/hooks/api/companies/statements/useIncome';
import {
  AXIS_CHART_LABELS,
  AXIS_FULL_NAMES,
  computeSustainabilityScore,
  type AxisScore,
  type SustainabilityGrade,
  type SustainabilityScoreResult,
} from '@/lib/companies/bullpineAnalysis/sustainabilityScore';
import type { BalanceSheetItem } from '@/types/statements/balanceSheet';
import type { CashFlowItem } from '@/types/statements/cashFlow';
import type { IncomeItem } from '@/types/statements/income';
import React, { useMemo, useState } from 'react';

const GRADE_EMOJI: Record<SustainabilityGrade, string> = {
  green: '🟢',
  yellow: '🟡',
  red: '🔴',
};

/** 5개 축별 설명·점수·신호 기준 (접기 블록용). note = "보통" 등 쉬운 설명, termExplain = 순수/희석 등 용어 한 줄 */
const AXIS_HELP: Record<
  1 | 2 | 3 | 4 | 5,
  {
    meaning: string;
    score: string;
    signals: { emoji: string; name: string; range: string; note?: string }[];
    termExplain?: string;
    valueExplain?: string;
  }
> = {
  1: {
    meaning: '매출 YoY(전년 대비 성장률)가 최근 5년 동안 얼마나 일정한지 표준편차로 봅니다. 성장률 수준(몇 %인지)이 아니라 연도 간 변동폭(변동성)만 보는 지표이며, 표준편차가 작을수록 연도별 성장률이 일정하고, 클수록 들쭉날쭉합니다.',
    score: '표준편차 5% 미만 2점, 5~15% 1점, 15% 초과 0점.',
    signals: [
      { emoji: '🟢', name: '고안정', range: '표준편차 5% 미만', note: '연간 성장률이 거의 비슷하게 나온다는 뜻. 가장 안정적.' },
      { emoji: '🟡', name: '보통', range: '5~15%', note: '고안정만큼 일정하진 않지만, 위험한 수준은 아님. 연간 성장률이 5~15% 범위로 들쭉날쭉한 편.' },
      { emoji: '🔴', name: '변동성 과다', range: '15% 이상', note: '연간마다 성장률이 크게 요동쳐서, 성장이 믿기 어려운 구간.' },
    ],
  },
  2: {
    meaning: '당기순이익이 현금으로 얼마나 실현되는지 봅니다. FCF(잉여현금흐름) ÷ 순이익 비율, 최근 3년 평균입니다.',
    score: '비율 1.0 이상 2점, 0.7~1.0 1점, 0.7 미만 0점.',
    signals: [
      { emoji: '🟢', name: '이익이 현금으로 실현', range: '비율 1.0 이상', note: '손익계산서상 이익이 그만큼 현금으로 들어왔다는 뜻. 가장 좋은 상태.' },
      { emoji: '🟡', name: '보통', range: '0.7~1.0', note: '이익의 70~100%가 현금으로 들어온 상태. 1.0 미만이면 일부 이익은 아직 미수금·재고 등에 묶여 있을 수 있음.' },
      { emoji: '🔴', name: '이익 착시 가능성', range: '0.7 미만', note: '장부상 이익은 있는데 현금은 덜 들어옴. 미수금·재고 증가 등 확인 필요.' },
    ],
  },
  3: {
    meaning: '매출 성장이 주식 수 증가(희석) 없이 이뤄지는지 봅니다. 5년 매출 성장률과 주식수 증가율을 비교합니다.',
    termExplain: '순수 성장 = 매출이 늘어나도 주식 수가 덜 늘어나서, 주당 가치가 보존되는 성장. 희석 성장 = 주식 수가 많이 늘어나서, 주당 가치가 나눠져 내려가는(희석되는) 성장.',
    score: '매출 성장률 > 주식수 증가율 2점, 비슷 1점, 매출 성장률 < 주식수 증가율 0점.',
    signals: [
      { emoji: '🟢', name: '순수 성장', range: '매출 성장률 > 주식수 증가율', note: '매출이 더 많이 늘어나서 주주 몫(주당 가치)이 보존됨.' },
      { emoji: '🟡', name: '희석 성장 의심', range: '비슷한 수준', note: '매출과 주식 수가 비슷하게 늘어나, 주당 가치가 희석될 수 있음.' },
      { emoji: '🔴', name: '희석이 성장을 초과', range: '주식수 증가 > 매출 성장', note: '주식 수가 매출보다 더 많이 늘어나, 주당 가치가 줄어드는 구조.' },
    ],
  },
  4: {
    meaning: '매출이 늘어날 때 영업이익률이 유지·개선되는지 봅니다. 최근 3년 영업이익률 추이로 판단합니다.',
    score: '유지 또는 개선 2점, 1~2%p 하락 1점, 3%p 이상 하락 0점.',
    signals: [
      { emoji: '🟢', name: '유지 또는 개선', range: '영업이익률이 그대로이거나 올라감', note: '매출이 늘어나도 수익성이 유지·개선되는 좋은 상태.' },
      { emoji: '🟡', name: '완만한 하락', range: '1~2%p 하락', note: '영업이익률이 조금 줄어든 상태. 비용이 매출보다 더 빠르게 늘고 있을 수 있음.' },
      { emoji: '🔴', name: '급격한 하락', range: '3%p 이상 하락', note: '매출은 늘었는데 이익률이 크게 떨어지는 출혈 성장에 가까운 상태.' },
    ],
  },
  5: {
    meaning: '성장을 지속할 재무 여력이 있는지 봅니다. Net Debt(순차입금 = 부채 − 현금) ÷ EBITDA 비율로 부채 부담을 봅니다.',
    valueExplain: '0배 = 순차입금이 0이거나 음수라는 뜻. 즉 현금이 부채보다 많아서 부채 부담이 없다는 의미입니다.',
    score: '2배 미만 2점, 2~4배 1점, 4배 이상 0점.',
    signals: [
      { emoji: '🟢', name: '성장 투자 여력 충분', range: 'Net Debt/EBITDA 2배 미만', note: '부채 부담이 적어 성장에 쓸 여력이 있음.' },
      { emoji: '🟡', name: '부담 있으나 관리 가능', range: '2~4배', note: '부채가 있지만 EBITDA 대비 관리 가능한 수준.' },
      { emoji: '🔴', name: '부채로 성장 중, 지속 한계', range: '4배 이상', note: '부채 비중이 커서 성장 지속이 어려울 수 있음.' },
    ],
  },
};

/** 접기: 5가지 축이 무엇인지, 점수·신호는 어떻게 매겨지는지 설명. axes 전달 시 현재 값 표시 */
function AxisHelpCollapse({ axes }: { axes?: AxisScore[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full border-b border-border bg-muted/60 px-5 py-3 flex items-center justify-between text-left hover:bg-muted/40 transition-colors"
      >
        <h3 className="text-base font-semibold text-foreground">
          📖 5가지 축 이해하기
        </h3>
        <span className="text-muted-foreground text-sm shrink-0">
          {open ? '접기' : '펼치기'}
        </span>
      </button>
      {open && (
        <div className="p-4 md:p-5 space-y-5 text-sm">
          <p className="text-muted-foreground">
            지속 가능성 점수는 5개 축으로 나뉩니다. 각 축이 무엇을 의미하는지, 점수(0~2점)와 신호(🟢🟡🔴)는 어떻게 정해지는지 아래에서 확인할 수 있습니다.
          </p>
          {([1, 2, 3, 4, 5] as const).map((id) => {
            const h = AXIS_HELP[id];
            const current = axes?.find((a) => a.id === id);
            return (
              <div key={id} className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                <p className="font-medium text-foreground">
                  {AXIS_FULL_NAMES[id]}
                </p>
                <p className="text-muted-foreground">{h.meaning}</p>
                {h.termExplain && (
                  <p className="text-muted-foreground text-xs bg-background/60 rounded px-2 py-1.5 border border-border">
                    💡 {h.termExplain}
                  </p>
                )}
                {h.valueExplain && (
                  <p className="text-muted-foreground text-xs bg-background/60 rounded px-2 py-1.5 border border-border">
                    💡 {h.valueExplain}
                  </p>
                )}
                {current && (
                  <div className="rounded-md bg-background/80 px-3 py-2 border border-border">
                    <p className="text-xs text-muted-foreground">현재 이 종목의 값</p>
                    <p className="font-medium text-foreground tabular-nums">
                      {current.valueLabel} → {current.points}점 {GRADE_EMOJI[current.grade]} {current.detailLabel}
                    </p>
                  </div>
                )}
                <div>
                  <p className="font-medium text-foreground mb-1.5">점수 산정</p>
                  <p className="text-muted-foreground">{h.score}</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1.5">신호 기준 (🟢 가장 좋음, 🟡 중간, 🔴 주의)</p>
                  <ul className="space-y-2 text-muted-foreground">
                    {h.signals.map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="shrink-0">{s.emoji}</span>
                        <span>
                          <span className="text-foreground/90 font-medium">{s.name}</span>
                          <span className="ml-1">{s.range}</span>
                          {s.note && (
                            <p className="text-xs mt-0.5 text-muted-foreground/90">{s.note}</p>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** 5각 레이더: 각 축 점수(0~2)를 반지름으로 표시. 축 이름은 짧은 라벨로 표시 */
function RadarChart({ axes }: { axes: AxisScore[] }) {
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const r = 72;
  const n = 5;
  const angleOffset = -90 * (Math.PI / 180);

  const points = axes.map((a, i) => {
    const angle = angleOffset + (i * 2 * Math.PI) / n;
    const value = (a.points / a.maxPoints) * r;
    return {
      x: cx + value * Math.cos(angle),
      y: cy + value * Math.sin(angle),
    };
  });
  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  const axisLabels = axes.map((a, i) => {
    const angle = angleOffset + (i * 2 * Math.PI) / n;
    const labelR = r + 36;
    const x = cx + labelR * Math.cos(angle);
    const y = cy + labelR * Math.sin(angle);
    return { id: a.id, name: AXIS_CHART_LABELS[a.id], x, y };
  });

  const gridPoints = [0.25, 0.5, 0.75, 1].map((scale) => {
    const pts = Array.from({ length: n }, (_, i) => {
      const angle = angleOffset + (i * 2 * Math.PI) / n;
      const value = scale * r;
      return `${cx + value * Math.cos(angle)},${cy + value * Math.sin(angle)}`;
    });
    return pts.join(' ');
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px] mx-auto" aria-hidden>
      {gridPoints.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="0.5"
        />
      ))}
      {Array.from({ length: n }, (_, i) => {
        const angle = angleOffset + (i * 2 * Math.PI) / n;
        const x2 = cx + r * Math.cos(angle);
        const y2 = cy + r * Math.sin(angle);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x2}
            y2={y2}
            stroke="hsl(var(--border))"
            strokeWidth="0.5"
          />
        );
      })}
      <polygon
        points={polygonPoints}
        fill="hsl(var(--primary) / 0.15)"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
      />
      {axisLabels.map((l) => (
        <text
          key={l.id}
          x={l.x}
          y={l.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground text-[11px] font-medium"
        >
          {l.name}
        </text>
      ))}
    </svg>
  );
}

interface SustainabilityScoreSectionProps {
  symbol: string;
}

export default function SustainabilityScoreSection({
  symbol,
}: SustainabilityScoreSectionProps) {
  const { data: incomeData, isLoading: incomeLoading } = useIncome({
    symbol,
    period: 'annual',
    limit: 7,
  });
  const { data: cashFlowData, isLoading: cfLoading } = useCashFlow({
    symbol,
    period: 'annual',
    limit: 7,
  });
  const { data: balanceData, isLoading: bsLoading } = useBalanceSheet({
    symbol,
    period: 'annual',
    limit: 7,
  });

  const income = useMemo(() => (incomeData ?? []) as IncomeItem[], [incomeData]);
  const cashFlow = useMemo(
    () => (cashFlowData ?? []) as CashFlowItem[],
    [cashFlowData],
  );
  const balanceSheet = useMemo((): BalanceSheetItem[] => {
    if (!balanceData) return [];
    return Array.isArray(balanceData)
      ? (balanceData as BalanceSheetItem[])
      : ((balanceData as { data?: BalanceSheetItem[] }).data ?? []);
  }, [balanceData]);

  const result = useMemo(
    (): SustainabilityScoreResult | null =>
      computeSustainabilityScore(income, cashFlow, balanceSheet),
    [income, cashFlow, balanceSheet],
  );

  const fyIncomeCount = useMemo(
    () => income.filter((i) => i.period === 'FY' || i.period === 'annual').length,
    [income],
  );
  const fyCfCount = useMemo(
    () => cashFlow.filter((c) => c.period === 'FY' || c.period === 'annual').length,
    [cashFlow],
  );
  const fyBsCount = useMemo(
    () => balanceSheet.filter((b) => b.period === 'FY' || b.period === 'annual').length,
    [balanceSheet],
  );

  const isLoading = incomeLoading || cfLoading || bsLoading;

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
        <p className="text-sm">지속 가능성 점수를 산출하는 중입니다.</p>
      </div>
    );
  }

  if (!result) {
    const missing: string[] = [];
    if (fyIncomeCount < 3) missing.push(`연간 손익 ${fyIncomeCount}건 (3년 이상 필요)`);
    if (fyCfCount < 2) missing.push(`연간 현금흐름 ${fyCfCount}건 (2년 이상 필요)`);
    if (fyBsCount < 1) missing.push(`연간 재무제표 ${fyBsCount}건 (1건 이상 필요)`);
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
        <p className="text-sm font-medium text-foreground mb-2">
          지속 가능성 점수를 산출할 수 없습니다.
        </p>
        <p className="text-sm mb-2">
          부족한 데이터: {missing.length > 0 ? missing.join(', ') : '연간 손익 3년·현금흐름 2년·재무제표 1건 이상 필요'}
        </p>
        <p className="text-xs">
          동일 종목의 손익계산서·현금흐름표·재무상태표가 연간(FY)으로 제공되는지 확인해 주세요.
        </p>
      </div>
    );
  }

  const { totalPoints, maxPoints, grade, gradeLabel, axes, insights, verdict } = result;

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        성장이 &quot;지금까지 어떻게 왔는가&quot;가 아니라 &quot;앞으로도 이어질 수 있는가&quot;를 5개 축으로 점수화했습니다.
      </p>

      {/* 종합 점수 + 등급 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <p className="text-xs text-muted-foreground mb-1">종합 점수</p>
          <p className="text-2xl font-semibold tabular-nums">
            {totalPoints} / {maxPoints}
          </p>
          <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(totalPoints / maxPoints) * 100}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 flex flex-col items-center justify-center">
          <p className="text-xs text-muted-foreground mb-1">등급</p>
          <p className="text-xl font-semibold">
            {GRADE_EMOJI[grade]} {gradeLabel}
          </p>
        </div>
      </div>

      {/* 5개 축 레이더 */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border bg-muted/60 px-5 py-3">
          <h3 className="text-base font-semibold text-foreground">
            5개 축 레이더 차트
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            각 축별 점수(0~2)를 한눈에 볼 수 있습니다. 차트 축 이름은 아래 상세 점수와 동일합니다(성장 일관성, 이익의 질, 성장 순수성, 수익성 동반, 재무 여력).
          </p>
        </div>
        <div className="p-4 md:p-5 flex justify-center">
          <RadarChart axes={axes} />
        </div>
      </div>

      {/* 접기: 5가지 축 이해하기 */}
      <AxisHelpCollapse axes={axes} />

      {/* 상세 점수 */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border bg-muted/60 px-5 py-3">
          <h3 className="text-base font-semibold text-foreground">
            상세 점수
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            축별 점수와 계산 근거입니다. 각 축 의미·신호 기준은 위 &quot;5가지 축 이해하기&quot;에서 확인할 수 있습니다.
          </p>
        </div>
        <div className="p-4 md:p-5 space-y-4">
          {axes.map((axis) => (
            <div key={axis.id} className="space-y-2 rounded-lg border border-border bg-muted/10 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">
                  {AXIS_FULL_NAMES[axis.id]}
                </span>
                <span className="tabular-nums shrink-0 ml-2 font-medium">
                  {axis.points}/{axis.maxPoints}점 {GRADE_EMOJI[axis.grade]}
                </span>
              </div>
              <p className="text-sm text-foreground/90 font-medium tabular-nums">
                {axis.valueLabel}
              </p>
              <p className="text-xs text-muted-foreground">
                → {axis.detailLabel}
              </p>
              {axis.calculationDetail && (
                <div className="pt-2 mt-2 border-t border-border/70">
                  <p className="text-xs font-medium text-muted-foreground mb-1">계산 근거</p>
                  <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 rounded-md px-2.5 py-2">
                    {axis.calculationDetail}
                  </p>
                </div>
              )}
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(axis.points / axis.maxPoints) * 100}%`,
                    backgroundColor:
                      axis.grade === 'green'
                        ? 'hsl(142, 76%, 36%)'
                        : axis.grade === 'yellow'
                          ? 'hsl(38, 92%, 50%)'
                          : 'hsl(0, 84%, 60%)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 인사이트 + 판정 */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border bg-muted/60 px-5 py-3">
          <h3 className="text-base font-semibold text-foreground">
            🔍 인사이트
          </h3>
        </div>
        <div className="p-4 md:p-5 space-y-4">
          {insights.map((line, i) => (
            <div key={i} className="flex gap-2 text-sm">
              <span className="text-muted-foreground shrink-0">•</span>
              <p className="text-foreground/90">{line}</p>
            </div>
          ))}
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">판정</p>
            <p className="text-sm font-semibold text-foreground">
              {GRADE_EMOJI[grade]} {verdict}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
