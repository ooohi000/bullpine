'use client';

import React from 'react';
import Highcharts from 'highcharts/highstock';
import addAccessibility from 'highcharts/modules/accessibility';
import HighchartsReact from 'highcharts-react-official';

// addAccessibility(Highcharts);
import type { Options } from 'highcharts';
import type { Chart } from 'highcharts';

interface HighchartsChartProps {
  options: Options;
  className?: string;
  /** 차트 생성 직후 콜백 (예: 이벤트 등록) */
  callback?: (chart: Chart) => void;
}

const HighchartsChart = ({
  options,
  className,
  callback,
}: HighchartsChartProps) => {
  return (
    <div className={className}>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        callback={callback}
      />
    </div>
  );
};

export default HighchartsChart;
