'use server';

import { clearAuthCookies } from '@/lib/authCookieOptions';
import { logoutService } from '@/services/auth/logoutService';
import { redirect } from 'next/navigation';

/**
 * 백엔드 로그아웃 시도 후 항상 로컬 쿠키 삭제·홈으로 이동.
 * 네트워크 실패 시에도 쿠키는 지워 클라이언트 세션은 끊김.
 */
export async function logoutAction() {
  try {
    await logoutService();
  } catch {
    /* ignore — still clear cookies */
  }
  clearAuthCookies();
  redirect('/');
}
