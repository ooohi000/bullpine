import React from 'react';
import { TableComponent } from '../common/Table';
import type { Company } from '@/types/stockList';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  COUNTRY_FALLBACK,
  INDUSTRY_FALLBACK,
  SECTOR_FALLBACK,
} from '@/constants';
import { formatNumber } from '@/lib';

interface CompaniesTableProps {
  content: Company[];
}

const sectorLabel = (sector: string) =>
  SECTOR_FALLBACK.find((s) => s.value === sector)?.label || sector;

const industryLabel = (industry: string) =>
  INDUSTRY_FALLBACK.find((i) => i.value === industry)?.label || industry;

const countryLabel = (country: string) =>
  COUNTRY_FALLBACK.find((c) => c.value === country)?.label || country;

const CompaniesTable = ({ content }: CompaniesTableProps) => {
  const searchParams = useSearchParams();
  const params = searchParams.get('search')
    ? `page=${searchParams.get('page')}&search=${searchParams.get('search')}`
    : `page=${searchParams.get('page')}`;
  const router = useRouter();
  const handleCompanyClick = (company: Company) => {
    router.push(`/companies/${company.symbol.toLowerCase()}?${params}`);
  };

  return (
    <TableComponent.table>
      <TableComponent.tableHeader className="!text-xs md:!text-sm">
        <TableComponent.tableRow className="border-b border-border">
          <TableComponent.tableHead className="hidden w-[30%] md:table-cell">
            회사명
          </TableComponent.tableHead>
          <TableComponent.tableHead className="w-[10%] whitespace-nowrap">
            종목코드
          </TableComponent.tableHead>
          <TableComponent.tableHead className="min-w-0 w-[12%]">
            업종
          </TableComponent.tableHead>
          <TableComponent.tableHead className="hidden w-[16%] md:table-cell">
            산업
          </TableComponent.tableHead>
          <TableComponent.tableHead className="w-[10%] whitespace-nowrap md:w-[10%]">
            거래소
          </TableComponent.tableHead>
          <TableComponent.tableHead className="hidden w-[14%] md:table-cell">
            시총
          </TableComponent.tableHead>
          <TableComponent.tableHead className="hidden w-[8%] md:table-cell">
            국가
          </TableComponent.tableHead>
        </TableComponent.tableRow>
      </TableComponent.tableHeader>
      <TableComponent.tableBody className="!text-xs md:!text-sm">
        {content?.map((company) => (
          <TableComponent.tableRow
            key={`${company.id}-${company.symbol}`}
            className="cursor-pointer hover:bg-muted/50 active:bg-muted/70"
            onClick={() => handleCompanyClick(company)}
          >
            <TableComponent.tableCell
              className="max-w-0 hidden md:table-cell text-left font-medium text-foreground py-3.5"
              title={company.companyName}
            >
              <span className="block md:whitespace-normal">
                {company.companyName}
              </span>
            </TableComponent.tableCell>
            <TableComponent.tableCell className="px-2.5 py-2.5 font-semibold tabular-nums text-foreground md:px-4 md:py-3.5 md:font-normal">
              {company.symbol}
            </TableComponent.tableCell>
            <TableComponent.tableCell
              className="min-w-0 px-2.5 py-2.5 md:px-4 md:py-3.5"
              title={sectorLabel(company.sector)}
            >
              <span className="block truncate md:whitespace-normal">
                {sectorLabel(company.sector)}
              </span>
            </TableComponent.tableCell>
            <TableComponent.tableCell
              className="hidden min-w-0 md:table-cell"
              title={industryLabel(company.industry)}
            >
              <span className="block md:whitespace-normal">
                {industryLabel(company.industry)}
              </span>
            </TableComponent.tableCell>
            <TableComponent.tableCell className="px-2.5 py-2.5 whitespace-nowrap md:px-4 md:py-3.5">
              {company.exchangeShortName}
            </TableComponent.tableCell>
            <TableComponent.tableCell className="hidden md:table-cell">
              {formatNumber(company.marketCap)} 달러
            </TableComponent.tableCell>
            <TableComponent.tableCell className="hidden md:table-cell">
              {countryLabel(company.country)}
            </TableComponent.tableCell>
          </TableComponent.tableRow>
        ))}
      </TableComponent.tableBody>
    </TableComponent.table>
  );
};

export default CompaniesTable;
