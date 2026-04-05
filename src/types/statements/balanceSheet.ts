import { PeriodType } from '..';

export interface GetBalanceSheetProps {
  symbol: string;
  limit?: number;
  period?: PeriodType;
}

export interface BalanceSheetItem {
  /** 종목 코드 */
  symbol: string;
  /** 보고일 */
  date: string;
  /** 보고 통화 */
  reportedCurrency: string;
  /** SEC CIK (Central Index Key) */
  cik: string;
  /** 제출일 */
  filingDate: string;
  /** 접수일 */
  acceptedDate: string;
  /** 회계연도 */
  fiscalYear: string;
  /** 보고 기간 (quarter / annual) */
  period: string;
  /** 현금 및 현금성자산 */
  cashAndCashEquivalents: number;
  /** 단기투자 */
  shortTermInvestments: number;
  /** 현금 및 단기투자 합계 */
  cashAndShortTermInvestments: number;
  /** 매출채권(순) */
  netReceivables: number;
  /** 매출채권 */
  accountsReceivables: number;
  /** 기타 미수금 */
  otherReceivables: number;
  /** 재고자산 */
  inventory: number;
  /** 선급비용 */
  prepaids: number;
  /** 기타 유동자산 */
  otherCurrentAssets: number;
  /** 유동자산 합계 */
  totalCurrentAssets: number;
  /** 유형자산(순) */
  propertyPlantEquipmentNet: number;
  /** 영업권 */
  goodwill: number;
  /** 무형자산 */
  intangibleAssets: number;
  /** 영업권 및 무형자산 합계 */
  goodwillAndIntangibleAssets: number;
  /** 장기투자 */
  longTermInvestments: number;
  /** 이연법인세자산 */
  taxAssets: number;
  /** 기타 비유동자산 */
  otherNonCurrentAssets: number;
  /** 비유동자산 합계 */
  totalNonCurrentAssets: number;
  /** 기타 자산 */
  otherAssets: number;
  /** 자산 총계 */
  totalAssets: number;
  /** 매입채무 등 합계 */
  totalPayables: number;
  /** 매입채무 */
  accountPayables: number;
  /** 기타 미지급금 */
  otherPayables: number;
  /** 선급비용·미지급비용 */
  accruedExpenses: number;
  /** 단기차입금 */
  shortTermDebt: number;
  /** 당기 만기 리스부채 */
  capitalLeaseObligationsCurrent: number;
  /** 미지급법인세 */
  taxPayables: number;
  /** 선수금(이연수익) */
  deferredRevenue: number;
  /** 기타 유동부채 */
  otherCurrentLiabilities: number;
  /** 유동부채 합계 */
  totalCurrentLiabilities: number;
  /** 장기차입금 */
  longTermDebt: number;
  /** 비당기 만기 리스부채 */
  capitalLeaseObligationsNonCurrent: number;
  /** 비유동 선수금 */
  deferredRevenueNonCurrent: number;
  /** 이연법인세부채(비유동) */
  deferredTaxLiabilitiesNonCurrent: number;
  /** 기타 비유동부채 */
  otherNonCurrentLiabilities: number;
  /** 비유동부채 합계 */
  totalNonCurrentLiabilities: number;
  /** 기타 부채 */
  otherLiabilities: number;
  /** 리스부채 합계 */
  capitalLeaseObligations: number;
  /** 부채 총계 */
  totalLiabilities: number;
  /** 자기주식 */
  treasuryStock: number;
  /** 우선주 */
  preferredStock: number;
  /** 보통주 */
  commonStock: number;
  /** 이익잉여금 */
  retainedEarnings: number;
  /** 자본잉여금 */
  additionalPaidInCapital: number;
  /** 기타포괄손익누계액 */
  accumulatedOtherComprehensiveIncomeLoss: number;
  /** 기타 자본합계 */
  otherTotalStockholdersEquity: number;
  /** 자본총계(지배) */
  totalStockholdersEquity: number;
  /** 자본총계 */
  totalEquity: number;
  /** 비지배지분 */
  minorityInterest: number;
  /** 부채·자본 합계 */
  totalLiabilitiesAndTotalEquity: number;
  /** 투자 합계 */
  totalInvestments: number;
  /** 차입금 합계 */
  totalDebt: number;
  /** 순차입금(차입금 - 현금성자산) */
  netDebt: number;
}

export interface BalanceSheetResponse {
  success: boolean;
  data: BalanceSheetItem[];
}
