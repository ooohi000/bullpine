/**
 * 회사 프로필 정보 타입 정의
 * FMP API 응답 기준. null/미제공될 수 있는 필드는 optional(?)
 */
export interface CompanyProfile {
  symbol: string;
  companyName: string;
  companyNameKo: string;
  currency: string;
  cik: string;
  isin: string;
  cusip: string;
  price: number;
  marketCap: number;
  beta: number;
  range: string;
  change: number;
  changePercentage: number;
  lastDividend: number;
  volume: number;
  averageVolume: number;
  exchange: string;
  exchangeFullName: string;
  description: string;
  descriptionKo: string | null;
  ceo: string;
  sector: string;
  industry: string;
  website: string;
  phone: string;
  fullTimeEmployees: number;
  country: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  image: string;
  defaultImage: boolean;
  ipoDate: string;
  isActivelyTrading: boolean;
  isEtf: boolean;
  isAdr: boolean;
  isFund: boolean;
}

/** API 응답: data는 해당 심볼 프로필 1개 요소 배열 (FMP 프로필 API 형태) */
export interface CompanyProfileResponse {
  success: boolean;
  data: CompanyProfile[];
}
