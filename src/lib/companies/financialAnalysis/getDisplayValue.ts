import type { IncomeItem } from '@/types/statements';
import type { IncomeRatioKey } from '@/types/financialAnalysis/financialAnalysis';
import { getIncomeRatioValue } from './getIncomeRatioValue';

const INCOME_RATIO_KEYS: IncomeRatioKey[] = [
  'grossMargin',
  'operatingMargin',
  'netProfitMargin',
  'ebitdaMargin',
  'interestCoverageRatio',
  'interestBurdenPercent',
  'effectiveTaxRate',
];

function isIncomeRatioKey(key: string): key is IncomeRatioKey {
  return (INCOME_RATIO_KEYS as string[]).includes(key);
}

/** 손익 테이블 셀 표시값: 항목은 API값, 비율은 계산값 */
export const getDisplayValue = (
  row: IncomeItem | undefined,
  key: keyof IncomeItem | IncomeRatioKey,
  isResult: boolean,
): IncomeItem[keyof IncomeItem] | number | null => {
  if (!row) return null;
  if (isIncomeRatioKey(key)) {
    return getIncomeRatioValue(row, key);
  }
  return row[key as keyof IncomeItem];
};
