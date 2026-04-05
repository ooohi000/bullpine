'use client';

export default function CostPressureSection({ symbol }: { symbol: string }) {
  return (
    <div className="text-sm text-muted-foreground">
      {symbol.toUpperCase()} 원가 압박 초기 신호 (Gross Margin 선행 하락) 분석 영역입니다. (준비 중)
    </div>
  );
}
