import { IncomeItem } from '@/types/statements';

/** API 값 대신 계산식으로 구한 값 사용 (손익 흐름이 맞도록) */
export const getComputedValue = (
  row: IncomeItem,
  key: keyof IncomeItem
): number | null => {
  const n = (v: number | undefined) =>
    typeof v === 'number' && !Number.isNaN(v) ? v : 0;
  const rev = n(row.revenue);
  const costRev = n(row.costOfRevenue);
  const sgna = n(row.sellingGeneralAndAdministrativeExpenses);
  const other = n(row.totalOtherIncomeExpensesNet);
  const netInt = n(row.netInterestIncome);
  const tax = n(row.incomeTaxExpense);

  const grossProfit = rev - costRev;
  const operatingIncome = grossProfit - sgna;
  const incomeBeforeTax = operatingIncome + other + netInt;
  const netIncome = incomeBeforeTax - tax;

  switch (key) {
    case 'grossProfit':
      return grossProfit;
    case 'operatingIncome':
      return operatingIncome;
    case 'incomeBeforeTax':
      return incomeBeforeTax;
    case 'netIncome':
      return netIncome;
    default:
      return null;
  }
};
