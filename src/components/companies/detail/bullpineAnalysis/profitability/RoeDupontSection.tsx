'use client';

export default function RoeDupontSection({ symbol }: { symbol: string }) {
  return (
    <div className="text-sm text-muted-foreground">
      {symbol.toUpperCase()} ROE 상승 원인 분해 (레버리지 vs 수익성 vs 자산회전율 — DuPont) 분석 영역입니다. (준비 중)
    </div>
  );
}
