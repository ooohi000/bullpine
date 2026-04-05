import type {
  IncomeKeyMetricsRowDef,
  IncomeRatioKey,
} from '@/types/financialAnalysis/financialAnalysis';

export type IncomeKeyMetricsSection = {
  title: string;
  subtitle?: string;
  rows: IncomeKeyMetricsRowDef[];
};

/** 손익계산서에서 얻는 재무비율 (주식분석용) */
export const INCOME_RATIO_SECTIONS: IncomeKeyMetricsSection[] = [
  {
    title: '수익성 비율 (마진)',
    subtitle: '매출 대비 이익률',
    rows: [
      { key: 'grossMargin' as IncomeRatioKey, label: '매출총이익률 (%)' },
      { key: 'operatingMargin' as IncomeRatioKey, label: '영업이익률 (%)' },
      { key: 'netProfitMargin' as IncomeRatioKey, label: '순이익률 (%)' },
      { key: 'ebitdaMargin' as IncomeRatioKey, label: 'EBITDA 마진 (%)' },
    ],
  },
  {
    title: '이자·세금 관련 비율',
    subtitle: '이자보상·이자부담·유효세율',
    rows: [
      { key: 'interestCoverageRatio' as IncomeRatioKey, label: '이자보상비율' },
      {
        key: 'interestBurdenPercent' as IncomeRatioKey,
        label: '이자부담률 (%)',
      },
      { key: 'effectiveTaxRate' as IncomeRatioKey, label: '유효세율 (%)' },
    ],
  },
];

/** 재무분석(손익) 테이블 섹션 구성: 매출 → 매출총이익 → … → 당기순이익 */
export const INCOME_KEY_METRICS_SECTIONS: IncomeKeyMetricsSection[] = [
  {
    title: '매출 → 매출총이익',
    subtitle: '매출액 − 매출원가 = 매출총이익',
    rows: [
      { key: 'revenue', label: '매출액' },
      { key: 'costOfRevenue', label: '매출원가' },
      {
        key: 'grossProfit',
        label: '매출총이익',
        isResult: true,
      },
    ],
  },
  {
    title: '매출총이익 → 영업이익',
    subtitle: '매출총이익 − 판매비와 관리비 - 연구개발비 = 영업이익',
    rows: [
      {
        key: 'sellingGeneralAndAdministrativeExpenses',
        label: '판매비와 관리비',
      },
      {
        key: 'researchAndDevelopmentExpenses',
        label: '연구개발비',
      },
      {
        key: 'operatingIncome',
        label: '영업이익',
        isResult: true,
      },
    ],
  },
  {
    title: '영업이익 → 법인세 차감전 순이익',
    subtitle: '영업이익 + 이자 손익 + 영업외 손익 = 법인세 차감전 순이익',
    rows: [
      { key: 'interestIncome', label: '이자수익' },
      { key: 'interestExpense', label: '이자비용' },
      { key: 'netInterestIncome', label: '순이자수익' },
      { key: 'totalOtherIncomeExpensesNet', label: '기타수익비용 순액' },
      {
        key: 'incomeBeforeTax',
        label: '법인세 차감전 순이익',
        isResult: true,
      },
    ],
  },
  {
    title: '법인세 차감전 → 당기순이익',
    subtitle: '법인세 차감전 순이익 − 법인세 = 당기순이익',
    rows: [
      { key: 'incomeTaxExpense', label: '법인세' },
      {
        key: 'netIncome',
        label: '당기순이익',
        isResult: true,
      },
    ],
  },
  {
    title: '당기순이익 → 주당순이익',
    subtitle: '당기순이익 ÷ 가중평균 발행주식수 = 주당순이익',
    rows: [
      { key: 'netIncome', label: '당기순이익' },
      { key: 'weightedAverageShsOut', label: '가중평균 발행주식수(기본)' },
      { key: 'weightedAverageShsOutDil', label: '가중평균 발행주식수(희석)' },
      { key: 'eps', label: '주당순이익(EPS, 기본)', isResult: true },
      { key: 'epsDiluted', label: '주당순이익(EPS, 희석)', isResult: true },
    ],
  },
];
