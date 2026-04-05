import { z } from 'zod';

/** 로그인 폼 — 클라이언트(RHF)와 서버 액션에서 동일 스키마로 검증 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, '이메일을 입력해주세요.')
    .email('올바른 이메일 형식이 아닙니다.')
    .transform((s) => s.toLowerCase()),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
