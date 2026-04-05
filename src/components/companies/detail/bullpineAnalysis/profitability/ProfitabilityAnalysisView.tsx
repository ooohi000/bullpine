'use client';

import React, { useState } from 'react';
import MarginTrendSection from './MarginTrendSection';
import RoicTrendSection from './RoicTrendSection';
import RoeDupontSection from './RoeDupontSection';
import EffectiveTaxSection from './EffectiveTaxSection';
import PricingPowerSection from './PricingPowerSection';
import CostPressureSection from './CostPressureSection';
import CompetitionRiskSection from './CompetitionRiskSection';

/** 수익성/경쟁력 분석: 핵심 지표(⭐) 4개 + 참조 지표(▫️) 3개 */
const PROFITABILITY_SECTIONS_CORE = [
  { id: 'margin-trend' as const, title: 'Gross / Operating / Net Margin 추세 (3~5년)', short: '마진 추세' },
  { id: 'roic-trend' as const, title: 'ROIC 3~5년 추세', short: 'ROIC 추세' },
  { id: 'roe-dupont' as const, title: 'ROE 상승 원인 분해 (DuPont)', short: 'ROE DuPont' },
  { id: 'effective-tax' as const, title: '세금 실효세율 이상 감지', short: '실효세율 감지' },
];
const PROFITABILITY_SECTIONS_REF = [
  { id: 'pricing-power' as const, title: '가격 결정력 추정 (마진 안정성 기반)', short: '가격 결정력' },
  { id: 'cost-pressure' as const, title: '원가 압박 초기 신호 (Gross Margin 선행 하락)', short: '원가 압박 신호' },
  { id: 'competition-risk' as const, title: '경쟁 심화 가능성 감지', short: '경쟁 심화 감지' },
];
const PROFITABILITY_SECTIONS = [...PROFITABILITY_SECTIONS_CORE, ...PROFITABILITY_SECTIONS_REF];

type ProfitabilitySectionId = (typeof PROFITABILITY_SECTIONS)[number]['id'];

interface ProfitabilityAnalysisViewProps {
  symbol: string;
}

const sectionStyle = (isActive: boolean) =>
  `rounded-lg px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border ${
    isActive
      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
      : 'bg-muted/40 text-muted-foreground border-transparent hover:bg-muted/70 hover:text-foreground'
  }`;

export default function ProfitabilityAnalysisView({ symbol }: ProfitabilityAnalysisViewProps) {
  const [activeId, setActiveId] = useState<ProfitabilitySectionId>('margin-trend');
  const active = PROFITABILITY_SECTIONS.find((s) => s.id === activeId)!;

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 w-full max-w-4xl">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">핵심 지표</p>
          <div className="flex flex-wrap gap-2">
            {PROFITABILITY_SECTIONS_CORE.map(({ id, title }) => (
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
          <p className="text-xs font-medium text-muted-foreground mb-2">참조 지표</p>
          <div className="flex flex-wrap gap-2">
            {PROFITABILITY_SECTIONS_REF.map(({ id, title }) => (
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
          <h2 className="text-base font-semibold text-foreground">{active.title}</h2>
        </div>
        <div className="p-4 md:p-5">
          {activeId === 'margin-trend' && <MarginTrendSection symbol={symbol} />}
          {activeId === 'roic-trend' && <RoicTrendSection symbol={symbol} />}
          {activeId === 'roe-dupont' && <RoeDupontSection symbol={symbol} />}
          {activeId === 'effective-tax' && <EffectiveTaxSection symbol={symbol} />}
          {activeId === 'pricing-power' && <PricingPowerSection symbol={symbol} />}
          {activeId === 'cost-pressure' && <CostPressureSection symbol={symbol} />}
          {activeId === 'competition-risk' && <CompetitionRiskSection symbol={symbol} />}
        </div>
      </div>
    </section>
  );
}
