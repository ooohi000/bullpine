import type { IncomeItem } from '@/types/statements';

export type RevenueQoqJudgment = 'green' | 'yellow' | 'red';

/** 단일 분기 데이터 (시간순 정렬된 분기 배열용) */
export interface QuarterRow {
  date: string;
  label: string; // e.g. "Q1'22"
  fiscalYear: string;
  period: string; // Q1, Q2, Q3, Q4
  revenue: number;
  operatingIncome: number;
}

/** 분기별 QoQ, YoY(분기), 가속/감속 */
export interface QuarterMetricsRow {
  date: string;
  label: string;
  fiscalYear: string;
  period: string;
  revenue: number;
  qoq: number; // (Q / Q-1) - 1
  yoyQuarterly: number; // (Q / Q-4) - 1, 전년 동기 대비
  momentum: number; // yoyQuarterly - yoyQuarterly_prev, 양수=가속 음수=감속
  momentumSignal: '가속' | '감속' | null; // 직전 대비
}

export interface RevenueQoqMetrics {
  quarters: QuarterRow[];
  metrics: QuarterMetricsRow[]; // length = quarters.length - 4 (YoY 필요해서 앞 4개 분기 제외)
  recentQoq: number | null;
  recentYoyQuarterly: number | null;
  recentMomentum: number | null;
  recentMomentumSignal: '가속' | '감속' | null;
  consecutiveDeceleration: number; // 최근 연속 감속 분기 수 (0, 1, 2, 3, ...)
  consecutiveAcceleration: number; // 최근 연속 가속 분기 수
}

export interface RevenueQoqJudgmentResult {
  qoq: RevenueQoqJudgment | null;
  yoyQuarterly: RevenueQoqJudgment | null;
  momentum: RevenueQoqJudgment | null; // 2연속 감속 🟡, 3연속 감속 🔴
}

/**
 * 분기 라벨: FMP period(Q1~Q4) + (fiscalYear - 1) 연도.
 * date는 보고 종료일이라 1월 종료 Q4면 date=2021-01-31, fiscalYear=2021 → 실제로는 "20년도 4분기"이므로
 * 연도는 fiscalYear - 1 로 표시. 예: FY2021 Q4 → Q4'20
 */
function getQuarterLabel(periodStr: string, fiscalYearStr: string): string {
  if (!periodStr) return periodStr || '';
  const y = parseInt(fiscalYearStr, 10);
  const year = Number.isNaN(y) ? '' : String(y - 1).slice(-2);
  return `${periodStr}'${year}`;
}

/** 분기 데이터만 추출, date 기준 시간순 오름차순 (QoQ·YoY 계산에 필수). 라벨 = FMP period + (fiscalYear-1) */
export function getQuarterlyRowsFromIncome(
  items: IncomeItem[],
): QuarterRow[] {
  const quarters = items.filter(
    (i) => i.period === 'Q1' || i.period === 'Q2' || i.period === 'Q3' || i.period === 'Q4',
  );
  return quarters
    .map((i) => {
      const revenue = i.revenue ?? 0;
      const operatingIncome = i.operatingIncome ?? 0;
      const label = getQuarterLabel(i.period, i.fiscalYear ?? '');
      return {
        date: i.date,
        label,
        fiscalYear: i.fiscalYear ?? '',
        period: i.period,
        revenue,
        operatingIncome,
      };
    })
    .filter((r) => r.revenue > 0 && r.date)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** 분기별 QoQ, YoY(전년 동기), 모멘텀(가속/감속) 계산 */
export function computeQuarterlyMetrics(
  quarters: QuarterRow[],
): QuarterMetricsRow[] {
  const result: QuarterMetricsRow[] = [];
  for (let i = 4; i < quarters.length; i++) {
    const curr = quarters[i]!;
    const prevQ = quarters[i - 1]!;
    const sameQuarterLastYear = quarters[i - 4]!;
    const qoq =
      prevQ.revenue > 0 ? curr.revenue / prevQ.revenue - 1 : 0;
    const yoyQuarterly =
      sameQuarterLastYear.revenue > 0
        ? curr.revenue / sameQuarterLastYear.revenue - 1
        : 0;
    // 직전 분기 YoY = (i-1)분기 대비 (i-5)분기. i>=5일 때만 직전 YoY 존재.
    const prevYoy =
      i >= 5 && quarters[i - 5]!.revenue > 0
        ? quarters[i - 1]!.revenue / quarters[i - 5]!.revenue - 1
        : 0;
    const momentum = i >= 5 ? yoyQuarterly - prevYoy : 0;
    result.push({
      date: curr.date,
      label: curr.label,
      fiscalYear: curr.fiscalYear,
      period: curr.period,
      revenue: curr.revenue,
      qoq,
      yoyQuarterly,
      momentum,
      momentumSignal: momentum > 0 ? '가속' : momentum < 0 ? '감속' : null,
    });
  }
  return result;
}

/** 최근 연속 감속/가속 분기 수 */
function getConsecutiveCount(
  metrics: QuarterMetricsRow[],
  direction: '가속' | '감속',
): number {
  let count = 0;
  for (let i = metrics.length - 1; i >= 0; i--) {
    const sig = metrics[i]!.momentumSignal;
    if (sig === direction) count++;
    else break;
  }
  return count;
}

export function computeRevenueQoqMetrics(
  items: IncomeItem[],
): RevenueQoqMetrics {
  const quarters = getQuarterlyRowsFromIncome(items);
  const metrics = computeQuarterlyMetrics(quarters);
  const latest = metrics.at(-1);
  const recentQoq = latest?.qoq ?? null;
  const recentYoyQuarterly = latest?.yoyQuarterly ?? null;
  const recentMomentum = latest?.momentum ?? null;
  const recentMomentumSignal = latest?.momentumSignal ?? null;
  const consecutiveDeceleration = getConsecutiveCount(metrics, '감속');
  const consecutiveAcceleration = getConsecutiveCount(metrics, '가속');

  return {
    quarters,
    metrics,
    recentQoq,
    recentYoyQuarterly,
    recentMomentum,
    recentMomentumSignal,
    consecutiveDeceleration,
    consecutiveAcceleration,
  };
}

/** QoQ 판정: -10% 이하 🔴, 그 외 🟡 보통 (계절성 있으므로 단순화) */
function getQoqJudgment(qoq: number | null): RevenueQoqJudgment | null {
  if (qoq == null) return null;
  if (qoq <= -0.1) return 'red';
  return 'yellow'; // 보통
}

/** YoY 분기: 15%+ 🟢, 5~15% 🟡, 0 미만 🔴 */
function getYoyQuarterlyJudgment(
  yoy: number | null,
): RevenueQoqJudgment | null {
  if (yoy == null) return null;
  if (yoy < 0) return 'red';
  if (yoy >= 0.15) return 'green';
  return 'yellow';
}

/** 모멘텀: 3연속 감속 🔴, 2연속 감속 🟡, 2연속 가속 🟢, 그 외 🟡 */
function getMomentumJudgment(
  m: RevenueQoqMetrics,
): RevenueQoqJudgment | null {
  if (m.consecutiveDeceleration >= 3) return 'red';
  if (m.consecutiveDeceleration >= 2) return 'yellow';
  if (m.consecutiveAcceleration >= 2) return 'green';
  return 'yellow';
}

export function getRevenueQoqJudgment(
  m: RevenueQoqMetrics,
): RevenueQoqJudgmentResult {
  return {
    qoq: getQoqJudgment(m.recentQoq),
    yoyQuarterly: getYoyQuarterlyJudgment(m.recentYoyQuarterly),
    momentum: getMomentumJudgment(m),
  };
}

/** YoY 분기 성장률이 단일 분기에서 10%p 이상 급락했는지 */
function getRecentYoyDropPct(m: RevenueQoqMetrics): number | null {
  if (m.metrics.length < 2) return null;
  const latest = m.metrics[m.metrics.length - 1]!;
  const prev = m.metrics[m.metrics.length - 2]!;
  const drop = (prev.yoyQuarterly - latest.yoyQuarterly) * 100; // %p
  return drop;
}

export function getRevenueQoqInsights(
  m: RevenueQoqMetrics,
  j: RevenueQoqJudgmentResult,
): string[] {
  const lines: string[] = [];
  const yoyPct =
    m.recentYoyQuarterly != null
      ? (m.recentYoyQuarterly * 100).toFixed(1)
      : null;
  const qoqPct =
    m.recentQoq != null ? (m.recentQoq * 100).toFixed(1) : null;
  const latestLabel = m.metrics.at(-1)?.label ?? null;

  if (m.consecutiveAcceleration >= 2) {
    lines.push(
      '매출 모멘텀 가속 중입니다. 전년 동기 대비 성장률이 2분기 연속 상승해 실적 상향 가능성을 주목할 수 있습니다.',
    );
  }

  if (m.consecutiveDeceleration >= 2 && m.consecutiveDeceleration < 3) {
    lines.push(
      '성장 둔화 초기 신호입니다. YoY(분기) 성장률이 2분기 연속 하락했으며, 다음 분기 추이 확인이 필요합니다.',
    );
  }

  if (m.consecutiveDeceleration >= 3) {
    lines.push(
      '구조적 성장 둔화 가능성이 있습니다. YoY(분기) 성장률이 3분기 연속 하락했으므로 연간 CAGR 재검토를 권합니다.',
    );
  }

  if (
    m.recentYoyQuarterly != null &&
    m.recentYoyQuarterly < 0 &&
    latestLabel
  ) {
    lines.push(
      `${latestLabel} 분기 매출이 전년 동기 대비 역성장했습니다. 일시적 요인인지 확인이 필요합니다.`,
    );
  }

  const yoyDrop = getRecentYoyDropPct(m);
  if (yoyDrop != null && yoyDrop > 10) {
    lines.push(
      `급격한 성장 둔화가 한 분기에서 발생했습니다(YoY 성장률 약 ${yoyDrop.toFixed(0)}%p 하락). 일회성 충격 또는 수요 급감 여부를 점검하는 것이 좋습니다.`,
    );
  }

  if (m.recentQoq != null && m.recentQoq <= -0.1) {
    lines.push(
      '비계절적 분기 매출 급락으로 보입니다(QoQ -10% 이하). 계절성이 낮은 업종이라면 이상 신호로 경고합니다.',
    );
  }

  if (m.consecutiveDeceleration >= 3 && m.recentMomentum != null && m.recentMomentum > 0) {
    lines.push(
      '3분기 연속 감속 후 최근 분기에서 반등했습니다. 반등 지속 여부가 관건이므로 다음 분기 YoY 성장률을 확인하는 것이 좋습니다.',
    );
  }

  if (lines.length === 0 && yoyPct && qoqPct) {
    lines.push(
      `최근 분기 매출 QoQ ${Number(qoqPct) >= 0 ? '+' : ''}${qoqPct}%, YoY(분기) ${Number(yoyPct) >= 0 ? '+' : ''}${yoyPct}%입니다.`,
    );
    lines.push(
      '분기 모멘텀(가속/감속)과 연간 매출 CAGR을 함께 보시면, 성장 추세를 더 정확히 파악할 수 있습니다.',
    );
  }

  return lines;
}

export function getRevenueQoqOverallJudgment(
  j: RevenueQoqJudgmentResult,
  m: RevenueQoqMetrics,
): RevenueQoqJudgment {
  if (j.yoyQuarterly === 'red') return 'red';
  if (j.momentum === 'red') return 'red';
  if (j.momentum === 'green' && j.yoyQuarterly === 'green') return 'green';
  return 'yellow';
}
