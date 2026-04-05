import { cache } from 'react';
import { getServerAccessToken } from '@/lib/server/getBackendRequestHeaders';
import type { MeData } from '@/types/auth/me';
import { meService } from './meService';

/**
 * 액세스 토큰 없으면 호출하지 않음. 실패 시 null (헤더 등에서 throw 방지).
 * 동일 RSC 요청에서 한 번만 fetch.
 */
export const loadMe = cache(async (): Promise<MeData | null> => {
  if (!getServerAccessToken()) return null;
  try {
    const res = await meService();
    if (!res.success || !res.data) return null;
    return res.data;
  } catch {
    return null;
  }
});
