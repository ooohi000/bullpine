export interface StockPeerComparison {
  symbol: string;
  companyName: string;
  price: number;
  mktCap: number;
}

export interface StockPeerComparisonResponse {
  success: boolean;
  data: StockPeerComparison[];
}
