'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginAction } from '@/actions/login';
import { loginSchema, type LoginFormValues } from './loginSchema';

function isNextRedirectError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'digest' in error &&
    typeof (error as { digest: unknown }).digest === 'string' &&
    (error as { digest: string }).digest.startsWith('NEXT_REDIRECT')
  );
}

const fieldErrorClass = (hasError: boolean) =>
  hasError
    ? 'border-destructive/70 focus:ring-destructive/50 focus:border-destructive/70'
    : 'border-white/10 focus:ring-destructive/50 focus:border-destructive/70';

const Login = () => {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const result = await loginAction(values);
      if (!result.success && result.error) {
        setServerError(result.error);
      }
    } catch (err) {
      if (isNextRedirectError(err)) {
        throw err;
      }
      setServerError(
        err instanceof Error
          ? err.message
          : '요청 처리 중 오류가 발생했습니다.',
      );
    }
  });

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="w-full max-h-[calc(100vh-220px)] overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <div className="mb-5">
          <h3 className="text-xl font-semibold text-foreground">로그인</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            이메일과 비밀번호로 로그인하세요.
          </p>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-left text-sm font-medium text-muted-foreground"
            >
              이메일
            </label>
            <input
              id="email"
              type="email"
              data-input-surface="dark"
              autoComplete="email"
              placeholder="example@email.com"
              disabled={isSubmitting}
              className={`w-full rounded-lg border bg-white/5 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 ${fieldErrorClass(!!errors.email)}`}
              {...register('email')}
            />
            {errors.email ? (
              <p className="text-left text-xs text-destructive" role="alert">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-left text-sm font-medium text-muted-foreground"
            >
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              data-input-surface="dark"
              autoComplete="current-password"
              placeholder="••••••••"
              disabled={isSubmitting}
              className={`w-full rounded-lg border bg-white/5 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 ${fieldErrorClass(!!errors.password)}`}
              {...register('password')}
            />
            {errors.password ? (
              <p className="text-left text-xs text-destructive" role="alert">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          {serverError ? (
            <p
              className="-mt-1 text-left text-xs text-destructive"
              role="alert"
            >
              {serverError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 w-full cursor-pointer rounded-lg bg-destructive py-2.5 text-sm font-semibold text-white transition-colors hover:bg-destructive/85 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground/80">
          <span className="font-semibold pr-1">계정이 없으신가요?</span>
          <Link
            href="/signup"
            className="font-semibold text-foreground/80 transition-colors hover:text-chart-foreground hover:underline"
          >
            회원가입
          </Link>
        </p>
      </div>
      <div className="mb-4 flex flex-col gap-2 text-sm text-muted-foreground">
        로그인 안해도 미국 기업 검색 및 상세 정보 볼 수 있습니다.
        <Link
          href="/companies"
          className="font-semibold text-foreground/80 transition-colors hover:text-chart-foreground hover:underline"
        >
          기업 검색 바로 가기
        </Link>
      </div>
    </div>
  );
};

export default Login;
