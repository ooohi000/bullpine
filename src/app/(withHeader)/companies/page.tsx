import { redirect } from 'next/navigation';
import CompaniesClient from '@/components/companies/CompaniesClient';
import React from 'react';
import { cookies } from 'next/headers';
import { AUTH_ACCESS_TOKEN_COOKIE } from '@/constants/authCookies';

type CompaniesPageProps = {
  searchParams: { page?: string; search?: string };
};

/** `page` 없음·무효 시 한 번만 서버 리다이렉트 → RSC 이중 요청 방지 */
export default function CompaniesPage({ searchParams }: CompaniesPageProps) {
  const raw = searchParams.page;
  const pageNum = raw !== undefined && raw !== '' ? Number(raw) : NaN;
  const valid = Number.isFinite(pageNum) && pageNum >= 1;

  if (!valid) {
    const qs = new URLSearchParams();
    qs.set('page', '1');
    if (searchParams.search) qs.set('search', searchParams.search);
    redirect(`/companies?${qs.toString()}`);
  }

  return (
    <React.Fragment>
      <div className="pointer-events-none z-10 h-1 bg-chart-up"></div>
      <div className="min-h-[calc(100vh-4rem)] px-4 py-8">
        <CompaniesClient />
      </div>
    </React.Fragment>
  );
}
