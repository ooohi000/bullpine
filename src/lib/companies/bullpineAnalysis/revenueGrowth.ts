import type { IncomeItem } from '@/types/statements';

export type RevenueJudgment = 'green' | 'yellow' | 'red';

export interface RevenueByYear {
  year: string;
  revenue: number;
}

export interface RevenueGrowthMetrics {
  cagr3: number | null;
  cagr5: number | null;
  recentYoY: number | null;
  acceleration: number | null; // 최근 YoY - 직전 YoY (양수=가속, 음수=감속)
  revenueByYear: RevenueByYear[];
  yoyByYear: { year: string; yoy: number }[];
}

export interface RevenueGrowthJudgment {
  cagr3: RevenueJudgment | null;
  cagr5: RevenueJudgment | null;
  recentYoY: RevenueJudgment | null;
  acceleration: '가속' | '감속' | null;
}

const isFyPeriod = (p: string) => p === 'FY' || p === 'annual';

/** 연간(FY/annual) 손익 데이터에서 연도별 매출 추출, 오래된 순 정렬 */
export function getRevenueByYearFromIncome(
  items: IncomeItem[],
): RevenueByYear[] {
  const fy = items.filter((i) => isFyPeriod(i.period ?? ''));
  return fy
    .map((i) => ({ year: i.fiscalYear, revenue: i.revenue }))
    .filter((r) => r.revenue != null && !Number.isNaN(r.revenue))
    .sort((a, b) => parseInt(a.year, 10) - parseInt(b.year, 10));
}

/**
 * 3년 CAGR (Compound Annual Growth Rate)
 * 공식: (Revenue_최근연도 / Revenue_3년전) ^ (1/3) - 1
 * 의미: 3년 동안 매출이 일정한 연율로 성장했다고 가정했을 때의 연간 성장률.
 * 예: 100 → 133.1 이면 ratio=1.331, 1.331^(1/3)-1 ≈ 10%
 */
export function computeCagr3(revenueByYear: RevenueByYear[]): number | null {
  if (revenueByYear.length < 4) return null;
  const latest = revenueByYear[revenueByYear.length - 1];
  const threeYearsAgo = revenueByYear[revenueByYear.length - 4];
  if (threeYearsAgo.revenue <= 0) return null;
  const ratio = latest.revenue / threeYearsAgo.revenue;
  return Math.pow(ratio, 1 / 3) - 1;
}

/**
 * 5년 CAGR
 * 공식: (Revenue_최근연도 / Revenue_5년전) ^ (1/5) - 1
 * 의미: 5년 동안 매출이 일정한 연율로 성장했다고 가정했을 때의 연간 성장률.
 */
export function computeCagr5(revenueByYear: RevenueByYear[]): number | null {
  if (revenueByYear.length < 6) return null;
  const latest = revenueByYear[revenueByYear.length - 1];
  const fiveYearsAgo = revenueByYear[revenueByYear.length - 6];
  if (fiveYearsAgo.revenue <= 0) return null;
  const ratio = latest.revenue / fiveYearsAgo.revenue;
  return Math.pow(ratio, 1 / 5) - 1;
}

/**
 * YoY (Year over Year) 성장률
 * 공식: (Revenue_당해 / Revenue_전년도) - 1
 * 의미: 전년 대비 당해 매출이 몇 % 증가했는지. 0.1 = 10% 성장.
 */
export function computeYoYByYear(
  revenueByYear: RevenueByYear[],
): { year: string; yoy: number }[] {
  const result: { year: string; yoy: number }[] = [];
  for (let i = 1; i < revenueByYear.length; i++) {
    const prev = revenueByYear[i - 1].revenue;
    const curr = revenueByYear[i].revenue;
    if (prev <= 0) continue;
    result.push({ year: revenueByYear[i].year, yoy: curr / prev - 1 });
  }
  return result;
}

/**
 * 가속/감속 신호
 * 공식: 최근 YoY - 직전 YoY
 * 의미: 양수면 최근 1년이 직전 1년보다 성장률이 높아짐(가속), 음수면 낮아짐(감속).
 */
export function getAcceleration(
  yoyByYear: { year: string; yoy: number }[],
): number | null {
  if (yoyByYear.length < 2) return null;
  const recent = yoyByYear[yoyByYear.length - 1].yoy;
  const prev = yoyByYear[yoyByYear.length - 2].yoy;
  return recent - prev;
}

export function computeRevenueGrowthMetrics(
  items: IncomeItem[],
): RevenueGrowthMetrics {
  const revenueByYear = getRevenueByYearFromIncome(items);
  const yoyByYear = computeYoYByYear(revenueByYear);
  return {
    cagr3: computeCagr3(revenueByYear),
    cagr5: computeCagr5(revenueByYear),
    recentYoY:
      yoyByYear.length > 0 ? yoyByYear[yoyByYear.length - 1].yoy : null,
    acceleration: getAcceleration(yoyByYear),
    revenueByYear,
    yoyByYear,
  };
}

/** 3년 CAGR 판정: 15%+ 🟢, 5~15% 🟡, 5% 미만 🔴 */
export function getCagr3Judgment(cagr: number | null): RevenueJudgment | null {
  if (cagr == null) return null;
  if (cagr >= 0.15) return 'green';
  if (cagr >= 0.05) return 'yellow';
  return 'red';
}

/** 5년 CAGR 판정: 10%+ 🟢, 5~10% 🟡, 5% 미만 🔴 */
export function getCagr5Judgment(cagr: number | null): RevenueJudgment | null {
  if (cagr == null) return null;
  if (cagr >= 0.1) return 'green';
  if (cagr >= 0.05) return 'yellow';
  return 'red';
}

/** YoY 판정: 양수 🟢/🟡(작으면 🟡), 음수 🔴 */
export function getYoYJudgment(yoy: number | null): RevenueJudgment | null {
  if (yoy == null) return null;
  if (yoy < 0) return 'red';
  if (yoy >= 0.1) return 'green';
  return 'yellow';
}

export function getRevenueGrowthJudgment(
  m: RevenueGrowthMetrics,
): RevenueGrowthJudgment {
  return {
    cagr3: getCagr3Judgment(m.cagr3),
    cagr5: getCagr5Judgment(m.cagr5),
    recentYoY: getYoYJudgment(m.recentYoY),
    acceleration:
      m.acceleration == null ? null : m.acceleration > 0 ? '가속' : '감속',
  };
}

/** 인사이트 문구 생성 — 비전문가도 이해할 수 있도록 쉬운 말로 작성 */
export function getRevenueGrowthInsights(
  m: RevenueGrowthMetrics,
  j: RevenueGrowthJudgment,
): string[] {
  const lines: string[] = [];
  const cagr3Pct = m.cagr3 != null ? (m.cagr3 * 100).toFixed(1) : null;
  const cagr5Pct = m.cagr5 != null ? (m.cagr5 * 100).toFixed(1) : null;
  const recentYoYPct =
    m.recentYoY != null ? (m.recentYoY * 100).toFixed(1) : null;

  if (m.recentYoY != null && m.recentYoY < 0) {
    lines.push(
      '최근 1년 매출이 전년보다 줄었습니다. 일시적인 이유(경기, 이벤트)인지, 사업 구조가 약해진 건지 구분해 보는 것이 좋습니다.',
    );
  }

  if (
    m.cagr3 != null &&
    m.cagr5 != null &&
    m.cagr3 < m.cagr5 &&
    m.cagr5 - m.cagr3 >= 0.05
  ) {
    const diff = ((m.cagr5 - m.cagr3) * 100).toFixed(1);
    lines.push(
      `최근 3년 평균 성장률(${cagr3Pct}%)이 5년 평균(${cagr5Pct}%)보다 ${diff}%p 낮습니다. 즉, 예전보다 성장 속도가 느려지고 있다는 뜻입니다.`,
    );
  }

  if (j.cagr3 === 'green' && j.acceleration === '가속') {
    lines.push(
      '최근 몇 년간 매출이 꾸준히 잘 늘고 있고, 성장 속도도 더 빨라지고 있습니다. 다만 주가가 그만큼 비싸게 형성돼 있지는 않은지(밸류에이션) 함께 확인하는 것이 좋습니다.',
    );
  }
  if (j.cagr3 === 'green' && j.acceleration === '감속') {
    lines.push(
      '전반적으로는 매출 성장이 좋은 편이지만, 최근 들어 성장률이 꺾이는 모습입니다. 성장이 정점에 가까워졌을 가능성을 염두에 두고 지표를 보는 것이 좋습니다.',
    );
  }

  if (m.yoyByYear.length >= 3) {
    const lastThree = m.yoyByYear
      .slice(-3)
      .map((x) => (x.yoy * 100).toFixed(1));
    const allDeclining = lastThree.every(
      (_, i) => i === 0 || Number(lastThree[i]) < Number(lastThree[i - 1]),
    );
    if (allDeclining && m.yoyByYear.length >= 3) {
      lines.push(
        `전년 대비 성장률이 ${lastThree.length}년째 계속 낮아지고 있습니다 (${lastThree.join('% → ')}%). 성장 둔화 추세입니다.`,
      );
    }
  }

  if (cagr3Pct && cagr5Pct && j.cagr3 === 'yellow') {
    lines.push(
      '성장률이 나쁘진 않지만 과거만큼 높지 않습니다. 이 구간에서 주가가 여전히 비싸게 평가돼 있다면, 나중에 주가가 조정될 수 있는 가능성을 고려하는 것이 좋습니다.',
    );
  }

  if (lines.length === 0 && cagr3Pct && recentYoYPct) {
    lines.push(
      `최근 3년 평균 성장률 ${cagr3Pct}%, 직전 1년 성장률 ${recentYoYPct}%로, 성장 추세가 유지되고 있습니다.`,
    );
  }

  return lines;
}

/** 종합 판정: 🟢 매력 / 🟡 주의 / 🔴 위험 */
export function getOverallJudgment(
  j: RevenueGrowthJudgment,
): 'green' | 'yellow' | 'red' {
  if (j.recentYoY === 'red') return 'red';
  if (j.cagr3 === 'red' || j.cagr5 === 'red') return 'red';
  if (j.cagr3 === 'green' && j.acceleration === '가속') return 'green';
  if (j.cagr3 === 'yellow' || j.cagr5 === 'yellow' || j.recentYoY === 'yellow')
    return 'yellow';
  return 'green';
}

/** 판정별 점수: 양호 80~100, 주의 50~79, 위험 0~49 (표시용 대표값) */
const JUDGMENT_SCORE: Record<RevenueJudgment, number> = {
  green: 85,
  yellow: 60,
  red: 35,
};

export interface RevenueGrowthScore {
  /** 0~100, 전체 매출 성장 건강도 */
  overall: number;
  cagr3Score: number | null;
  cagr5Score: number | null;
  recentYoYScore: number | null;
}

/** 개별 지표 점수(0~100)와 종합 점수 계산 */
export function getRevenueGrowthScore(
  m: RevenueGrowthMetrics,
  j: RevenueGrowthJudgment,
): RevenueGrowthScore {
  const cagr3Score = j.cagr3 != null ? JUDGMENT_SCORE[j.cagr3] : null;
  const cagr5Score = j.cagr5 != null ? JUDGMENT_SCORE[j.cagr5] : null;
  const recentYoYScore = j.recentYoY != null ? JUDGMENT_SCORE[j.recentYoY] : null;
  const overallJudgment = getOverallJudgment(j);
  const overall = JUDGMENT_SCORE[overallJudgment];
  const parts = [cagr3Score, cagr5Score, recentYoYScore].filter(
    (s): s is number => s != null,
  );
  const average =
    parts.length > 0
      ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length)
      : overall;
  return {
    overall: average,
    cagr3Score: cagr3Score ?? null,
    cagr5Score: cagr5Score ?? null,
    recentYoYScore: recentYoYScore ?? null,
  };
}

/** UI용 용어 설명 (매출 성장 분석) */
export const REVENUE_GROWTH_TERMS = [
  {
    term: '3년 CAGR',
    description:
      '최근 연도 매출을 3년 전 매출과 비교해, “매년 이 비율로 늘었다고 가정했을 때”의 연간 성장률입니다. 예: 최근 연도가 2025년이면 2025년 매출을 2022년 매출과 비교해 위와 같이 구합니다.',
  },
  {
    term: '5년 CAGR',
    description:
      '최근 연도 매출을 5년 전 매출과 비교한 연평균 성장률입니다. 예: 2025년이 최근 연도면 2025년 매출을 2020년 매출과 비교합니다. 3년보다 긴 기간이라 장기 추세를 볼 때 유용합니다.',
  },
  {
    term: 'YoY (전년 대비 성장률)',
    description:
      '“직전 1년보다 올해 매출이 몇 % 늘었는지”를 나타냅니다. 예: 2025년 YoY 10%면 2024년 대비 2025년 매출이 10% 증가한 것입니다.',
  },
  {
    term: '가속 / 감속',
    description:
      '가속은 “최근 1년 성장률이 그 전 1년보다 더 높아진 것”, 감속은 “더 낮아진 것”을 의미합니다. 아래 표시되는 감속/가속은 항상 가장 최근 연도(예: 2025년) 기준입니다.',
  },
] as const;
