'use client';

import React, { useState } from 'react';
import CyclicalVolatilitySection from './CyclicalVolatilitySection';
import EpsVsRevenueGrowthSection from './EpsVsRevenueGrowthSection';
import OperatingIncomeGrowthSection from './OperatingIncomeGrowthSection';
import RevenueGrowthSection from './RevenueGrowthSection';
import RevenueQoqSection from './RevenueQoqSection';
import RevenueSlowdownSection from './RevenueSlowdownSection';
import SustainabilityScoreSection from './SustainabilityScoreSection';

/** 성장성 분석 하위 항목: 핵심 4개 + 세부 3개 */
const GROWTH_SECTIONS_CORE = [
  {
    id: 'revenue-cagr' as const,
    title: '매출 3년/5년 CAGR',
    short: '매출 CAGR',
  },
  {
    id: 'operating-income-yoy' as const,
    title: '영업이익 성장 추세 (YoY)',
    short: '영업이익 YoY',
  },
  {
    id: 'eps-vs-revenue' as const,
    title: 'EPS vs 매출 성장률 괴리',
    short: 'EPS·매출 괴리',
  },
  {
    id: 'revenue-qoq' as const,
    title: '분기별 매출 가속/감속 (QoQ)',
    short: '분기 가속/감속',
  },
];
const GROWTH_SECTIONS_SUB = [
  {
    id: 'revenue-slowdown' as const,
    title: '매출 둔화 초기 경고',
    short: '둔화 경고',
  },
  {
    id: 'sustainability-score' as const,
    title: '성장 지속 가능성 점수',
    short: '지속가능성 점수',
  },
  {
    id: 'cyclical-volatility' as const,
    title: '경기민감 업종 매출 변동성',
    short: '경기민감 변동성',
  },
];
const GROWTH_SECTIONS = [...GROWTH_SECTIONS_CORE, ...GROWTH_SECTIONS_SUB];

type GrowthSectionId = (typeof GROWTH_SECTIONS)[number]['id'];

interface GrowthAnalysisViewProps {
  symbol: string;
}

const sectionStyle = (isActive: boolean) =>
  `rounded-lg px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border ${
    isActive
      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
      : 'bg-muted/40 text-muted-foreground border-transparent hover:bg-muted/70 hover:text-foreground'
  }`;

export default function GrowthAnalysisView({
  symbol,
}: GrowthAnalysisViewProps) {
  const [activeId, setActiveId] = useState<GrowthSectionId>('revenue-cagr');
  const active = GROWTH_SECTIONS.find((s) => s.id === activeId)!;

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 w-full max-w-4xl">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            핵심 지표
          </p>
          <div className="flex flex-wrap gap-2">
            {GROWTH_SECTIONS_CORE.map(({ id, title }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveId(id)}
                className={sectionStyle(activeId === id)}
              >
                {title}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            참조 지표
          </p>
          <div className="flex flex-wrap gap-2">
            {GROWTH_SECTIONS_SUB.map(({ id, title }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveId(id)}
                className={sectionStyle(activeId === id)}
              >
                {title}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border bg-muted/60 px-5 py-3">
          <h2 className="text-base font-semibold text-foreground">
            {active.title}
          </h2>
        </div>
        <div className="p-4 md:p-5">
          {activeId === 'revenue-cagr' && (
            <RevenueGrowthSection symbol={symbol} />
          )}
          {activeId === 'operating-income-yoy' && (
            <OperatingIncomeGrowthSection symbol={symbol} />
          )}
          {activeId === 'eps-vs-revenue' && (
            <EpsVsRevenueGrowthSection symbol={symbol} />
          )}
          {activeId === 'revenue-qoq' && <RevenueQoqSection symbol={symbol} />}
          {activeId === 'revenue-slowdown' && (
            <RevenueSlowdownSection symbol={symbol} />
          )}
          {activeId === 'sustainability-score' && (
            <SustainabilityScoreSection symbol={symbol} />
          )}
          {activeId === 'cyclical-volatility' && (
            <CyclicalVolatilitySection symbol={symbol} />
          )}
          {activeId !== 'revenue-cagr' &&
            activeId !== 'operating-income-yoy' &&
            activeId !== 'eps-vs-revenue' &&
            activeId !== 'revenue-qoq' &&
            activeId !== 'revenue-slowdown' &&
            activeId !== 'sustainability-score' &&
            activeId !== 'cyclical-volatility' && (
              <p className="text-sm text-muted-foreground">
                {symbol.toUpperCase()} 기준 분석 데이터가 곧 제공됩니다.
              </p>
            )}
        </div>
      </div>
    </section>
  );
}
