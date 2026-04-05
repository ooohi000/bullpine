import React from 'react';
import { AUTH_ACCESS_TOKEN_COOKIE } from '@/constants/authCookies';
import { cookies } from 'next/headers';
import CompanyAuthGateClient from './CompanyAuthGateClient';

/** 액세스 토큰 없으면 자식 RSC를 렌더하지 않고 로그인 안내 모달만 표시 */
export default function RequireCompanyAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = cookies().get(AUTH_ACCESS_TOKEN_COOKIE)?.value;
  if (!token) {
    return <CompanyAuthGateClient />;
  }
  return <>{children}</>;
}
