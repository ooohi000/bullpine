export interface MarketCap {
  symbol: string;
  date: string;
  marketCap: number;
}

export interface MarketCapResponse {
  data: MarketCap[];
}
