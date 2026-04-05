import type { BalanceSheetItem } from '@/types/statements/balanceSheet';
import type { CashFlowItem } from '@/types/statements/cashFlow';
import type { IncomeItem } from '@/types/statements/income';

export type SustainabilityGrade = 'green' | 'yellow' | 'red';

export interface AxisScore {
  id: 1 | 2 | 3 | 4 | 5;
  name: string;
  points: number;
  maxPoints: number;
  grade: SustainabilityGrade;
  valueLabel: string;
  detailLabel: string;
  /** 계산 근거 (처음 보는 사람이 "어떤 숫자로 나왔는지" 바로 보이도록) */
  calculationDetail?: string;
}

export interface SustainabilityScoreResult {
  totalPoints: number;
  maxPoints: number;
  grade: SustainabilityGrade;
  gradeLabel: string;
  axes: AxisScore[];
  insights: string[];
  verdict: string;
}

/** 축 전체 이름 (UI 표시·접기 설명용) */
export const AXIS_FULL_NAMES: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: '성장의 일관성 (변동성)',
  2: '이익의 질 (현금 뒷받침)',
  3: '성장 동력의 순수성 (희석 여부)',
  4: '수익성 동반 여부',
  5: '재무 여력 (성장을 지속할 체력)',
};

const AXIS_NAMES: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: '성장 일관성',
  2: '이익의 질',
  3: '성장 순수성',
  4: '수익성 동반',
  5: '재무 여력',
};

/** 레이더 차트용 라벨 (축별 상세와 동일한 이름) */
export const AXIS_CHART_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: '성장 일관성',
  2: '이익의 질',
  3: '성장 순수성',
  4: '수익성 동반',
  5: '재무 여력',
};

/** 표준편차 (퍼센트 포인트 단위, 0~1 비율 배열을 100 곱한 값 기준) */
function stdDevPct(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance) * 100;
}

const isFyPeriod = (p: string) => p === 'FY' || p === 'annual';

/** 축 1: 매출 YoY 표준편차 (최근 5년). 5% 미만 2점, 5~15% 1점, 15%+ 0점 */
function axis1Consistency(income: IncomeItem[]): AxisScore {
  const fy = income.filter((i) => isFyPeriod(i.period)).sort((a, b) => parseInt(a.fiscalYear, 10) - parseInt(b.fiscalYear, 10));
  const yoyByYear: { year: string; yoy: number }[] = [];
  for (let i = 1; i < fy.length; i++) {
    const prev = fy[i - 1]!.revenue ?? 0;
    const curr = fy[i]!.revenue ?? 0;
    if (prev > 0) yoyByYear.push({ year: fy[i]!.fiscalYear, yoy: curr / prev - 1 });
  }
  const last5 = yoyByYear.slice(-5);
  const stdPct = last5.length >= 2 ? stdDevPct(last5.map((x) => x.yoy)) : 0;

  let points: number;
  let grade: SustainabilityGrade;
  let detailLabel: string;
  if (stdPct < 5) {
    points = 2;
    grade = 'green';
    detailLabel = '고안정 성장';
  } else if (stdPct <= 15) {
    points = 1;
    grade = 'yellow';
    detailLabel = '보통';
  } else {
    points = 0;
    grade = 'red';
    detailLabel = '변동성 과다 (성장 신뢰 낮음)';
  }

  const yoyPctStr =
    last5.length >= 2
      ? `연도별 매출 전년 대비 성장률: ${last5.map((x) => `${x.year}년 ${(x.yoy * 100 >= 0 ? '+' : '')}${(x.yoy * 100).toFixed(1)}%`).join(', ')}. 위 값들의 표준편차 = ${stdPct.toFixed(1)}%. 이 축은 성장률 수준(몇 %인지)이 아니라 연도 간 변동폭만 봄. 표준편차가 작으면 연도별 성장률이 일정(변동성 낮음), 크면 들쭉날쭉(변동성 높음)입니다.`
      : undefined;

  return {
    id: 1,
    name: AXIS_NAMES[1],
    points,
    maxPoints: 2,
    grade,
    valueLabel: `매출 YoY 표준편차 ${stdPct.toFixed(1)}%`,
    detailLabel,
    calculationDetail: yoyPctStr,
  };
}

/** 축 2: FCF/Net Income (최근 3년 평균). 1.0+ 2점, 0.7~1.0 1점, 0.7 미만 0점 */
function axis2ProfitQuality(
  income: IncomeItem[],
  cashFlow: CashFlowItem[],
): AxisScore {
  const fyIncome = income.filter((i) => isFyPeriod(i.period)).sort((a, b) => parseInt(a.fiscalYear, 10) - parseInt(b.fiscalYear, 10));
  const fyCf = cashFlow.filter((c) => isFyPeriod(c.period)).sort((a, b) => parseInt(a.fiscalYear, 10) - parseInt(b.fiscalYear, 10));
  const byYear = new Map<string, { ni: number; fcf: number; hasCf: boolean }>();
  fyIncome.forEach((i) => byYear.set(i.fiscalYear, { ni: i.netIncome ?? 0, fcf: 0, hasCf: false }));
  fyCf.forEach((c) => {
    const cur = byYear.get(c.fiscalYear);
    if (cur) {
      cur.fcf = c.freeCashFlow ?? 0;
      cur.hasCf = true;
    }
  });

  const yearRatios: { year: string; ratio: number }[] = [];
  Array.from(byYear.entries())
    .sort((a, b) => parseInt(a[0], 10) - parseInt(b[0], 10))
    .forEach(([year, { ni, fcf, hasCf }]) => {
      if (hasCf && ni > 0) yearRatios.push({ year, ratio: fcf / ni });
    });
  const last3 = yearRatios.slice(-3);
  const avg = last3.length > 0 ? last3.reduce((a, x) => a + x.ratio, 0) / last3.length : 0;

  if (last3.length === 0) {
    return {
      id: 2,
      name: AXIS_NAMES[2],
      points: 0,
      maxPoints: 2,
      grade: 'red',
      valueLabel: '데이터 부족 (연간 손익·현금흐름 매칭)',
      detailLabel: '최근 3년 FCF/NI 산출 불가',
    };
  }

  let points: number;
  let grade: SustainabilityGrade;
  let detailLabel: string;
  if (avg >= 1.0) {
    points = 2;
    grade = 'green';
    detailLabel = '이익이 현금으로 실현됨';
  } else if (avg >= 0.7) {
    points = 1;
    grade = 'yellow';
    detailLabel = '보통 수준';
  } else {
    points = 0;
    grade = 'red';
    detailLabel = '이익 착시 가능성';
  }

  const calcStr =
    last3.length > 0
      ? `각 연도 FCF÷순이익 비율(1이면 당기 순이익이 100% 현금으로 실현): ${last3.map((x) => `${x.year}년 ${x.ratio.toFixed(2)}`).join(', ')}. 세 값의 평균 = ${avg.toFixed(2)}.`
      : undefined;

  return {
    id: 2,
    name: AXIS_NAMES[2],
    points,
    maxPoints: 2,
    grade,
    valueLabel: `FCF/NI ${avg.toFixed(2)}`,
    detailLabel,
    calculationDetail: calcStr,
  };
}

/** 축 3: 매출 성장 vs 주식수 증가. 매출 > 주식수 2점, ≈ 1점, 매출 < 주식수 0점 */
function axis3GrowthPurity(income: IncomeItem[]): AxisScore {
  const fy = income.filter((i) => isFyPeriod(i.period)).sort((a, b) => parseInt(a.fiscalYear, 10) - parseInt(b.fiscalYear, 10));
  if (fy.length < 6) {
    return {
      id: 3,
      name: AXIS_NAMES[3],
      points: 0,
      maxPoints: 2,
      grade: 'red',
      valueLabel: '데이터 부족',
      detailLabel: '5년 이상 연간 데이터 필요',
    };
  }
  const latest = fy[fy.length - 1]!;
  const fiveAgo = fy[fy.length - 6]!;
  const revGrowth =
    (fiveAgo.revenue ?? 0) > 0
      ? (latest.revenue ?? 0) / (fiveAgo.revenue ?? 0) - 1
      : 0;
  const sharesLatest = latest.weightedAverageShsOutDil ?? latest.weightedAverageShsOut ?? 0;
  const sharesFiveAgo = fiveAgo.weightedAverageShsOutDil ?? fiveAgo.weightedAverageShsOut ?? 0;
  const shareGrowth =
    sharesFiveAgo > 0 ? sharesLatest / sharesFiveAgo - 1 : 0;

  const revPct = revGrowth * 100;
  const sharePct = shareGrowth * 100;
  const diff = revPct - sharePct;

  let points: number;
  let grade: SustainabilityGrade;
  let detailLabel: string;
  if (diff > 5) {
    points = 2;
    grade = 'green';
    detailLabel = '순수 성장 확인';
  } else if (diff >= -5) {
    points = 1;
    grade = 'yellow';
    detailLabel = '희석 성장 의심';
  } else {
    points = 0;
    grade = 'red';
    detailLabel = '희석이 성장을 초과';
  }

  const shareLabel =
    shareGrowth <= 0
      ? `주식수 ${(shareGrowth * 100).toFixed(1)}% (감소)`
      : `주식수 +${(shareGrowth * 100).toFixed(1)}%`;
  const calcStr =
    `${fiveAgo.fiscalYear}년 대비 ${latest.fiscalYear}년: 매출 성장률 ${revPct >= 0 ? '+' : ''}${revPct.toFixed(1)}%, 주식 수 증가율 ${sharePct >= 0 ? '+' : ''}${sharePct.toFixed(1)}%. ` +
    `비교 기준: 주식 수가 매출보다 많이 늘면 주당 실질 가치가 희석되므로, 매출 성장률이 주식 수 증가율보다 크면 희석 없이 성장한 것으로 봄. → 이 종목은 매출이 주식수보다 ${diff > 0 ? '더 많이 늘어나 희석 없이 성장' : diff < 0 ? '덜 늘어나 희석 우려' : '비슷하게 늘어남'}.`;
  return {
    id: 3,
    name: AXIS_NAMES[3],
    points,
    maxPoints: 2,
    grade,
    valueLabel: shareLabel,
    detailLabel,
    calculationDetail: calcStr,
  };
}

/** 축 4: 영업이익률 3년 추세. 유지/개선 2점, 완만한 하락(1~2%p) 1점, 급격한 하락(3%p+) 0점 */
function axis4ProfitabilityTrend(income: IncomeItem[]): AxisScore {
  const fy = income.filter((i) => isFyPeriod(i.period)).sort((a, b) => parseInt(a.fiscalYear, 10) - parseInt(b.fiscalYear, 10));
  const margins: { year: string; margin: number }[] = [];
  fy.forEach((i) => {
    const rev = i.revenue ?? 0;
    const op = i.operatingIncome ?? 0;
    if (rev > 0) margins.push({ year: i.fiscalYear, margin: (op / rev) * 100 });
  });
  const last3 = margins.slice(-3);
  if (last3.length < 2) {
    return {
      id: 4,
      name: AXIS_NAMES[4],
      points: 0,
      maxPoints: 2,
      grade: 'red',
      valueLabel: '데이터 부족',
      detailLabel: '3년 이상 데이터 필요',
    };
  }
  const first = last3[0]!.margin;
  const last = last3[last3.length - 1]!.margin;
  const changePp = last - first;

  let points: number;
  let grade: SustainabilityGrade;
  let detailLabel: string;
  if (changePp >= 0) {
    points = 2;
    grade = 'green';
    detailLabel = '유지 또는 개선';
  } else if (changePp >= -2) {
    points = 1;
    grade = 'yellow';
    detailLabel = '완만한 하락';
  } else {
    points = 0;
    grade = 'red';
    detailLabel = '급격한 하락 (출혈 성장 가능)';
  }

  const firstYear = last3[0]!.year;
  const lastYear = last3[last3.length - 1]!.year;
  const revFirst = fy.find((i) => i.fiscalYear === firstYear)?.revenue ?? 0;
  const revLast = fy.find((i) => i.fiscalYear === lastYear)?.revenue ?? 0;
  const revGrowthPct =
    revFirst > 0 ? ((revLast / revFirst - 1) * 100) : 0;
  const firstShow = first.toFixed(1);
  const lastShow = last.toFixed(1);
  const changePpShow = (parseFloat(lastShow) - parseFloat(firstShow)).toFixed(1);
  const revGrowthStr =
    revFirst > 0
      ? `동 기간 매출: ${firstYear}년 → ${lastYear}년 ${revGrowthPct >= 0 ? '+' : ''}${revGrowthPct.toFixed(1)}% 성장. `
      : '';
  const calcStr =
    `${revGrowthStr}영업이익률: ${firstYear}년 ${firstShow}% → ${lastYear}년 ${lastShow}%. ` +
    `변화량 = ${lastShow}% − ${firstShow}% = ${changePp >= 0 ? '+' : ''}${changePpShow}%p. ` +
    `(매출이 늘어나는 동안 영업이익률이 개선된지 보는 지표. 양수면 수익성 동반 개선, 음수면 악화)`;
  return {
    id: 4,
    name: AXIS_NAMES[4],
    points,
    maxPoints: 2,
    grade,
    valueLabel: `영업이익률 ${changePp >= 0 ? '+' : ''}${changePp.toFixed(1)}%p`,
    detailLabel,
    calculationDetail: calcStr,
  };
}

/** 축 5: Net Debt/EBITDA. 2배 미만 2점, 2~4배 1점, 4배+ 0점 */
function axis5FinancialHeadroom(
  income: IncomeItem[],
  balanceSheet: BalanceSheetItem[],
): AxisScore {
  const fyIncome = income.filter((i) => isFyPeriod(i.period)).sort((a, b) => parseInt(a.fiscalYear, 10) - parseInt(b.fiscalYear, 10));
  const fyBs = balanceSheet.filter((b) => isFyPeriod(b.period)).sort((a, b) => parseInt(a.fiscalYear, 10) - parseInt(b.fiscalYear, 10));
  const latestIncome = fyIncome[fyIncome.length - 1];
  const latestBs = fyBs[fyBs.length - 1];
  if (!latestIncome || !latestBs) {
    return {
      id: 5,
      name: AXIS_NAMES[5],
      points: 0,
      maxPoints: 2,
      grade: 'red',
      valueLabel: '데이터 부족',
      detailLabel: '연간 손익·재무제표 필요',
    };
  }
  const ebitda = latestIncome.ebitda ?? 0;
  const netDebt = latestBs.netDebt ?? (latestBs.totalDebt ?? 0) - (latestBs.cashAndCashEquivalents ?? 0);

  let ratio: number;
  if (ebitda <= 0) {
    ratio = netDebt > 0 ? 999 : 0;
  } else {
    ratio = netDebt / ebitda;
  }

  let points: number;
  let grade: SustainabilityGrade;
  let detailLabel: string;
  if (ratio < 2) {
    points = 2;
    grade = 'green';
    detailLabel = '성장 투자 여력 충분';
  } else if (ratio <= 4) {
    points = 1;
    grade = 'yellow';
    detailLabel = '관리 가능 수준';
  } else {
    points = 0;
    grade = 'red';
    detailLabel = '부채 부담으로 지속 한계';
  }

  const ratioDisplay = ratio < 1 ? ratio.toFixed(2) : ratio.toFixed(1);
  let valueLabel: string;
  let calculationDetail: string | undefined;
  if (ebitda <= 0) {
    valueLabel = `Net Debt ${netDebt > 0 ? '보유' : '—'}, EBITDA 없음`;
  } else {
    if (netDebt <= 0) {
      valueLabel = `Net Debt/EBITDA ${ratioDisplay}배 (순차입금 없음·현금이 부채보다 많음)`;
      calculationDetail =
        `순차입금 ${netDebt <= 0 ? '0 또는 음수' : netDebt.toLocaleString()}, EBITDA ${ebitda.toLocaleString()} → ${ratioDisplay}배. ` +
        `순차입금÷EBITDA 비율(배수). 2배 미만이면 부채 상환 여력 양호, 4배 초과면 부담 큼.`;
    } else {
      valueLabel = `Net Debt/EBITDA ${ratioDisplay}배`;
      calculationDetail =
        `순차입금(총차입금−현금) ÷ EBITDA = ${netDebt.toLocaleString()} ÷ ${ebitda.toLocaleString()} = ${ratioDisplay}배. ` +
        `이 비율이 낮을수록 부채 상환 여력이 좋음(2배 미만 양호, 4배 초과 위험).`;
    }
  }
  return {
    id: 5,
    name: AXIS_NAMES[5],
    points,
    maxPoints: 2,
    grade,
    valueLabel,
    detailLabel,
    calculationDetail,
  };
}

function buildInsightsAndVerdict(
  totalPoints: number,
  grade: SustainabilityGrade,
  axes: AxisScore[],
): { insights: string[]; verdict: string } {
  const insights: string[] = [];
  const a1 = axes.find((a) => a.id === 1);
  const a2 = axes.find((a) => a.id === 2);
  const a3 = axes.find((a) => a.id === 3);
  const a4 = axes.find((a) => a.id === 4);
  const a5 = axes.find((a) => a.id === 5);

  if (totalPoints >= 8) {
    insights.push(
      '성장의 질과 지속성 모두 우수. 현재 성장이 구조적 체력에서 나오는 것으로 판단됩니다.',
    );
    const strong = axes.filter((a) => a.points === 2).map((a) => a.name);
    if (strong.length > 0) {
      insights.push(
        `우수한 축: ${strong.join(', ')}. 이 축들이 높은 점수로 종합 점수를 끌어올리고 있습니다.`,
      );
    }
    insights.push(
      '앞으로는 분기 실적에서 매출·이익·FCF 추이가 유지되는지, 부채 비율이 악화되지 않는지만 주기적으로 확인하면 됩니다.',
    );
  }

  if (totalPoints >= 5 && totalPoints <= 7) {
    insights.push(
      '종합 점수는 중간 구간입니다. 성장은 있으나 일부 축에서 약점이 있어, 해당 부분 개선 여부를 추적하는 것이 좋습니다.',
    );
  }

  if (a1?.points === 0) {
    insights.push(
      `성장의 일관성(변동성) 0점: ${a1.valueLabel}. 연간 성장률이 크게 요동쳐 성장 신뢰도가 낮은 상태입니다. 사업 구조 변화나 일회성 요인 여부를 확인해 보시는 것이 좋습니다.`,
    );
  } else if (a1?.points === 1) {
    insights.push(
      `성장의 일관성 1점: ${a1.valueLabel}. 고안정은 아니지만 위험 수준은 아닙니다. 다음 몇 년 연간 성장률이 안정화되는지 지켜보면 됩니다.`,
    );
  }

  if (a2?.points === 0) {
    insights.push(
      '이익의 질(현금 뒷받침) 0점: FCF/NI가 0.7 미만으로, 이익이 현금으로 덜 실현되고 있습니다. 미수금·재고 증가, 감가상각 등 비현금 비용이 큰지 현금흐름표를 함께 확인해 보세요.',
    );
  } else if (a2?.points === 1) {
    insights.push(
      '이익의 질 1점: FCF/NI가 0.7~1.0 구간입니다. 이익의 70~100%가 현금으로 들어오는 상태로, 1.0 이상으로 개선되면 더 안정적입니다.',
    );
  }

  if (a3?.points === 0) {
    insights.push(
      '성장 순수성 0점: 주식 수 증가가 매출 성장보다 커서, 주당 가치가 희석되고 있습니다. 신주 발행·M&A·스톡옵션 등 주식 수가 늘어난 원인을 확인하고, 향후 희석이 줄어드는지 보는 것이 좋습니다.',
    );
  } else if (a3?.points === 1) {
    insights.push(
      '성장 순수성 1점: 매출 성장과 주식 수 증가가 비슷한 수준입니다. 주당 가치가 크게 희석되지는 않았지만, 순수 성장으로 보기엔 애매한 구간입니다.',
    );
  }

  if (a4?.points === 0) {
    insights.push(
      '수익성 동반 0점: 영업이익률이 3%p 이상 하락한 상태입니다. 매출은 늘었는데 이익률이 떨어지는 출혈 성장에 가깝습니다. 원가·비용 구조와 가격 경쟁력을 점검해 보세요.',
    );
  } else if (a4?.points === 1) {
    insights.push(
      '수익성 동반 1점: 영업이익률이 1~2%p 정도 하락했습니다. 완만한 하락이지만, 비용이 매출보다 더 빠르게 늘고 있을 수 있으니 추이를 지켜보는 것이 좋습니다.',
    );
  }

  if (a5?.points === 0) {
    insights.push(
      '재무 여력 0점: Net Debt/EBITDA가 4배 이상으로 부채 부담이 큽니다. 금리 상승이나 매출 둔화 시 상환 부담이 커질 수 있어, 차입금 구조와 만기 구간을 확인하는 것을 권합니다.',
    );
  } else if (a5?.points === 1) {
    insights.push(
      '재무 여력 1점: Net Debt/EBITDA가 2~4배로 부담은 있으나 관리 가능한 수준입니다. 부채가 더 늘지 않도록 하고, EBITDA가 꾸준히 나오는지 추이를 보시면 됩니다.',
    );
  }

  if (totalPoints <= 4) {
    insights.push(
      '종합 점수가 4점 이하로, 현재 성장의 지속 가능성이 낮게 나옵니다. 외형 성장에도 불구하고 변동성·이익의 질·희석·수익성·재무 여력 중 여러 축에서 한계가 감지됩니다.',
    );
    insights.push(
      '해당 종목에 이미 투자 중이라면 비중을 줄이거나, 신규 투자 시에는 위 약점이 개선되는 시점까지 관망하는 전략을 고려할 수 있습니다.',
    );
  }

  if (a4?.points === 0 && a2?.points === 0) {
    insights.push(
      '수익성 동반과 이익의 질이 모두 0점인 출혈 성장 패턴입니다. 매출은 늘지만 이익률이 떨어지고, 이익도 현금으로 덜 들어오는 구조이므로 원인 분석이 필요합니다.',
    );
  }

  const weakAxes = axes.filter((a) => a.points === 0);
  if (weakAxes.length > 0 && totalPoints < 8) {
    insights.push(
      `낮은 점수 축: ${weakAxes.map((a) => a.name).join(', ')}. 이 축들이 개선되면 종합 점수와 지속 가능성 판단이 더 유리해질 수 있습니다.`,
    );
  }

  let verdict: string;
  if (grade === 'green') {
    verdict = '지속 가능성 높음. 성장의 질과 재무 여력이 양호합니다.';
  } else if (grade === 'yellow') {
    const weak = axes.filter((a) => a.points === 0).map((a) => a.name);
    verdict =
      weak.length > 0
        ? `성장 체력 양호, ${weak.join('·')} 개선 여부 추적 필요`
        : '조건부 지속 가능. 일부 축 보완 시 안정성 향상 가능.';
  } else {
    verdict = '지속 가능성 낮음. 구조적 한계가 있어 모니터링이 필요합니다.';
  }

  return { insights, verdict };
}

export function computeSustainabilityScore(
  income: IncomeItem[],
  cashFlow: CashFlowItem[],
  balanceSheet: BalanceSheetItem[],
): SustainabilityScoreResult | null {
  const fyIncome = income.filter((i) => isFyPeriod(i.period));
  const fyCf = cashFlow.filter((c) => isFyPeriod(c.period));
  const fyBs = balanceSheet.filter((b) => isFyPeriod(b.period));
  if (fyIncome.length < 3 || fyCf.length < 2 || fyBs.length < 1) {
    return null;
  }

  const axes: AxisScore[] = [
    axis1Consistency(income),
    axis2ProfitQuality(income, cashFlow),
    axis3GrowthPurity(income),
    axis4ProfitabilityTrend(income),
    axis5FinancialHeadroom(income, balanceSheet),
  ];
  const totalPoints = axes.reduce((s, a) => s + a.points, 0);
  const maxPoints = 10;

  let grade: SustainabilityGrade;
  let gradeLabel: string;
  if (totalPoints >= 8) {
    grade = 'green';
    gradeLabel = '지속 가능성 높음';
  } else if (totalPoints >= 5) {
    grade = 'yellow';
    gradeLabel = '조건부 지속 가능';
  } else {
    grade = 'red';
    gradeLabel = '지속 가능성 낮음';
  }

  const { insights, verdict } = buildInsightsAndVerdict(totalPoints, grade, axes);

  return {
    totalPoints,
    maxPoints,
    grade,
    gradeLabel,
    axes,
    insights: insights.length > 0 ? insights : ['위 5개 축 종합 결과입니다.'],
    verdict,
  };
}
