export interface GetKeyMetricsProps {
  symbol: string;
  limit?: number;
  period?: string;
}

export interface KeyMetricsItem {
  symbol: string;
  date: string;
  fiscalYear: string;
  period: string;
  reportedCurrency: string;

  /** 시가총액 */
  marketCap: number;
  /** 기업가치 (EV) — 시가총액 + 순부채 */
  enterpriseValue: number;
  /** EV/매출 — 기업가치/매출 */
  evToSales: number;
  /** EV/영업현금흐름 */
  evToOperatingCashFlow: number;
  /** EV/자유현금흐름 */
  evToFreeCashFlow: number;
  /** EV/EBITDA */
  evToEBITDA: number;
  /** 순부채/EBITDA — 부채 상환 가능 연수 감 (낮을수록 여유) */
  netDebtToEBITDA: number;

  /** 유동비율 — 유동자산/유동부채 */
  currentRatio: number;
  /** 이익의 질 — 영업현금흐름/순이익 (이익의 현금화 정도) */
  incomeQuality: number;

  /** 그레이엄 숫자 — √(22.5 × EPS × BPS) 벤저민 그레이엄 식 적정주가 참고치 */
  grahamNumber: number;
  /** 그레이엄 넷넷 — (유동자산 − 총부채) 기반 보수적 청산가치 감 */
  grahamNetNet: number;

  /** 세부담 — 세후이익/세전이익 (1−실효세율 개념) */
  taxBurden: number;
  /** 이자부담 — 세전이익/EBIT (이자 비용이 먹는 비중) */
  interestBurden: number;

  /** 운전자본 — 유동자산 − 유동부채 */
  workingCapital: number;
  /** 투자자본 — 부채+자본(또는 총자산−무이자유동부채) */
  investedCapital: number;

  /** ROA (총자산이익률) — 순이익/평균 총자산 */
  returnOnAssets: number;
  /** 영업ROA — 영업이익/평균 총자산 */
  operatingReturnOnAssets: number;
  /** 유형자산이익률 — 순이익/평균 유형자산 */
  returnOnTangibleAssets: number;
  /** ROE (자기자본이익률) — 순이익/평균 자본총계 */
  returnOnEquity: number;
  /** ROIC (투자자본이익률) — NOPAT/투자자본 */
  returnOnInvestedCapital: number;
  /** ROCE (투입자본이익률) — EBIT/투입자본 */
  returnOnCapitalEmployed: number;

  /** 이익수익률 — 순이익/시가총액 (PER의 역수) */
  earningsYield: number;
  /** FCF 수익률 — 자유현금흐름/시가총액 */
  freeCashFlowYield: number;

  /** 설비투자/영업현금흐름 — 자본적지출이 CF에서 차지하는 비중 */
  capexToOperatingCashFlow: number;
  /** 설비투자/감가상각비 */
  capexToDepreciation: number;
  /** 설비투자/매출 */
  capexToRevenue: number;

  /** 판관비/매출 — 판매비·일반관리비/매출 */
  salesGeneralAndAdministrativeToRevenue: number;
  /** R&D/매출 — 연구개발비/매출 (FMP 필드명: researchAndDevelopementToRevenue) */
  researchAndDevelopementToRevenue: number;
  /** 주식보상비/매출 — 스톡옵션 등 비용/매출 */
  stockBasedCompensationToRevenue: number;

  /** 무형자산/총자산 */
  intangiblesToTotalAssets: number;

  /** 평균 매출채권 */
  averageReceivables: number;
  /** 평균 매입채무 */
  averagePayables: number;
  /** 평균 재고자산 */
  averageInventory: number;

  /** 매출채권 회전일수 — 365/매출채권회전율 (외상 매출 회수 기간) */
  daysOfSalesOutstanding: number;
  /** 매입채무 회전일수 — 365/매입채무회전율 (외상 매입 지급 기간) */
  daysOfPayablesOutstanding: number;
  /** 재고 보유일수 — 365/재고회전율 */
  daysOfInventoryOutstanding: number;
  /** 영업 cycle — 재고보유일수 + 매출채권회전일수 */
  operatingCycle: number;
  /** 현금전환 cycle — 영업cycle − 매입채무회전일수 (자금 묶이는 일수) */
  cashConversionCycle: number;

  /** FCFE — 자본에 귀속하는 자유현금흐름 (주주 가치) */
  freeCashFlowToEquity: number;
  /** FCFF — 기업 전체 자유현금흐름 (부채·자본 제공자 전체) */
  freeCashFlowToFirm: number;

  /** 유형자산 가치 — 유형자산 관련 장부가치 */
  tangibleAssetValue: number;
  /** 순유동자산가치 — 유동자산 − 총부채 (넷넷 등에서 사용) */
  netCurrentAssetValue: number;
}

export interface KeyMetricsResponse {
  success: boolean;
  data: KeyMetricsItem[];
}

/** 지표별 표시용 메타 (라벨, 설명, 계산식) — constants/ratios에서 사용 */
export interface KeyMetricsMeta {
  key: keyof KeyMetricsItem;
  label: string;
  description: string;
  formula: string;
}
