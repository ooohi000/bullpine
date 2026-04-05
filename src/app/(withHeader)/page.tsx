'use client';

import React, { useEffect, useRef, useState } from 'react';
import LandingSection from '@/components/landing/LandingSection';
import Login from '@/components/login/Login';

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const lerp = (start: number, end: number, amount: number) => {
  return start + (end - start) * amount;
};

const SCROLL_SENSITIVITY = 0.00012;
const LERP_AMOUNT = 0.12;
const ANIMATION_STOP_THRESHOLD = 0.0005;

const MD_UP = '(min-width: 768px)';

const Home = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMdUp, setIsMdUp] = useState(false);
  const wheelAreaRef = useRef<HTMLDivElement | null>(null);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(MD_UP);
    const sync = () => setIsMdUp(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  /** 모바일: 일반 페이지 스크롤 → 트리맵 진행률 (body 잠금 없음) */
  useEffect(() => {
    if (isMdUp) return;

    const onScroll = () => {
      const el = document.documentElement;
      const scrollable = el.scrollHeight - window.innerHeight;
      const p = scrollable > 0 ? window.scrollY / scrollable : 0;
      setScrollProgress(clamp(p, 0, 1));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [isMdUp]);

  /** 데스크톱: 휠로 진행률 + body 스크롤 잠금 (랜딩 전용 인터랙션) */
  useEffect(() => {
    if (!isMdUp) {
      targetProgressRef.current = 0;
      currentProgressRef.current = 0;
      setScrollProgress(0);
      return;
    }

    targetProgressRef.current = 0;
    currentProgressRef.current = 0;
    setScrollProgress(0);

    const element = wheelAreaRef.current;
    if (!element) return;

    const prevOverflow = document.body.style.overflow;
    const prevOverscrollBehavior = document.body.style.overscrollBehavior;
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';

    const startAnimation = () => {
      if (rafIdRef.current !== null) return;

      const tick = () => {
        const next = lerp(
          currentProgressRef.current,
          targetProgressRef.current,
          LERP_AMOUNT,
        );

        currentProgressRef.current = next;
        setScrollProgress(next);

        if (
          Math.abs(targetProgressRef.current - next) < ANIMATION_STOP_THRESHOLD
        ) {
          currentProgressRef.current = targetProgressRef.current;
          setScrollProgress(targetProgressRef.current);
          rafIdRef.current = null;
          return;
        }

        rafIdRef.current = requestAnimationFrame(tick);
      };

      rafIdRef.current = requestAnimationFrame(tick);
    };

    const getDeltaPixels = (event: WheelEvent) => {
      if (event.deltaMode === 1) return event.deltaY * 16;
      if (event.deltaMode === 2) return event.deltaY * element.clientHeight;
      return event.deltaY;
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const deltaPixels = getDeltaPixels(event);
      targetProgressRef.current = clamp(
        targetProgressRef.current + deltaPixels * SCROLL_SENSITIVITY,
        0,
        1,
      );
      startAnimation();
    };

    element.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      element.removeEventListener('wheel', handleWheel);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      document.body.style.overflow = prevOverflow;
      document.body.style.overscrollBehavior = prevOverscrollBehavior;
    };
  }, [isMdUp]);

  return (
    <div>
      <div
        ref={wheelAreaRef}
        className={`relative overscroll-none ${
          isMdUp
            ? 'h-[calc(100vh-80px)] overflow-hidden'
            : 'min-h-[calc(100vh-80px)] overflow-visible py-8 sm:py-10'
        }`}
      >
        <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-1 bg-muted/60">
          <div
            className="h-full bg-gradient-to-r from-destructive to-chart-up transition-none"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>

        <div className="mx-auto flex h-full w-full max-w-6xl flex-col justify-center gap-8 p-4 md:gap-0 md:p-6 lg:p-8">
          <div
            className={`flex h-full max-h-[750px] min-h-0 flex-col md:flex-row md:items-stretch md:gap-0 ${
              isMdUp
                ? 'rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6 shadow-sm backdrop-blur-[2px] md:rounded-3xl md:p-8 lg:p-10'
                : 'rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-5 shadow-sm backdrop-blur-[2px] sm:p-6'
            }`}
          >
            <div className="flex min-h-0 w-full flex-col items-center justify-center gap-5 sm:gap-6 md:w-[52%] md:gap-8 md:border-r md:border-white/10 md:pr-8 lg:pr-10">
              <div className="origin-center scale-[0.72] sm:scale-80 md:scale-90">
                <LandingSection scrollProgress={scrollProgress} />
              </div>
              <div className="flex max-w-3xl flex-col items-center justify-center gap-2 text-center sm:gap-3 md:gap-4">
                <h2 className="text-2xl font-bold text-foreground sm:text-2xl md:text-3xl lg:text-4xl">
                  미국 주식, 데이터로 읽다
                </h2>
                <p className="px-2 text-sm font-medium text-muted-foreground sm:text-base md:text-lg lg:text-xl">
                  재무제표부터 핵심 지표까지, <br className="hidden sm:block" />
                  투자 결정에 필요한 모든 정보를 한눈에 확인해보세요.
                </p>
              </div>
            </div>

            <div className="my-6 h-px w-full shrink-0 bg-white/10 md:hidden" />

            <div className="flex w-full min-h-0 flex-1 items-center justify-center md:pl-8 lg:pl-10">
              <div id="signin" className="w-full max-w-[420px] scroll-mt-28">
                <Login />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
