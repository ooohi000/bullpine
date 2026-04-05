import { headers } from 'next/headers';

export const frontBaseUrl = async () => {
  // Server Component에서 같은 서버의 API route를 호출하려면 절대 URL이 필요
  // headers()를 사용해서 동적으로 호스트를 가져옴
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const baseUrl = `${protocol}://${host}`;
  return baseUrl;
};
