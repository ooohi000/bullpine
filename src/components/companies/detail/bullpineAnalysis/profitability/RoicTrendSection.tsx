'use client';

export default function RoicTrendSection({ symbol }: { symbol: string }) {
  return (
    <div className="text-sm text-muted-foreground">
      {symbol.toUpperCase()} ROIC 3~5년 추세 분석 영역입니다. (준비 중)
    </div>
  );
}
