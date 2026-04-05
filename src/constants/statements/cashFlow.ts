import type { CashFlowItem } from '@/types/statements';

/**
 * 현금흐름표 공식 정리
 * - 영업 + 투자 + 재무 현금흐름 = 현금 변동(순액)
 * - 잉여현금흐름(FCF) = 영업활동으로 인한 현금흐름 − 자본지출
 * - 자본지출(capitalExpenditure)과 유형자산 투자(investmentsInPropertyPlantAndEquipment)는
 *   US GAAP상 동일 항목(동일 지출)이며, API에서 둘 다 제공할 수 있어 값이 같게 나올 수 있음.
 * - 이자 지급·법인세 지급: 보충 공시 항목이며, 이 둘을 합산한 "계산된 값"은 API에 없음.
 */

/**
 * CashFlowItem의 영어 키를 한글 헤더로 매핑
 * 현금흐름표의 각 항목을 한글로 표시하기 위한 매핑 객체
 */
export const CASH_FLOW_KEY_MAP: Record<keyof CashFlowItem, string> = {
  // 기본 정보
  symbol: '심볼',
  date: '날짜',
  reportedCurrency: '보고 통화',
  cik: 'CIK',
  filingDate: '제출일',
  acceptedDate: '승인일',
  fiscalYear: '회계연도',
  period: '기간',

  // 영업활동 현금흐름 (Operating Activities)
  netIncome: '순이익',
  depreciationAndAmortization: '감가상각 및 무형자산상각비',
  stockBasedCompensation: '주식보상비',
  deferredIncomeTax: '이연소득세',
  otherNonCashItems: '기타 비현금 항목',
  changeInWorkingCapital: '운전자본 변동',
  accountsReceivables: '매출채권',
  accountsPayables: '매입채무',
  inventory: '재고자산',
  otherWorkingCapital: '기타 운전자본',
  operatingCashFlow: '영업활동 현금흐름',
  netCashProvidedByOperatingActivities: '영업활동으로 인한 현금흐름',

  // 투자활동 현금흐름 (Investing Activities). 자본지출 = 유형자산 투자와 동일 개념
  capitalExpenditure: '자본적지출',
  investmentsInPropertyPlantAndEquipment: '유형자산 취득',
  acquisitionsNet: '기업인수(순액)',
  purchasesOfInvestments: '투자자산 매입',
  salesMaturitiesOfInvestments: '투자자산 매각·만기',
  otherInvestingActivities: '기타 투자활동',
  netCashProvidedByInvestingActivities: '투자활동으로 인한 현금흐름',

  // 재무활동 현금흐름 (Financing Activities)
  commonStockIssuance: '보통주 발행',
  commonStockRepurchased: '보통주 매입',
  netCommonStockIssuance: '보통주 발행(순액)',
  netPreferredStockIssuance: '우선주 발행(순액)',
  netStockIssuance: '주식 발행(순액)',
  longTermNetDebtIssuance: '장기차입금 순증감',
  shortTermNetDebtIssuance: '단기차입금 순증감',
  netDebtIssuance: '차입금 순증감',
  commonDividendsPaid: '보통주 배당금 지급',
  preferredDividendsPaid: '우선주 배당금 지급',
  netDividendsPaid: '배당금 지급(순액)',
  otherFinancingActivities: '기타 재무활동',
  netCashProvidedByFinancingActivities: '재무활동으로 인한 현금흐름',

  // 현금 및 현금성자산 변동
  netChangeInCash: '현금의 순증감',
  cashAtBeginningOfPeriod: '기초 현금 및 현금성자산',
  cashAtEndOfPeriod: '기말 현금 및 현금성자산',
  effectOfForexChangesOnCash: '환율변동의 영향',

  // 기타
  freeCashFlow: '잉여현금흐름 (FCF)',
  interestPaid: '이자 지급',
  incomeTaxesPaid: '법인세 지급',
};

/**
 * 현금흐름표 표시 필드 구조 (섹션별)
 * 영업활동 → 투자활동 → 재무활동 → 현금 변동 순. 기타에 FCF·이자·법인세(참고용).
 */
export const CASH_FLOW_DISPLAY_FIELDS = {
  /** 영업활동: 순이익 + 비현금 조정 + 운전자본 변동 = 영업활동으로 인한 현금흐름 */
  operating: [
    'netIncome',
    'depreciationAndAmortization',
    'stockBasedCompensation',
    'deferredIncomeTax',
    'otherNonCashItems',
    'accountsReceivables',
    'accountsPayables',
    'inventory',
    'otherWorkingCapital',
    'changeInWorkingCapital',
    'netCashProvidedByOperatingActivities',
  ] as (keyof CashFlowItem)[],

  /**
   * 투자활동: 자본지출(=유형자산 투자와 동일)·인수·투자 등 = 투자활동 현금흐름.
   * 자본지출만 표시(capitalExpenditure). investmentsInPropertyPlantAndEquipment는 같은 값이므로 제외.
   */
  investing: [
    'capitalExpenditure',
    'acquisitionsNet',
    'purchasesOfInvestments',
    'salesMaturitiesOfInvestments',
    'otherInvestingActivities',
    'netCashProvidedByInvestingActivities',
  ] as (keyof CashFlowItem)[],

  /** 재무활동: 주식·차입금·배당 등 = 재무활동 현금흐름 */
  financing: [
    'commonStockIssuance',
    'commonStockRepurchased',
    'netCommonStockIssuance',
    'netPreferredStockIssuance',
    'netStockIssuance',
    'shortTermNetDebtIssuance',
    'longTermNetDebtIssuance',
    'netDebtIssuance',
    'commonDividendsPaid',
    'preferredDividendsPaid',
    'netDividendsPaid',
    'otherFinancingActivities',
    'netCashProvidedByFinancingActivities',
  ] as (keyof CashFlowItem)[],

  /** 현금 및 현금성자산: 기초 + 순변동 + 환율효과 = 기말 현금 */
  cash: [
    'cashAtBeginningOfPeriod',
    'cashAtEndOfPeriod',
    'netChangeInCash',
  ] as (keyof CashFlowItem)[],

  /**
   * 기타: FCF(영업현금흐름−자본지출), 이자·법인세 지급(보충 공시, 합산 값 없음).
   */
  other: [
    'freeCashFlow',
    'interestPaid',
    'incomeTaxesPaid',
  ] as (keyof CashFlowItem)[],
} as const;

/** 섹션별 소계/결과 행(강조 표시용). 기초잔액(cashAtBeginningOfPeriod)은 제외, 최종 소계만 포함 */
export const CASH_FLOW_TOTAL_FIELDS = new Set<keyof CashFlowItem>([
  'netCashProvidedByOperatingActivities',
  'netCashProvidedByInvestingActivities',
  'netCashProvidedByFinancingActivities',
  'netChangeInCash',
  'freeCashFlow',
]);
