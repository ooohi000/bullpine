'use client';

import React, { useState } from 'react';
import {
  Activity,
  ArrowLeft,
  Banknote,
  Building2,
  CalendarCheck,
  CircleDollarSign,
  HandCoins,
  LineChart,
  Menu,
  Newspaper,
  Percent,
  PieChart,
  Receipt,
  Scale,
  Lock,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import LoginRequiredModal from '@/components/common/LoginRequiredModal';

/** 메뉴 항목: 일반 링크 | 구분선 | 섹션 제목 */
export type VerticalMenuItem =
  | { label: string; href: string; requiresAuth?: boolean }
  | { label: 'line'; href: '' }
  | { label: 'section'; href: ''; sectionTitle: string };

interface VerticalMenuProps {
  symbol: string;
  items: VerticalMenuItem[];
  /** false이면 `requiresAuth` 링크에 잠금 표시 */
  isAuthenticated: boolean;
}

const LABEL_ICON_MAP: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  '차트 분석': LineChart,
  '재무 비율': Percent,
  '핵심 지표': Target,
  주주잉여현금흐름: HandCoins,
  '성장성 분석': TrendingUp,
  '수익성/경쟁력 분석': PieChart,
  손익계산서: Receipt,
  대차대조표: Scale,
  현금흐름표: CircleDollarSign,
  실적: CalendarCheck,
  배당: Banknote,
  뉴스: Newspaper,
  성장률: Activity,
};

const getIcon = (label: string) => LABEL_ICON_MAP[label] ?? (() => null);

const isLine = (item: VerticalMenuItem): item is { label: 'line'; href: '' } =>
  item.label === 'line';

const isSection = (
  item: VerticalMenuItem,
): item is { label: 'section'; href: ''; sectionTitle: string } =>
  item.label === 'section';

const isLink = (
  item: VerticalMenuItem,
): item is { label: string; href: string; requiresAuth?: boolean } =>
  item.label !== 'line' && item.label !== 'section';

const MenuContent = ({
  symbol,
  items,
  params,
  location,
  onBack,
  onLinkClick,
  isAuthenticated,
  onAuthRequired,
}: {
  symbol: string;
  items: VerticalMenuProps['items'];
  params: string;
  location: string;
  onBack: () => void;
  onLinkClick?: () => void;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}) => {
  return (
    <>
      <button
        onClick={onBack}
        className="w-full flex items-center justify-start gap-3 px-4 pt-8 pb-4 text-foreground cursor-pointer hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-5 h-5 shrink-0" />
        <span className="text-base font-medium">뒤로 가기</span>
      </button>
      <h2
        className={`flex items-center gap-3 px-4 py-2.5 mb-2 text-base font-medium text-foreground hover:text-primary transition-colors ${
          location === `/companies/${symbol}` ? '!text-primary !font-bold' : ''
        }`}
      >
        <Link
          href={`/companies/${symbol}?${params}`}
          className="flex items-center gap-3 w-full"
          onClick={onLinkClick}
        >
          <Building2 className="w-5 h-5 shrink-0" />
          <span>{symbol} 프로필</span>
        </Link>
      </h2>
      <ul className="flex flex-col gap-0.5">
        {items.map((item, index) => {
          if (isLine(item)) {
            return (
              <li
                key={`line-${index}`}
                className="border-b border-border my-2"
                aria-hidden
              />
            );
          }
          if (isSection(item)) {
            return (
              <li
                key={`section-${item.sectionTitle}-${index}`}
                className="px-4 pt-3 pb-1"
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {item.sectionTitle}
                </span>
              </li>
            );
          }
          if (!isLink(item)) return null;
          const Icon = getIcon(item.label);
          const isActive = location === item.href;
          const locked = item.requiresAuth && !isAuthenticated;
          return (
            <li
              key={`${item.label}-${item.href}`}
              className={`flex items-center min-h-[44px] text-base font-medium text-foreground transition-colors ${
                isActive && !locked ? '!text-primary !font-bold' : ''
              } ${locked ? 'opacity-70' : 'hover:text-primary'}`}
            >
              {locked ? (
                <button
                  type="button"
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-left cursor-pointer rounded-md hover:bg-muted/60 transition-colors"
                  onClick={() => {
                    onAuthRequired();
                    onLinkClick?.();
                  }}
                  title="로그인 후 이용할 수 있습니다"
                  aria-label={`${item.label}, 로그인 필요`}
                >
                  {Icon ? <Icon className="w-5 h-5 shrink-0" /> : null}
                  <span className="flex-1">{item.label}</span>
                  <Lock
                    className="w-4 h-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                </button>
              ) : (
                <Link
                  href={`${item.href}?${params}`}
                  className="flex items-center gap-3 w-full px-4 py-2.5"
                  onClick={onLinkClick}
                >
                  {Icon ? <Icon className="w-5 h-5 shrink-0" /> : null}
                  <span className="flex-1">{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
};

const VerticalMenu = ({
  symbol,
  items,
  isAuthenticated,
}: VerticalMenuProps) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const params = searchParams.get('search')
    ? `page=${searchParams.get('page')}&search=${searchParams.get('search')}`
    : `page=${searchParams.get('page')}`;
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleBack = () => {
    router.push(`/companies?${params}`);
  };

  return (
    <>
      <LoginRequiredModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
      {/* 모바일: 상단 바 + 햄버거 */}
      <div className="md:hidden h-12 shrink-0 border-b border-border bg-muted/80 flex items-center px-4">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="p-2 -ml-2 text-foreground hover:text-primary transition-colors rounded-md"
          aria-label="메뉴 열기"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* 모바일: 드로어 오버레이 */}
      {drawerOpen && (
        <button
          type="button"
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setDrawerOpen(false)}
          aria-label="메뉴 닫기"
        />
      )}

      {/* 모바일: 드로어 패널 */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-[min(280px,85vw)] bg-muted/95 border-r border-border z-50 flex flex-col pt-2 transition-transform duration-200 ease-out ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 pb-2 border-b border-border">
          <span className="text-sm font-medium text-muted-foreground">
            메뉴
          </span>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="p-2 -mr-2 text-foreground hover:text-primary transition-colors rounded-md"
            aria-label="메뉴 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <MenuContent
            symbol={symbol}
            items={items}
            params={params}
            location={pathname}
            onBack={handleBack}
            onLinkClick={() => setDrawerOpen(false)}
            isAuthenticated={isAuthenticated}
            onAuthRequired={() => setLoginModalOpen(true)}
          />
        </div>
      </div>

      {/* 데스크톱: 세로 메뉴 (스크롤 시에도 고정) */}
      <aside
        className="hidden md:flex fixed top-0 left-0 h-screen w-[180px] shrink-0 flex-col bg-muted/80 border-r border-border overflow-y-auto z-30"
        aria-label="회사 하위 메뉴"
      >
        <MenuContent
          symbol={symbol}
          items={items}
          params={params}
          location={pathname}
          onBack={handleBack}
          isAuthenticated={isAuthenticated}
          onAuthRequired={() => setLoginModalOpen(true)}
        />
      </aside>
    </>
  );
};

export default VerticalMenu;
