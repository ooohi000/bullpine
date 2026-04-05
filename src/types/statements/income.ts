export interface GetIncomeProps {
  symbol: string;
  limit?: number;
  period?: string;
}

/**
 * 손익계산서 표시용 섹션 구분 (계산 공식 순서)
 * - revenue: 매출액 − 매출원가 = 매출총이익
 * - operating: 매출총이익 − 영업비용 = 영업이익
 * - preTax: 영업이익 + 영업외 손익 = 법인세 차감전 순이익
 * - netIncome: 법인세 차감전 순이익 − 법인세 = 당기순이익
 * - perShare: 당기순이익 ÷ 가중평균 주식수 = 주당순이익
 */
export type IncomeSectionKey =
  | 'revenue'
  | 'operating'
  | 'preTax'
  | 'netIncome'
  | 'perShare';

/**
 * 손익계산서 항목 타입 정의
 */
export interface IncomeItem {
  /** 종목 티커 심볼 */
  symbol: string;
  /** 보고 기준일(재무제표 기간 종료일) */
  date: string;
  /** 보고 통화(예: USD, KRW) */
  reportedCurrency: string;
  /** SEC 중앙 인덱스 키(기업 식별자) */
  cik: string;
  /** SEC 제출일 */
  filingDate: string;
  /** SEC 접수일 */
  acceptedDate: string;
  /** 회계 연도 */
  fiscalYear: string;
  /** 보고 기간(예: Q1, Q2, FY) */
  period: string;
  /** 매출액(수익) */
  revenue: number;
  /** 매출원가 */
  costOfRevenue: number;
  /** 매출총이익(매출액 - 매출원가) */
  grossProfit: number;
  /** 비용 및 경비 합계 */
  costAndExpenses: number;
  /** 영업비용(판매비와관리비 등) */
  operatingExpenses: number;
  /** 연구개발비 */
  researchAndDevelopmentExpenses: number;
  /** 판매 및 마케팅 비용 */
  sellingAndMarketingExpenses: number;
  /** 일반 및 관리비 */
  generalAndAdministrativeExpenses: number;
  /** 판매·일반·관리비(SG&A) */
  sellingGeneralAndAdministrativeExpenses: number;
  /** 영업이익(매출총이익 - 영업비용) */
  operatingIncome: number;
  /** 감가상각 및 무형자산상각비 */
  depreciationAndAmortization: number;
  /** 이자·세전이익(Earnings Before Interest and Taxes) */
  ebit: number;
  /** 이자·세·감가상각·상각 전이익(EBITDA) */
  ebitda: number;
  /** 이자수익 */
  interestIncome: number;
  /** 이자비용 */
  interestExpense: number;
  /** 순이자수익(이자수익 - 이자비용) */
  netInterestIncome: number;
  /** 이자를 제외한 영업외수익 */
  nonOperatingIncomeExcludingInterest: number;
  /** 기타 수익·비용 순액 */
  totalOtherIncomeExpensesNet: number;
  /** 기타 비용 */
  otherExpenses: number;
  /** 법인세차감전순이익(세전이익) */
  incomeBeforeTax: number;
  /** 법인세비용 */
  incomeTaxExpense: number;
  /** 당기순이익 */
  netIncome: number;
  /** 최종순이익(당기순이익, bottom line) */
  bottomLineNetIncome: number;
  /** 계속영업부문순이익 */
  netIncomeFromContinuingOperations: number;
  /** 중단영업부문순이익 */
  netIncomeFromDiscontinuedOperations: number;
  /** 순이익 공제(우선주 배당 등) */
  netIncomeDeductions: number;
  /** 순이익 기타 조정 */
  otherAdjustmentsToNetIncome: number;
  /** 주당순이익(EPS, 기본) */
  eps: number;
  /** 희석 주당순이익(EPS, 희석) */
  epsDiluted: number;
  /** 가중평균 발행주식수(기본) */
  weightedAverageShsOut: number;
  /** 가중평균 발행주식수(희석) */
  weightedAverageShsOutDil: number;
}

export interface IncomeResponse {
  success: boolean;
  data: IncomeItem[];
}
