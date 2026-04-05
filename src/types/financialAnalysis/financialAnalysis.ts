import { IncomeItem } from '../statements';

/** 손익계산서에서 계산하는 재무비율 키 (주식분석용) */
export type IncomeRatioKey =
  | 'grossMargin'
  | 'operatingMargin'
  | 'netProfitMargin'
  | 'ebitdaMargin'
  | 'interestCoverageRatio'
  | 'interestBurdenPercent'
  | 'effectiveTaxRate';

export type IncomeKeyMetricsRowDef = {
  key: keyof IncomeItem | IncomeRatioKey;
  label: string;
  isResult?: boolean;
  formula?: string;
};
