import React from 'react';
import CompanyProfile from '@/components/companies/detail/profile/CompanyProfile';
import CompanyEmployeeCount from '@/components/companies/detail/profile/CompanyEmployeeCount';
import StockPeerComparison from '@/components/companies/detail/profile/StockPeerComparison';
import RevenueProductSegmentation from '@/components/companies/detail/profile/RevenueProductSegmentation';
import ExecutiveCompensation from '@/components/companies/detail/profile/ExecutiveCompensation';
import { loadCompanyProfile } from '@/services/companies/profile/loadCompanyProfile';
import { getCompanyEmployeeCount } from '@/services/companies/profile/getCompanyEmployeeCount';
import { getStockPeerComparison } from '@/services/companies/profile/getStockPeerComparison';
import { getExchangeRateService } from '@/services/exchangeRate/getExchangeRateService';
import { getRevenueProductSegmentation } from '@/services/companies/profile/getRevenueProductSegmentation';
import getShareFloat from '@/services/companies/profile/getShareFloat';
import { getExecutives } from '@/services/companies/executives/getExecutives';

interface CompanyDetailPageProps {
  params: Promise<{ symbol: string }> | { symbol: string };
}

const CompanyDetailPage = async ({ params }: CompanyDetailPageProps) => {
  // Next.js 15+에서는 params가 Promise일 수 있으므로 await 처리
  const resolvedParams = await Promise.resolve(params);
  const { symbol } = resolvedParams;

  const companyProfile = await loadCompanyProfile({ symbol });
  const employeeCount = await getCompanyEmployeeCount({
    symbol,
    limit: 5,
  });
  const stockPeerComparison = await getStockPeerComparison({
    symbol,
  });
  const exchangeRate = await getExchangeRateService();
  const revenueProductSegmentation = await getRevenueProductSegmentation({
    symbol,
    period: 'annual',
  });
  const shareFloat = await getShareFloat({ symbol });
  const executives = await getExecutives({
    symbol,
    active: true,
  });

  return (
    <div className="flex flex-col gap-8">
      {companyProfile.success ? (
        <CompanyProfile
          companyProfile={companyProfile.data[0] ?? []}
          exchangeRate={exchangeRate.data.price ?? null}
          shareFloat={shareFloat.data[0] ?? []}
        />
      ) : (
        <div className="rounded-lg border border-border bg-card px-4 py-6 text-center text-muted-foreground">
          회사 프로필을 찾을 수 없습니다.
        </div>
      )}
      {revenueProductSegmentation.data.length > 0 ? (
        <div>
          <RevenueProductSegmentation
            revenueProductSegmentation={revenueProductSegmentation.data ?? []}
            exchangeRate={exchangeRate.data.price ?? null}
          />
        </div>
      ) : null}
      {employeeCount.data.length > 0 ? (
        <div className="min-w-0 flex-1">
          <CompanyEmployeeCount employeeCount={employeeCount.data ?? []} />
        </div>
      ) : null}
      {executives.data.length > 0 ? (
        <ExecutiveCompensation
          executives={executives.data ?? []}
          exchangeRate={exchangeRate.data.price ?? null}
        />
      ) : null}
      {stockPeerComparison.data.length > 0 ? (
        <StockPeerComparison
          stockPeerComparison={stockPeerComparison.data ?? []}
        />
      ) : null}
    </div>
  );
};

export default CompanyDetailPage;
