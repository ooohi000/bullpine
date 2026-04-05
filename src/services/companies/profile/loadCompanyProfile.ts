import { cache } from 'react';
import { getCompanyProfile } from './getCompanyProfile';

/**
 * 동일 요청(RSC) 안에서 레이아웃·페이지가 각각 호출해도 fetch 한 번만 나가도록 캐시.
 */
export const loadCompanyProfile = cache(async (args: { symbol: string }) => {
  return getCompanyProfile(args);
});
