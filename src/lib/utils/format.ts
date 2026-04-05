/**
 * 숫자 포맷팅 함수
 * 큰 숫자를 읽기 쉽게 포맷팅 (예: 1000000 -> 1,000,000)
 * 한국 로케일을 사용하여 천 단위마다 쉼표를 추가
 *
 * @param value - 포맷팅할 숫자 값 (null 또는 undefined 가능)
 * @returns 포맷팅된 문자열 또는 '-'
 */
export const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('ko-KR').format(value);
};

export const formatUsdNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};
