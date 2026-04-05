import { useEffect, useMemo, useState } from 'react';

/**
 * 종료 시각 기준 쿨다운. 백그라운드 탭에서도 복귀 시 Date.now()와 비교해 맞춤.
 */
export function useVerificationCooldown() {
  const [cooldownEndsAt, setCooldownEndsAt] = useState<number | null>(null);
  const [cooldownTick, setCooldownTick] = useState(0);

  const cooldownRemainingSec = useMemo(() => {
    if (cooldownEndsAt == null) return 0;
    return Math.max(0, Math.ceil((cooldownEndsAt - Date.now()) / 1000));
  }, [cooldownEndsAt, cooldownTick]);

  const cooldownLabel = useMemo(() => {
    const s = cooldownRemainingSec;
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, '0')}`;
  }, [cooldownRemainingSec]);

  useEffect(() => {
    if (cooldownEndsAt == null) return;
    const end = cooldownEndsAt;
    if (end <= Date.now()) {
      setCooldownEndsAt(null);
      return;
    }
    const id = window.setInterval(() => {
      setCooldownTick((t) => t + 1);
      if (Date.now() >= end) {
        setCooldownEndsAt(null);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [cooldownEndsAt]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        setCooldownTick((t) => t + 1);
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  const resetCooldown = () => {
    setCooldownEndsAt(null);
    setCooldownTick(0);
  };

  return {
    cooldownEndsAt,
    setCooldownEndsAt,
    cooldownRemainingSec,
    cooldownLabel,
    resetCooldown,
  };
}
