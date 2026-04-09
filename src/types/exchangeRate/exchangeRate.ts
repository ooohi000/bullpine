export interface ExchangeRate {
  timestamp: number;
  price: number;
}

export interface ExchangeRateResponse {
  success: boolean;
  data: ExchangeRate;
}
