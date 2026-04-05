export interface ExecutivesItem {
  title: string;
  name: string;
  pay: number;
  currencyPay: string;
  gender: string;
  yearBorn: number;
  titleSince: string | null;
  active: boolean;
}

export interface ExecutivesResponse {
  success: boolean;
  data: ExecutivesItem[];
}
