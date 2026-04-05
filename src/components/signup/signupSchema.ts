import { z } from 'zod';

export const VERIFICATION_COOLDOWN_MS = 5 * 60 * 1000;

/** 닉네임 단일 필드 — RHF·서버 액션 공통 */
export const signupNicknameSchema = z
  .string()
  .trim()
  .min(2, '닉네임은 2자 이상 입력해주세요.')
  .max(20, '닉네임은 20자 이하로 입력해주세요.');

/** 이메일 단일 필드 */
export const signupEmailSchema = z
  .string()
  .trim()
  .email('올바른 이메일 형식이 아닙니다.');

/** 비밀번호 단일 필드 */
export const signupPasswordSchema = z
  .string()
  .min(9, '비밀번호는 9자 이상이어야 합니다.')
  .regex(/[A-Za-z]/, '영문을 포함해주세요.')
  .regex(/\d/, '숫자를 포함해주세요.')
  .regex(/[^A-Za-z0-9]/, '특수문자를 포함해주세요.');

/**
 * 최종 회원가입 API — nickname, email, password만 전달할 때 (서버 액션)
 * 폼 전체 스키마와 동일 규칙.
 */
export const signUpActionSchema = z.object({
  nickname: signupNicknameSchema,
  email: signupEmailSchema,
  password: signupPasswordSchema,
});

export const signupSchema = z
  .object({
    nickname: signupNicknameSchema,
    email: signupEmailSchema,
    verificationCode: z.string().optional(),
    password: signupPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: '비밀번호가 일치하지 않습니다.',
  });

export type SignupFormValues = z.infer<typeof signupSchema>;

export const sendVerificationEmailSchema = z.object({
  email: signupEmailSchema,
});

export const verifyEmailCodeFormSchema = z.object({
  email: signupEmailSchema,
  code: z
    .string()
    .trim()
    .min(1, '인증번호를 입력해주세요.'),
});

/**
 * 닉네임·이메일 「중복 확인」 UI 상태
 * - idle: 아직 확인 안 함, 또는 입력을 바꿔서 다시 확인이 필요한 상태
 * - checking: 서버 요청 중
 * - duplicate: 중복(사용 불가)
 * - available: 중복 아님(사용 가능)
 */
export type CheckStatus = 'idle' | 'checking' | 'duplicate' | 'available';
