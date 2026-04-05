'use client';

import React, { useMemo, useState } from 'react';
import useEnterpriseValues from '@/hooks/api/companies/chartsAnalysis/useEnterpriseValues';
import ChartsAnalysisTabs, { ChartsAnalysisTabId } from './ChartsAnalysisTabs';
import StockPriceAndVolumeSection from './StockPriceAndVolumeSection';
import StockPriceAndEnterpriseValuesSection from './StockPriceAndEnterpriseValuesSection';

interface ChartsAnalysisViewProps {
  symbol: string;
}

const ChartsAnalysisView = ({ symbol }: ChartsAnalysisViewProps) => {
  const [activeTab, setActiveTab] = useState<ChartsAnalysisTabId>(
    'stockPriceAndVolume',
  );

  return (
    <div className="flex flex-col gap-8">
      <ChartsAnalysisTabs activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'stockPriceAndVolume' && (
        <StockPriceAndVolumeSection symbol={symbol} />
      )}
      {activeTab === 'enterpriseValues' && (
        <StockPriceAndEnterpriseValuesSection symbol={symbol} />
      )}
    </div>
  );
};

export default ChartsAnalysisView;
