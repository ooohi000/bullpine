import {
  type QuarterMetricsRow,
  type QuarterRow,
  computeQuarterlyMetrics,
  getQuarterlyRowsFromIncome,
} from '@/lib/companies/bullpineAnalysis/revenueQoq';
import type { IncomeItem } from '@/types/statements';

/** 업종 그룹: A=고경기민감, B=중경기민감, C=저경기민감(방어주) */
export type SectorGroup = 'A' | 'B' | 'C';

/** 그룹별 업종 평균 변동성 벤치마크 (실제 동종 평균 없을 때 사용, %). A는 통상 30~50%이므로 기준값 30% 사용 */
export const GROUP_VOLATILITY_BENCHMARK: Record<SectorGroup, number> = {
  A: 30,
  B: 15,
  C: 5,
};

/** 벤치마크 설명 (UI에서 범위 표시용). 고경기민감은 30~50%가 정상 범위 */
export const GROUP_BENCHMARK_NOTE: Record<SectorGroup, string> = {
  A: '고경기민감 업종은 통상 30~50% 변동이 정상 범위로 알려져 있어, 비교 기준값 30%로 산출합니다.',
  B: '중경기민감 업종은 통상 10~20% 변동이 일반적이라 기준값 15%로 비교합니다.',
  C: '저경기민감(방어주) 업종은 5% 내외 변동이 일반적이라 기준값 5%로 비교합니다.',
};

/** 그룹 표시명 (UI에서 "그룹 A/B" 대신 사용) */
export const GROUP_LABEL: Record<SectorGroup, string> = {
  A: '고경기민감',
  B: '중경기민감',
  C: '저경기민감(방어주)',
};

/** 업종 유형별 설명: 포함 섹터와 특징 (이해하기·설명용, "그룹 A/B" 표현 없음) */
export const GROUP_DESCRIPTION: Record<
  SectorGroup,
  { name: string; sectors: string; characteristics: string }
> = {
  A: {
    name: '고경기민감 업종',
    sectors:
      '반도체·반도체장비(Semiconductors), 철강·금속·채굴(Steel, Metals & Mining), 에너지(Oil & Gas), 화학(Chemicals), 해운(Marine Shipping), 항공(Airlines), 건설·건자재(Construction, Building Materials) 등',
    characteristics:
      '경기 사이클에 따라 매출이 ±30~50% 수준으로 오르내리는 것이 흔합니다. 저점 → 고점 → 저점의 사이클이 뚜렷해, 지금이 사이클의 어디쯤인지(저점 근처인지, 고점 근처인지)를 아는 것이 투자 판단에 중요합니다.',
  },
  B: {
    name: '중경기민감 업종',
    sectors:
      '자동차(Automotive), 산업재(Industrials), 금융(Financial Services), 소재(Basic Materials), 부동산(Real Estate), 리테일·선택소비재(Consumer Cyclical, Retail) 등',
    characteristics:
      '경기에 영향을 받지만 고경기민감 업종보다는 완만합니다. 매출이 연간 ±10~20% 정도 변동하는 것은 정상 범위로 볼 수 있으며, 변동성이 이보다 크면 경기 연동이 강한 편으로 해석합니다.',
  },
  C: {
    name: '저경기민감 업종 (방어주)',
    sectors:
      '필수소비재(Consumer Defensive/Staples), 헬스케어(Healthcare), 유틸리티(Utilities), 통신(Communication Services), SaaS·구독형 소프트웨어(Software—Application 등) 등',
    characteristics:
      '경기와 관계없이 매출이 비교적 안정적입니다. 이런 업종에서 변동성이 커지면(예: YoY 표준편차 10% 이상) “방어주로 분류됐지만 실제로는 경기에 민감할 수 있다”는 신호로 보고, 업종 분류나 리스크를 다시 확인하는 것이 좋습니다.',
  },
};

/** FMP sector/industry 문자열로 그룹 분류 (FMP: Technology, Consumer Defensive, Healthcare 등) */
export function getSectorGroup(sector: string, industry: string): SectorGroup {
  const s = (sector ?? '').toLowerCase();
  const i = (industry ?? '').toLowerCase();
  const combined = `${s} ${i}`;

  // 고경기민감(A): 반도체, 철강/금속/채굴, 에너지, 화학, 해운, 항공, 건설/건자재
  if (
    /semiconductor|steel|metal|mining|oil|gas|chemical|shipping|airline|construction|building material/i.test(
      combined,
    )
  ) {
    return 'A';
  }
  // 저경기민감(C): 필수소비재(Consumer Defensive/Staples), 헬스케어, 유틸리티, 통신, SaaS·구독
  if (
    /consumer defensive|consumer staple|staples|defensive|healthcare|health care|utility|utilities|telecom|saas|software.*subscription|subscription|communication services/i.test(
      combined,
    )
  ) {
    return 'C';
  }
  // 중경기민감(B): 자동차, 산업재, 금융, 소재, 부동산, 리테일, 소비재(cyclical)
  if (
    /automotive|auto|industrial|financial|material|real estate|retail|consumer cyclical/i.test(
      combined,
    )
  ) {
    return 'B';
  }
  // Technology 섹터: 산업이 반도체·장비면 A, 그 외 소프트웨어 등은 B
  if (/technology|tech/i.test(s)) {
    if (/semiconductor|equipment|chip/i.test(combined)) return 'A';
    return 'B';
  }
  return 'B'; // 기본값
}

function stdDevPct(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance) * 100;
}

export interface CyclicalVolatilityMetrics {
  sectorGroup: SectorGroup;
  sector: string;
  industry: string;
  /** 분기 YoY 성장률 5년치 표준편차 (%) */
  revenueVolatilityPct: number;
  /** 업종 그룹 벤치마크 변동성 (%) */
  groupBenchmarkPct: number;
  /** 변동성 비율 = 기업 변동성 / 그룹 평균. 1.0 미만 안정, 1.5 이상 과다 */
  volatilityRatio: number;
  /** 최근 4분기 매출 평균 / 5년 분기 매출 최고점 (0~1). 90%+ 고점, 50~90% 중간, 50% 미만 저점 */
  cyclePositionPct: number;
  /** (현재 매출 - 저점) / (고점 - 저점). 0=저점, 100=고점 회복 */
  recoveryRatePct: number;
  /** 5년 분기 매출 최고점 */
  peakRevenue: number;
  /** 5년 분기 매출 최저점 */
  troughRevenue: number;
  /** 최근 4분기 매출 평균 */
  currentRevenueAvg: number;
  /** Peak-to-Trough 최대 낙폭 (%) */
  peakToTroughPct: number;
  /** 분기별 데이터 (차트·YoY 표시용) */
  quarters: QuarterRow[];
  metrics: QuarterMetricsRow[];
  /** 최근 4분기 라벨 (현재 매출 대표) */
  recentLabel: string | null;
  /** 계산 근거: 매출 변동성 (연도·분기별 YoY → 표준편차) */
  calculationDetailVolatility: string;
  /** 계산 근거: 변동성 비율 (기업 변동성 ÷ 업종 벤치마크) */
  calculationDetailVolatilityRatio: string;
  /** 계산 근거: 사이클 위치 (최근 4분기 평균 ÷ 5년 최고) */
  calculationDetailCyclePosition: string;
  /** 계산 근거: 낙폭 회복률 (현재−저점)/(고점−저점) */
  calculationDetailRecoveryRate: string;
  /** 계산 근거: 최대 낙폭 (Peak-to-Trough) */
  calculationDetailPeakToTrough: string;
  /** 사이클 위치 판단 이유 (고경기민감일 때: 저점/중간/고점 근거) */
  cyclePositionReason: string;
}

/**
 * 분기 손익 데이터 + sector/industry로 경기민감 매출 변동성 지표 계산
 */
export function computeCyclicalVolatilityMetrics(
  incomeItems: IncomeItem[],
  sector: string,
  industry: string,
): CyclicalVolatilityMetrics | null {
  const quarters = getQuarterlyRowsFromIncome(incomeItems);
  const metrics = computeQuarterlyMetrics(quarters);
  if (metrics.length < 2) return null;

  const sectorGroup = getSectorGroup(sector, industry);
  const groupBenchmarkPct = GROUP_VOLATILITY_BENCHMARK[sectorGroup];

  // 분기 YoY 5년치 = 최대 20개 분기. 표준편차 계산
  const yoySeries = metrics.map((m) => m.yoyQuarterly);
  const last20 = yoySeries.slice(-20);
  const revenueVolatilityPct = last20.length >= 2 ? stdDevPct(last20) : 0;
  const volatilityRatio =
    groupBenchmarkPct > 0 ? revenueVolatilityPct / groupBenchmarkPct : 0;

  // 5년 분기 매출: quarters 전체 사용 (이미 정렬됨)
  const revenues = quarters.map((q) => q.revenue).filter((r) => r > 0);
  if (revenues.length === 0) return null;
  const peakRevenue = Math.max(...revenues);
  const troughRevenue = Math.min(...revenues);
  const last4Quarters = quarters.slice(-4);
  const currentRevenueAvg =
    last4Quarters.length > 0
      ? last4Quarters.reduce((s, q) => s + q.revenue, 0) / last4Quarters.length
      : quarters[quarters.length - 1]!.revenue;
  const cyclePositionPct =
    peakRevenue > 0 ? (currentRevenueAvg / peakRevenue) * 100 : 0;
  const recoveryRatePct =
    peakRevenue > troughRevenue
      ? ((currentRevenueAvg - troughRevenue) / (peakRevenue - troughRevenue)) * 100
      : 0;
  const peakToTroughPct =
    peakRevenue > 0 ? ((troughRevenue - peakRevenue) / peakRevenue) * 100 : 0;

  const recentLabel =
    last4Quarters.length > 0
      ? last4Quarters[last4Quarters.length - 1]!.label
      : null;

  // 계산 근거 문구 (이해하기 쉽게)
  const last20Metrics = metrics.slice(-20);
  const yoySampleStr =
    last20Metrics.length >= 2
      ? last20Metrics
          .slice(-10)
          .map(
            (m) =>
              `${m.label} ${(m.yoyQuarterly * 100 >= 0 ? '+' : '')}${(m.yoyQuarterly * 100).toFixed(1)}%`,
          )
          .join(', ')
      : '';
  const calculationDetailVolatility =
    yoySampleStr
      ? `최근 5년 분기별 매출 YoY(전년 동기 대비 성장률): ${yoySampleStr} … → 이 값들의 표준편차 = ${revenueVolatilityPct.toFixed(1)}%. (참고: 이 값은 분기 단위입니다. 성장 지속 가능성 점수에서 쓰는 연간 매출 YoY 표준편차(연도별 5개 값)와는 계산 단위가 달라 수치가 다르게 나옵니다. 분기 기준이 보통 더 크게 나옵니다.)`
      : '분기 YoY 데이터가 부족해 표준편차를 산출하지 못했습니다.';

  const calculationDetailVolatilityRatio =
    sectorGroup === 'A'
      ? `해당 기업 매출 변동성 ${revenueVolatilityPct.toFixed(1)}% ÷ 고경기민감 업종 기준값 ${groupBenchmarkPct.toFixed(0)}% (동 업종 통상 30~50% 중 기준) = ${volatilityRatio.toFixed(2)}배. 1배 미만이면 동종 대비 안정적, 1.5배 이상이면 동종 대비 변동성이 큰 편입니다.`
      : `해당 기업 매출 변동성 ${revenueVolatilityPct.toFixed(1)}% ÷ ${GROUP_LABEL[sectorGroup]} 업종 벤치마크 ${groupBenchmarkPct.toFixed(0)}% = ${volatilityRatio.toFixed(2)}배. 1배 미만이면 동종 업종 평균보다 안정적, 1.5배 이상이면 동종 대비 변동성이 큰 편입니다.`;

  const formatRev = (v: number) =>
    v >= 1e9 ? `${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v.toLocaleString();
  const calculationDetailCyclePosition =
    `왜 이렇게 계산하나요? — 우리가 알고 싶은 것은 “지금 매출이 과거 5년 중 최고점에 비해 어디쯤인가”입니다. 그래서 “현재 수준”(단일 분기 노이즈를 줄이기 위해 최근 4분기 평균)을 “5년 중 최고 분기 매출”로 나누면 0~100% 스케일이 됩니다. 100%에 가까우면 “과거 5년 기준” 고점 근처, 0%에 가까우면 저점 근처입니다. (참고: 5년은 과거 데이터이므로, 고점 근처라고 해서 반드시 매출이 줄어든다는 뜻은 아닙니다. 더 우상향할 수도 있습니다. 다만 고경기민감 업종에서는 과거에 고점 부근 이후 조정이 온 경우가 많아 참고하시라는 의미입니다.) 계산: 최근 4분기 매출 평균 ${formatRev(currentRevenueAvg)} ÷ 5년 분기 최고치 ${formatRev(peakRevenue)} = ${cyclePositionPct.toFixed(1)}%.`;
  const calculationDetailRecoveryRate =
    peakRevenue > troughRevenue
      ? `(현재 4분기 평균 ${formatRev(currentRevenueAvg)} − 5년 최저 ${formatRev(troughRevenue)}) ÷ (5년 최고 ${formatRev(peakRevenue)} − 5년 최저 ${formatRev(troughRevenue)}) = ${recoveryRatePct.toFixed(0)}%. 0%면 아직 저점, 100%면 고점까지 완전 회복된 상태입니다.`
      : '고점·저점이 같아 회복률을 계산할 수 없습니다.';

  const calculationDetailPeakToTrough =
    `5년 동안의 분기 매출 중 최고치(피크)와 최저치(트로우)를 찾은 뒤, (최저 − 최고) ÷ 최고 × 100으로 계산합니다. 즉 (${formatRev(troughRevenue)} − ${formatRev(peakRevenue)}) ÷ ${formatRev(peakRevenue)} × 100 = ${peakToTroughPct.toFixed(1)}%. 과거 5년 중 “매출이 가장 컸던 시점에서 가장 작았던 시점까지 얼마나 떨어졌었는지”를 보는 지표이며, 같은 업종 내에서 상대적으로 낙폭이 컸던 기업인지 참고할 수 있습니다.`;

  let cyclePositionReason: string;
  if (sectorGroup === 'A') {
    if (cyclePositionPct < 50) {
      if (recoveryRatePct < 30) {
        cyclePositionReason = `사이클 위치 ${cyclePositionPct.toFixed(0)}%(50% 미만)이고 낙폭 회복률 ${recoveryRatePct.toFixed(0)}%(30% 미만)이므로, 고경기민감 업종 기준으로 “사이클 저점 초입”으로 판단했습니다. 반등 초기 구간으로 볼 수 있습니다.`;
      } else if (recoveryRatePct < 60) {
        cyclePositionReason = `사이클 위치 ${cyclePositionPct.toFixed(0)}%(50% 미만)이고 낙폭 회복률 ${recoveryRatePct.toFixed(0)}%(30~60%)이므로, “사이클 저점을 지나 회복 중”으로 판단했습니다.`;
      } else {
        cyclePositionReason = `사이클 위치 ${cyclePositionPct.toFixed(0)}%(50% 미만)이므로 고경기민감 업종 기준 “저점 근처”로 판단했습니다.`;
      }
    } else if (cyclePositionPct >= 90) {
      cyclePositionReason = `사이클 위치 ${cyclePositionPct.toFixed(0)}%(90% 이상)이므로, 고경기민감 업종 기준 “사이클 고점 근접”으로 판단했습니다. 매출이 정점에 가깝다는 뜻이라 피크아웃 리스크를 고려해야 합니다.`;
    } else {
      cyclePositionReason = `사이클 위치 ${cyclePositionPct.toFixed(0)}%(50~90%)이므로 “사이클 중간 구간”으로 판단했습니다. 고점에 가까워질수록 변동성·피크아웃에 주의하는 것이 좋습니다.`;
    }
  } else {
    cyclePositionReason =
      '중경기민감·저경기민감 업종은 사이클 위치보다 “매출 변동성(표준편차)”을 중심으로 판단합니다. 위 사이클 위치 수치는 참고용입니다.';
  }

  return {
    sectorGroup,
    sector,
    industry,
    revenueVolatilityPct,
    groupBenchmarkPct,
    volatilityRatio,
    cyclePositionPct,
    recoveryRatePct,
    peakRevenue,
    troughRevenue,
    currentRevenueAvg,
    peakToTroughPct,
    quarters,
    metrics,
    recentLabel,
    calculationDetailVolatility,
    calculationDetailVolatilityRatio,
    calculationDetailCyclePosition,
    calculationDetailRecoveryRate,
    calculationDetailPeakToTrough,
    cyclePositionReason,
  };
}

export type CyclicalJudgment = 'green' | 'yellow' | 'red';

export interface CyclicalVolatilityResult {
  metrics: CyclicalVolatilityMetrics;
  /** 사이클 위치 판정 */
  cyclePositionJudgment: CyclicalJudgment;
  /** 변동성 비율 판정 */
  volatilityRatioJudgment: CyclicalJudgment;
  /** 종합 판정 (그룹별 기준 적용) */
  overallJudgment: CyclicalJudgment;
  insights: string[];
  verdict: string;
}

function getCyclePositionJudgment(
  group: SectorGroup,
  cyclePositionPct: number,
): CyclicalJudgment {
  if (group === 'A') {
    if (cyclePositionPct < 50) return 'green';
    if (cyclePositionPct >= 90) return 'red';
    return 'yellow';
  }
  if (group === 'B' || group === 'C') {
    return 'yellow'; // B/C는 사이클 위치만으로는 단순 판정 안 함
  }
  return 'yellow';
}

function getVolatilityRatioJudgment(ratio: number): CyclicalJudgment {
  if (ratio < 1.0) return 'green';
  if (ratio <= 1.5) return 'yellow';
  return 'red';
}

const GROUP_NAME: Record<SectorGroup, string> = {
  A: '고경기민감 업종',
  B: '중경기민감 업종',
  C: '저경기민감(방어주) 업종',
};

/** 그룹별 종합 판정 (설계 명세 5, 6절 기준). "그룹 A/B/C" 대신 고경기민감/중경기민감/저경기민감 업종으로만 표현 */
function getOverallJudgment(
  group: SectorGroup,
  m: CyclicalVolatilityMetrics,
  cycleJudgment: CyclicalJudgment,
  volRatioJudgment: CyclicalJudgment,
): { overall: CyclicalJudgment; insights: string[]; verdict: string } {
  const insights: string[] = [];
  let overall: CyclicalJudgment = 'yellow';
  const groupName = GROUP_NAME[group];

  if (group === 'A') {
    if (m.cyclePositionPct < 50 && m.recoveryRatePct < 30) {
      insights.push(
        `고경기민감 업종 기준, 현재 “사이클 저점 초입”으로 보입니다. 사이클 위치 ${m.cyclePositionPct.toFixed(0)}%, 낙폭 회복률 ${m.recoveryRatePct.toFixed(0)}%로 반등 초기 구간에 해당할 수 있어, 분할 매수 검토가 가능한 대신 저점이 완전히 확인되기 전까지는 비중을 전체의 50% 이내로 두는 것을 권합니다.`,
      );
      overall = 'green';
    } else if (m.cyclePositionPct < 50 && m.recoveryRatePct >= 30 && m.recoveryRatePct < 60) {
      insights.push(
        `고경기민감 업종 기준, “사이클 저점을 지나 회복 중”으로 판단됩니다. 낙폭 회복률 ${m.recoveryRatePct.toFixed(0)}%로 저점 통과 후 반등 구간에 있으므로, 분기 실적에서 모멘텀이 가속되면 비중 확대를 검토할 수 있습니다.`,
      );
      overall = 'green';
    } else if (m.cyclePositionPct >= 90) {
      insights.push(
        `고경기민감 업종 기준, “사이클 고점 근접”으로 보입니다. 사이클 위치 ${m.cyclePositionPct.toFixed(0)}%로 매출이 정점에 가까울 수 있어 피크아웃 리스크가 큽니다. 신규 진입은 자제하고, 이미 보유 중이라면 비중을 줄이는 것을 검토하는 것이 좋습니다.`,
      );
      overall = 'red';
    } else if (m.cyclePositionPct >= 50 && m.cyclePositionPct < 90) {
      insights.push(
        `고경기민감 업종 기준, “사이클 중간 구간”입니다. 사이클 위치 ${m.cyclePositionPct.toFixed(0)}%로, 고점(100%)에 가까워질수록 매출이 정점을 지날 가능성이 있으므로 변동성과 피크아웃 가능성을 함께 보시는 것이 좋습니다.`,
      );
      overall = 'yellow';
    }
    if (m.volatilityRatio < 1.5) {
      insights.push(
        `변동성 비율이 ${m.volatilityRatio.toFixed(1)}배로, 고경기민감 업종 평균 수준보다 낮거나 비슷합니다. 동종 업종 대비 매출이 과도하게 들쭉날쭉하지는 않은 편이라는 뜻입니다.`,
      );
    } else if (m.volatilityRatio >= 2.0) {
      insights.push(
        `변동성 비율이 ${m.volatilityRatio.toFixed(1)}배로, 동종 업종 대비 2배 이상입니다. 사업 구조(고객·제품 집중도)나 수요 변동이 큰지 원인을 한 번 점검해 보시는 것을 권합니다.`,
      );
    }
  }

  if (group === 'B') {
    if (m.revenueVolatilityPct < 10) {
      insights.push(
        `중경기민감 업종 기준, 매출 YoY 변동성(표준편차)이 ${m.revenueVolatilityPct.toFixed(1)}%로 10% 미만입니다. 경기가 나빠질 때도 매출이 상대적으로 덜 흔들리는 편이라, 변동성 관점에서는 양호한 편으로 볼 수 있습니다.`,
      );
      overall = 'green';
    } else if (m.revenueVolatilityPct >= 20) {
      insights.push(
        `중경기민감 업종 기준, 매출 변동성이 ${m.revenueVolatilityPct.toFixed(1)}%로 20% 이상입니다. 중경기민감 업종치고는 경기에 더 크게 반응할 수 있다는 뜻이므로, 실적 추이와 경기 구간을 더 꼼꼼히 보시는 것이 좋습니다.`,
      );
      overall = 'red';
    } else {
      insights.push(
        `중경기민감 업종 기준, 매출 변동성이 ${m.revenueVolatilityPct.toFixed(1)}%(10~20% 구간)입니다. 경기와 매출이 어느 정도 연동되는 구간이므로, 경기 사이클과 분기 실적 추이를 함께 보시면 됩니다.`,
      );
      overall = 'yellow';
    }
  }

  if (group === 'C') {
    if (m.revenueVolatilityPct < 5) {
      insights.push(
        `저경기민감(방어주) 업종 기준, 매출 변동성이 ${m.revenueVolatilityPct.toFixed(1)}%로 5% 미만입니다. 경기와 관계없이 매출이 꾸준한 편이라는 뜻으로, 방어주로서의 성격이 잘 유지되고 있는 것으로 해석할 수 있습니다.`,
      );
      overall = 'green';
    } else if (m.revenueVolatilityPct >= 10) {
      insights.push(
        `저경기민감(방어주)로 분류된 업종인데, 실제 매출 변동성이 ${m.revenueVolatilityPct.toFixed(1)}%로 10% 이상입니다. “방어주”라고 보기엔 경기에 더 민감할 수 있다는 신호이므로, 업종 분류를 다시 확인하고 리스크를 재평가하는 것을 권합니다.`,
      );
      overall = 'red';
    } else {
      insights.push(
        `저경기민감(방어주) 업종 기준, 매출 변동성이 ${m.revenueVolatilityPct.toFixed(1)}%(5~10% 구간)입니다. 완전한 방어주 수준은 아니지만 위험 수준은 아니므로, 추이를 지켜보시면 됩니다.`,
      );
      overall = 'yellow';
    }
  }

  if (m.volatilityRatio >= 2.0 && group !== 'A') {
    insights.push(
      `변동성 비율이 ${m.volatilityRatio.toFixed(1)}배로 동종 대비 2배 이상입니다. 사업 모델이나 고객 집중도 등 원인을 한 번 점검해 보시는 것을 권합니다.`,
    );
    if (overall === 'green') overall = 'yellow';
  }

  insights.push(
    '고경기민감 업종은 연간 CAGR·YoY 하나만으로 보면 “좋다/나쁘다”가 왜곡될 수 있습니다. 지금이 사이클의 어디쯤인지(저점인지 고점인지)와 함께 보면 더 정확한 판단이 가능합니다.',
  );

  let verdict: string;
  if (overall === 'green') {
    if (group === 'A') {
      verdict =
        m.cyclePositionPct < 50
          ? '고경기민감 업종 기준 사이클 저점 근처로 보입니다. 분할 매수 검토 가능하나, 저점 확인 전까지는 전체 비중의 50% 이내를 권합니다.'
          : `${groupName} 내에서 변동성·사이클 위치가 상대적으로 안정적인 구간으로 보입니다. 변동성 비율과 분기 실적만 주기적으로 확인하시면 됩니다.`;
    } else {
      verdict = `${groupName} 기준으로 매출 변동성이 양호한 편입니다. 경기 구간에 따른 리스크만 유지하시면 됩니다.`;
    }
  } else if (overall === 'red') {
    verdict =
      group === 'A' && m.cyclePositionPct >= 90
        ? '고경기민감 업종 기준 사이클 고점 근접으로 보입니다. 신규 진입은 자제하고, 보유 비중 축소를 검토하세요.'
        : '변동성 또는 사이클 위치상 위험 구간으로 판단됩니다. 리스크를 재평가한 뒤 비중 조정을 권합니다.';
  } else {
    verdict = '주의 구간입니다. 사이클 위치와 분기 실적 추이를 계속 모니터링하시는 것이 좋습니다.';
  }

  return { overall, insights, verdict };
}

export function computeCyclicalVolatilityResult(
  incomeItems: IncomeItem[],
  sector: string,
  industry: string,
): CyclicalVolatilityResult | null {
  const metrics = computeCyclicalVolatilityMetrics(
    incomeItems,
    sector,
    industry,
  );
  if (!metrics) return null;

  const cyclePositionJudgment = getCyclePositionJudgment(
    metrics.sectorGroup,
    metrics.cyclePositionPct,
  );
  const volatilityRatioJudgment = getVolatilityRatioJudgment(
    metrics.volatilityRatio,
  );
  const { overall, insights, verdict } = getOverallJudgment(
    metrics.sectorGroup,
    metrics,
    cyclePositionJudgment,
    volatilityRatioJudgment,
  );

  return {
    metrics,
    cyclePositionJudgment,
    volatilityRatioJudgment,
    overallJudgment: overall,
    insights,
    verdict,
  };
}
