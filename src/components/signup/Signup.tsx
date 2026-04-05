'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import {
  checkEmailDuplicateAction,
  checkNicknameDuplicateAction,
  sendEmailVerificationCodeAction,
  signUpAction,
  verifyEmailCodeAction,
} from '@/actions/signup';
import SignupEmailSection from './SignupEmailSection';
import SignupNicknameField from './SignupNicknameField';
import SignupPasswordFields from './SignupPasswordFields';
import {
  signupSchema,
  VERIFICATION_COOLDOWN_MS,
  type CheckStatus,
  type SignupFormValues,
} from './signupSchema';
import { useVerificationCooldown } from './useVerificationCooldown';

const Signup = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    watch,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
    defaultValues: {
      nickname: '',
      email: '',
      verificationCode: '',
      password: '',
      confirmPassword: '',
    },
  });

  const [nicknameStatus, setNicknameStatus] = useState<CheckStatus>('idle');
  const [emailStatus, setEmailStatus] = useState<CheckStatus>('idle');
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationBanner, setVerificationBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successDialogMessage, setSuccessDialogMessage] = useState('');
  /** 인증번호를 한 번이라도 보낸 뒤에는 버튼 문구를「재전송」으로 */
  const [verificationCodeSentOnce, setVerificationCodeSentOnce] =
    useState(false);
  /** 전송 API 대기 중 — 클릭 직후 비활성화(중복 클릭 방지), 완료/실패 후 해제 */
  const [isSendingVerificationCode, setIsSendingVerificationCode] =
    useState(false);
  /** 인증 확인 API 대기 중 */
  const [isVerifyingEmailCode, setIsVerifyingEmailCode] = useState(false);

  const {
    setCooldownEndsAt,
    cooldownRemainingSec,
    cooldownLabel,
    resetCooldown,
  } = useVerificationCooldown();

  const email = watch('email');

  const nicknameInputClass = useMemo(() => {
    if (nicknameStatus === 'available') {
      return 'border-green-500/80 focus:ring-green-500/40 focus:border-green-500';
    }
    if (nicknameStatus === 'duplicate') {
      return 'border-destructive/70 focus:ring-destructive/50 focus:border-destructive/70';
    }
    return 'border-white/10 focus:ring-destructive/50 focus:border-destructive/70';
  }, [nicknameStatus]);

  const clearSubmitMessages = () => {
    setSubmitError('');
    setSuccessDialogOpen(false);
    setSuccessDialogMessage('');
  };

  const handleCheckNickname = async () => {
    clearSubmitMessages();
    const targetNickname = getValues('nickname').trim();
    if (!targetNickname) {
      setError('nickname', { message: '닉네임을 입력해주세요.' });
      return;
    }

    setNicknameStatus('checking');
    const result = await checkNicknameDuplicateAction(targetNickname);
    if (!result.success) {
      setNicknameStatus('duplicate');
      setError('nickname', { message: result.error ?? '중복된 닉네임입니다.' });
      return;
    }

    clearErrors('nickname');
    setNicknameStatus('available');
    setSubmitError('');
  };

  const handleCheckEmail = async () => {
    clearSubmitMessages();
    setVerificationBanner(null);
    const targetEmail = getValues('email').trim();
    if (!targetEmail) {
      setError('email', { message: '이메일을 입력해주세요.' });
      return;
    }

    setEmailStatus('checking');
    const result = await checkEmailDuplicateAction(targetEmail);
    if (!result.success) {
      setEmailStatus('duplicate');
      setError('email', { message: result.error ?? '중복된 이메일입니다.' });
      return;
    }

    clearErrors('email');
    setEmailStatus('available');
    setEmailVerified(false);
    resetCooldown();
    setVerificationCodeSentOnce(false);
    setIsSendingVerificationCode(false);
    setIsVerifyingEmailCode(false);
    setValue('verificationCode', '');
    clearErrors('verificationCode');
    setSubmitError('');
  };

  const handleSendVerificationCode = async () => {
    setSubmitError('');
    if (emailVerified || isSendingVerificationCode) return;
    if (cooldownRemainingSec > 0) return;

    const targetEmail = getValues('email').trim();
    setIsSendingVerificationCode(true);
    setVerificationBanner(null);

    try {
      const result = await sendEmailVerificationCodeAction(targetEmail);
      if (!result.success) {
        setVerificationBanner({
          type: 'error',
          message: result.error ?? '인증번호 전송에 실패했습니다.',
        });
        return;
      }

      setCooldownEndsAt(Date.now() + VERIFICATION_COOLDOWN_MS);
      setVerificationCodeSentOnce(true);
      setEmailVerified(false);
      setVerificationBanner({
        type: 'success',
        message:
          result.message ?? '인증번호를 전송했습니다. 이메일을 확인해주세요.',
      });
    } finally {
      setIsSendingVerificationCode(false);
    }
  };

  const handleVerifyEmailCode = async () => {
    setSubmitError('');
    if (emailVerified || isVerifyingEmailCode) return;

    const targetEmail = getValues('email').trim();
    const code = String(getValues('verificationCode') ?? '').trim();
    if (!code) {
      setError('verificationCode', { message: '인증번호를 입력해주세요.' });
      return;
    }

    setIsVerifyingEmailCode(true);
    setVerificationBanner(null);

    try {
      const result = await verifyEmailCodeAction(targetEmail, code);
      if (!result.success) {
        setVerificationBanner({
          type: 'error',
          message: result.error ?? '인증번호가 올바르지 않습니다.',
        });
        return;
      }

      clearErrors('verificationCode');
      resetCooldown();
      setEmailVerified(true);
      setVerificationBanner({
        type: 'success',
        message: result.message ?? '이메일 인증이 완료되었습니다.',
      });
    } finally {
      setIsVerifyingEmailCode(false);
    }
  };

  const onSubmit = async (values: SignupFormValues) => {
    setSubmitError('');
    setSuccessDialogOpen(false);
    setSuccessDialogMessage('');
    if (nicknameStatus !== 'available') {
      setError('nickname', { message: '닉네임 중복 확인을 완료해주세요.' });
      return;
    }
    if (emailStatus !== 'available') {
      setError('email', { message: '이메일 중복 확인을 완료해주세요.' });
      return;
    }
    if (!emailVerified) {
      setError('verificationCode', { message: '이메일 인증을 완료해주세요.' });
      return;
    }

    const result = await signUpAction({
      nickname: values.nickname.trim(),
      email: values.email.trim(),
      password: values.password,
    });

    if (!result.success) {
      setSubmitError(result.error ?? '회원가입 중 오류가 발생했습니다.');
      return;
    }

    setSubmitError('');
    setSuccessDialogMessage(
      result.message ?? '회원가입이 완료되었습니다.',
    );
    setSuccessDialogOpen(true);
  };

  return (
    <div className="h-auto min-h-0 w-full max-w-[560px] rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:p-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full min-w-0 flex-col gap-4 sm:min-w-[420px]"
      >
        <SignupNicknameField
          register={register}
          errors={errors}
          nicknameStatus={nicknameStatus}
          nicknameInputClass={nicknameInputClass}
          isSubmitting={isSubmitting}
          onNicknameChange={() => {
            setNicknameStatus('idle');
            clearSubmitMessages();
          }}
          onCheckNickname={handleCheckNickname}
        />

        <SignupEmailSection
          register={register}
          errors={errors}
          email={email}
          emailStatus={emailStatus}
          emailVerified={emailVerified}
          verificationCodeSentOnce={verificationCodeSentOnce}
          verificationBanner={verificationBanner}
          cooldownRemainingSec={cooldownRemainingSec}
          cooldownLabel={cooldownLabel}
          isSubmitting={isSubmitting}
          isSendingVerificationCode={isSendingVerificationCode}
          isVerifyingEmailCode={isVerifyingEmailCode}
          onEmailChange={() => {
            setEmailStatus('idle');
            setEmailVerified(false);
            resetCooldown();
            setVerificationCodeSentOnce(false);
            setIsSendingVerificationCode(false);
            setIsVerifyingEmailCode(false);
            setVerificationBanner(null);
            setValue('verificationCode', '');
            clearErrors('verificationCode');
            clearSubmitMessages();
          }}
          onCheckEmail={handleCheckEmail}
          onSendVerificationCode={handleSendVerificationCode}
          onVerifyEmailCode={handleVerifyEmailCode}
          onVerificationCodeChange={() => {
            setVerificationBanner(null);
            clearSubmitMessages();
          }}
        />

        <SignupPasswordFields
          register={register}
          errors={errors}
          isSubmitting={isSubmitting}
          onFieldChange={clearSubmitMessages}
        />

        {submitError ? (
          <p className="text-left text-xs text-destructive" role="alert">
            {submitError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 w-full cursor-pointer rounded-lg bg-destructive py-2.5 text-sm font-semibold text-white transition-colors hover:bg-destructive/85 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? '가입 중...' : '회원가입'}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-muted-foreground/50">
        계정이 있으신가요?{' '}
        <Link
          href="/#signin"
          className="font-medium text-destructive/80 transition-colors hover:text-destructive hover:underline"
        >
          로그인
        </Link>
      </p>

      <ConfirmDialog
        open={successDialogOpen}
        onOpenChange={setSuccessDialogOpen}
        title="회원가입 완료"
        description={successDialogMessage}
        confirmLabel="확인"
        onConfirm={() => {
          router.push('/');
        }}
      />
    </div>
  );
};

export default Signup;
