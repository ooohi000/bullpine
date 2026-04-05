import VerticalMenu, {
  type VerticalMenuItem,
} from '@/components/common/VerticalMenu';
import { isAuthenticated } from '@/lib/server/isAuthenticated';
import { loadCompanyProfile } from '@/services/companies/profile/loadCompanyProfile';
import { notFound } from 'next/navigation';

interface CompanyDetailLayoutProps {
  children: React.ReactNode;
  params: Promise<{ symbol: string }> | { symbol: string };
}

export default async function CompanyDetailLayout({
  children,
  params,
}: CompanyDetailLayoutProps) {
  const resolvedParams = await Promise.resolve(params);
  const { symbol } = resolvedParams;
  const authed = isAuthenticated();

  const profile = await loadCompanyProfile({ symbol });
  if (
    !profile.success ||
    !Array.isArray(profile.data) ||
    profile.data.length === 0
  ) {
    notFound();
  }


  const items: VerticalMenuItem[] = [
    { label: 'line', href: '' },
    { label: 'section', href: '', sectionTitle: '재무제표' },
    { label: '대차대조표', href: `/companies/${symbol}/balanceSheet` },
    { label: '손익계산서', href: `/companies/${symbol}/income` },
    { label: '현금흐름표', href: `/companies/${symbol}/cashFlow` },
    { label: 'section', href: '', sectionTitle: '재무 분석' },
    {
      label: '재무 비율',
      href: `/companies/${symbol}/financialRatios`,
      requiresAuth: true,
    },
    {
      label: '핵심 지표',
      href: `/companies/${symbol}/keyMetrics`,
      requiresAuth: true,
    },
    { label: 'section', href: '', sectionTitle: '실적·배당' },
    {
      label: '실적',
      href: `/companies/${symbol}/earnings`,
      requiresAuth: true,
    },
    {
      label: '배당',
      href: `/companies/${symbol}/dividends`,
      requiresAuth: true,
    },
    { label: 'line', href: '' },
    { label: 'section', href: '', sectionTitle: '기타' },
    {
      label: '뉴스',
      href: `/companies/${symbol}/news`,
      requiresAuth: true,
    },
    // { label: 'line', href: '' },
    // { label: 'section', href: '', sectionTitle: '차트·가격' },
    // { label: '차트 분석', href: `/companies/${symbol}/chartsAnalysis` },
    // { label: 'line', href: '' },
    // { label: 'section', href: '', sectionTitle: '재무 분석' },
    // { label: '재무 비율', href: `/companies/${symbol}/financialRatios` },
    // { label: '핵심 지표', href: `/companies/${symbol}/keyMetrics` },
    // { label: '주주잉여현금흐름', href: `/companies/${symbol}/ownerEarnings` },
    // { label: 'line', href: '' },
    // { label: 'section', href: '', sectionTitle: '불파인 분석' },
    // {
    //   label: '성장성 분석',
    //   href: `/companies/${symbol}/bullpineAnalysis/growth`,
    // },
    // {
    //   label: '수익성/경쟁력 분석',
    //   href: `/companies/${symbol}/bullpineAnalysis/profitability`,
    // },
    // { label: 'line', href: '' },
    // { label: 'section', href: '', sectionTitle: '재무제표' },
    // { label: '손익계산서', href: `/companies/${symbol}/income` },
    // { label: '대차대조표', href: `/companies/${symbol}/balanceSheet` },
    // { label: '현금흐름표', href: `/companies/${symbol}/cashFlow` },
    // { label: 'line', href: '' },
    // { label: 'section', href: '', sectionTitle: '실적·배당' },
    // { label: '실적', href: `/companies/${symbol}/earnings` },
    // { label: '배당', href: `/companies/${symbol}/dividends` },
    // { label: 'line', href: '' },
    // { label: 'section', href: '', sectionTitle: '기타' },
    // { label: '뉴스', href: `/companies/${symbol}/news` },
    // { label: '성장률', href: `/companies/${symbol}/growth` },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <VerticalMenu
        symbol={symbol}
        items={items}
        isAuthenticated={authed}
      />
      {/* 데스크톱: 고정 메뉴(180px)만큼 왼쪽 여백 */}
      <main className="flex-1 min-w-0 h-auto pt-4 pb-12 px-3 md:px-8 md:pr-8 md:ml-[180px]">
        {children}
      </main>
    </div>
  );
}
