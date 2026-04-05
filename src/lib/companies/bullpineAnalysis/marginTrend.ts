import type { IncomeItem } from '@/types/statements';

const isFyPeriod = (p: string) => p === 'FY' || p === 'annual';

export type MarginGrade = 'green' | 'yellow' | 'red';

export interface MarginByYear {
  year: string;
  revenue: number;
  grossProfit: number;
  operatingIncome: number;
  netIncome: number;
  /** Gross Profit Margin % */
  gpm: number;
  /** Operating Profit Margin % */
  opm: number;
  /** Net Profit Margin % */
  npm: number;
  /** GPM - OPM (%p). 판관비 + R&D 부담 */
  gapGpmOpm: number;
  /** OPM - NPM (%p). 이자 + 세금 부담 */
  gapOpmNpm: number;
}

export interface MarginTrendMetrics {
  byYear: MarginByYear[];
  /** 최근 연도 마진 */
  latestGpm: number | null;
  latestOpm: number | null;
  latestNpm: number | null;
  /** 3년 추세 기울기 (%p/년). (최근 - 3년전) / 3 */
  slopeGpm: number | null;
  slopeOpm: number | null;
  slopeNpm: number | null;
  /** 최근 GPM→OPM 갭, OPM→NPM 갭 */
  latestGapGpmOpm: number | null;
  latestGapOpmNpm: number | null;
}

export interface MarginJudgment {
  gpm: MarginGrade | null;
  opm: MarginGrade | null;
  npm: MarginGrade | null;
  trendGpm: MarginGrade | null;
  trendOpm: MarginGrade | null;
  trendNpm: MarginGrade | null;
}

/** 업종별 GPM 기준 (우수/경고). sector 없으면 공통 기준 사용 */
export const GPM_BENCHMARK: Record<string, { good: number; warn: number }> = {
  default: { good: 40, warn: 25 },
  'SaaS / 소프트웨어': { good: 70, warn: 50 },
  '제약 / 바이오': { good: 60, warn: 40 },
  '소비재 브랜드': { good: 40, warn: 25 },
  반도체: { good: 50, warn: 35 },
  '자동차 / 제조': { good: 20, warn: 10 },
  '유통 / 리테일': { good: 25, warn: 15 },
};

/** OPM 기준 (업종 공통): 15%+ 🟢, 5~15% 🟡, 5% 미만 또는 적자 🔴 */
export function getOpmGrade(opm: number | null): MarginGrade | null {
  if (opm == null) return null;
  if (opm >= 15) return 'green';
  if (opm >= 5) return 'yellow';
  return 'red';
}

/** NPM 기준: 10%+ 🟢, 3~10% 🟡, 3% 미만 또는 적자 🔴 */
export function getNpmGrade(npm: number | null): MarginGrade | null {
  if (npm == null) return null;
  if (npm >= 10) return 'green';
  if (npm >= 3) return 'yellow';
  return 'red';
}

/** 추세 기울기: +0.5%p 이상 🟢, ±0.5%p 🟡, -0.5%p 이하 🔴 */
export function getTrendGrade(slope: number | null): MarginGrade | null {
  if (slope == null) return null;
  if (slope >= 0.5) return 'green';
  if (slope >= -0.5) return 'yellow';
  return 'red';
}

/** GPM 등급 (업종 키로 벤치마크 선택, 없으면 default) */
export function getGpmGrade(gpm: number | null, sectorKey?: string): MarginGrade | null {
  if (gpm == null) return null;
  const bench = GPM_BENCHMARK[sectorKey ?? 'default'] ?? GPM_BENCHMARK.default;
  if (gpm >= bench.good) return 'green';
  if (gpm >= bench.warn) return 'yellow';
  return 'red';
}

/** 연간(FY) 손익에서 연도별 마진·갭 추출 */
export function getMarginByYearFromIncome(items: IncomeItem[]): MarginByYear[] {
  const fy = items
    .filter((i) => isFyPeriod(i.period ?? ''))
    .sort((a, b) => parseInt(a.fiscalYear, 10) - parseInt(b.fiscalYear, 10));

  return fy
    .filter((i) => (i.revenue ?? 0) > 0)
    .map((i) => {
      const revenue = i.revenue ?? 0;
      const grossProfit = i.grossProfit ?? 0;
      const operatingIncome = i.operatingIncome ?? 0;
      const netIncome = i.netIncome ?? 0;
      const gpm = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
      const opm = revenue > 0 ? (operatingIncome / revenue) * 100 : 0;
      const npm = revenue > 0 ? (netIncome / revenue) * 100 : 0;
      const gapGpmOpm = gpm - opm;
      const gapOpmNpm = opm - npm;
      return {
        year: i.fiscalYear,
        revenue,
        grossProfit,
        operatingIncome,
        netIncome,
        gpm,
        opm,
        npm,
        gapGpmOpm,
        gapOpmNpm,
      };
    });
}

/** 3년 추세 기울기 (%p/년): (최근 - 3년전) / 3 */
function slope3(before: number, after: number): number {
  return (after - before) / 3;
}

export function computeMarginTrendMetrics(items: IncomeItem[]): MarginTrendMetrics {
  const byYear = getMarginByYearFromIncome(items);
  if (byYear.length === 0) {
    return {
      byYear: [],
      latestGpm: null,
      latestOpm: null,
      latestNpm: null,
      slopeGpm: null,
      slopeOpm: null,
      slopeNpm: null,
      latestGapGpmOpm: null,
      latestGapOpmNpm: null,
    };
  }

  const latest = byYear[byYear.length - 1]!;
  const threeYearsAgo = byYear.length >= 4 ? byYear[byYear.length - 4]! : null;

  let slopeGpm: number | null = null;
  let slopeOpm: number | null = null;
  let slopeNpm: number | null = null;
  if (threeYearsAgo) {
    slopeGpm = slope3(threeYearsAgo.gpm, latest.gpm);
    slopeOpm = slope3(threeYearsAgo.opm, latest.opm);
    slopeNpm = slope3(threeYearsAgo.npm, latest.npm);
  }

  return {
    byYear,
    latestGpm: latest.gpm,
    latestOpm: latest.opm,
    latestNpm: latest.npm,
    slopeGpm,
    slopeOpm,
    slopeNpm,
    latestGapGpmOpm: latest.gapGpmOpm,
    latestGapOpmNpm: latest.gapOpmNpm,
  };
}

export function getMarginJudgment(
  m: MarginTrendMetrics,
  sectorKey?: string,
): MarginJudgment {
  return {
    gpm: getGpmGrade(m.latestGpm, sectorKey),
    opm: getOpmGrade(m.latestOpm),
    npm: getNpmGrade(m.latestNpm),
    trendGpm: getTrendGrade(m.slopeGpm),
    trendOpm: getTrendGrade(m.slopeOpm),
    trendNpm: getTrendGrade(m.slopeNpm),
  };
}

/** 3년 연속 하락 여부 */
function is3YearDecline(values: number[]): boolean {
  if (values.length < 4) return false;
  const last4 = values.slice(-4);
  return last4[0]! > last4[1]! && last4[1]! > last4[2]! && last4[2]! > last4[3]!;
}

/** 3년 연속 상승 여부 */
function is3YearRise(values: number[]): boolean {
  if (values.length < 4) return false;
  const last4 = values.slice(-4);
  return last4[0]! < last4[1]! && last4[1]! < last4[2]! && last4[2]! < last4[3]!;
}

export interface MarginInsightItem {
  type: 'positive' | 'warning' | 'negative' | 'verdict';
  text: string;
  /** verdict일 때만: 판정 등급 */
  grade?: MarginGrade;
}

export function getMarginInsights(
  m: MarginTrendMetrics,
  judgment: MarginJudgment,
  sectorKey?: string,
): MarginInsightItem[] {
  const insights: MarginInsightItem[] = [];
  const byYear = m.byYear;
  const gpmSeries = byYear.map((y) => y.gpm);
  const opmSeries = byYear.map((y) => y.opm);
  const npmSeries = byYear.map((y) => y.npm);

  // GPM 3년 연속 하락
  if (is3YearDecline(gpmSeries)) {
    insights.push({
      type: 'warning',
      text: 'GPM 3년 연속 하락. 이 말은 매출 대비 「매출총이익」 비중이 해마다 줄어들고 있다는 뜻입니다. 원가가 매출보다 더 빨리 늘거나, 가격을 올리기 어려운 상황일 수 있어, 원가·가격 결정력을 점검해 보는 것이 좋습니다.',
    });
  }

  // GPM 유지 + OPM 하락
  const gpmStable = gpmSeries.length >= 2 && Math.abs(gpmSeries[gpmSeries.length - 1]! - gpmSeries[gpmSeries.length - 2]!) < 1;
  const opmDeclining = opmSeries.length >= 2 && opmSeries[opmSeries.length - 1]! < opmSeries[opmSeries.length - 2]!;
  if (gpmStable && opmDeclining) {
    insights.push({
      type: 'warning',
      text: '제품 마진(GPM)은 비슷한데 영업이익률(OPM)만 내려갔습니다. 이는 「판관비·R&D」가 매출 대비 더 많이 쓰였다는 뜻입니다. 인건비·광고·연구비 등이 늘었는지 재무제표에서 확인해 보시고, 성장을 위한 투자인지 비효율인지 구분해 보시면 좋습니다.',
    });
  }

  // OPM 유지 + NPM 하락
  const opmStable = opmSeries.length >= 2 && Math.abs(opmSeries[opmSeries.length - 1]! - opmSeries[opmSeries.length - 2]!) < 1;
  const npmDeclining = npmSeries.length >= 2 && npmSeries[npmSeries.length - 1]! < npmSeries[npmSeries.length - 2]!;
  if (opmStable && npmDeclining) {
    insights.push({
      type: 'warning',
      text: '영업이익(OPM)은 비슷한데 순이익률(NPM)만 내려갔습니다. 이는 이자비용이나 세금이 매출 대비 더 많이 쓰였다는 뜻입니다. 부채가 늘어 이자가 많아졌는지 재무상태표(대차대조표)를 함께 확인해 보시는 것을 권합니다.',
    });
  }

  // 3개 마진 동시 3년 상승
  if (is3YearRise(gpmSeries) && is3YearRise(opmSeries) && is3YearRise(npmSeries)) {
    insights.push({
      type: 'positive',
      text: 'GPM·OPM·NPM이 3년 연속 모두 올랐습니다. 제품 수익성, 본업 수익성, 최종 주주 귀속 수익성이 모두 개선되고 있다는 뜻으로, 가격 결정력과 비용 효율이 함께 좋아지는 구조라 보시면 됩니다.',
    });
  }

  // 고마진 구조
  if ((m.latestGpm ?? 0) > 60 && (m.latestOpm ?? 0) > 20) {
    insights.push({
      type: 'positive',
      text: '매출총이익률·영업이익률이 모두 높은 고마진 구조입니다. 제품과 본업 모두에서 강한 수익성을 갖추고 있어, 「해자(Moat)」가 있을 가능성이 있습니다. 해자란 성 주변의 해자(壕)처럼, 경쟁사가 쉽게 따라오거나 대체할 수 없게 만드는 경쟁 우위를 말합니다. 브랜드·기술·네트워크·규모의 경제 등으로 가격을 지키거나 원가를 낮춰, 오랫동안 높은 마진을 유지할 수 있는 구조를 의미합니다.',
    });
  }

  // 영업 흑자 + 순손실
  if ((m.latestOpm ?? 0) > 0 && (m.latestNpm ?? 0) < 0) {
    insights.push({
      type: 'warning',
      text: '본업(영업이익)은 흑자인데 최종 순이익은 마이너스입니다. 이자비용이 과도하거나, 일회성 손실(예: 구조조정비, 소송 등)이 있어 순이익이 깎였을 수 있으니, 손익계산서의 비용·손실 항목을 확인해 보세요.',
    });
  }

  // NPM > OPM (비정상)
  if (m.latestNpm != null && m.latestOpm != null && m.latestNpm > m.latestOpm) {
    insights.push({
      type: 'warning',
      text: '순이익률이 영업이익률보다 높게 나왔습니다. 정상적으로는 이자·세금을 빼면 낮아져야 하므로, 영업외 수익(예: 매각이익, 투자수익)이 크게 반영됐을 가능성이 있습니다. 이런 수익은 매년 반복되기 어렵기 때문에, 지속 가능한 수익인지 구분해 보시는 것이 좋습니다.',
    });
  }

  // GPM 3년 연속 개선
  if (is3YearRise(gpmSeries) && m.slopeGpm != null && m.slopeGpm > 0) {
    insights.push({
      type: 'positive',
      text: `GPM이 3년 연속 올라가고 있습니다(연평균 약 ${m.slopeGpm >= 0 ? '+' : ''}${m.slopeGpm.toFixed(1)}%p). 매출 대비 원가 비중이 줄거나 가격을 잘 받고 있다는 의미로, 제품/서비스의 수익성이 꾸준히 개선되고 있다고 볼 수 있습니다.`,
    });
  }

  // OPM 15%+ 3년 안정
  if (byYear.length >= 3) {
    const last3Opm = byYear.slice(-3).map((y) => y.opm);
    if (last3Opm.every((o) => o >= 15)) {
      insights.push({
        type: 'positive',
        text: '영업이익률(OPM)이 15% 이상으로 3년째 안정적으로 유지되고 있습니다. 본업에서 매출의 15% 이상을 이익으로 남기고 있다는 뜻으로, 비용 구조가 효율적이고 본업 경쟁력이 있다고 해석할 수 있습니다.',
      });
    }
  }

  // GPM→OPM 갭 확대
  if (byYear.length >= 2) {
    const prevGap = byYear[byYear.length - 2]!.gapGpmOpm;
    const currGap = byYear[byYear.length - 1]!.gapGpmOpm;
    if (currGap > prevGap + 0.5) {
      insights.push({
        type: 'warning',
        text: 'GPM과 OPM 사이 갭이 전년보다 커졌습니다. 매출총이익에서 영업이익으로 갈 때 「판관비·R&D」가 더 많이 빠져나가고 있다는 뜻입니다. R&D나 인력·마케팅 투자를 늘린 것이라면 성장을 위한 투자로 볼 수 있고, 그렇지 않다면 비효율적인 비용 증가일 수 있으니 재무제표를 확인해 보세요.',
      });
    }
  }

  // OPM→NPM 갭
  if (m.latestGapOpmNpm != null && m.latestGapOpmNpm > 5) {
    insights.push({
      type: 'warning',
      text: `영업이익과 순이익 사이 갭이 ${m.latestGapOpmNpm.toFixed(1)}%p로 꽤 큽니다. 이자비용이나 세금이 매출 대비 이만큼 쓰이고 있다는 뜻이에요. 부채가 많거나 세금 부담이 크면 주주에게 돌아가는 순이익이 줄어들 수 있으니, 부채 규모와 이자비용을 재무상태표에서 함께 확인해 보시는 것을 권합니다.`,
    });
  }

  // 판정
  const hasRed = [judgment.gpm, judgment.opm, judgment.npm].includes('red');
  const hasYellow = [judgment.gpm, judgment.opm, judgment.npm].includes('yellow');
  let verdictText: string;
  let verdictGrade: MarginGrade;
  if (hasRed) {
    verdictText = '마진 구조 점검 필요. GPM·OPM·NPM 중 일부가 우수 수준에 미치지 못하고 있어, 원가·판관비·이자·세금 등 어디서 부담이 큰지 재무제표에서 확인해 보시는 것을 권합니다.';
    verdictGrade = 'red';
  } else if (hasYellow) {
    verdictText = '마진 구조는 보통 수준입니다. 일부 지표는 개선 여지가 있으니, 위 인사이트와 갭 분석을 참고해 보시면 됩니다.';
    verdictGrade = 'yellow';
  } else {
    verdictText = '마진 구조가 우수합니다. 제품·본업·순이익 모두 수익성이 좋은 편입니다. R&D나 판관비 증가가 있다면 성장 투자인지 확인한 뒤, 장기 보유 관점에서 판단하시면 됩니다.';
    verdictGrade = 'green';
  }
  insights.push({ type: 'verdict', text: verdictText, grade: verdictGrade });

  return insights;
}
