export interface OwnerEarningsItem {
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
  data: OwnerEarningsItem[];
}
