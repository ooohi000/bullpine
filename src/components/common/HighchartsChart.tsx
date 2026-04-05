'use client';

import React from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import type { Options } from 'highcharts';

interface HighchartsChartProps {
  options: Options;
  className?: string;
  /** 차트 설명 (스크린 리더·접근성) */
}

const HighchartsChart = ({ options, className }: HighchartsChartProps) => {
  return (
    <div className={className}>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

export default HighchartsChart;
