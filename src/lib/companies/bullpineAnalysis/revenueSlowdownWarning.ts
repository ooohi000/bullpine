import type { EpsVsRevenueGrowthMetrics } from './epsVsRevenueGrowth';
import { getEpsGapCause } from './epsVsRevenueGrowth';
import type { OperatingIncomeGrowthMetrics } from './operatingIncomeGrowth';
import type { RevenueGrowthMetrics } from './revenueGrowth';
import type { RevenueQoqMetrics } from './revenueQoq';

export type SlowdownLevel = 'green' | 'yellow' | 'orange' | 'red';

export interface SlowdownSignal {
  id: string;
  label: string;
  level: 1 | 2 | 3;
  points: number;
  detected: boolean;
}

export interface RevenueSlowdownWarningInput {
  revenueGrowth: RevenueGrowthMetrics;
  operatingIncome: OperatingIncomeGrowthMetrics;
  epsVsRevenue: EpsVsRevenueGrowthMetrics;
  revenueQoq: RevenueQoqMetrics;
}

export interface RevenueSlowdownWarningResult {
  totalPoints: number;
  maxPoints: number;
  level: SlowdownLevel;
  levelLabel: string;
  signals: SlowdownSignal[];
  detectedCount: number;
  insights: string[];
}

const SIGNALS: Omit<SlowdownSignal, 'detected'>[] = [
  { id: 'qoq_yoy_2', label: '분기 YoY 2분기 연속 하락', level: 1, points: 1 },
  { id: 'qoq_yoy_3', label: '분기 YoY 3분기 연속 하락', level: 2, points: 1 },
  { id: 'annual_yoy_drop', label: '연간 YoY 전년 대비 3%p 이상 하락', level: 1, points: 1 },
  { id: 'cagr_gap', label: '3년 CAGR < 5년 CAGR (괴리 3%p 이상)', level: 2, points: 1 },
  { id: 'op_under_rev', label: '영업이익 성장 < 매출 성장', level: 2, points: 1 },
  { id: 'eps_buyback_only', label: 'EPS 성장 = 자사주 매입만', level: 2, points: 1 },
  { id: 'qoq_yoy_neg', label: '분기 YoY 역성장', level: 3, points: 3 },
  { id: 'annual_yoy_neg', label: '연간 YoY 역성장', level: 3, points: 3 },
  { id: 'qoq_vs_avg', label: 'QoQ가 과거 4분기 평균 대비 절반 이하', level: 1, points: 1 },
  { id: 'cagr_low', label: '3년 CAGR < 2% (사실상 정체)', level: 3, points: 1 },
  { id: 'op_rev_neg_both', label: '영업이익 역성장 동시 발생', level: 3, points: 1 },
];

const MAX_POINTS = 15; // YoY 역성장 2개×3점(6) + 나머지 9개×1점(9)

function getSignals(input: RevenueSlowdownWarningInput): SlowdownSignal[] {
  const { revenueGrowth, operatingIncome, epsVsRevenue, revenueQoq } = input;
  const cause = getEpsGapCause(epsVsRevenue);

  const annualYoYDrop3pp =
    revenueGrowth.yoyByYear.length >= 2
      ? (revenueGrowth.yoyByYear[revenueGrowth.yoyByYear.length - 1]!.yoy -
          revenueGrowth.yoyByYear[revenueGrowth.yoyByYear.length - 2]!.yoy) *
          100 <= -3
      : false;

  const cagrGap3pp =
    revenueGrowth.cagr3 != null &&
    revenueGrowth.cagr5 != null &&
    (revenueGrowth.cagr5 - revenueGrowth.cagr3) * 100 >= 3;

  const opUnderRev =
    operatingIncome.recentLeverageEffect != null &&
    operatingIncome.recentLeverageEffect < 0;

  const epsBuybackOnly = cause.likelyBuyback && !cause.likelyMargin;

  const qoqYoy2 = revenueQoq.consecutiveDeceleration >= 2;
  const qoqYoy3 = revenueQoq.consecutiveDeceleration >= 3;
  const qoqYoyNeg =
    revenueQoq.recentYoyQuarterly != null &&
    revenueQoq.recentYoyQuarterly < 0;
  const annualYoyNeg =
    revenueGrowth.recentYoY != null && revenueGrowth.recentYoY < 0;

  let qoqVsAvgHalf = false;
  if (revenueQoq.metrics.length >= 5 && revenueQoq.recentQoq != null) {
    const last4 = revenueQoq.metrics.slice(-5, -1);
    const avgQoq =
      last4.reduce((s, m) => s + m.qoq, 0) / last4.length;
    if (avgQoq > 0) {
      qoqVsAvgHalf = revenueQoq.recentQoq < avgQoq * 0.5;
    } else {
      qoqVsAvgHalf = revenueQoq.recentQoq < avgQoq;
    }
  }

  const cagrLow =
    revenueGrowth.cagr3 != null && revenueGrowth.cagr3 < 0.02;
  const opRevNegBoth =
    (revenueGrowth.recentYoY != null && revenueGrowth.recentYoY < 0) &&
    (operatingIncome.recentOperatingIncomeYoY != null &&
      operatingIncome.recentOperatingIncomeYoY < 0);

  return SIGNALS.map((s) => {
    let detected = false;
    switch (s.id) {
      case 'qoq_yoy_2':
        detected = qoqYoy2 && !qoqYoy3;
        break;
      case 'qoq_yoy_3':
        detected = qoqYoy3;
        break;
      case 'annual_yoy_drop':
        detected = annualYoYDrop3pp;
        break;
      case 'cagr_gap':
        detected = cagrGap3pp;
        break;
      case 'op_under_rev':
        detected = opUnderRev;
        break;
      case 'eps_buyback_only':
        detected = epsBuybackOnly;
        break;
      case 'qoq_yoy_neg':
        detected = qoqYoyNeg;
        break;
      case 'annual_yoy_neg':
        detected = annualYoyNeg;
        break;
      case 'qoq_vs_avg':
        detected = qoqVsAvgHalf;
        break;
      case 'cagr_low':
        detected = cagrLow;
        break;
      case 'op_rev_neg_both':
        detected = opRevNegBoth;
        break;
      default:
        break;
    }
    return { ...s, detected };
  });
}

function getLevel(totalPoints: number): SlowdownLevel {
  if (totalPoints <= 1) return 'green';
  if (totalPoints <= 3) return 'yellow';
  if (totalPoints <= 6) return 'orange';
  return 'red';
}

function getLevelLabel(level: SlowdownLevel): string {
  switch (level) {
    case 'green':
      return '정상';
    case 'yellow':
      return 'Level 1 주의';
    case 'orange':
      return 'Level 2 경고';
    case 'red':
      return 'Level 3 강한 경고';
    default:
      return '';
  }
}

export function computeRevenueSlowdownWarning(
  input: RevenueSlowdownWarningInput,
): RevenueSlowdownWarningResult {
  const signals = getSignals(input);
  const totalPoints = signals
    .filter((s) => s.detected)
    .reduce((sum, s) => sum + s.points, 0);
  const level = getLevel(totalPoints);
  const detectedCount = signals.filter((s) => s.detected).length;

  const insights: string[] = [];

  if (totalPoints === 0) {
    insights.push(
      '현재 매출 성장 둔화 신호가 감지되지 않았습니다. 모멘텀 유지 중으로 보입니다.',
    );
  }

  if (totalPoints >= 1 && totalPoints <= 3) {
    const hasQoq2 = signals.find((s) => s.id === 'qoq_yoy_2')?.detected;
    if (hasQoq2) {
      insights.push(
        '분기 성장 둔화 초기 신호가 감지되었습니다. 다음 1~2분기 추이가 추세 확인의 핵심 구간입니다.',
      );
    }
  }

  if (totalPoints >= 4 && totalPoints <= 6) {
    const hasAnnual = signals.find((s) => s.id === 'annual_yoy_drop')?.detected;
    const hasQoq = signals.some(
      (s) => (s.id === 'qoq_yoy_2' || s.id === 'qoq_yoy_3') && s.detected,
    );
    if (hasAnnual && hasQoq) {
      insights.push(
        '연간·분기 지표가 동시에 둔화하고 있습니다. 구조적 성장 한계 가능성이 있어 밸류에이션 재점검을 권합니다.',
      );
    }
  }

  if (totalPoints >= 7) {
    insights.push(
      '복합 둔화 신호가 다수 감지되었습니다. 매출 역성장 리스크가 높아지고 있으므로 투자 비중 축소 검토를 권합니다.',
    );
  }

  const opNeg =
    input.operatingIncome.recentOperatingIncomeYoY != null &&
    input.operatingIncome.recentOperatingIncomeYoY < 0;
  const revNeg =
    input.revenueGrowth.recentYoY != null &&
    input.revenueGrowth.recentYoY < 0;
  if (opNeg && revNeg) {
    insights.push(
      '매출과 영업이익이 동시에 역성장 중입니다. 비용 구조 점검과 함께 사업 모델 지속 가능성을 재검토하는 것이 좋습니다.',
    );
  }

  const cagrGap =
    input.revenueGrowth.cagr3 != null &&
    input.revenueGrowth.cagr5 != null
      ? (input.revenueGrowth.cagr5 - input.revenueGrowth.cagr3) * 100
      : null;
  if (cagrGap != null && cagrGap >= 3) {
    insights.push(
      `3년 CAGR이 5년 CAGR보다 ${cagrGap.toFixed(1)}%p 낮습니다. 최근 성장이 과거보다 구조적으로 느려지는 구간으로 해석할 수 있습니다.`,
    );
  }

  if (level === 'yellow' && detectedCount > 0) {
    insights.push(
      '경고 해제를 위해서는 분기 YoY 2분기 연속 반등, 연간 YoY 전년 수준 회복, 또는 3년·5년 CAGR 괴리 2%p 이내 수준 회복이 필요합니다.',
    );
  }

  return {
    totalPoints,
    maxPoints: MAX_POINTS,
    level,
    levelLabel: getLevelLabel(level),
    signals,
    detectedCount,
    insights: insights.length > 0 ? insights : ['둔화 신호를 종합한 결과 위 등급으로 판정되었습니다.'],
  };
}

/** 성장률 요약 (한눈에 보기용) */
export function getGrowthSummaryForSlowdown(input: RevenueSlowdownWarningInput): {
  annualYoY: number | null;
  recentQuarterYoy: number | null;
  cagr3: number | null;
  cagr5: number | null;
  cagrGapPct: number | null;
  quarterYoyDirection: '상승' | '하락' | null;
} {
  const rg = input.revenueGrowth;
  const rq = input.revenueQoq;
  const cagrGapPct =
    rg.cagr3 != null && rg.cagr5 != null
      ? (rg.cagr5 - rg.cagr3) * 100
      : null;
  const quarterYoyDirection =
    rq.recentMomentumSignal === '가속'
      ? '상승'
      : rq.recentMomentumSignal === '감속'
        ? '하락'
        : null;
  return {
    annualYoY: rg.recentYoY,
    recentQuarterYoy: rq.recentYoyQuarterly,
    cagr3: rg.cagr3,
    cagr5: rg.cagr5,
    cagrGapPct,
    quarterYoyDirection,
  };
}
