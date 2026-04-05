export interface StockPriceAndVolumeItem {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePercent: number;
  vwap: number;
}

export interface StockPriceAndVolumeResponse {
  data: StockPriceAndVolumeItem[];
}
