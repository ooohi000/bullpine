export interface IndicatorsItem {
  name: string;
  date: string;
  value: number;
}

export interface IndicatorsResponse {
  data: IndicatorsItem[];
}
