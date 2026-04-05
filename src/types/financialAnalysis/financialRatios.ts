import { PeriodType } from '..';

export interface GetFinancialRatiosProps {
  symbol: string;
  limit?: number;
  period?: PeriodType;
}

export interface FinancialRatiosItem {
  symbol: string;
  date: string;
  fiscalYear: string;
  period: string;
  reportedCurrency: string;

  /** 매출 대비 이익률 (%) — 매출총이익/매출 */
  grossProfitMargin: number;
  /** EBIT 마진 (%) — 영업이익(이자·세금 차감 전)/매출 */
  ebitMargin: number;
  /** EBITDA 마진 (%) — 감가상각·상각 차감 전 영업이익/매출 */
  ebitdaMargin: number;
  /** 영업이익률 (%) — 영업이익/매출 */
  operatingProfitMargin: number;
  /** 세전이익률 (%) — 세전이익/매출 */
  pretaxProfitMargin: number;
  /** 계속영업이익률 (%) — 계속영업부문 순이익/매출 */
  continuousOperationsProfitMargin: number;
  /** 순이익률 (%) — 당기순이익/매출 */
  netProfitMargin: number;
  /** 최종이익률 (%) — 최종순이익(비지배 등 반영)/매출 */
  bottomLineProfitMargin: number;

  /** 매출채권 회전율 — 매출/평균 매출채권 (회수 속도) */
  receivablesTurnover: number;
  /** 매입채무 회전율 — 매출원가 등/평균 매입채무 (지급 주기) */
  payablesTurnover: number;
  /** 재고 회전율 — 매출원가/평균 재고 (재고 회전 속도) */
  inventoryTurnover: number;
  /** 고정자산 회전율 — 매출/평균 고정자산 */
  fixedAssetTurnover: number;
  /** 총자산 회전율 — 매출/평균 총자산 (자산 효율) */
  assetTurnover: number;

  /** 유동비율 — 유동자산/유동부채 (단기 상환 능력) */
  currentRatio: number;
  /** 당좌비율 — (유동자산－재고)/유동부채 (재고 제외 단기 지급능력) */
  quickRatio: number;
  /** 상환비율 — (당기순이익+감가상각 등)/총부채 (부채 상환 여력) */
  solvencyRatio: number;
  /** 현금비율 — 현금·현금성자산/유동부채 */
  cashRatio: number;

  /** PER (주가수익비율) — 시가총액/순이익 (주가가 이익의 몇 배인지) */
  priceToEarningsRatio: number;
  /** PEG — PER/이익성장률 (성장을 고려한 PER) */
  priceToEarningsGrowthRatio: number;
  /** 선행 PER 대비 성장 — 선행 PER/예상 성장률 */
  forwardPriceToEarningsGrowthRatio: number;
  /** PBR (주가순자산비율) — 시가총액/순자산(자본) */
  priceToBookRatio: number;
  /** PSR (주가매출비율) — 시가총액/매출 */
  priceToSalesRatio: number;
  /** 주가자유현금흐름비율 — 시가총액/자유현금흐름 */
  priceToFreeCashFlowRatio: number;
  /** 주가영업현금흐름비율 — 시가총액/영업현금흐름 */
  priceToOperatingCashFlowRatio: number;

  /** 부채비율(자산 대비) — 총부채/총자산 */
  debtToAssetsRatio: number;
  /** D/E (부채비율) — 총부채/자본총계 */
  debtToEquityRatio: number;
  /** 부채/자본비율 — 부채/(부채+자본) */
  debtToCapitalRatio: number;
  /** 장기부채/자본비율 — 장기부채/(부채+자본) */
  longTermDebtToCapitalRatio: number;
  /** 재무레버리지 — 총자산/자본총계 (자본 대비 자산 규모) */
  financialLeverageRatio: number;

  /** 운전자본 회전율 — 매출/평균 운전자본 */
  workingCapitalTurnoverRatio: number;
  /** 영업현금흐름비율 — 영업현금흐름/유동부채 */
  operatingCashFlowRatio: number;
  /** 영업현금흐름 매출비율 — 영업현금흐름/매출 */
  operatingCashFlowSalesRatio: number;
  /** FCF/영업CF — 자유현금흐름/영업현금흐름 */
  freeCashFlowOperatingCashFlowRatio: number;

  /** 부채상환능력 — 영업CF/원리금 상환액 */
  debtServiceCoverageRatio: number;
  /** 이자보상배율 — 영업이익(또는 EBIT)/이자비용 */
  interestCoverageRatio: number;
  /** 단기 영업CF 커버리지 — 영업CF/단기 부채 등 */
  shortTermOperatingCashFlowCoverageRatio: number;
  /** 영업CF 커버리지 — 영업CF/총부채 등 */
  operatingCashFlowCoverageRatio: number;
  /** 설비투자 커버리지 — 영업CF/자본적지출 */
  capitalExpenditureCoverageRatio: number;
  /** 배당·설비투자 커버리지 — 영업CF/(배당+설비투자) */
  dividendPaidAndCapexCoverageRatio: number;

  /** 배당성향 (%) — 배당총액/순이익 */
  dividendPayoutRatio: number;
  /** 배당수익률 (소수) — 주당배당/주가 */
  dividendYield: number;
  /** 배당수익률 (%) */
  dividendYieldPercentage: number;
  /** 주당배당금 */
  dividendPerShare: number;

  /** 주당매출 — 매출/발행주식수 */
  revenuePerShare: number;
  /** EPS (주당순이익) — 순이익/발행주식수 */
  netIncomePerShare: number;
  /** 주당이자부채 — 이자부채/발행주식수 */
  interestDebtPerShare: number;
  /** 주당현금 — 현금·현금성자산/발행주식수 */
  cashPerShare: number;
  /** BPS (주당순자산) — 자본총계/발행주식수 */
  bookValuePerShare: number;
  /** 주당유형순자산 — (유형자산－부채 등)/발행주식수 */
  tangibleBookValuePerShare: number;
  /** 주당자본 — 자본총계/발행주식수 (BPS와 동일 개념) */
  shareholdersEquityPerShare: number;
  /** 주당영업현금흐름 — 영업CF/발행주식수 */
  operatingCashFlowPerShare: number;
  /** 주당자본적지출 — 설비투자/발행주식수 */
  capexPerShare: number;
  /** 주당자유현금흐름 — FCF/발행주식수 */
  freeCashFlowPerShare: number;

  /** 순이익/세전이익 — 실효세율 반영 정도 */
  netIncomePerEBT: number;
  /** 세전이익/EBIT — 이자비용 영향 */
  ebtPerEbit: number;
  /** 주가/공정가치비율 */
  priceToFairValue: number;
  /** 부채/시가총액 */
  debtToMarketCap: number;
  /** 실효세율 (%) — 세금비용/세전이익 */
  effectiveTaxRate: number;
  /** EV/EBITDA 등 기업가치 배수 */
  enterpriseValueMultiple: number;
}
export interface FinancialRatiosResponse {
  success: boolean;
  data: FinancialRatiosItem[];
}
