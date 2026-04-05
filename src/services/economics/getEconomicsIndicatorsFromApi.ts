import { IndicatorsResponse } from '@/types/economics';

interface GetEconomicsIndicatorsFromApiProps {
  name: string;
  from: string;
  to: string;
}

export const getEconomicsIndicatorsFromApi = async ({
  name,
  from,
  to,
}: GetEconomicsIndicatorsFromApiProps): Promise<IndicatorsResponse> => {
  const response = await fetch(
    `/api/economics/indicators?name=${name}&from=${from}&to=${to}`,
  );
  if (!response.ok) {
    throw new Error(`API 오류: ${response.statusText}`);
  }
  const data = await response.json();
  return data as IndicatorsResponse;
};
