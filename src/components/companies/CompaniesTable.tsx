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
import { ExchangeRate } from '@/types';

interface CompaniesTableProps {
  content: Company[];
  exchangeRate: ExchangeRate | null;
}

const sectorLabel = (sector: string) =>
  SECTOR_FALLBACK.find((s) => s.value === sector)?.label || sector;

const industryLabel = (industry: string) =>
  INDUSTRY_FALLBACK.find((i) => i.value === industry)?.label || industry;

const countryLabel = (country: string) =>
  COUNTRY_FALLBACK.find((c) => c.value === country)?.label || country;

const CompaniesTable = ({ content, exchangeRate }: CompaniesTableProps) => {
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
          <TableComponent.tableHead className="w-[20%] md:table-cell">
            회사명
          </TableComponent.tableHead>
          <TableComponent.tableHead className="hidden w-[10%] whitespace-nowrap md:table-cell">
            종목코드
          </TableComponent.tableHead>
          <TableComponent.tableHead className="hidden min-w-0 w-[14%] md:table-cell">
            업종
          </TableComponent.tableHead>
          <TableComponent.tableHead className="hidden w-[14%] md:table-cell">
            산업
          </TableComponent.tableHead>
          <TableComponent.tableHead className="hidden w-[10%] whitespace-nowrap md:table-cell">
            거래소
          </TableComponent.tableHead>
          <TableComponent.tableHead className="hidden w-[22%] md:table-cell">
            <div className="flex flex-col gap-1">
              <p className="font-medium">시가총액</p>
              <p className="text-xs text-muted-foreground">
                {exchangeRate ? `(환율: ${exchangeRate.price} 원)` : ''}
              </p>
            </div>
          </TableComponent.tableHead>
          <TableComponent.tableHead className="hidden w-[10%] md:table-cell">
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
              className="max-w-0 text-left font-medium text-foreground"
              title={company.companyName}
            >
              <span className="hidden block md:whitespace-normal md:table-cell">
                {company.companyName}
              </span>
              <span className="block md:whitespace-normal md:hidden">
                {`${company.companyName} (${company.symbol})`}
              </span>
            </TableComponent.tableCell>
            <TableComponent.tableCell className="hidden font-semibold tabular-nums text-foreground md:font-normal md:table-cell">
              {company.symbol}
            </TableComponent.tableCell>
            <TableComponent.tableCell
              className="min-w-0 hidden whitespace-nowrap break-all md:table-cell"
              title={sectorLabel(company.sector)}
            >
              <span className="block truncate md:whitespace-normal">
                {sectorLabel(company.sector)}
              </span>
            </TableComponent.tableCell>
            <TableComponent.tableCell
              className="min-w-0 hidden whitespace-nowrap break-all md:table-cell"
              title={industryLabel(company.industry)}
            >
              <span className="block md:whitespace-normal">
                {industryLabel(company.industry)}
              </span>
            </TableComponent.tableCell>
            <TableComponent.tableCell className="hidden whitespace-nowrap md:table-cell">
              {company.exchangeShortName}
            </TableComponent.tableCell>
            <TableComponent.tableCell className="hidden break-keep md:table-cell">
              {exchangeRate
                ? `${formatNumber(Math.round(company.marketCap * exchangeRate.price))} 원`
                : `${formatNumber(company.marketCap)} 달러`}
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
