'use client';

export default function PricingPowerSection({ symbol }: { symbol: string }) {
  return (
    <div className="text-sm text-muted-foreground">
      {symbol.toUpperCase()} 가격 결정력 추정 (마진 안정성 기반 간접 추정) 분석 영역입니다. (준비 중)
    </div>
  );
}
