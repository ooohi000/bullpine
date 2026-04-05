'use client';

import React, { useMemo } from 'react';
import HighchartsChart from '@/components/common/HighchartsChart';
import { chartSeriesColor } from '@/constants/chartSeriesColors';
import useIncome from '@/hooks/api/companies/statements/useIncome';
import {
  computeMarginTrendMetrics,
  getMarginInsights,
  getMarginJudgment,
  type MarginGrade,
  type MarginInsightItem,
} from '@/lib/companies/bullpineAnalysis/marginTrend';
import type { IncomeItem } from '@/types/statements';
import type { Options } from 'highcharts';

const GRADE_LABEL: Record<MarginGrade, string> = {
  green: '🟢 우수',
  yellow: '🟡 보통',
  red: '🔴 경고',
};

const TREND_LABEL: Record<MarginGrade, string> = {
  green: '🟢 개선',
  yellow: '🟡 보합',
  red: '🔴 악화',
};

const CHART_THEME = {
  chart: { height: 260, backgroundColor: 'transparent' as const },
  xAxis: {
    lineColor: 'hsl(220, 15%, 20%)',
    tickColor: 'hsl(220, 15%, 20%)',
    labels: { style: { color: 'hsl(215, 20%, 70%)', fontSize: '11px' } },
  },
  yAxis: {
    gridLineColor: 'hsl(220, 15%, 18%)',
    labels: { style: { color: 'hsl(215, 20%, 70%)' }, format: '{value}%' },
  },
  tooltip: {
    backgroundColor: 'hsl(220, 23%, 10%)',
    borderColor: 'hsl(220, 15%, 20%)',
    style: { color: 'hsl(210, 20%, 96%)', fontSize: '11px' },
  },
};

function MarginCard({
  title,
  valuePct,
  grade,
  slopePct,
  trendGrade,
}: {
  title: string;
  valuePct: number | null;
  grade: MarginGrade | null;
  slopePct: number | null;
  trendGrade: MarginGrade | null;
}) {
  if (valuePct == null) return null;
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-center">
      <p className="text-xs text-muted-foreground mb-1">{title}</p>
      <p className="text-xl font-semibold text-foreground">{valuePct.toFixed(1)}%</p>
      {grade != null && (
        <p className="text-xs mt-1 text-foreground">{GRADE_LABEL[grade]}</p>
      )}
      {slopePct != null && (
        <p className="text-xs mt-0.5 text-muted-foreground">
          {slopePct >= 0 ? '+' : ''}{slopePct.toFixed(1)}%p/년
          {trendGrade != null && ` ${TREND_LABEL[trendGrade]}`}
        </p>
      )}
    </div>
  );
}

export default function MarginTrendSection({ symbol }: { symbol: string }) {
  const { data: incomeData, isLoading } = useIncome({
    symbol,
    period: 'annual',
    limit: 7,
  });

  const items = useMemo(() => (incomeData ?? []) as IncomeItem[], [incomeData]);
  const metrics = useMemo(() => computeMarginTrendMetrics(items), [items]);
  const judgment = useMemo(() => getMarginJudgment(metrics), [metrics]);
  const insights = useMemo(
    () => getMarginInsights(metrics, judgment),
    [metrics, judgment],
  );

  const displayYears = useMemo(
    () => metrics.byYear.slice(-5),
    [metrics.byYear],
  );

  const chartOptions: Options = useMemo(() => {
    const categories = displayYears.map((y) => `${y.year}년`);
    return {
      ...CHART_THEME,
      title: { text: '' },
      legend: { enabled: true },
      credits: { enabled: false },
      xAxis: { ...CHART_THEME.xAxis, categories },
      yAxis: [{ ...CHART_THEME.yAxis, title: { text: '마진 (%)' } }],
      tooltip: {
        ...CHART_THEME.tooltip,
        shared: true,
        pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y:.1f}%</b><br/>',
      },
      series: [
        { type: 'line', name: 'GPM', data: displayYears.map((y) => y.gpm), color: chartSeriesColor(0), marker: { radius: 3 } },
        { type: 'line', name: 'OPM', data: displayYears.map((y) => y.opm), color: chartSeriesColor(1), marker: { radius: 3 } },
        { type: 'line', name: 'NPM', data: displayYears.map((y) => y.npm), color: chartSeriesColor(2), marker: { radius: 3 } },
      ],
    };
  }, [displayYears]);

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground py-8 text-center">
        마진 추세 데이터를 불러오는 중입니다.
      </div>
    );
  }

  if (metrics.byYear.length < 2) {
    return (
      <div className="text-sm text-muted-foreground py-8 text-center">
        연도별 손익 데이터가 부족합니다. (최소 2년 필요)
      </div>
    );
  }

  const verdictItem = insights.find((i) => i.type === 'verdict');
  const listInsights = insights.filter((i) => i.type !== 'verdict');

  return (
    <div className="flex flex-col gap-6">
      {/* GPM / OPM / NPM 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MarginCard
          title="GPM (매출총이익률)"
          valuePct={metrics.latestGpm}
          grade={judgment.gpm}
          slopePct={metrics.slopeGpm ?? null}
          trendGrade={judgment.trendGpm ?? null}
        />
        <MarginCard
          title="OPM (영업이익률)"
          valuePct={metrics.latestOpm}
          grade={judgment.opm}
          slopePct={metrics.slopeOpm ?? null}
          trendGrade={judgment.trendOpm ?? null}
        />
        <MarginCard
          title="NPM (순이익률)"
          valuePct={metrics.latestNpm}
          grade={judgment.npm}
          slopePct={metrics.slopeNpm ?? null}
          trendGrade={judgment.trendNpm ?? null}
        />
      </div>

      {/* 3개 마진 관계 설명 — 처음 보는 사람도 이해하기 쉽게 */}
      <details className="rounded-lg border border-border bg-muted/20 overflow-hidden">
        <summary className="list-none cursor-pointer px-4 py-2.5 border-b border-border bg-muted/40 hover:bg-muted/60 flex items-center justify-between text-sm font-medium text-foreground">
          📖 GPM → OPM → NPM이란? (한 번에 이해하기)
          <span className="text-muted-foreground text-xs">▼</span>
        </summary>
        <div className="p-4 text-sm text-muted-foreground space-y-4">
          <p className="text-foreground font-medium">
            GPM·OPM·NPM은 모두 「<strong>P</strong>rofit <strong>M</strong>argin(이익률, 마진)」의 줄임말입니다. 앞에 붙는 글자만 다릅니다. <strong>G</strong> = Gross(매출총이익), <strong>O</strong> = Operating(영업이익), <strong>N</strong> = Net(순이익). 즉 GPM = 매출총이익률, OPM = 영업이익률, NPM = 순이익률입니다.
          </p>
          <p className="text-foreground font-medium">
            손익계산서는 맨 위에 <strong>매출(매상액)</strong>을 두고, 그다음 단계마다 비용을 차례로 빼 나갑니다. 각 단계에서 「매출 − 그때까지 뺀 비용 = 남은 금액」이 되고, 그 남은 금액이 매출총이익 → 영업이익 → 순이익 순으로 이어집니다. 그래서 「남은 이익 ÷ 매출」을 %로 만든 것이 각각 GPM, OPM, NPM입니다.
          </p>
          <ol className="list-decimal list-inside space-y-3 pl-1">
            <li>
              <strong className="text-foreground">1단계: 매출에서 매출원가만 뺀 것 = 매출총이익</strong>
              <br />
              매출총이익 ÷ 매출 = <strong className="text-foreground">GPM (Gross Profit Margin, 매출총이익률)</strong>. 「제품/서비스를 팔 때 원가를 제외하고 얼마나 남는가」를 보는 지표입니다. GPM이 높으면 가격을 잘 받거나 원가를 잘 잡고 있다는 뜻이고, 낮으면 원가 부담이 크거나 가격 경쟁에 밀리고 있을 수 있습니다.
            </li>
            <li>
              <strong className="text-foreground">2단계: 여기서 판관비·R&D 등을 빼면 = 영업이익</strong>
              <br />
              영업이익 ÷ 매출 = <strong className="text-foreground">OPM (Operating Profit Margin, 영업이익률)</strong>. 본업을 운영하는 데 들어가는 인건비, 마케팅, 연구개발비 등을 모두 뺀 뒤 남는 이익이 매출의 몇 %인지 보는 지표입니다. 본업의 「진짜 수익성」을 보는 핵심 지표라고 보면 됩니다.
            </li>
            <li>
              <strong className="text-foreground">3단계: 이자·세금까지 빼면 = 순이익</strong>
              <br />
              순이익 ÷ 매출 = <strong className="text-foreground">NPM (Net Profit Margin, 순이익률)</strong>. 빌린 돈 이자와 법인세까지 모두 반영한 뒤, 주주에게 돌아가는 최종 이익이 매출의 몇 %인지 보는 지표입니다.
            </li>
          </ol>
          <div className="rounded-md bg-muted/40 p-3 space-y-2">
            <p className="font-medium text-foreground">갭(Gap)이란?</p>
            <p><strong className="text-foreground">GPM − OPM</strong> = 매출총이익과 영업이익 사이의 차이(%p). 이 차이는 「판관비 + R&D」가 매출 대비 얼마나 먹는지를 나타냅니다. 갭이 크면 고정비(인건비·광고·연구비 등) 부담이 크고, 갭이 줄어들면 비용 효율이 좋아진 것입니다.</p>
            <p><strong className="text-foreground">OPM − NPM</strong> = 영업이익과 순이익 사이의 차이(%p). 이 차이는 「이자비용 + 세금」이 매출 대비 얼마나 먹는지를 나타냅니다. 갭이 크면 부채 이자나 세금 부담이 크고, 갭이 줄어들면 재무 구조나 세금 효율이 나아진 것입니다.</p>
          </div>
        </div>
      </details>

      {/* 3년 마진 추이 차트 */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">마진 추이 (최근 5년)</h3>
        <p className="text-xs text-muted-foreground mb-2">
          아래 차트는 연도별 GPM·OPM·NPM이 어떻게 움직였는지 한눈에 보여줍니다. 위로 올라가면 수익성이 좋아진 것이고, 내려가면 악화된 것입니다.
        </p>
        <HighchartsChart options={chartOptions} className="min-h-[260px]" />
        <div className="mt-4 rounded-lg border border-border bg-muted/20 overflow-hidden">
          <p className="text-xs font-medium text-muted-foreground px-3 py-2 border-b border-border bg-muted/40">
            연도별 수치 (차트와 동일)
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-2 px-3 font-medium text-foreground w-20">지표</th>
                  {displayYears.map((y) => (
                    <th key={y.year} className="text-right py-2 px-3 font-medium text-foreground min-w-[72px]">
                      {y.year}년
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/60">
                  <td className="py-2 px-3 font-medium text-foreground">GPM</td>
                  {displayYears.map((y) => (
                    <td key={y.year} className="text-right py-2 px-3">{y.gpm.toFixed(1)}%</td>
                  ))}
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-2 px-3 font-medium text-foreground">OPM</td>
                  {displayYears.map((y) => (
                    <td key={y.year} className="text-right py-2 px-3">{y.opm.toFixed(1)}%</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium text-foreground">NPM</td>
                  {displayYears.map((y) => (
                    <td key={y.year} className="text-right py-2 px-3">{y.npm.toFixed(1)}%</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 마진 변화 원인 분해 (최근 2년 비교) */}
      {displayYears.length >= 2 && (() => {
        const prev = displayYears[displayYears.length - 2]!;
        const curr = displayYears[displayYears.length - 1]!;
        const dGpm = curr.gpm - prev.gpm;
        const dGapGpmOpm = curr.gapGpmOpm - prev.gapGpmOpm;
        const dGapOpmNpm = curr.gapOpmNpm - prev.gapOpmNpm;
        return (
          <div className="rounded-lg border border-border bg-muted/20 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border bg-muted/40">
              <h3 className="text-sm font-semibold text-foreground">마진 변화 원인 분해 ({prev.year}년 → {curr.year}년)</h3>
              <p className="text-xs text-muted-foreground mt-1">
                전년 대비 마진이 왜 올랐는지/내렸는지, 그 원인이 「원가·판관비·이자/세금」 중 어디에 있는지 구분해 보여줍니다.
              </p>
            </div>
            <div className="p-4 space-y-4">
              <div className="rounded-md bg-background/60 border border-border/60 p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">① GPM 변화: {dGpm >= 0 ? '+' : ''}{dGpm.toFixed(1)}%p {dGpm >= 0 ? '개선' : '하락'}</p>
                <p className="text-sm text-foreground">
                  {dGpm >= 0
                    ? '매출총이익률이 올랐다는 뜻입니다. 같은 매출에서 원가를 더 잘 잡았거나, 가격을 더 잘 받고 있다는 의미입니다. 제품/서비스의 수익성이 좋아진 좋은 신호입니다.'
                    : '매출총이익률이 내려갔다는 뜻입니다. 원가가 매출보다 더 빨리 늘었거나, 가격을 올리기 어려운 상황일 수 있습니다. 원가 구조나 가격 경쟁력을 점검해 보는 것이 좋습니다.'}
                </p>
              </div>
              <div className="rounded-md bg-background/60 border border-border/60 p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">② GPM→OPM 갭 변화: {dGapGpmOpm >= 0 ? '+' : ''}{dGapGpmOpm.toFixed(1)}%p {dGapGpmOpm > 0 ? '확대' : '축소'}</p>
                <p className="text-xs text-muted-foreground mb-2">
                  갭 = GPM − OPM (%p). 전년 대비 갭이 얼마나 달라졌는지: <span className="font-mono">{curr.year}년 갭 {curr.gapGpmOpm.toFixed(1)}%p − {prev.year}년 갭 {prev.gapGpmOpm.toFixed(1)}%p = {dGapGpmOpm >= 0 ? '+' : ''}{dGapGpmOpm.toFixed(1)}%p</span>
                </p>
                <p className="text-sm text-foreground">
                  {dGapGpmOpm > 0
                    ? '갭이 커졌다는 것은 「판관비·R&D」가 매출 대비 더 많이 쓰였다는 뜻입니다. 새 인력 채용, 광고 확대, 연구개발 투자를 늘렸다면 성장을 위한 투자로 볼 수 있고, 그렇지 않다면 비효율적인 비용 증가일 수 있으니 재무제표의 판관비·R&D 항목을 확인해 보세요.'
                    : '갭이 줄었다는 것은 판관비·R&D 부담이 상대적으로 줄었다는 뜻입니다. 비용 효율이 좋아졌거나, 매출이 더 빠르게 늘어나서 고정비 비중이 낮아진 경우입니다.'}
                </p>
              </div>
              <div className="rounded-md bg-background/60 border border-border/60 p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">③ OPM→NPM 갭 변화: {dGapOpmNpm >= 0 ? '+' : ''}{dGapOpmNpm.toFixed(1)}%p {dGapOpmNpm < 0 ? '축소' : '확대'}</p>
                <p className="text-xs text-muted-foreground mb-2">
                  갭 = OPM − NPM (%p). 전년 대비 갭이 얼마나 달라졌는지: <span className="font-mono">{curr.year}년 갭 {curr.gapOpmNpm.toFixed(1)}%p − {prev.year}년 갭 {prev.gapOpmNpm.toFixed(1)}%p = {dGapOpmNpm >= 0 ? '+' : ''}{dGapOpmNpm.toFixed(1)}%p</span>
                </p>
                <p className="text-sm text-foreground">
                  {dGapOpmNpm < 0
                    ? '갭이 줄었다는 것은 이자비용이나 세금이 매출 대비 덜 먹고 있다는 뜻입니다. 부채를 줄였거나, 이자 부담이 낮아졌거나, 세금 효율이 나아진 경우일 수 있습니다.'
                    : '갭이 커졌다는 것은 이자비용이나 세금이 매출 대비 더 많이 쓰였다는 뜻입니다. 부채가 늘어 이자가 많아졌거나, 일회성 세금 요인이 있을 수 있으니 재무상태표와 세금 관련 주석을 확인해 보세요.'}
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 마진 갭 분석 */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/60 px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">마진 갭 분석</h3>
          <p className="text-xs text-muted-foreground mt-1.5">
            갭이 <strong className="text-foreground">크면</strong> 해당 구간(판관비·R&D 또는 이자·세금)의 부담이 크다는 뜻이고, <strong className="text-foreground">갭이 줄어들면</strong> 비용·부채·세금 부담이 상대적으로 줄어든 것입니다. 갭이 해마다 <strong className="text-foreground">늘어나면</strong> 매출은 늘어도 그만큼 비용이 더 빠르게 늘고 있다는 신호이므로, 원인(인건비·R&D·이자 등)을 확인하는 것이 좋습니다.
          </p>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">GPM → OPM 갭 (매출총이익과 영업이익 사이 = 판관비 + R&D가 먹는 비중)</p>
            <div className="space-y-1.5">
              {displayYears.map((y) => (
                <div key={y.year} className="flex items-center gap-3">
                  <span className="w-12 text-sm text-foreground">{y.year}</span>
                  <span className="text-sm font-medium w-14">{y.gapGpmOpm.toFixed(1)}%p</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden max-w-[200px]">
                    <div
                      className="h-full bg-primary/70 rounded-full"
                      style={{ width: `${Math.min(100, (y.gapGpmOpm / 30) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">OPM → NPM 갭 (영업이익과 순이익 사이 = 이자 + 세금이 먹는 비중)</p>
            <div className="space-y-1.5">
              {displayYears.map((y) => (
                <div key={y.year} className="flex items-center gap-3">
                  <span className="w-12 text-sm text-foreground">{y.year}</span>
                  <span className="text-sm font-medium w-14">{y.gapOpmNpm.toFixed(1)}%p</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden max-w-[200px]">
                    <div
                      className="h-full bg-primary/70 rounded-full"
                      style={{ width: `${Math.min(100, (y.gapOpmNpm / 15) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 인사이트 */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/60 px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">🔍 인사이트</h3>
          <p className="text-xs text-muted-foreground mt-1">
            위 마진·갭·추세를 바탕으로 자동으로 정리한 요약입니다. 처음 보시는 분도 「무슨 의미인지」「왜 중요한지」를 같이 읽어 보시면 도움이 됩니다.
          </p>
        </div>
        <ul className="p-4 space-y-3">
          {listInsights.map((item, idx) => (
            <li
              key={idx}
              className={`text-sm ${
                item.type === 'positive'
                  ? 'text-green-600 dark:text-green-400'
                  : item.type === 'warning'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-muted-foreground'
              }`}
            >
              {item.type === 'positive' && '✅ '}
              {item.type === 'warning' && '⚠️ '}
              {item.text}
            </li>
          ))}
        </ul>
        {verdictItem && (
          <div className="border-t border-border px-4 py-3 bg-muted/30">
            <p className="text-sm font-medium text-foreground">
              판정: {verdictItem.grade === 'red' ? '🔴' : verdictItem.grade === 'yellow' ? '🟡' : '🟢'} {verdictItem.text}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
