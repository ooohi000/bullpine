import NewsView from '@/components/companies/detail/news/NewsView';

const NewsPage = async ({
  params,
}: {
  params: { symbol: string };
}) => {
  const { symbol } = params;

  return <NewsView symbol={symbol} />;
};

export default NewsPage;
