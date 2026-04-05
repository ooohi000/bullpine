import type { ReactNode } from 'react';
import RequireCompanyAuth from '@/components/companies/detail/auth/RequireCompanyAuth';

export default function KeyMetricsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <RequireCompanyAuth>{children}</RequireCompanyAuth>;
}
