/**
 * 전년 대비 변동률 (%).
 * 이전 값이 0이거나 유효하지 않으면 null.
 */
export const getYoYPercent = (
  current: number | null,
  prev: number | null
): number | null => {
  if (
    current == null ||
    prev == null ||
    !Number.isFinite(current) ||
    !Number.isFinite(prev) ||
    prev === 0
  )
    return null;
  return ((current - prev) / Math.abs(prev)) * 100;
};
