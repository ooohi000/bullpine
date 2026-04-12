export interface StockPriceAndVolumeProps {
  symbol: string;
  from?: string;
  to?: string;
}

export interface StockPriceAndVolumeItem {
  id: number;
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  changePercent: number;
  vwap: number;
  volume: number;
}

export interface StockPriceAndVolumeResponse {
  success: boolean;
  data: StockPriceAndVolumeItem[];
  message?: string;
  errorCode?: string;
}
