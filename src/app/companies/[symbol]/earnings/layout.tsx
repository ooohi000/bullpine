import type { ReactNode } from 'react';
import RequireCompanyAuth from '@/components/companies/detail/auth/RequireCompanyAuth';

export default function EarningsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <RequireCompanyAuth>{children}</RequireCompanyAuth>;
}
