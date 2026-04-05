/** 서버 액션·미들웨어에서 동일 이름 사용 */
export const AUTH_ACCESS_TOKEN_COOKIE = 'bp_access_token';
export const AUTH_REFRESH_TOKEN_COOKIE = 'bp_refresh_token';

/**
 * 브라우저 쿠키 만료: Set-Cookie 시점부터의 초. 타임존과 무관.
 * 백엔드 JWT `exp`와 최대한 맞추지 않으면 쿠키는 남는데 API만 401이거나 그 반대가 날 수 있음.
 */
export const ACCESS_TOKEN_MAX_AGE_SEC = 15 * 60;
export const REFRESH_TOKEN_MAX_AGE_SEC = 60 * 60 * 24 * 14;
