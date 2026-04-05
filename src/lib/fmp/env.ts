/**
 * FMP(Federal Modeling Prep) API 키 환경 변수 검증
 */
export const apiKeyCheck = (): string => {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    throw new Error('FMP_API_KEY가 환경 변수에 설정되지 않았습니다.');
  }
  return apiKey;
};
