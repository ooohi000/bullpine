import { redirect } from 'next/navigation';
import CompaniesClient from '@/components/companies/CompaniesClient';
import MaintenanceNotice from '@/components/common/MaintenanceNotice';
import { isMaintenanceWindow } from '@/lib/server/isMaintenanceWindow';
import React from 'react';
import { getExchangeRateService } from '@/services/exchangeRate/getExchangeRateService';

type CompaniesPageProps = {
  searchParams: { page?: string; search?: string };
};

/** `page` 없음·무효 시 한 번만 서버 리다이렉트 → RSC 이중 요청 방지 */
const CompaniesPage = async ({ searchParams }: CompaniesPageProps) => {
  if (isMaintenanceWindow()) {
    return <MaintenanceNotice />;
  }

  const raw = searchParams.page;
  const pageNum = raw !== undefined && raw !== '' ? Number(raw) : NaN;
  const valid = Number.isFinite(pageNum) && pageNum >= 1;

  const exchangeRate = await getExchangeRateService();

  if (!valid) {
    const qs = new URLSearchParams();
    qs.set('page', '1');
    if (searchParams.search) qs.set('search', searchParams.search);
    redirect(`/companies?${qs.toString()}`);
  }

  return (
    <React.Fragment>
      <div className="pointer-events-none z-10 h-1 bg-chart-up"></div>
      <div className="min-h-[calc(100vh-4rem)]">
        <CompaniesClient exchangeRate={exchangeRate.data ?? null} />
      </div>
    </React.Fragment>
  );
};

export default CompaniesPage;
