import { PeriodType } from '@/types';
import type { FinancialRatiosItem } from '@/types/financialAnalysis';

function quarterKoreanLabel(period: string): string {
  return period.split('').reverse().join('').replace(/Q/gi, '분기');
}

/** X축 라벨 (손익·대차 차트와 동일 규칙, 회계연도 기준) */
export function getFinancialRatiosCategories(
  sortedData: FinancialRatiosItem[],
  period: PeriodType,
): string[] {
  return sortedData.map((item) => {
    const [year, month] = item.date.split('-');
    return period === 'FY'
      ? `${year}`
      : `${year.slice(2)}.${month.padStart(2, '0')}`;
  });
}

/** 툴팁 제목: 연간·FY는 년도만, 분기는 회계연도 + 분기 */
export function formatFinancialRatiosTooltipPeriodTitle(
  item: FinancialRatiosItem,
): string {
  const year = item.fiscalYear;
  const p = (item.period ?? '').trim();
  if (/Q/i.test(p)) {
    return `${year}년 ${quarterKoreanLabel(p)}`;
  }
  return `${year}년`;
}

const CHART_AXIS_STYLE = {
  gridLineColor: 'hsl(220, 15%, 18%)',
  xAxisLine: 'hsl(220, 15%, 20%)',
};

export const chartTheme = {
  ...CHART_AXIS_STYLE,
  chart: {
    height: 300,
    backgroundColor: 'transparent' as const,
    spacing: [16, 4, 16, 4] as [number, number, number, number],
    style: { fontFamily: 'inherit' as const },
  },
  tooltip: {
    backgroundColor: 'hsl(220, 22%, 11%)',
    borderColor: 'hsl(220, 14%, 24%)',
    borderRadius: 8,
    padding: 12,
    shadow: false as const,
    style: { color: 'hsl(210, 20%, 96%)', fontSize: '11px' },
    shared: true as const,
    useHTML: true as const,
    outside: false as const,
  },
  xAxis: {
    crosshair: {
      width: 1,
      color: 'hsl(220, 15%, 35%)',
      dashStyle: 'Dash' as const,
    },
    labels: {
      useHTML: true,
      rotation: 0,
      overflow: 'allow' as const,
      style: { color: 'hsl(215, 20%, 70%)', fontSize: '10px' },
    },
    tickLength: 4,
    lineWidth: 1,
    lineColor: 'hsl(220, 15%, 20%)',
  },
};

export const financialRatiosResponsive = {
  rules: [
    {
      condition: { maxWidth: 680 },
      chartOptions: {
        chart: { height: 250 },
        xAxis: {
          labels: { enabled: false },
        },
      },
    },
  ],
};

export function financialRatiosTooltipPositioner(
  this: unknown,
  labelWidth: number,
  labelHeight: number,
  point: { plotX?: number; plotY?: number },
) {
  const chart = (
    this as { chart: { plotLeft: number; plotWidth: number; plotTop: number } }
  ).chart;
  const plotLeft = chart.plotLeft;
  const plotRight = chart.plotLeft + chart.plotWidth;
  const plotTop = chart.plotTop;
  let x = (point.plotX ?? 0) + plotLeft - labelWidth / 2;
  const y = Math.max(4, (point.plotY ?? 0) + plotTop - labelHeight - 8);
  x = Math.max(plotLeft, Math.min(x, plotRight - labelWidth));
  return { x: Math.max(4, x), y };
}

export function createFinancialRatiosSharedTooltipFormatter(
  sortedData: FinancialRatiosItem[],
  categories: string[],
  formatY: (y: number) => string,
) {
  return function (this: unknown) {
    const ctx = this as {
      points?: {
        y?: number | null;
        color?: string;
        series: { name: string };
      }[];
      x?: number | string;
    };
    const points = (ctx.points ?? []).filter((p) => p.y != null);
    if (points.length === 0) return '';
    const idx = Number(ctx.x);
    const item = sortedData[idx];
    const dateLabel = item
      ? formatFinancialRatiosTooltipPeriodTitle(item)
      : (categories[idx] ?? '').replace(/<br\s*\/?>/gi, ' ');
    const rows = points
      .map((p, i) => {
        const sep =
          i < points.length - 1
            ? 'border-bottom:1px solid hsl(220,14%,18%);'
            : '';
        const yStr = p.y != null ? formatY(Number(p.y)) : '-';
        return `<div style="display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:14px;row-gap:2px;align-items:start;padding:8px 0;${sep}">
              <span style="color:hsl(215,14%,72%);font-size:11px;line-height:1.4;word-break:keep-all;overflow-wrap:break-word;">${p.series.name}</span>
              <span style="color:${p.color};font-weight:700;font-size:12px;line-height:1.35;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums;">${yStr}</span>
            </div>`;
      })
      .join('');
    return `<div style="width:max-content;min-width:200px;max-width:min(300px,calc(100vw - 24px));box-sizing:border-box;">
            <div style="margin:0 0 4px;padding-bottom:10px;border-bottom:1px solid hsl(220,14%,22%);font-weight:600;font-size:12px;line-height:1.35;color:hsl(210,20%,96%);word-break:keep-all;">${dateLabel}</div>
            <div style="display:block;">${rows}</div>
          </div>`;
  };
}

/** 마진·배당 등 % 값: API가 소수(0.25)로 오면 25로 변환 */
export function toPercentDisplay(
  value: number | null | undefined,
): number | null {
  if (value == null || Number.isNaN(value)) return null;
  return Math.abs(value) <= 1 ? value * 100 : value;
}
