'use client';

import React from 'react';

export type ChartsAnalysisTabId = 'stockPriceAndVolume' | 'enterpriseValues';

interface ChartsAnalysisTabsProps {
  activeTab: ChartsAnalysisTabId;
  onTabChange: (tab: ChartsAnalysisTabId) => void;
}

const TABS: { id: ChartsAnalysisTabId; label: string }[] = [
  { id: 'stockPriceAndVolume', label: '주가 · 거래량' },
  { id: 'enterpriseValues', label: '주가 · 기업가치' },
];

const ChartsAnalysisTabs = ({
  activeTab,
  onTabChange,
}: ChartsAnalysisTabsProps) => {
  return (
    <div className="flex gap-1 rounded-lg border border-border bg-muted/50 p-1 w-fit">
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onTabChange(id)}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === id
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default ChartsAnalysisTabs;
