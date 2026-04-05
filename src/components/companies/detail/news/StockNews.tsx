'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import NewsItem from './NewsItem';
import useInfiniteSearchStockNews from '@/hooks/api/companies/news/useInfiniteSearchStockNews';
import { NewsItem as NewsItemType } from '@/types/news';

function getItems(
  response: { data?: NewsItemType[] } | NewsItemType[],
): NewsItemType[] {
  if (Array.isArray(response)) return response;
  return response?.data ?? [];
}

interface StockNewsProps {
  symbol: string;
  to: string;
  limit: number;
}

const StockNews = ({ symbol, to, limit }: StockNewsProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteSearchStockNews({ symbol, to, limit });

  const items: NewsItemType[] =
    data?.pages.flatMap((page) => getItems(page)) ?? [];

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: '100px', threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div>
      {isLoading && (
        <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground text-sm">
          뉴스를 불러오는 중입니다.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-border bg-card p-6 text-center text-destructive text-sm">
          {error instanceof Error
            ? error.message
            : '데이터를 불러오는데 실패했습니다.'}
        </div>
      )}

      {!isLoading && !error && (
        <>
          <NewsItem data={items} />
          <div ref={sentinelRef} className="h-4" aria-hidden />
          {isFetchingNextPage && (
            <div className="py-4 text-center text-muted-foreground text-sm">
              더 불러오는 중...
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StockNews;
