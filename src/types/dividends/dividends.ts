export interface GetDividendsProps {
  symbol: string;
}

export interface DividendsItem {
  symbol: string;
  date: string;
  recordDate: string;
  paymentDate: string;
  declarationDate: string;
  adjDividend: number;
  dividend: number;
  yield: number;
  frequency: string;
}

export interface DividendsResponse {
  data: DividendsItem[];
}
