import type { IncomeItem } from '@/types/statements';

export type OperatingIncomeJudgment = 'green' | 'yellow' | 'red';

export interface OperatingIncomeByYear {
  year: string;
  operatingIncome: number;
  revenue: number;
  operatingIncomeRatio: number; // 영업이익률 = operatingIncome / revenue
}

export interface OperatingIncomeYoYRow {
  year: string;
  operatingIncomeYoY: number;
  revenueYoY: number;
  leverageEffect: number; // 영업이익 YoY - 매출 YoY (양수 = 레버리지)
}

export interface OperatingIncomeGrowthMetrics {
  byYear: OperatingIncomeByYear[];
  yoyByYear: OperatingIncomeYoYRow[];
  recentOperatingIncomeYoY: number | null;
  recentOperatingIncomeRatio: number | null;
  recentLeverageEffect: number | null; // 최신 연도 기준 매출 대비 괴리(%p)
}

export interface OperatingIncomeGrowthJudgment {
  operatingIncomeYoY: OperatingIncomeJudgment | null;
  operatingIncomeRatio: OperatingIncomeJudgment | null;
  leverage: OperatingIncomeJudgment | null; // 레버리지: 양수 🟢, -5%p 이하 🔴
}

const isFyPeriod = (p: string) => p === 'FY' || p === 'annual';

/** 연간(FY/annual) 손익에서 연도별 영업이익·매출·영업이익률 추출 */
export function getOperatingIncomeByYearFromIncome(
  items: IncomeItem[],
): OperatingIncomeByYear[] {
  const fy = items.filter((i) => isFyPeriod(i.period ?? ''));
  return fy
    .map((i) => {
      const revenue = i.revenue ?? 0;
      const operatingIncome = i.operatingIncome ?? 0;
      const ratio =
        revenue > 0 ? operatingIncome / revenue : 0;
      return {
        year: i.fiscalYear,
        operatingIncome,
        revenue,
        operatingIncomeRatio: ratio,
      };
    })
    .filter(
      (r) =>
        !Number.isNaN(r.operatingIncomeRatio) &&
        r.revenue > 0,
    )
    .sort((a, b) => parseInt(a.year, 10) - parseInt(b.year, 10));
}

/** 영업이익 YoY, 매출 YoY, 레버리지(영업이익 YoY - 매출 YoY) 연도별 */
export function computeOperatingIncomeYoYByYear(
  byYear: OperatingIncomeByYear[],
): OperatingIncomeYoYRow[] {
  const result: OperatingIncomeYoYRow[] = [];
  for (let i = 1; i < byYear.length; i++) {
    const prev = byYear[i - 1];
    const curr = byYear[i];
    const opYoY =
      prev.operatingIncome !== 0
        ? curr.operatingIncome / prev.operatingIncome - 1
        : 0;
    const revYoY =
      prev.revenue > 0 ? curr.revenue / prev.revenue - 1 : 0;
    result.push({
      year: curr.year,
      operatingIncomeYoY: opYoY,
      revenueYoY: revYoY,
      leverageEffect: opYoY - revYoY,
    });
  }
  return result;
}

export function computeOperatingIncomeGrowthMetrics(
  items: IncomeItem[],
): OperatingIncomeGrowthMetrics {
  const byYear = getOperatingIncomeByYearFromIncome(items);
  const yoyByYear = computeOperatingIncomeYoYByYear(byYear);
  const latest = byYear.at(-1);
  const latestYoY = yoyByYear.at(-1);
  return {
    byYear,
    yoyByYear,
    recentOperatingIncomeYoY: latestYoY?.operatingIncomeYoY ?? null,
    recentOperatingIncomeRatio: latest?.operatingIncomeRatio ?? null,
    recentLeverageEffect: latestYoY?.leverageEffect ?? null,
  };
}

/** 영업이익 YoY 판정: 20%+ 🟢, 5~20% 🟡, 0% 미만 🔴 */
export function getOperatingIncomeYoYJudgment(
  yoy: number | null,
): OperatingIncomeJudgment | null {
  if (yoy == null) return null;
  if (yoy >= 0.2) return 'green';
  if (yoy >= 0) return 'yellow';
  return 'red';
}

/** 영업이익률 판정: 15%+ 🟢, 10~15% 🟡, 10% 미만 또는 급락 🔴 (단순화: 15%+ 🟢, 5~15% 🟡, 5% 미만 🔴) */
export function getOperatingIncomeRatioJudgment(
  ratio: number | null,
): OperatingIncomeJudgment | null {
  if (ratio == null) return null;
  if (ratio >= 0.15) return 'green';
  if (ratio >= 0.05) return 'yellow';
  return 'red';
}

/** 레버리지(영업이익 YoY - 매출 YoY): 양수 🟢, -5%p 이하 🔴, 그 사이 🟡 */
export function getLeverageJudgment(
  leverage: number | null,
): OperatingIncomeJudgment | null {
  if (leverage == null) return null;
  if (leverage > 0.05) return 'green';
  if (leverage < -0.05) return 'red';
  return 'yellow';
}

export function getOperatingIncomeGrowthJudgment(
  m: OperatingIncomeGrowthMetrics,
): OperatingIncomeGrowthJudgment {
  return {
    operatingIncomeYoY: getOperatingIncomeYoYJudgment(
      m.recentOperatingIncomeYoY,
    ),
    operatingIncomeRatio: getOperatingIncomeRatioJudgment(
      m.recentOperatingIncomeRatio,
    ),
    leverage: getLeverageJudgment(m.recentLeverageEffect),
  };
}

/** 인사이트 문구 — 매출과 괴리 분석 중심, 쉬운 말 */
export function getOperatingIncomeGrowthInsights(
  m: OperatingIncomeGrowthMetrics,
  j: OperatingIncomeGrowthJudgment,
): string[] {
  const lines: string[] = [];
  const opYoYPct =
    m.recentOperatingIncomeYoY != null
      ? (m.recentOperatingIncomeYoY * 100).toFixed(1)
      : null;
  const revYoYPct =
    m.yoyByYear.length > 0
      ? (m.yoyByYear[m.yoyByYear.length - 1].revenueYoY * 100).toFixed(1)
      : null;
  const leveragePct =
    m.recentLeverageEffect != null
      ? (m.recentLeverageEffect * 100).toFixed(1)
      : null;
  const ratioPct =
    m.recentOperatingIncomeRatio != null
      ? (m.recentOperatingIncomeRatio * 100).toFixed(1)
      : null;

  if (m.recentOperatingIncomeYoY != null && m.recentOperatingIncomeYoY < 0) {
    lines.push(
      '영업이익이 전년 대비 줄었습니다. 영업손실로 전환된 경우 본업에서 돈을 못 버는 상태일 수 있어 주의가 필요합니다.',
    );
  }

  if (
    m.recentOperatingIncomeYoY != null &&
    m.yoyByYear.length > 0 &&
    m.recentLeverageEffect != null &&
    m.recentLeverageEffect > 0.05
  ) {
    lines.push(
      `영업이익 성장률(${opYoYPct}%)이 매출 성장률(${revYoYPct}%)보다 ${leveragePct}%p 높습니다. 이익 레버리지가 작동 중이며, 규모의 경제 효과가 나고 있을 가능성이 있습니다.`,
    );
  }

  if (
    m.recentLeverageEffect != null &&
    m.recentLeverageEffect < -0.05 &&
    revYoYPct
  ) {
    lines.push(
      `매출은 전년 대비 ${revYoYPct}% 늘었지만 영업이익 성장이 더 느립니다. 비용이 매출보다 빠르게 늘고 있다는 신호이므로, 원가·판관비 추이를 확인하는 것이 좋습니다.`,
    );
  }

  if (
    m.yoyByYear.length > 0 &&
    m.recentOperatingIncomeYoY != null &&
    m.recentOperatingIncomeYoY < 0 &&
    m.yoyByYear[m.yoyByYear.length - 1].revenueYoY > 0
  ) {
    lines.push(
      '매출은 성장했는데 영업이익은 줄어든 상황입니다. 비용 구조에 심각한 압박이 있을 수 있으므로 원인 파악이 필요합니다.',
    );
  }

  if (m.byYear.length >= 3) {
    const ratios = m.byYear.slice(-3).map((r) => r.operatingIncomeRatio);
    const allDeclining = ratios.every(
      (_, i) => i === 0 || ratios[i]! < ratios[i - 1]!,
    );
    if (allDeclining) {
      lines.push(
        '영업이익률이 3년 연속 하락하고 있습니다. 마진이 구조적으로 악화되고 있을 수 있으며, 경쟁 심화나 원가 상승 가능성을 점검하는 것이 좋습니다.',
      );
    }
  }

  if (
    ratioPct &&
    m.recentOperatingIncomeRatio != null &&
    m.recentOperatingIncomeRatio >= 0.15 &&
    m.byYear.length >= 3
  ) {
    const lastThree = m.byYear.slice(-3).map((r) => (r.operatingIncomeRatio * 100).toFixed(0));
    const stable =
      lastThree.every((v, i) => i === 0 || Math.abs(Number(v) - Number(lastThree[i - 1])) < 2);
    if (stable) {
      lines.push(
        `영업이익률이 ${lastThree.join('%·')}% 수준으로 안정적입니다. 가격 결정력과 비용 통제가 잘 유지되고 있을 가능성이 있습니다.`,
      );
    }
  }

  if (lines.length === 0 && opYoYPct && ratioPct) {
    lines.push(
      `최근 연도 영업이익 전년 대비 ${opYoYPct}%, 영업이익률 ${ratioPct}%입니다.`,
    );
  }

  return lines;
}

/** 종합 판정 */
export function getOperatingIncomeOverallJudgment(
  j: OperatingIncomeGrowthJudgment,
): OperatingIncomeJudgment {
  if (j.operatingIncomeYoY === 'red') return 'red';
  if (j.operatingIncomeRatio === 'red' || j.leverage === 'red') return 'red';
  if (j.operatingIncomeYoY === 'green' && j.leverage === 'green')
    return 'green';
  return 'yellow';
}
