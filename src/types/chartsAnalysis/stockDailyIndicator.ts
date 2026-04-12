export interface StockDailyIndicatorProps {
  symbol: string;
  from?: string;
  to?: string;
}

export interface StockDailyIndicatorItem {
  alignmentScore: number;
  atr: number;
  bbBandwidth: number;
  bbLower: number;
  bbMiddle: number;
  bbPercentB: number;
  bbSqueeze: boolean;
  bbUpper: number;
  createdAt: string;
  date: string;
  deadCross: boolean;
  deadCrossLong: boolean;
  ema12: number;
  ema26: number;
  goldenCross: boolean;
  goldenCrossLong: boolean;
  id: number;
  ma5: number;
  ma20: number;
  ma60: number;
  ma120: number;
  ma200: number;
  macd: number;
  macdHistogram: number;
  macdSignal: number;
  macdZeroCross: boolean;
  obv: number;
  rsi: number;
  stockListId: number;
  symbol: string;
  tr: number;
  vma20: number;
  volumeRatio: number;
  volumeSurge: boolean;
  vwapGap: number;
  vwapSignal: string;
}

export interface StockDailyIndicatorResponse {
  success: boolean;
  data: StockDailyIndicatorItem[];
  message?: string;
  errorCode?: string;
}
