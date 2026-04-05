'use client';

export default function CompetitionRiskSection({ symbol }: { symbol: string }) {
  return (
    <div className="text-sm text-muted-foreground">
      {symbol.toUpperCase()} 경쟁 심화 가능성 감지 (마진 압축 + 매출 둔화 동시 발생) 분석 영역입니다. (준비 중)
    </div>
  );
}
