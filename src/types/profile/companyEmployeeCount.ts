export interface CompanyEmployeeCount {
  formType: string;
  periodOfReport: string;
  employeeCount: number;
}

export interface CompanyEmployeeCountResponse {
  success: boolean;
  data: CompanyEmployeeCount[];
}
