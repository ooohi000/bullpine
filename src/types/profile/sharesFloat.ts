export interface SharesFloat {
  symbol: string;
  date: string;
  source: string;
  outstandingShares: number;
  floatShares: number;
  freeFloat: number;
}

export interface SharesFloatResponse {
  success: boolean;
  data: SharesFloat[];
}
