'use client';

import React from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import type { CheckStatus, SignupFormValues } from './signupSchema';

type Props = {
  register: UseFormRegister<SignupFormValues>;
  errors: FieldErrors<SignupFormValues>;
  nicknameStatus: CheckStatus;
  nicknameInputClass: string;
  isSubmitting: boolean;
  onNicknameChange: () => void;
  onCheckNickname: () => void;
};

const SignupNicknameField = ({
  register,
  errors,
  nicknameStatus,
  nicknameInputClass,
  isSubmitting,
  onNicknameChange,
  onCheckNickname,
}: Props) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor="nickname"
        className="text-left text-sm font-medium text-muted-foreground"
      >
        닉네임
      </label>
      <div className="flex min-w-0 flex-row items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <input
            type="text"
            id="nickname"
            data-input-surface="dark"
            placeholder="닉네임"
            {...register('nickname', {
              onChange: onNicknameChange,
            })}
            disabled={isSubmitting}
            className={`w-full rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 ${nicknameInputClass}`}
          />
          {errors.nickname && (
            <p className="text-left text-xs text-destructive">
              {errors.nickname.message}
            </p>
          )}
          {!errors.nickname && nicknameStatus === 'available' && (
            <p className="text-left text-xs text-green-400">
              사용 가능한 닉네임입니다.
            </p>
          )}
        </div>
        <div className="flex shrink-0">
          <button
            type="button"
            onClick={onCheckNickname}
            disabled={isSubmitting || nicknameStatus === 'checking'}
            className="h-10 min-w-[5.5rem] whitespace-nowrap rounded-md bg-destructive px-3 text-sm font-medium text-white transition-colors hover:bg-destructive/85 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[120px]"
          >
            {nicknameStatus === 'checking' ? '확인 중...' : '중복 확인'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupNicknameField;
