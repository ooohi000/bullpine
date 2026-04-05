import type { IncomeItem } from '@/types/statements';

export type EpsGapJudgment = 'green' | 'yellow' | 'red';

export interface EpsRevenueByYear {
  year: string;
  revenue: number;
  epsDiluted: number;
  netIncome: number;
  operatingIncome: number;
  shares: number; // weightedAverageShsOutDil
  netMargin: number; // netIncome / revenue
}

export interface EpsRevenueYoYRow {
  year: string;
  revenueYoY: number;
  epsYoY: number;
  gap: number; // EPS YoY - Revenue YoY (%p)
  sharesYoY: number; // 주식수 변화율, 음수=자사주 매입
  netMarginChange: number; // 순이익률 변화 (%p)
}

export interface EpsVsRevenueGrowthMetrics {
  byYear: EpsRevenueByYear[];
  yoyByYear: EpsRevenueYoYRow[];
  recentRevenueYoY: number | null;
  recentEpsYoY: number | null;
  recentGap: number | null;
  recentSharesYoY: number | null;
}

export interface EpsVsRevenueGrowthJudgment {
  revenueYoY: EpsGapJudgment | null;
  epsYoY: EpsGapJudgment | null;
  gap: EpsGapJudgment | null;
  shares: EpsGapJudgment | null; // 감소 🟢, 소폭 증가 🟡, 3%+ 증가 🔴
}

const isFyPeriod = (p: string) => p === 'FY' || p === 'annual';

/** 연간(FY/annual) 손익에서 연도별 매출·EPS·순이익·주식수 추출 */
export function getEpsRevenueByYearFromIncome(
  items: IncomeItem[],
): EpsRevenueByYear[] {
  const fy = items.filter((i) => isFyPeriod(i.period ?? ''));
  return fy
    .map((i) => {
      const revenue = i.revenue ?? 0;
      const netIncome = i.netIncome ?? 0;
      const operatingIncome = i.operatingIncome ?? 0;
      const epsDiluted = i.epsDiluted ?? i.eps ?? 0;
      const shares = i.weightedAverageShsOutDil ?? i.weightedAverageShsOut ?? 0;
      const netMargin = revenue > 0 ? netIncome / revenue : 0;
      return {
        year: i.fiscalYear,
        revenue,
        epsDiluted,
        netIncome,
        operatingIncome,
        shares,
        netMargin,
      };
    })
    .filter((r) => r.revenue > 0 && !Number.isNaN(r.epsDiluted))
    .sort((a, b) => parseInt(a.year, 10) - parseInt(b.year, 10));
}

export function computeEpsRevenueYoYByYear(
  byYear: EpsRevenueByYear[],
): EpsRevenueYoYRow[] {
  const result: EpsRevenueYoYRow[] = [];
  for (let i = 1; i < byYear.length; i++) {
    const prev = byYear[i - 1]!;
    const curr = byYear[i]!;
    const revenueYoY = prev.revenue > 0 ? curr.revenue / prev.revenue - 1 : 0;
    const epsYoY =
      prev.epsDiluted !== 0 ? curr.epsDiluted / prev.epsDiluted - 1 : 0;
    const sharesYoY =
      prev.shares > 0 ? curr.shares / prev.shares - 1 : 0;
    const netMarginChange =
      (curr.netMargin - prev.netMargin) * 100; // %p
    result.push({
      year: curr.year,
      revenueYoY,
      epsYoY,
      gap: (epsYoY - revenueYoY) * 100, // %p
      sharesYoY,
      netMarginChange,
    });
  }
  return result;
}

export function computeEpsVsRevenueGrowthMetrics(
  items: IncomeItem[],
): EpsVsRevenueGrowthMetrics {
  const byYear = getEpsRevenueByYearFromIncome(items);
  const yoyByYear = computeEpsRevenueYoYByYear(byYear);
  const latestYoY = yoyByYear.at(-1);
  return {
    byYear,
    yoyByYear,
    recentRevenueYoY: latestYoY?.revenueYoY ?? null,
    recentEpsYoY: latestYoY?.epsYoY ?? null,
    recentGap: latestYoY?.gap ?? null,
    recentSharesYoY: latestYoY?.sharesYoY ?? null,
  };
}

/** 매출 YoY 판정: 단순 구간 */
function getRevenueYoYJudgment(yoy: number | null): EpsGapJudgment | null {
  if (yoy == null) return null;
  if (yoy < 0) return 'red';
  if (yoy >= 0.1) return 'green';
  return 'yellow';
}

/** EPS YoY: 15%+ 🟢, 5~15% 🟡, 0 미만 🔴 */
function getEpsYoYJudgment(yoy: number | null): EpsGapJudgment | null {
  if (yoy == null) return null;
  if (yoy < 0) return 'red';
  if (yoy >= 0.15) return 'green';
  if (yoy >= 0.05) return 'yellow';
  return 'yellow';
}

/** 괴리: +5%p 이상 🟢, -5%p 미만 🔴, 그 사이 🟡 */
function getGapJudgment(gap: number | null): EpsGapJudgment | null {
  if (gap == null) return null;
  if (gap >= 5) return 'green';
  if (gap <= -5) return 'red';
  return 'yellow';
}

/** 주식수: 감소(자사주) 🟢, 3%+ 증가(희석) 🔴, 그 사이 🟡 */
function getSharesJudgment(sharesYoY: number | null): EpsGapJudgment | null {
  if (sharesYoY == null) return null;
  if (sharesYoY <= -0.01) return 'green'; // 1% 이상 감소
  if (sharesYoY >= 0.03) return 'red'; // 3% 이상 증가
  return 'yellow';
}

export function getEpsVsRevenueGrowthJudgment(
  m: EpsVsRevenueGrowthMetrics,
): EpsVsRevenueGrowthJudgment {
  return {
    revenueYoY: getRevenueYoYJudgment(m.recentRevenueYoY),
    epsYoY: getEpsYoYJudgment(m.recentEpsYoY),
    gap: getGapJudgment(m.recentGap),
    shares: getSharesJudgment(m.recentSharesYoY),
  };
}

/** 원인 분해: 마진 개선 / 자사주 / 일회성 등 */
export function getEpsGapCause(
  m: EpsVsRevenueGrowthMetrics,
): {
  netMarginChange: number | null;
  sharesYoY: number | null;
  likelyMargin: boolean;
  likelyBuyback: boolean;
  likelyOneTime: boolean;
} {
  const latest = m.yoyByYear.at(-1);
  const latestByYear = m.byYear.at(-1);
  const prevByYear = m.byYear.length >= 2 ? m.byYear[m.byYear.length - 2] : null;
  const netMarginChange = latest?.netMarginChange ?? null;
  const sharesYoY = latest?.sharesYoY ?? null;
  const likelyMargin = netMarginChange != null && netMarginChange > 0;
  const likelyBuyback = sharesYoY != null && sharesYoY < 0;
  const likelyOneTime =
    latestByYear != null &&
    prevByYear != null &&
    latestByYear.operatingIncome > 0 &&
    latestByYear.netIncome > latestByYear.operatingIncome * 1.2;
  return {
    netMarginChange,
    sharesYoY,
    likelyMargin,
    likelyBuyback,
    likelyOneTime,
  };
}

/** 인사이트 문구 */
export function getEpsVsRevenueGrowthInsights(
  m: EpsVsRevenueGrowthMetrics,
  j: EpsVsRevenueGrowthJudgment,
): string[] {
  const lines: string[] = [];
  const cause = getEpsGapCause(m);
  const latest = m.yoyByYear.at(-1);
  const revYoYPct =
    m.recentRevenueYoY != null ? (m.recentRevenueYoY * 100).toFixed(1) : null;
  const epsYoYPct =
    m.recentEpsYoY != null ? (m.recentEpsYoY * 100).toFixed(1) : null;
  const gapPct = m.recentGap != null ? m.recentGap.toFixed(1) : null;

  if (
    m.recentRevenueYoY != null &&
    m.recentEpsYoY != null &&
    m.recentEpsYoY > m.recentRevenueYoY &&
    cause.likelyMargin
  ) {
    lines.push(
      '마진 개선으로 EPS가 매출보다 빠르게 성장하고 있습니다. 수익성 개선이 반영된 건강한 성장 패턴입니다.',
    );
  }

  if (
    m.recentEpsYoY != null &&
    m.recentEpsYoY > (m.recentRevenueYoY ?? 0) &&
    cause.likelyBuyback &&
    !cause.likelyMargin
  ) {
    lines.push(
      'EPS 상승의 상당 부분이 자사주 매입 효과입니다. 사업 자체 성장은 매출 YoY 수준이라고 보는 것이 좋습니다.',
    );
  }

  if (
    m.recentEpsYoY != null &&
    m.recentEpsYoY > (m.recentRevenueYoY ?? 0) &&
    cause.likelyOneTime
  ) {
    lines.push(
      '영업외 이익(세금 환급, 자산 매각 등)이 순이익을 부풀렸을 가능성이 있습니다. EPS 지속 가능성은 별도 확인이 필요합니다.',
    );
  }

  if (
    m.recentEpsYoY != null &&
    m.recentRevenueYoY != null &&
    m.recentEpsYoY < m.recentRevenueYoY &&
    cause.sharesYoY != null &&
    cause.sharesYoY > 0.03
  ) {
    lines.push(
      '주식 수가 늘어나면서 EPS가 희석되고 있습니다. 매출은 성장해도 주주 몫이 줄어드는 구조이므로 희석 속도를 확인하는 것이 좋습니다.',
    );
  }

  if (
    m.recentEpsYoY != null &&
    m.recentRevenueYoY != null &&
    m.recentEpsYoY < m.recentRevenueYoY &&
    cause.netMarginChange != null &&
    cause.netMarginChange < 0
  ) {
    lines.push(
      '순이익률이 하락하면서 매출은 늘었는데 EPS 성장이 뒤처지고 있습니다. 비용 증가 등 수익성 악화를 점검하는 것이 좋습니다.',
    );
  }

  if (
    m.recentRevenueYoY != null &&
    m.recentRevenueYoY > 0 &&
    m.recentEpsYoY != null &&
    m.recentEpsYoY < 0
  ) {
    lines.push(
      '매출은 성장했는데 EPS는 역성장입니다. 비용 구조 문제나 주식 희석이 동시에 있을 수 있으므로 원인 파악이 필요합니다.',
    );
  }

  if (lines.length === 0 && revYoYPct && epsYoYPct && gapPct) {
    lines.push(
      `최근 연도 매출 YoY ${revYoYPct}%, EPS YoY ${epsYoYPct}%, 괴리 ${Number(gapPct) >= 0 ? '+' : ''}${gapPct}%p입니다.`,
    );
  }

  return lines;
}

export function getEpsVsRevenueOverallJudgment(
  j: EpsVsRevenueGrowthJudgment,
): EpsGapJudgment {
  if (j.epsYoY === 'red') return 'red';
  if (j.shares === 'red') return 'red';
  if (j.gap === 'green' && j.epsYoY === 'green') return 'green';
  return 'yellow';
}
