import type { FinancialRatiosItem } from '@/types';

export interface FinancialRatiosConfigItem {
  key: keyof FinancialRatiosItem;
  label: string;
  description: string;
  formula: string;
}

/** 재무 비율 테이블에 표시할 지표 (마진·회전율·유동성·밸류·레버리지·배당·주당) */
export const FINANCIAL_RATIOS_CONFIG: FinancialRatiosConfigItem[] = [
  {
    key: 'grossProfitMargin',
    label: '매출총이익률',
    description:
      '매출에서 매출원가를 뺀 매출총이익이 매출의 몇 %인지를 나타냅니다. ' +
      '높을수록 가격 경쟁력·원가 통제가 좋고, 업종별로 차이가 크므로 동종 업계와 비교해야 합니다.',
    formula: '매출총이익률 = 매출총이익 ÷ 매출 × 100',
  },
  {
    key: 'operatingProfitMargin',
    label: '영업이익률',
    description:
      '매출에서 판관비·감가상각 등을 뺀 영업이익이 매출의 몇 %인지를 나타냅니다. ' +
      '본업의 수익성을 보는 대표 지표이며, 높을수록 영업 효율이 좋습니다.',
    formula: '영업이익률 = 영업이익 ÷ 매출 × 100',
  },
  {
    key: 'netProfitMargin',
    label: '순이익률',
    description:
      '당기순이익이 매출의 몇 %인지를 나타냅니다. ' +
      '이자·세금·비경상 손익까지 반영한 최종 수익성으로, 업종·레버리지에 따라 차이가 납니다.',
    formula: '순이익률 = 당기순이익 ÷ 매출 × 100',
  },
  {
    key: 'ebitdaMargin',
    label: 'EBITDA 마진',
    description:
      '이자·세금·감가상각·상각 전 이익(EBITDA)이 매출의 몇 %인지를 나타냅니다. ' +
      '회계 정책·세율 영향을 줄인 영업 현금 창출력 비교에 쓰입니다.',
    formula: 'EBITDA 마진 = EBITDA ÷ 매출 × 100',
  },
  {
    key: 'receivablesTurnover',
    label: '매출채권 회전율',
    description:
      '연간 매출이 평균 매출채권의 몇 배인지를 나타냅니다. ' +
      '높을수록 외상 매출 회수가 빨라 자금 회전이 좋고, 낮으면 채권 회수 기간이 길어질 수 있습니다.',
    formula: '매출채권 회전율 = 매출 ÷ 평균 매출채권',
  },
  {
    key: 'inventoryTurnover',
    label: '재고 회전율',
    description:
      '매출원가가 평균 재고의 몇 배로 팔렸는지를 나타냅니다. ' +
      '높을수록 재고 회전이 빠르고 진부화·재고 손실 위험이 낮습니다. 업종별로 적정 수준이 다릅니다.',
    formula: '재고 회전율 = 매출원가 ÷ 평균 재고자산',
  },
  {
    key: 'assetTurnover',
    label: '총자산 회전율',
    description:
      '매출이 평균 총자산의 몇 배인지를 나타냅니다. ' +
      '자산을 얼마나 효율적으로 매출로 돌리는지 보는 지표이며, 높을수록 자산 활용도가 좋습니다.',
    formula: '총자산 회전율 = 매출 ÷ 평균 총자산',
  },
  {
    key: 'currentRatio',
    label: '유동비율',
    description:
      '유동자산이 유동부채의 몇 배인지를 나타내는 단기 지급능력 지표입니다. ' +
      '1.0 미만이면 단기 자금 압박이 있을 수 있고, 2.0 이상이면 유동성이 충분한 편으로 봅니다.',
    formula: '유동비율 = 유동자산 ÷ 유동부채',
  },
  {
    key: 'quickRatio',
    label: '당좌비율',
    description:
      '재고를 제외한 유동자산(현금·매출채권·유가증권 등)이 유동부채의 몇 배인지를 나타냅니다. ' +
      '유동비율보다 보수적으로 단기 지급능력을 보며, 재고 처리가 어려울 때의 여유를 봅니다.',
    formula: '당좌비율 = (유동자산 − 재고) ÷ 유동부채',
  },
  {
    key: 'cashRatio',
    label: '현금비율',
    description:
      '현금·현금성 자산만으로 유동부채의 몇 %를 갚을 수 있는지를 나타냅니다. ' +
      '가장 보수적인 유동성 지표로, 0.2 이상이면 단기 현금 여유가 있는 편으로 봅니다.',
    formula: '현금비율 = 현금 및 현금성 자산 ÷ 유동부채',
  },
  {
    key: 'priceToEarningsRatio',
    label: 'PER',
    description:
      '주가가 주당순이익(EPS)의 몇 배인지를 나타내는 대표 밸류에이션 지표입니다. ' +
      '낮을수록 이익 대비 저평가로 해석되지만, 성장성·품질이 다르면 단순 비교는 한계가 있습니다.',
    formula: 'PER = 주가 ÷ 주당순이익 (EPS)',
  },
  {
    key: 'priceToBookRatio',
    label: 'PBR',
    description:
      '주가가 주당순자산(BPS)의 몇 배인지를 나타냅니다. ' +
      '1 미만이면 장부상 자산보다 시가총액이 낮다는 뜻이며, 자산 가치 기반 투자에서 참고합니다.',
    formula: 'PBR = 주가 ÷ 주당순자산 (BPS)',
  },
  {
    key: 'priceToSalesRatio',
    label: 'PSR',
    description:
      '시가총액이 연간 매출의 몇 배인지를 나타냅니다. ' +
      '적자 기업처럼 이익 지표를 쓰기 어려울 때 매출 규모 대비 밸류에이션 비교에 씁니다.',
    formula: 'PSR = 시가총액 ÷ 매출',
  },
  {
    key: 'priceToFreeCashFlowRatio',
    label: '주가/FCF',
    description:
      '시가총액이 자유현금흐름(FCF)의 몇 배인지를 나타냅니다. ' +
      '이익보다 현금 창출력에 초점을 두는 밸류 지표로, 배수가 낮을수록 FCF 대비 저평가로 볼 수 있습니다.',
    formula: '주가/FCF = 시가총액 ÷ 자유현금흐름',
  },
  {
    key: 'debtToEquityRatio',
    label: '부채비율 (D/E)',
    description:
      '총부채가 자본총계의 몇 배인지를 나타내는 레버리지 지표입니다. ' +
      '높을수록 부채 의존도가 크고 이자 부담·파산 위험이 커질 수 있으며, 업종별로 적정 수준이 다릅니다.',
    formula: '부채비율 = 총부채 ÷ 자본총계',
  },
  {
    key: 'debtToAssetsRatio',
    label: '부채/자산',
    description:
      '총자산 중 부채가 차지하는 비중을 나타냅니다. ' +
      '높을수록 자산이 부채로 조달된 비중이 크고, 1에 가까우면 자본이 거의 없음을 의미합니다.',
    formula: '부채/자산 = 총부채 ÷ 총자산',
  },
  {
    key: 'interestCoverageRatio',
    label: '이자보상배율',
    description:
      '영업이익(또는 EBIT)이 이자비용의 몇 배인지를 나타냅니다. ' +
      '높을수록 이자 지급 여유가 있고, 1 미만이면 영업이익만으로는 이자를 감당하기 어렵습니다.',
    formula: '이자보상배율 = EBIT ÷ 이자비용',
  },
  {
    key: 'dividendPayoutRatio',
    label: '배당성향',
    description:
      '당기순이익 중 배당으로 지급한 비율(%)입니다. ' +
      '높을수록 수익을 주주에게 돌려주는 비중이 크고, 낮으면 이익 유보·재투자 비중이 큽니다.',
    formula: '배당성향 = 배당총액 ÷ 당기순이익 × 100',
  },
  {
    key: 'dividendYieldPercentage',
    label: '배당수익률',
    description:
      '현재 주가 기준으로 배당이 몇 %인지를 나타냅니다. ' +
      '주가 대비 배당 매력도를 보는 지표이며, 국채 수익률 등과 비교해 수익자산 대비 매력을 봅니다.',
    formula: '배당수익률 = 주당배당 ÷ 주가 × 100',
  },
  {
    key: 'netIncomePerShare',
    label: 'EPS',
    description:
      '발행 주식 수로 순이익을 나눈 주당순이익입니다. ' +
      '한 주가 벌어다 주는 이익으로, PER 계산의 분모가 되며 성장·수익성 비교에 널리 쓰입니다.',
    formula: 'EPS = 당기순이익 ÷ 발행 보통주 수',
  },
  {
    key: 'bookValuePerShare',
    label: 'BPS',
    description:
      '자본총계를 발행 주식 수로 나눈 주당순자산입니다. ' +
      '한 주가 갖는 장부상 순자산이며, PBR 계산의 분모가 됩니다.',
    formula: 'BPS = 자본총계 ÷ 발행 보통주 수',
  },
  {
    key: 'freeCashFlowPerShare',
    label: '주당 FCF',
    description:
      '자유현금흐름을 발행 주식 수로 나눈 값입니다. ' +
      '한 주가 창출하는 FCF로, 배당·자사주 매입 여력과 주가/FCF 배수 계산에 쓰입니다.',
    formula: '주당 FCF = 자유현금흐름 ÷ 발행 보통주 수',
  },
  {
    key: 'operatingCashFlowPerShare',
    label: '주당 영업CF',
    description:
      '영업활동 현금흐름을 발행 주식 수로 나눈 값입니다. ' +
      '한 주가 영업에서 창출하는 현금으로, 이익의 현금화 정도·주당 기준 비교에 씁니다.',
    formula: '주당 영업CF = 영업활동 현금흐름 ÷ 발행 보통주 수',
  },
];
