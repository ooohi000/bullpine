import Header from '@/components/layout/Header';
import React from 'react';

/**
 * Route group `(withHeader)` — 폴더 이름의 괄호는 URL에 포함되지 않음.
 * 이 레이아웃 아래 페이지만 상단 Header를 공유함.
 * `app/companies/[symbol]/` 는 이 폴더 밖에 두어 기업 상세에서는 Header 없음.
 */
export default function WithHeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
