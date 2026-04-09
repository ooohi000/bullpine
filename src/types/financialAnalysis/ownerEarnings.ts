export interface OwnerEarningsProps {
  symbol: string;
}

export interface OwnerEarningsItem {
  id: number;
  symbol: string;
  reportedCurrency: string;
  fiscalYear: string;
  period: string;
  date: string;
  averagePPE: number;
  maintenanceCapex: number;
  growthCapex: number;
  ownersEarnings: number;
  ownersEarningsPerShare: number;
}

export interface OwnerEarningsResponse {
  success: boolean;
  data: OwnerEarningsItem[];
  message?: string;
  errorCode?: string;
}
