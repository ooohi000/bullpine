import React from 'react';
import Signup from '@/components/signup/Signup';

/** 로그인 상태 리다이렉트는 `src/middleware.ts`에서 `/signup` 매처로 처리 */
const SignupPage = () => {
  return (
    <div>
      <div className="pointer-events-none z-10 h-1 bg-chart-up"></div>
      {/* min-h: 내용이 길어지면 영역이 같이 늘어나 스크롤됨. 고정 h만 쓰면 카드가 잘리기 쉬움 */}
      <div className="relative min-h-[calc(100vh-80px)]">
        <div className="flex w-full flex-col items-center px-4 py-8 sm:py-10">
          <div className="mb-6 w-full max-w-[560px] text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              무료 회원가입
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-[15px]">
              회원가입 후 미국 주식 데이터를 분석해보세요.
            </p>
          </div>
          <Signup />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
