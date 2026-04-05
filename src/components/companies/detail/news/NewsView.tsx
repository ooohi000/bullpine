'use client';

import React, { useMemo, useState } from 'react';
import TypeToggle from './TypeToggle';
import StockNews from './StockNews';
import PressReleases from './PressReleases';

export type TabId = 'news' | 'press';

const LIMIT = 10;

const NewsView = ({ symbol }: { symbol: string }) => {
  const to = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [activeTab, setActiveTab] = useState<TabId>('press');

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
  };

  const tabs: { id: TabId; label: string }[] = [
    // { id: 'news', label: '뉴스' },
    { id: 'press', label: '보도자료' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <TypeToggle
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        tabs={tabs}
      />
      {/* <div
        className={activeTab === 'news' ? 'block' : 'hidden'}
        aria-hidden={activeTab !== 'news'}
      >
        <StockNews symbol={symbol} to={to} limit={LIMIT} />
      </div> */}
      <div
        className={activeTab === 'press' ? 'block' : 'hidden'}
        aria-hidden={activeTab !== 'press'}
      >
        <PressReleases symbol={symbol} to={to} limit={LIMIT} />
      </div>
    </div>
  );
};

export default NewsView;
