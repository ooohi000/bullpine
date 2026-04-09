'use client';

import React from 'react';
import { ExecutivesItem } from '@/types';
import { formatNumber } from '@/lib';

/** 출생연도 기준 대략 나이(올해 − 출생연도). 만 나이·생일 미반영. */
const ageFromYearBorn = (yearBorn: number): string => {
  if (yearBorn === null) return '밝히지 않음';

  if (!Number.isFinite(yearBorn) || yearBorn < 1900) return '밝히지 않음';
  const age = new Date().getFullYear() - yearBorn;
  if (age < 0 || age > 120) return '밝히지 않음';
  return `${age}세`;
};

const genderFromGender = (gender: string): string => {
  if (gender === 'male') return '남자';
  if (gender === 'female') return '여자';
  return '밝히지 않음';
};

interface ExecutiveCompensationProps {
  executives: ExecutivesItem[];
  exchangeRate: number | null;
}

const ExecutiveCompensation = ({
  executives,
  exchangeRate,
}: ExecutiveCompensationProps) => {
  if (!executives.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">임원 보상</h2>
        <div className="mt-4 rounded-lg bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
          임원 데이터가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/20 px-5 py-4">
        <h2 className="text-lg font-semibold text-foreground">임원</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="sticky left-0 z-10 min-w-[100px] bg-muted px-4 py-2.5 text-left text-xs font-medium text-foreground">
                이름
              </th>
              <th className="min-w-[90px] px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">
                성별
              </th>
              <th className="min-w-[90px] px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">
                나이
              </th>
              <th className="min-w-[200px] px-4 py-2.5 text-left text-xs font-medium text-foreground">
                직책
              </th>
              <th className="min-w-[200px] px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">
                연봉
              </th>
            </tr>
          </thead>
          <tbody>
            {executives
              .filter((executive) => executive.active)
              .map((executive, idx) => {
                return (
                  <tr
                    key={`${executive.name}-${executive.title}-${idx}`}
                    className={`border-b border-border/60 transition-colors hover:bg-muted/20`}
                  >
                    <td className="sticky left-0 z-10 bg-muted py-3 pl-4 pr-2 font-medium text-foreground">
                      {executive.name}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-muted-foreground">
                      {genderFromGender(executive.gender)}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-muted-foreground">
                      {ageFromYearBorn(executive.yearBorn)}
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">
                      {executive.title}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-muted-foreground">
                      {executive.pay
                        ? exchangeRate
                          ? `${formatNumber(executive.pay * exchangeRate)} 원`
                          : `${formatNumber(executive.pay)} 달러`
                        : '밝히지 않음'}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExecutiveCompensation;
