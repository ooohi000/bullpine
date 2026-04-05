import type { IncomeItem } from '@/types/statements';

/**
 * IncomeItem의 영어 키를 한글 헤더로 매핑
 * 손익계산서의 각 항목을 한글로 표시하기 위한 매핑 객체
 */
export const INCOME_KEY_MAP: Record<keyof IncomeItem, string> = {
  // 기본 정보
  symbol: '심볼',
  date: '날짜',
  reportedCurrency: '보고 통화',
  cik: 'CIK',
  filingDate: '제출일',
  acceptedDate: '승인일',
  fiscalYear: '회계연도',
  period: '기간',

  // 매출 및 비용
  revenue: '매출액',
  costOfRevenue: '매출원가',
  grossProfit: '매출총이익',
  costAndExpenses: '비용 및 지출 총계',

  // 운영 비용
  operatingExpenses: '운영비용',
  researchAndDevelopmentExpenses: '연구개발비',
  sellingAndMarketingExpenses: '판매 및 마케팅 비용',
  generalAndAdministrativeExpenses: '일반 및 관리비',
  sellingGeneralAndAdministrativeExpenses: '판매관리비',

  // 운영 손익
  operatingIncome: '영업이익',
  depreciationAndAmortization: '감가상각비',
  ebit: 'EBIT',
  ebitda: 'EBITDA',

  // 기타 수익/비용
  interestIncome: '이자수익',
  interestExpense: '이자비용',
  netInterestIncome: '순이자수익',
  nonOperatingIncomeExcludingInterest: '이자를 제외한 영업외수익',
  otherExpenses: '기타비용',
  totalOtherIncomeExpensesNet: '영업외손익',

  // 세전/세후 손익
  incomeBeforeTax: '세전이익',
  incomeTaxExpense: '법인세비용',
  netIncome: '순이익',
  bottomLineNetIncome: '당기순이익',

  // 순이익 상세
  netIncomeFromContinuingOperations: '지속사업순이익',
  netIncomeFromDiscontinuedOperations: '중단사업순이익',
  netIncomeDeductions: '순이익 공제',
  otherAdjustmentsToNetIncome: '순이익 기타조정',

  // 주당 이익
  eps: '주당순이익 (EPS)',
  epsDiluted: '희석주당순이익',
  weightedAverageShsOut: '가중평균 발행주식수',
  weightedAverageShsOutDil: '가중평균 희석 발행주식수',
};

/**
 * 손익계산서 표시 필드 구조 (섹션별)
 * 계산 공식 순서로 배치: 위에서부터 읽으면 공식이 성립하도록 함.
 */
export const INCOME_DISPLAY_FIELDS = {
  /** 매출액 − 매출원가 = 매출총이익 */
  revenue: ['revenue', 'costOfRevenue', 'grossProfit'] as (keyof IncomeItem)[],

  /**
   * 매출총이익 − 영업비용 = 영업이익
   * (비용 및 지출 총계 = 매출원가 + 영업비용 이므로, 영업이익은 매출총이익 − 영업비용)
   */
  operating: [
    // 'costAndExpenses',
    'researchAndDevelopmentExpenses',
    'sellingAndMarketingExpenses',
    'generalAndAdministrativeExpenses',
    'sellingGeneralAndAdministrativeExpenses',
    'operatingExpenses',
    'operatingIncome',
    'ebit',
    'depreciationAndAmortization',
    'ebitda',
  ] as (keyof IncomeItem)[],

  /** 영업이익 + 영업외 손익 = 법인세 차감전 순이익. 영업외 손익은 컴포넌트에서 세전이익−영업이익으로 계산해 표시 */
  preTax: [
    'interestIncome',
    'interestExpense',
    'netInterestIncome',
    'nonOperatingIncomeExcludingInterest',
    'otherExpenses',
    'totalOtherIncomeExpensesNet',
    'incomeBeforeTax',
  ] as (keyof IncomeItem)[],

  /** 법인세 차감전 순이익 − 법인세 = 당기순이익 */
  netIncome: [
    'incomeTaxExpense',
    'netIncome',
    'bottomLineNetIncome',
  ] as (keyof IncomeItem)[],

  /** 당기순이익 ÷ 가중평균 주식수 = 주당순이익 */
  perShare: [
    'weightedAverageShsOut',
    'weightedAverageShsOutDil',
    'eps',
    'epsDiluted',
  ] as (keyof IncomeItem)[],
} as const;

/** 섹션별 계산 공식 (전체 항목 테이블 서브타이틀용) */
// export const INCOME_SECTION_FORMULAS: Record<
//   keyof typeof INCOME_DISPLAY_FIELDS,
//   string
// > = {
//   revenue: '매출액 − 매출원가 = 매출총이익',
//   operating: '매출총이익 − 운영비용 = 영업이익',
//   preTax: '영업이익 + 영업외 손익(이자·기타) = 법인세 차감전 순이익',
//   netIncome: '법인세 차감전 순이익 − 법인세 = 당기순이익',
//   perShare: '당기순이익 ÷ 가중평균 주식수 = 주당순이익',
// };

/** 섹션별 소계/결과 행(강조 표시용) */
export const INCOME_TOTAL_FIELDS = new Set<keyof IncomeItem>([
  'grossProfit',
  'operatingExpenses',
  'operatingIncome',
  'ebitda',
  'incomeBeforeTax',
  'netIncome',
  'bottomLineNetIncome',
]);
