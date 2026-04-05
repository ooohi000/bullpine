import { redirect } from 'next/navigation';

const CompanyFinancialAnalysisPage = async ({
  params,
}: {
  params: Promise<{ symbol: string }> | { symbol: string };
}) => {
  const resolvedParams = await Promise.resolve(params);
  const { symbol } = resolvedParams;
  redirect(`/companies/${symbol}/financialRatios`);
};

export default CompanyFinancialAnalysisPage;
