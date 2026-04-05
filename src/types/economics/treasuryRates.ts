export interface TreasuryRatesItem {
  date: string;
  month1: number;
  month2: number;
  month3: number;
  month6: number;
  year1: number;
  year2: number;
  year3: number;
  year5: number;
  year7: number;
  year10: number;
  year20: number;
  year30: number;
}

export interface TreasuryRatesResponse {
  data: TreasuryRatesItem[];
}
