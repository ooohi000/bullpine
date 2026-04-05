import type { IncomeItem } from '@/types/statements';
import type { IncomeRatioKey } from '@/types/financialAnalysis/financialAnalysis';

const n = (v: unknown): number =>
  typeof v === 'number' && !Number.isNaN(v) ? v : 0;

/** 손익계산서 기반 재무비율 (주식분석용) */
export function getIncomeRatioValue(
  row: IncomeItem | undefined,
  key: IncomeRatioKey,
): number | null {
  if (!row) return null;
  const rev = n(row.revenue);
  const gross = n(row.grossProfit);
  const operating = n(row.operatingIncome);
  const net = n(row.netIncome);
  const ebitda = n(row.ebitda);
  const interestExp = n(row.interestExpense);
  const beforeTax = n(row.incomeBeforeTax);
  const taxExp = n(row.incomeTaxExpense);

  switch (key) {
    case 'grossMargin':
      return rev > 0 ? (gross / rev) * 100 : null;
    case 'operatingMargin':
      return rev > 0 ? (operating / rev) * 100 : null;
    case 'netProfitMargin':
      return rev > 0 ? (net / rev) * 100 : null;
    case 'ebitdaMargin':
      return rev > 0 ? (ebitda / rev) * 100 : null;
    case 'interestCoverageRatio':
      return interestExp > 0 ? operating / interestExp : null;
    case 'interestBurdenPercent':
      return operating > 0 ? (interestExp / operating) * 100 : null;
    case 'effectiveTaxRate':
      return beforeTax > 0 ? (taxExp / beforeTax) * 100 : null;
    default:
      return null;
  }
}

export const INCOME_RATIO_LABELS: Record<IncomeRatioKey, string> = {
  grossMargin: '매출총이익률',
  operatingMargin: '영업이익률',
  netProfitMargin: '순이익률',
  ebitdaMargin: 'EBITDA 마진',
  interestCoverageRatio: '이자보상비율',
  interestBurdenPercent: '이자부담률',
  effectiveTaxRate: '유효세율',
};

export const INCOME_RATIO_FORMULAS: Record<IncomeRatioKey, string> = {
  grossMargin: '매출총이익 ÷ 매출액 × 100',
  operatingMargin: '영업이익 ÷ 매출액 × 100',
  netProfitMargin: '당기순이익 ÷ 매출액 × 100',
  ebitdaMargin: 'EBITDA ÷ 매출액 × 100',
  interestCoverageRatio: '영업이익 ÷ 이자비용',
  interestBurdenPercent: '이자비용 ÷ 영업이익 × 100',
  effectiveTaxRate: '법인세비용 ÷ 세전이익 × 100',
};

/** %로 표시하는 비율 (나머지는 배수 등) */
export const INCOME_RATIO_PERCENT_KEYS: IncomeRatioKey[] = [
  'grossMargin',
  'operatingMargin',
  'netProfitMargin',
  'ebitdaMargin',
  'interestBurdenPercent',
  'effectiveTaxRate',
];
