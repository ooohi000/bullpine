'use client';

import React, { useEffect, useState } from 'react';
import Search from '@/components/layout/Search';
import {
  COMPANIES,
  EXCHANGE_FALLBACK,
  INDUSTRY_FALLBACK,
  SECTOR_FALLBACK,
} from '@/constants';
import CompaniesTable from './CompaniesTable';
import { useRouter, useSearchParams } from 'next/navigation';
import Pagination from '../common/Pagination';
import useStockList from '@/hooks/api/stocks/useStockList';
import Select, { SelectOption } from '../common/Select';
import { ExchangeRate } from '@/types';

const CompaniesClient = ({
  exchangeRate,
}: {
  exchangeRate: ExchangeRate | null;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  /** 입력창 전용. 목록 검색어는 URL(`search` 쿼리)만 사용 → 타이핑마다 API 호출 없음, 뒤로가기와 일치 */
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const urlSearch = searchParams.get('search') ?? '';
  const [selectedExchange, setSelectedExchange] = useState<SelectOption>(
    EXCHANGE_FALLBACK[0],
  );
  const [selectedSector, setSelectedSector] = useState<SelectOption>(
    SECTOR_FALLBACK[0],
  );
  const [selectedIndustry, setSelectedIndustry] = useState<SelectOption>(
    INDUSTRY_FALLBACK[0],
  );
  const [page, setPage] = useState(
    Number(searchParams.get('page')) ? Number(searchParams.get('page')) : 1,
  );
  const LIMIT = COMPANIES.DEFAULT_PAGE_SIZE;
  const setSearchHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const { data, isLoading, refetch, isFetching } = useStockList({
    search: urlSearch,
    page: page - 1,
    limit: LIMIT,
    exchange: selectedExchange.value,
    sector: selectedSector.value,
    industry: selectedIndustry.value,
  });

  const handleExchangeSelect = (value: SelectOption) => {
    const params = new URLSearchParams(searchParams);
    const search = params.get('search') || '';
    search ? params.set('search', search) : params.delete('search');
    params.set('page', '1');
    value.value
      ? params.set('exchange', value.value)
      : params.delete('exchange');
    selectedSector.value
      ? params.set('sector', selectedSector.value)
      : params.delete('sector');
    selectedIndustry.value
      ? params.set('industry', selectedIndustry.value)
      : params.delete('industry');
    router.push(`/companies?${params.toString()}`);
    setSelectedExchange(value);
  };

  const handleSectorSelect = (value: SelectOption) => {
    const params = new URLSearchParams(searchParams);
    const search = params.get('search') || '';
    search ? params.set('search', search) : params.delete('search');
    params.set('page', '1');
    selectedExchange.value
      ? params.set('exchange', selectedExchange.value)
      : params.delete('exchange');
    value.value ? params.set('sector', value.value) : params.delete('sector');
    selectedIndustry.value
      ? params.set('industry', selectedIndustry.value)
      : params.delete('industry');
    router.push(`/companies?${params.toString()}`);
    setSelectedSector(value);
  };

  const handleIndustrySelect = (value: SelectOption) => {
    const params = new URLSearchParams(searchParams);
    const search = params.get('search') || '';
    search ? params.set('search', search) : params.delete('search');
    params.set('page', '1');
    selectedExchange.value
      ? params.set('exchange', selectedExchange.value)
      : params.delete('exchange');
    selectedSector.value
      ? params.set('sector', selectedSector.value)
      : params.delete('sector');
    value.value
      ? params.set('industry', value.value)
      : params.delete('industry');
    router.push(`/companies?${params.toString()}`);
    setSelectedIndustry(value);
  };

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);
    search ? params.set('search', search) : params.delete('search');
    params.set('page', '1');
    const nextSearch = search || '';
    const currentSearch = searchParams.get('search') || '';
    const searchWillChange = nextSearch !== currentSearch;

    router.push(`/companies?${params.toString()}`);
    if (page > 1) {
      setPage(1);
    } else if (!searchWillChange) {
      // URL·queryKey가 그대로일 때만(같은 검색으로 다시 검색) 수동 새로고침
      refetch();
    }
  };

  const handlePageChange = (nextPage: number) => {
    const params = new URLSearchParams(searchParams);
    const q = params.get('search') || '';
    q ? params.set('search', q) : params.delete('search');
    params.set('page', nextPage.toString());
    selectedExchange.value
      ? params.set('exchange', selectedExchange.value)
      : params.delete('exchange');
    selectedSector.value
      ? params.set('sector', selectedSector.value)
      : params.delete('sector');
    selectedIndustry.value
      ? params.set('industry', selectedIndustry.value)
      : params.delete('industry');
    router.push(`/companies?${params.toString()}`);
    setPage(nextPage);
  };

  useEffect(() => {
    setPage(Number(searchParams.get('page')) || 1);
    setSearch(searchParams.get('search') || '');

    const ex = searchParams.get('exchange') || '';
    const se = searchParams.get('sector') || '';
    const ind = searchParams.get('industry') || '';

    setSelectedExchange(
      EXCHANGE_FALLBACK.find((o) => o.value === ex) ?? EXCHANGE_FALLBACK[0],
    );
    setSelectedSector(
      SECTOR_FALLBACK.find((o) => o.value === se) ?? SECTOR_FALLBACK[0],
    );
    setSelectedIndustry(
      INDUSTRY_FALLBACK.find((o) => o.value === ind) ?? INDUSTRY_FALLBACK[0],
    );
  }, [searchParams]);

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      {/* Search section */}
      <div className="mb-8 flex flex-col gap-5">
        <div className="w-full max-w-2xl">
          <Search
            value={search}
            onChange={setSearchHandler}
            handleSearch={handleSearch}
          />
        </div>
        <div className="hidden w-full gap-3 md:grid md:grid-cols-3">
          <Select
            selectedValue={selectedExchange}
            onSelect={handleExchangeSelect}
            options={EXCHANGE_FALLBACK}
          />
          <Select
            selectedValue={selectedSector}
            onSelect={handleSectorSelect}
            options={SECTOR_FALLBACK}
          />
          <Select
            selectedValue={selectedIndustry}
            onSelect={handleIndustrySelect}
            options={INDUSTRY_FALLBACK}
          />
        </div>
      </div>

      {/* Table card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-lg">
        {isLoading || isFetching ? (
          <div className="p-12 flex flex-col items-center justify-center gap-4">
            <p className="text-muted-foreground text-sm">
              종목 목록을 불러오는 중...
            </p>
          </div>
        ) : data && data.content?.length > 0 ? (
          <>
            <div className="min-w-0 overflow-x-auto">
              <CompaniesTable
                content={data.content}
                exchangeRate={exchangeRate}
              />
            </div>
            {data.totalPages > 0 && (
              <div className="border-t border-border py-4 bg-muted/30">
                <Pagination
                  currentPage={page}
                  totalPages={data.totalPages}
                  pageSize={5}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : data && data.content.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <p className="text-foreground font-medium">검색 결과가 없습니다</p>
            <p className="text-muted-foreground text-sm max-w-sm">
              다른 키워드로 검색하거나 검색어를 비워 두고 전체 목록을 확인해
              보세요.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CompaniesClient;
