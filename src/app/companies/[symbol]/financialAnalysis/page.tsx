import { redirect } from 'next/navigation';

const CompanyFinancialAnalysisPage = async ({
  params,
}: {
  params: { symbol: string };
}) => {
  const { symbol } = params;
  redirect(`/companies/${symbol}/financialRatios`);
};

export default CompanyFinancialAnalysisPage;
