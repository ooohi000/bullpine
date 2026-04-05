'use client';

import React from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import type { SignupFormValues } from './signupSchema';

type Props = {
  register: UseFormRegister<SignupFormValues>;
  errors: FieldErrors<SignupFormValues>;
  isSubmitting: boolean;
  onFieldChange: () => void;
};

const SignupPasswordFields = ({
  register,
  errors,
  isSubmitting,
  onFieldChange,
}: Props) => {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-left text-sm font-medium text-muted-foreground"
        >
          비밀번호
        </label>
        <input
          type="password"
          id="password"
          data-input-surface="dark"
          placeholder="••••••••"
          {...register('password', {
            onChange: onFieldChange,
          })}
          disabled={isSubmitting}
          className="w-full rounded-lg border border-white/10 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-colors focus:border-destructive/70 focus:outline-none focus:ring-2 focus:ring-destructive/50 disabled:opacity-50"
        />
        {errors.password && (
          <p className="text-left text-xs text-destructive">
            {errors.password.message}
          </p>
        )}
        {!errors.password && (
          <p className="text-left text-xs text-muted-foreground/70">
            영문(대소문자 무관), 숫자, 특수문자를 포함해 9자 이상 입력해주세요.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="confirmPassword"
          className="text-left text-sm font-medium text-muted-foreground"
        >
          비밀번호 확인
        </label>
        <input
          type="password"
          id="confirmPassword"
          data-input-surface="dark"
          placeholder="••••••••"
          {...register('confirmPassword', {
            onChange: onFieldChange,
          })}
          disabled={isSubmitting}
          className="w-full rounded-lg border border-white/10 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-colors focus:border-destructive/70 focus:outline-none focus:ring-2 focus:ring-destructive/50 disabled:opacity-50"
        />
        {errors.confirmPassword && (
          <p className="text-left text-xs text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>
    </>
  );
};

export default SignupPasswordFields;
