import type { BalanceSheetItem } from '@/types/statements';

/**
 * BalanceSheetItem의 영어 키를 한글 헤더로 매핑
 * 재무상태표의 각 항목을 한글로 표시하기 위한 매핑 객체
 */
export const BALANCE_SHEET_KEY_MAP: Record<keyof BalanceSheetItem, string> = {
  // 기본 정보
  symbol: '심볼',
  date: '날짜',
  reportedCurrency: '보고 통화',
  cik: 'CIK',
  filingDate: '제출일',
  acceptedDate: '승인일',
  fiscalYear: '회계연도',
  period: '기간',

  // 자산 (Assets) - 유동자산
  cashAndCashEquivalents: '현금 및 현금성자산',
  shortTermInvestments: '단기투자',
  cashAndShortTermInvestments: '현금 및 단기투자',
  netReceivables: '순매출채권',
  accountsReceivables: '매출채권',
  otherReceivables: '기타채권',
  inventory: '재고자산',
  prepaids: '선급금',
  otherCurrentAssets: '기타유동자산',
  totalCurrentAssets: '유동자산 합계',

  // 자산 (Assets) - 비유동자산
  propertyPlantEquipmentNet: '유형자산(순)',
  goodwill: '영업권',
  intangibleAssets: '무형자산',
  goodwillAndIntangibleAssets: '영업권 및 무형자산',
  longTermInvestments: '장기투자',
  taxAssets: '세금자산',
  otherNonCurrentAssets: '기타비유동자산',
  totalNonCurrentAssets: '비유동자산 합계',
  otherAssets: '기타자산',
  totalAssets: '자산 총계',

  // 부채 (Liabilities) - 유동부채
  totalPayables: '채무 총계',
  accountPayables: '매입채무',
  otherPayables: '기타채무',
  accruedExpenses: '미지급비용',
  shortTermDebt: '단기차입금',
  capitalLeaseObligationsCurrent: '자본리스 의무(유동)',
  taxPayables: '세금채무',
  deferredRevenue: '선수금',
  otherCurrentLiabilities: '기타유동부채',
  totalCurrentLiabilities: '유동부채 합계',

  // 부채 (Liabilities) - 비유동부채
  longTermDebt: '장기차입금',
  capitalLeaseObligationsNonCurrent: '자본리스 의무(비유동)',
  deferredRevenueNonCurrent: '선수금(비유동)',
  deferredTaxLiabilitiesNonCurrent: '이연법인세부채(비유동)',
  otherNonCurrentLiabilities: '기타비유동부채',
  totalNonCurrentLiabilities: '비유동부채 합계',
  otherLiabilities: '기타부채',
  capitalLeaseObligations: '자본리스 의무',
  totalLiabilities: '부채 총계',

  // 자본 (Equity)
  treasuryStock: '자기주식',
  preferredStock: '우선주',
  commonStock: '보통주',
  retainedEarnings: '이익잉여금',
  additionalPaidInCapital: '자본잉여금',
  accumulatedOtherComprehensiveIncomeLoss: '기타포괄손익누계액',
  otherTotalStockholdersEquity: '기타주주지분',
  totalStockholdersEquity: '주주지분 총계',
  totalEquity: '자본 총계',
  minorityInterest: '비지배지분',
  totalLiabilitiesAndTotalEquity: '부채 및 자본 총계',

  // 기타
  totalInvestments: '투자 총계',
  totalDebt: '부채 총계',
  netDebt: '순부채',
};

/**
 * 재무상태표 표시 필드 구조
 * 재무상태표의 표준 표시 순서를 정의
 * Annual과 Quarter 테이블에서 공통으로 사용
 */
export const BALANCE_SHEET_DISPLAY_FIELDS = {
  // 자산 (Assets) - 유동자산 (합계 중복 제거: cashAndShortTerm=현금+단기투자, netReceivables=매출채권+기타채권)
  currentAssets: [
    'cashAndCashEquivalents',
    'shortTermInvestments',
    'accountsReceivables',
    'otherReceivables',
    'inventory',
    'prepaids',
    'otherCurrentAssets',
    'totalCurrentAssets',
  ] as (keyof BalanceSheetItem)[],

  // 자산 (Assets) - 비유동자산 (goodwillAndIntangibleAssets = goodwill+intangible 합계라 제거)
  nonCurrentAssets: [
    'propertyPlantEquipmentNet',
    'goodwill',
    'intangibleAssets',
    'longTermInvestments',
    'taxAssets',
    'otherNonCurrentAssets',
    'totalNonCurrentAssets',
    'otherAssets',
    'totalAssets',
  ] as (keyof BalanceSheetItem)[],

  // 부채 (Liabilities) - 유동부채 (totalPayables = 매입채무+기타채무 합계라 제거, 구성항목만 표시)
  currentLiabilities: [
    'accountPayables',
    'otherPayables',
    'accruedExpenses',
    'shortTermDebt',
    'capitalLeaseObligationsCurrent',
    'taxPayables',
    'deferredRevenue',
    'otherCurrentLiabilities',
    'totalCurrentLiabilities',
  ] as (keyof BalanceSheetItem)[],

  // 부채 (Liabilities) - 비유동부채 (capitalLeaseObligations=유동+비유동 합계라 제거, 유동은 위에서 표시)
  nonCurrentLiabilities: [
    'longTermDebt',
    'capitalLeaseObligationsNonCurrent',
    'deferredRevenueNonCurrent',
    'deferredTaxLiabilitiesNonCurrent',
    'otherNonCurrentLiabilities',
    'totalNonCurrentLiabilities',
    'otherLiabilities',
    'totalLiabilities',
  ] as (keyof BalanceSheetItem)[],

  // 자본 (Equity)
  equity: [
    'treasuryStock',
    'preferredStock',
    'commonStock',
    'retainedEarnings',
    'additionalPaidInCapital',
    'accumulatedOtherComprehensiveIncomeLoss',
    'otherTotalStockholdersEquity',
    'totalStockholdersEquity',
    'totalEquity',
    'minorityInterest',
    // 'totalLiabilitiesAndTotalEquity',
  ] as (keyof BalanceSheetItem)[],

  // 기타
  other: [
    'totalInvestments',
    'totalDebt',
    'netDebt',
  ] as (keyof BalanceSheetItem)[],
} as const;

/**
 * 재무상태표 전체 표시 필드 (순서대로)
 * 모든 섹션을 합친 전체 필드 배열
 */
export const BALANCE_SHEET_ALL_FIELDS: (keyof BalanceSheetItem)[] = [
  ...BALANCE_SHEET_DISPLAY_FIELDS.currentAssets,
  ...BALANCE_SHEET_DISPLAY_FIELDS.nonCurrentAssets,
  ...BALANCE_SHEET_DISPLAY_FIELDS.currentLiabilities,
  ...BALANCE_SHEET_DISPLAY_FIELDS.nonCurrentLiabilities,
  ...BALANCE_SHEET_DISPLAY_FIELDS.equity,
  ...BALANCE_SHEET_DISPLAY_FIELDS.other,
];

/** 합계 행 여부 (강조 스타일 적용) */
export const BALANCE_SHEET_TOTAL_FIELDS = new Set<keyof BalanceSheetItem>([
  'totalCurrentAssets',
  'totalNonCurrentAssets',
  'totalAssets',
  'totalCurrentLiabilities',
  'totalNonCurrentLiabilities',
  'totalLiabilities',
  'totalStockholdersEquity',
  'totalEquity',
  'totalLiabilitiesAndTotalEquity',
]);

/** 합계 요약에서 "총계" 행 하이라이트용 (자산 총계, 부채 총계, 부채 및 자본 총계) */
export const BALANCE_SHEET_SUMMARY_TOTAL_FIELDS = new Set<
  keyof BalanceSheetItem
>(['totalAssets', 'totalLiabilities', 'totalLiabilitiesAndTotalEquity']);

export type BalanceSheetSummarySection = {
  title: string;
  formula: string;
  fields: (keyof BalanceSheetItem)[];
};

/** 합계 요약: 자산·부채·자본별 항목 + 계산식 */
export const BALANCE_SHEET_SUMMARY_SECTIONS: BalanceSheetSummarySection[] = [
  {
    title: '자산',
    formula: '유동자산 합계 + 비유동자산 합계 = 자산 총계',
    fields: ['totalCurrentAssets', 'totalNonCurrentAssets', 'totalAssets'],
  },
  {
    title: '부채',
    formula: '유동부채 합계 + 비유동부채 합계 = 부채 총계',
    fields: [
      'totalCurrentLiabilities',
      'totalNonCurrentLiabilities',
      'totalLiabilities',
    ],
  },
  {
    title: '자본',
    formula: '주주지분 총계, 자본 총계, 부채 및 자본 총계',
    fields: [
      'totalStockholdersEquity',
      'totalEquity',
      'totalLiabilitiesAndTotalEquity',
    ],
  },
];
