'use client';

import React from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import type { CheckStatus, SignupFormValues } from './signupSchema';
import { VERIFICATION_COOLDOWN_MS } from './signupSchema';

type VerificationBanner = {
  type: 'success' | 'error';
  message: string;
} | null;

type Props = {
  register: UseFormRegister<SignupFormValues>;
  errors: FieldErrors<SignupFormValues>;
  email: string;
  emailStatus: CheckStatus;
  emailVerified: boolean;
  /** 한 번이라도 전송 성공 시 재전송 UI로 전환 */
  verificationCodeSentOnce: boolean;
  verificationBanner: VerificationBanner;
  cooldownRemainingSec: number;
  cooldownLabel: string;
  isSubmitting: boolean;
  isSendingVerificationCode: boolean;
  isVerifyingEmailCode: boolean;
  onEmailChange: () => void;
  onCheckEmail: () => void;
  onSendVerificationCode: () => void;
  onVerifyEmailCode: () => void;
  onVerificationCodeChange: () => void;
};

const SignupEmailSection = ({
  register,
  errors,
  email,
  emailStatus,
  emailVerified,
  verificationCodeSentOnce,
  verificationBanner,
  cooldownRemainingSec,
  cooldownLabel,
  isSubmitting,
  isSendingVerificationCode,
  isVerifyingEmailCode,
  onEmailChange,
  onCheckEmail,
  onSendVerificationCode,
  onVerifyEmailCode,
  onVerificationCodeChange,
}: Props) => {
  const showVerification =
    emailStatus === 'available' && email.trim().length > 0;

  /** 인증 완료 후에는 쿨다운·타이머 UI 숨김 (부모에서 resetCooldown 호출) */
  const showCooldownTimer = !emailVerified && cooldownRemainingSec > 0;

  const sendCodeDisabled =
    isSubmitting ||
    emailVerified ||
    isSendingVerificationCode ||
    cooldownRemainingSec > 0;

  const sendButtonLabel = (() => {
    if (emailVerified) return '인증 완료';
    if (isSendingVerificationCode) return '전송 중...';
    if (cooldownRemainingSec > 0) return '재전송 대기';
    return verificationCodeSentOnce ? '재전송' : '인증번호 받기';
  })();

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-left text-sm font-medium text-muted-foreground"
        >
          이메일
        </label>
        <div className="flex min-w-0 flex-row items-start gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <input
              type="email"
              id="email"
              data-input-surface="dark"
              placeholder="example@email.com"
              {...register('email', {
                onChange: onEmailChange,
              })}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-white/10 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-colors focus:border-destructive/70 focus:outline-none focus:ring-2 focus:ring-destructive/50 disabled:opacity-50"
            />
            {errors.email && (
              <p className="text-left text-xs text-destructive">
                {errors.email.message}
              </p>
            )}
            {!errors.email && emailStatus === 'available' && (
              <p className="text-left text-xs text-green-400">
                사용 가능한 이메일입니다.
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-wrap items-start justify-end gap-2 sm:justify-start">
            <button
              type="button"
              onClick={onCheckEmail}
              disabled={isSubmitting || emailStatus === 'checking'}
              className="h-10 min-w-[5.5rem] whitespace-nowrap rounded-md bg-destructive px-3 text-sm font-medium text-white transition-colors hover:bg-destructive/85 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[120px]"
            >
              {emailStatus === 'checking' ? '확인 중...' : '중복 확인'}
            </button>
          </div>
        </div>
      </div>

      {showVerification && (
        <div className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3">
          <p className="text-left text-xs font-medium text-muted-foreground">
            이메일 인증
          </p>
          <p className="text-left text-xs text-muted-foreground/80">
            인증번호 받기 후 메일로 온 번호를 입력하고 인증 확인을 눌러주세요.
            재전송은 {VERIFICATION_COOLDOWN_MS / 60000}분 후 가능합니다.
          </p>
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                data-input-surface="dark"
                placeholder="인증번호 6자리"
                disabled={isSubmitting || emailVerified}
                {...register('verificationCode', {
                  onChange: onVerificationCodeChange,
                })}
                className="w-full rounded-lg border border-white/10 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-colors focus:border-destructive/70 focus:outline-none focus:ring-2 focus:ring-destructive/50 disabled:opacity-50"
              />
              {errors.verificationCode && (
                <p className="text-left text-xs text-destructive">
                  {errors.verificationCode.message}
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onSendVerificationCode}
                disabled={sendCodeDisabled}
                title={
                  showCooldownTimer
                    ? `${cooldownLabel} 후 재전송할 수 있습니다`
                    : isSendingVerificationCode
                      ? '인증번호를 전송하는 중입니다'
                      : undefined
                }
                aria-busy={isSendingVerificationCode || showCooldownTimer}
                className="h-10 min-w-[5.5rem] whitespace-nowrap rounded-md border border-white/20 bg-white/10 px-3 text-sm font-medium text-foreground transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[120px]"
              >
                {sendButtonLabel}
              </button>
              {showCooldownTimer ? (
                <span className="text-xs tabular-nums text-muted-foreground">
                  {cooldownLabel}
                </span>
              ) : null}
              <button
                type="button"
                onClick={onVerifyEmailCode}
                disabled={isSubmitting || emailVerified || isVerifyingEmailCode}
                className="h-10 min-w-[5.5rem] whitespace-nowrap rounded-md bg-destructive px-3 text-sm font-medium text-white transition-colors hover:bg-destructive/85 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[100px]"
              >
                {emailVerified
                  ? '인증 완료'
                  : isVerifyingEmailCode
                    ? '확인 중...'
                    : '인증 확인'}
              </button>
            </div>
          </div>
          {verificationBanner && (
            <p
              className={`text-left text-xs ${
                verificationBanner.type === 'error'
                  ? 'text-destructive'
                  : 'text-green-400'
              }`}
              role={verificationBanner.type === 'error' ? 'alert' : 'status'}
            >
              {verificationBanner.message}
            </p>
          )}
        </div>
      )}
    </>
  );
};

export default SignupEmailSection;
