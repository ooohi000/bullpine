export interface EnterpriseValuesProps {
  symbol: string;
  from?: string;
  to?: string;
}

export interface EnterpriseValuesItem {
  id: number;
  symbol: string;
  date: string;
  stockPrice: number;
  numberOfShares: number;
  marketCapitalization: number;
  minusCashAndCashEquivalents: number;
  addTotalDebt: number;
  enterpriseValue: number;
}

export interface EnterpriseValuesResponse {
  success: boolean;
  data: EnterpriseValuesItem[];
  message?: string;
  errorCode?: string;
}
