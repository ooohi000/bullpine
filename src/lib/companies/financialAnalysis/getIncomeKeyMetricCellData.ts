import type { IncomeItem } from '@/types/statements';
import type { IncomeRatioKey } from '@/types/financialAnalysis/financialAnalysis';
import { getYoYPercent } from '@/lib/utils/math';
import { getDisplayValue } from './getDisplayValue';

export type IncomeKeyMetricCellData = {
  displayValue: IncomeItem[keyof IncomeItem] | number | null;
  isNumber: boolean;
  yoyPercent: number | null;
};

/** 연도·항목별 셀에 필요한 표시값 + 전년 대비 변동률 */
export const getIncomeKeyMetricCellData = (
  dataByYear: Map<string, IncomeItem>,
  years: string[],
  yearIdx: number,
  key: keyof IncomeItem | IncomeRatioKey,
  isResult: boolean,
): IncomeKeyMetricCellData => {
  const year = years[yearIdx];
  const row = dataByYear.get(year);
  const displayValue = getDisplayValue(row, key, isResult);
  const isNumber =
    typeof displayValue === 'number' && !Number.isNaN(displayValue);
  const prevValue =
    yearIdx > 0
      ? getDisplayValue(
          dataByYear.get(years[yearIdx - 1]) ?? undefined,
          key,
          isResult,
        )
      : null;
  const numCurrent =
    isNumber && typeof displayValue === 'number' ? displayValue : null;
  const numPrev =
    prevValue != null &&
    typeof prevValue === 'number' &&
    !Number.isNaN(prevValue)
      ? prevValue
      : null;
  const yoyPercent = getYoYPercent(numCurrent, numPrev);

  return { displayValue, isNumber, yoyPercent };
};
