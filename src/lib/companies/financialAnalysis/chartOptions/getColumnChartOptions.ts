import {
  CHART_BAR_NEUTRAL,
  chartSeriesColor,
} from '@/constants/chartSeriesColors';
import { Options } from 'highcharts';

/** 막대 색: 상승·하락은 팔레트 고정 인덱스, 중립은 `CHART_BAR_NEUTRAL` */
const CHART_UP = chartSeriesColor(4);
const CHART_DOWN = chartSeriesColor(1);
const CHART_NEUTRAL = CHART_BAR_NEUTRAL;

/** 연도별 값으로 미니 컬럼 차트 옵션 생성 (테이블 셀용) - 상승 빨간색 */
export const getColumnChartOptions = (
  years: string[],
  values: (number | null)[],
  isResult: boolean
): Options => {
  const raw = values.map((v) => (v != null && !Number.isNaN(v) ? v : 0));
  const data = raw.map((y, i) => {
    const prev = i > 0 ? raw[i - 1] : null;
    const color =
      prev === null
        ? CHART_NEUTRAL
        : y > prev
        ? CHART_UP
        : y < prev
        ? CHART_DOWN
        : CHART_NEUTRAL;
    return { y, color };
  });
  return {
    chart: {
      type: 'column',
      height: 52,
      backgroundColor: 'transparent',
      margin: [2, 2, 2, 2],
      spacing: [0, 0, 0, 0],
    },
    title: { text: undefined },
    legend: { enabled: false },
    credits: { enabled: false },
    xAxis: {
      categories: years.map((y) => `${y}`),
      tickLength: 0,
      lineWidth: 0,
      labels: {
        style: { fontSize: '9px', color: 'hsl(215, 20%, 70%)' },
      },
    },
    yAxis: {
      visible: false,
      title: { text: undefined },
      startOnTick: true,
      endOnTick: true,
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'hsl(220, 23%, 10%)',
      borderColor: 'hsl(220, 15%, 20%)',
      style: { color: 'hsl(210, 20%, 96%)' },
      pointFormat: '<b>{point.category}년</b>: {y:,.0f}',
    },
    plotOptions: {
      column: {
        borderWidth: 0,
        pointPadding: 0.15,
        groupPadding: 0.25,
        borderRadius: 2,
        /** 값이 아주 작아도 막대가 최소 4px은 보이도록 (영업외손익 등) */
        minPointLength: 4,
      },
    },
    series: [{ type: 'column', data, showInLegend: false }],
  };
};
