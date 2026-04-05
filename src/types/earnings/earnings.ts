export interface GetEarningsProps {
  symbol: string;
}

export interface EarningsItem {
  symbol: string;
  date: string;
  epsActual: number | null;
  epsEstimated: number | null;
  revenueActual: number | null;
  revenueEstimated: number | null;
  lastUpdated: string;
}

export interface EarningsResponse {
  success: boolean;
  data: EarningsItem[];
}
