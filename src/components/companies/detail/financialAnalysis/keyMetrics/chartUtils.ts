import { PeriodType } from '@/types';
import type { KeyMetricsItem } from '@/types/financialAnalysis';
import { formatNumber } from '@/lib/utils/format';

/** X축 라벨 (재무 차트와 동일 규칙, 회계연도 기준) */
export function getKeyMetricsCategories(
  sortedData: KeyMetricsItem[],
  period: PeriodType,
): string[] {
  return sortedData.map((item) => {
    const [year, month] = item.date.split('-');
    return period === 'FY'
      ? `${year}`
      : `${year.slice(2)}.${month.padStart(2, '0')}`;
  });
}

export function formatKeyMetricsTooltipPeriodTitle(
  item: KeyMetricsItem,
  period: PeriodType,
): string {
  const [year, month] = item.date.split('-');
  return period === 'FY'
    ? `${year}년`
    : `${year}년 ${month.padStart(2, '0')}월`;
}

const CHART_AXIS_STYLE = {
  gridLineColor: 'hsl(220, 15%, 18%)',
  labelsStyle: { color: 'hsl(215, 20%, 70%)' as const, fontSize: '11px' },
  xAxisLine: 'hsl(220, 15%, 20%)',
};

export const chartTheme = {
  ...CHART_AXIS_STYLE,
  xAxisLine: 'hsl(220, 15%, 20%)',
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

export const keyMetricsResponsive = {
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

export function keyMetricsTooltipPositioner(
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

export function createKeyMetricsSharedTooltipFormatter(
  sortedData: KeyMetricsItem[],
  categories: string[],
  formatY: (y: number) => string,
  period: PeriodType,
  exchangeRate: number | null = null,
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
      ? formatKeyMetricsTooltipPeriodTitle(item, period)
      : (categories[idx] ?? '').replace(/<br\s*\/?>/gi, ' ');
    const rows = points
      .map((p, i) => {
        const yValue =
          (p.series.name.includes('시가총액') ||
            p.series.name.includes('기업가치')) &&
          exchangeRate
            ? `${formatNumber(Math.round(Number(p.y) * exchangeRate))} 원`
            : Number(p.y).toFixed(2);
        const sep =
          i < points.length - 1
            ? 'border-bottom:1px solid hsl(220,14%,18%);'
            : '';
        return `<div style="display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:14px;row-gap:2px;align-items:start;padding:8px 0;${sep}">
              <span style="color:hsl(215,14%,72%);font-size:11px;line-height:1.4;word-break:keep-all;overflow-wrap:break-word;">${p.series.name}</span>
              <span style="color:${p.color};font-weight:700;font-size:12px;line-height:1.35;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums;">${yValue}</span>
            </div>`;
      })
      .join('');
    return `<div style="width:max-content;min-width:200px;max-width:min(300px,calc(100vw - 24px));box-sizing:border-box;">
            <div style="margin:0 0 4px;padding-bottom:10px;border-bottom:1px solid hsl(220,14%,22%);font-weight:600;font-size:12px;line-height:1.35;color:hsl(210,20%,96%);word-break:keep-all;">${dateLabel}</div>
            <div style="display:block;">${rows}</div>
          </div>`;
  };
}
