import NewsView from '@/components/companies/detail/news/NewsView';

const NewsPage = async ({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) => {
  const resolvedParams = await Promise.resolve(params);
  const { symbol } = resolvedParams;

  return <NewsView symbol={symbol} />;
};

export default NewsPage;
