'use client';

export default function EffectiveTaxSection({ symbol }: { symbol: string }) {
  return (
    <div className="text-sm text-muted-foreground">
      {symbol.toUpperCase()} 세금 실효세율 이상 감지 (Net Income 착시 경고) 분석 영역입니다. (준비 중)
    </div>
  );
}
