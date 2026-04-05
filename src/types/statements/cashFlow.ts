export interface GetCashFlowProps {
  symbol: string;
  limit?: number;
  period?: string;
}

export type CashFlowSectionKey =
  | 'operating'
  | 'investing'
  | 'financing'
  | 'cash'
  | 'other';

/**
 * 현금흐름표 항목 타입 정의
 */
export interface CashFlowItem {
  symbol: string;
  date: string;
  reportedCurrency: string;
  cik: string;
  filingDate: string;
  acceptedDate: string;
  fiscalYear: string;
  period: string;
  netIncome: number;
  depreciationAndAmortization: number;
  stockBasedCompensation: number;
  deferredIncomeTax: number;
  otherNonCashItems: number;
  changeInWorkingCapital: number;
  accountsReceivables: number;
  accountsPayables: number;
  inventory: number;
  otherWorkingCapital: number;
  operatingCashFlow: number;
  netCashProvidedByOperatingActivities: number;
  capitalExpenditure: number;
  investmentsInPropertyPlantAndEquipment: number;
  acquisitionsNet: number;
  purchasesOfInvestments: number;
  salesMaturitiesOfInvestments: number;
  otherInvestingActivities: number;
  netCashProvidedByInvestingActivities: number;
  commonStockIssuance: number;
  commonStockRepurchased: number;
  netCommonStockIssuance: number;
  netPreferredStockIssuance: number;
  netStockIssuance: number;
  longTermNetDebtIssuance: number;
  shortTermNetDebtIssuance: number;
  netDebtIssuance: number;
  commonDividendsPaid: number;
  preferredDividendsPaid: number;
  netDividendsPaid: number;
  otherFinancingActivities: number;
  netCashProvidedByFinancingActivities: number;
  netChangeInCash: number;
  cashAtBeginningOfPeriod: number;
  cashAtEndOfPeriod: number;
  effectOfForexChangesOnCash: number;
  freeCashFlow: number;
  interestPaid: number;
  incomeTaxesPaid: number;
}

export interface CashFlowResponse {
  success: boolean;
  data: CashFlowItem[];
}
