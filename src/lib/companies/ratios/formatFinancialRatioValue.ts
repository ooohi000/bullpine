import type { FinancialRatiosItem } from '@/types/financialAnalysis';
import { formatNumber } from '@/lib';

const PERCENT_KEYS: (keyof FinancialRatiosItem)[] = [
  'grossProfitMargin',
  'ebitMargin',
  'ebitdaMargin',
  'operatingProfitMargin',
  'pretaxProfitMargin',
  'continuousOperationsProfitMargin',
  'netProfitMargin',
  'bottomLineProfitMargin',
  'dividendPayoutRatio',
  'dividendYieldPercentage',
  'effectiveTaxRate',
];

const PER_SHARE_KEYS: (keyof FinancialRatiosItem)[] = [
  'revenuePerShare',
  'netIncomePerShare',
  'interestDebtPerShare',
  'cashPerShare',
  'bookValuePerShare',
  'tangibleBookValuePerShare',
  'shareholdersEquityPerShare',
  'operatingCashFlowPerShare',
  'capexPerShare',
  'freeCashFlowPerShare',
  'dividendPerShare',
];

export function formatFinancialRatioValue(
  key: keyof FinancialRatiosItem,
  value: number | null | undefined,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';

  if (PERCENT_KEYS.includes(key)) {
    const percent = Math.abs(value) <= 1 ? value * 100 : value;
    return `${Number(percent).toFixed(2)}%`;
  }

  if (PER_SHARE_KEYS.includes(key)) {
    return formatNumber(value);
  }

  if (key === 'dividendYield') {
    const percent = Math.abs(value) <= 1 ? value * 100 : value;
    return `${Number(percent).toFixed(2)}%`;
  }

  return typeof value === 'number' ? value.toFixed(2) : String(value);
}
