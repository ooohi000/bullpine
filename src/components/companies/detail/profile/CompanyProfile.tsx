'use client';

import React, { useEffect, useState } from 'react';
import { CompanyProfile as CompanyProfileType } from '@/types';
import { ExternalStockImage } from '@/components/common/ExternalStockImage';
import Link from 'next/link';
import { formatNumber } from '@/lib';
import { SharesFloat as SharesFloatType } from '@/types/profile/sharesFloat';
import { CompanyEmployeeCount as CompanyEmployeeCountType } from '@/types/profile';
import {
  COUNTRY_FALLBACK,
  INDUSTRY_FALLBACK,
  SECTOR_FALLBACK,
} from '@/constants';

function CompanyProfileLogo({
  src,
  alt,
  fallback,
}: {
  src: string;
  alt: string;
  fallback: React.ReactNode;
}) {
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [src]);

  if (broken) return fallback;

  return (
    <div className="relative h-[100px] w-[100px] shrink-0 overflow-hidden rounded-lg bg-muted">
      <ExternalStockImage
        src={src}
        alt={alt}
        fill
        sizes="100px"
        className="object-cover"
        onError={() => setBroken(true)}
        onMissing={() => setBroken(true)}
      />
    </div>
  );
}

const CompanyProfile = ({
  companyProfile,
  employeeCount,
  exchangeRate,
  shareFloat,
}: {
  companyProfile: CompanyProfileType;
  employeeCount: CompanyEmployeeCountType[];
  exchangeRate: number | null;
  shareFloat: SharesFloatType;
}) => {
  const currentYear = new Date().getFullYear();
  const employeeCountYear = Number(
    employeeCount[0].periodOfReport.split('-')[0],
  );
  const isCurrentYear = currentYear === employeeCountYear;
  const infoRows = [
    { label: '대표자', value: companyProfile.ceo ?? '-' },
    {
      label: '정규직 수',
      value: isCurrentYear
        ? `${employeeCount[0].employeeCount} 명`
        : companyProfile.fullTimeEmployees
          ? `${companyProfile.fullTimeEmployees} 명`
          : '-',
    },
    {
      label: '발행주식수',
      value: `${formatNumber(shareFloat.outstandingShares ?? 0)} 주`,
    },
    {
      label: '유통주식수',
      value: `${formatNumber(shareFloat.floatShares ?? 0)} 주`,
    },
    {
      label: '유통비율',
      value: `${shareFloat.freeFloat.toFixed(2)}%`,
    },
    {
      label: '시가총액',
      value: exchangeRate
        ? `${formatNumber(companyProfile.marketCap * exchangeRate)} 원`
        : `${formatNumber(companyProfile.marketCap)} 달러`,
    },
  ];

  const logoFallback = (
    <div className="flex h-[100px] w-[100px] shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-medium text-chart-up">
      Bullpine
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* 헤더: 로고 + 기업명·국가·업종 */}
      <div className="flex items-start justify-between gap-8">
        <div className="box-border flex h-[100px] w-[100px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-card">
          {companyProfile.image ? (
            <CompanyProfileLogo
              src={companyProfile.image}
              alt={companyProfile.companyName}
              fallback={logoFallback}
            />
          ) : (
            logoFallback
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">
            {companyProfile.companyName}{' '}
            <span className="text-muted-foreground">
              ({companyProfile.symbol})
            </span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {
              COUNTRY_FALLBACK.find(
                (country) => country.value === companyProfile.country,
              )?.label
            }{' '}
            · {companyProfile.exchange}
          </p>
          <p className="text-sm text-muted-foreground">
            {
              SECTOR_FALLBACK.find(
                (sector) => sector.value === companyProfile.sector,
              )?.label
            }
            {companyProfile.industry &&
              ` · ${INDUSTRY_FALLBACK.find((industry) => industry.value === companyProfile.industry)?.label}`}
          </p>
        </div>
      </div>

      {/* 상세 정보 + 현재가 (하나의 카드) */}
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card px-4 py-4 sm:flex-row sm:items-stretch sm:justify-between">
        <div className="flex-1">
          <div className="grid gap-2 text-sm sm:grid-cols-[auto_1fr]">
            {infoRows.map(({ label, value }) => (
              <React.Fragment key={label}>
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium text-foreground">{value}</span>
              </React.Fragment>
            ))}
          </div>
          {exchangeRate ? (
            <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
              환율: {exchangeRate} 원
            </p>
          ) : null}
        </div>

        <div
          className={`flex shrink-0 flex-col items-end justify-center px-4 py-2 ${
            companyProfile.change > 0 ? 'text-chart-up' : 'text-chart-down'
          }`}
        >
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            현재가
          </span>
          <span className="text-3xl font-bold tabular-nums">
            {companyProfile.price}
          </span>
          <div className="flex items-center gap-1">
            {companyProfile.change >= 0 ? (
              <span
                className="inline-block w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-current"
                aria-hidden
              />
            ) : (
              <span
                className="inline-block w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-current"
                aria-hidden
              />
            )}
            <span className="text-sm font-medium">
              {companyProfile.change >= 0 ? '+' : ''}
              {companyProfile.change.toFixed(2)}
            </span>
            <span className="text-sm font-medium">
              ({companyProfile.changePercentage >= 0 ? '+' : ''}
              {companyProfile.changePercentage.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* 웹사이트 + 기업 소개 (border 없음) */}
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            기업 소개
          </h3>
          {companyProfile.website ? (
            <Link
              href={companyProfile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit text-sm text-primary underline decoration-primary/50 transition-colors hover:decoration-primary"
              aria-label={`${companyProfile.companyName} website`}
            >
              {companyProfile.website}
            </Link>
          ) : null}
          <p className="text-sm leading-relaxed text-foreground/90 break-all whitespace-pre-wrap">
            {companyProfile.description ?? '-'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
