export interface Company {
  beta: number;
  companyName: string;
  country: string;
  exchange: string;
  exchangeShortName: string;
  id: number;
  industry: string;
  isActivelyTrading: boolean;
  isEtf: boolean;
  isFund: boolean;
  lastAnnualDividend: number;
  marketCap: number;
  price: number;
  sector: string;
  symbol: string;
  volume: number;
}

export interface GetStockListData {
  content: Company[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/** 백엔드 응답이 `{ success, data }` 일 때 (스펙 바뀌면 여기만 맞추면 됨) */
export interface GetStockListResponse {
  data: GetStockListData;
  success: boolean;
}
