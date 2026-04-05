export interface RevenueProductSegmentation {
  symbol: string;
  date: string;
  fiscalYear: string;
  revenue: number;
  productSegment: string;
  data: Record<string, number>;
}

export interface RevenueProductSegmentationResponse {
  data: RevenueProductSegmentation[];
}
