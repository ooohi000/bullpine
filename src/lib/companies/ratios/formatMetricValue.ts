import { formatNumber } from '@/lib';
import { KeyMetricsItem } from '@/types/financialAnalysis';

function formatPercentSmart(value: number, digits = 2): string {
  const v = Math.abs(value) <= 1.5 ? value * 100 : value;
  return `${v.toFixed(digits)}%`;
}

function formatDays(value: number): string {
  const rounded = Math.round(value);
  return `${new Intl.NumberFormat('ko-KR').format(rounded)}일`;
}

export function formatMetricValue(
  key: keyof KeyMetricsItem,
  value: number | null | undefined,
  exchangeRate: number | null = null,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';

  // money
  if (
    key === 'marketCap' ||
    key === 'enterpriseValue' ||
    key === 'workingCapital' ||
    key === 'investedCapital'
  ) {
    return exchangeRate
      ? `${formatNumber(Math.round(Number(value) * exchangeRate))} 원`
      : `${formatNumber(value as number)} 달러`;
  }

  // percent (returns / yields)
  if (
    key === 'returnOnEquity' ||
    key === 'returnOnAssets' ||
    key === 'returnOnInvestedCapital' ||
    key === 'returnOnCapitalEmployed' ||
    key === 'earningsYield' ||
    key === 'freeCashFlowYield' ||
    // 아래 2개도 데이터가 0~1 소수라면 %가 맞음 (샘플이 그렇게 나옴)
    key === 'operatingReturnOnAssets' ||
    key === 'returnOnTangibleAssets'
  ) {
    return formatPercentSmart(value);
  }

  // multiples (x)
  if (
    key === 'evToSales' ||
    key === 'evToOperatingCashFlow' ||
    key === 'evToFreeCashFlow' ||
    key === 'evToEBITDA' ||
    key === 'netDebtToEBITDA' ||
    // ✅ capexToDepreciation: 배수로 이동
    key === 'capexToDepreciation'
  ) {
    return value.toFixed(2);
  }

  // percent-like ratios (0~1 -> %)
  if (
    key === 'capexToOperatingCashFlow' ||
    key === 'capexToRevenue' ||
    key === 'salesGeneralAndAdministrativeToRevenue' ||
    key === 'researchAndDevelopementToRevenue' ||
    key === 'stockBasedCompensationToRevenue' ||
    key === 'intangiblesToTotalAssets'
  ) {
    return formatPercentSmart(value);
  }

  // current ratio: x
  if (key === 'currentRatio') {
    return `${value.toFixed(2)}배`;
  }

  // ✅ incomeQuality: "배" 제거 (비율로 그냥 보여주기)
  if (key === 'incomeQuality') {
    return value.toFixed(2);
  }

  // tax/interest burden: percent
  if (key === 'taxBurden' || key === 'interestBurden') {
    return formatPercentSmart(value);
  }

  // days
  if (
    key === 'daysOfSalesOutstanding' ||
    key === 'daysOfPayablesOutstanding' ||
    key === 'daysOfInventoryOutstanding' ||
    key === 'operatingCycle' ||
    key === 'cashConversionCycle' ||
    String(key).includes('Days')
  ) {
    return formatDays(value);
  }

  return formatNumber(value);
}
