/**
 * 모든 Highcharts 시리즈(라인·컬럼)에 공통으로 쓰는 색 순서.
 * 첫 번째 시리즈 = 인덱스 0, 두 번째 = 1 … 형태로 `chartSeriesColor(n)`만 쓰면 됩니다.
 */
export const CHART_SERIES_COLORS = [
  'hsl(152, 55%, 48%)',
  'hsl(217, 88%, 58%)',
  'hsl(200, 78%, 52%)',
  'hsl(235, 62%, 58%)',
  'hsl(8, 75%, 56%)',
  'hsl(32, 88%, 56%)',
  'hsl(348, 58%, 55%)',
  'hsl(27, 92.00%, 34.30%)',
  'hsl(308, 93.40%, 47.80%)',
  'hsl(61, 97.40%, 44.70%)',
] as const;

export function chartSeriesColor(index: number): string {
  return CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length]!;
}

/** 방향형 미니 컬럼(테이블 셀 등) 첫 연도·보합 막대 — 시리즈 순번 팔레트와 별도 무채색 */
export const CHART_BAR_NEUTRAL = 'hsl(220, 15%, 45%)';
