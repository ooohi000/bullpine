'use client';

import React from 'react';
import HighchartsChart from '@/components/common/HighchartsChart';
import { chartSeriesColor } from '@/constants/chartSeriesColors';
import type { Options } from 'highcharts';
import { OwnerEarningsItem } from '@/types/financialAnalysis';

interface OwnerEarningsChartProps {
  sortedData: OwnerEarningsItem[];
}

const OwnerEarningsChart = ({ sortedData }: OwnerEarningsChartProps) => {
  const categories = sortedData.map((item) => {
    if (item.period === 'Q1') {
      return `${Number(item.fiscalYear) - 1}년<br/>1분기`;
    }
    return `${item.period.split('').reverse().join('').replace('Q', '분기')}`;
  });
  const ownersEarningsData = sortedData
    .filter((item) => Number(item.date.split('-')[0]) > 2020)
    .map((item) => item.ownersEarnings);
  const perShareData = sortedData.map((item) => item.ownersEarningsPerShare);

  const options: Options = {
    chart: {
      type: 'column',
      height: 360,
      backgroundColor: 'transparent',
      spacing: [12, 12, 20, 12],
    },
    title: { text: '' },
    legend: {
      enabled: true,
      align: 'center',
      verticalAlign: 'bottom',
      itemStyle: { color: 'hsl(215, 20%, 70%)', fontSize: '12px' },
      itemDistance: 16,
    },
    credits: { enabled: false },
    xAxis: {
      categories,
      crosshair: true,
      labels: {
        useHTML: true,
        style: { color: 'hsl(215, 20%, 70%)', fontSize: '12px' },
      },
      tickLength: 4,
      lineWidth: 1,
      lineColor: 'hsl(220, 15%, 20%)',
    },
    yAxis: [
      {
        title: {
          text: '',
        },
        opposite: false,
        gridLineColor: 'hsl(220, 15%, 18%)',
        plotLines: [
          {
            value: 0,
            width: 1,
            color: 'hsl(220, 15%, 20%)',
            zIndex: 2,
          },
        ],
        labels: {
          style: { color: 'hsl(215, 20%, 70%)', fontSize: '12px' },
          formatter: function () {
            const v = Math.abs(this.value as number);
            if (v >= 1e9) return `${(this.value as number) / 1e9}B`;
            if (v >= 1e6) return `${(this.value as number) / 1e6}M`;
            if (v >= 1e3) return `${(this.value as number) / 1e3}k`;
            return String(this.value);
          },
        },
      },
      {
        title: {
          text: '',
        },
        opposite: true,
        gridLineColor: 'transparent',
        labels: {
          style: { color: 'hsl(215, 20%, 70%)', fontSize: '12px' },
          format: '{value:,.2f}',
        },
      },
    ],
    tooltip: {
      backgroundColor: 'hsl(220, 23%, 10%)',
      borderColor: 'hsl(220, 15%, 20%)',
      style: { color: 'hsl(210, 20%, 96%)', fontSize: '12px' },
      shared: true,
      useHTML: true,
      formatter: function () {
        const points = this.points ?? [];
        const lines = points.map(
          (p) =>
            `<span style="color:${p.color}">●</span> ${p.series.name}: <b>${p.y != null ? (p.series.name === '주당 주주잉여현금흐름' ? Number(p.y).toFixed(2) : Number(p.y).toLocaleString()) : '-'}</b>`,
        );
        return `<div class="flex flex-col gap-1">${lines.join('<br/>')}</div>`;
      },
    },
    plotOptions: {
      column: {
        borderRadius: 4,
        pointPadding: 0.12,
        groupPadding: 0.2,
        borderWidth: 0,
        shadow: false,
        dataLabels: {
          enabled: false,
        },
      },
      line: {
        lineWidth: 2,
        marker: {
          radius: 4,
          symbol: 'circle',
        },
        dataLabels: { enabled: false },
      },
    },
    series: [
      {
        type: 'column',
        name: '주주잉여현금흐름',
        data: ownersEarningsData,
        color: chartSeriesColor(0),
        yAxis: 0,
      },
      {
        type: 'line',
        name: '주당 주주잉여현금흐름',
        data: perShareData,
        color: chartSeriesColor(1),
        yAxis: 1,
      },
    ],
  };

  return (
    <div className="min-h-[360px] w-full">
      <HighchartsChart options={options} className="w-full" />
    </div>
  );
};

export default OwnerEarningsChart;
