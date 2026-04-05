import HighchartsChart from '@/components/common/HighchartsChart';
import { chartSeriesColor } from '@/constants/chartSeriesColors';
import { CompanyEmployeeCount as CompanyEmployeeCountType } from '@/types/profile';
import React from 'react';

const CompanyEmployeeCount = ({
  employeeCount,
}: {
  employeeCount: CompanyEmployeeCountType[];
}) => {
  const sortedEmployeeCount = [...employeeCount].sort(
    (a, b) =>
      new Date(a.periodOfReport).getTime() -
      new Date(b.periodOfReport).getTime()
  );
  const options = {
    chart: {
      type: 'column',
      height: 250,
      backgroundColor: 'transparent',
      spacing: [12, 12, 15, 12],
    },
    title: { text: '' },
    legend: { enabled: false },
    credits: { enabled: false },
    plotOptions: {
      column: {
        borderRadius: 4,
        pointPadding: 0.15,
        groupPadding: 0.2,
      },
    },
    yAxis: {
      title: { text: '' },
      allowDecimals: false,
      gridLineColor: 'hsl(220, 15%, 20%)',
      labels: {
        style: { color: 'hsl(215, 20%, 70%)', fontSize: '11px' },
      },
    },
    xAxis: {
      categories: sortedEmployeeCount.map((item) => {
        const d = item.periodOfReport;
        return d.length >= 4 ? d.slice(0, 4) : d; // "2024-12-31" → "2024"
      }),
      gridLineColor: 'hsl(220, 15%, 20%)',
      labels: {
        style: { color: 'hsl(215, 20%, 70%)', fontSize: '11px' },
      },
    },
    tooltip: {
      backgroundColor: 'hsl(220, 23%, 10%)',
      borderColor: 'hsl(220, 15%, 20%)',
      style: { color: 'hsl(210, 20%, 96%)' },
      pointFormat: '<b>정규직 수</b>: {y:,.0f}명',
    },
    series: [
      {
        type: 'column' as const,
        name: '정규직 수',
        data: sortedEmployeeCount.map((item) => item.employeeCount),
        color: chartSeriesColor(0),
      },
    ],
  };

  return (
    <div className="flex flex-1 flex-col gap-3">
      <h2 className="text-lg font-bold text-foreground">정규직 수 추이</h2>
      <div className="min-h-[250px] w-full">
        <HighchartsChart options={options} className="w-full" />
      </div>
    </div>
  );
};

export default CompanyEmployeeCount;
