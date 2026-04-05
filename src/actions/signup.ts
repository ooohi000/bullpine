'use server';

import { checkEmailService } from '@/services/signup/checkEmailService';
import { checkNicknameService } from '@/services/signup/checkNicknameService';
import { sendCodeService } from '@/services/signup/sendCodeService';
import { signupService } from '@/services/signup/signupService';
import { verifyCodeService } from '@/services/signup/verifyCodeService';
import { BaseUrl } from '@/services/baseUrl';
import {
  sendVerificationEmailSchema,
  signUpActionSchema,
  signupEmailSchema,
  signupNicknameSchema,
  verifyEmailCodeFormSchema,
} from '@/components/signup/signupSchema';

/**
 * 클라이언트(`use client`)에서 직접 service를 부르지 않는 이유:
 * - service는 `fetch(BaseUrl + '/api/...')`를 하는데, 이걸 클라이언트에서 import하면
 *   요청이 브라우저에서 나가고, `BaseUrl`도 번들/네트워크에 더 가깝게 노출될 수 있음.
 * - `'use server'` 액션은 **서버에서만** 실행되므로, 서비스 호출·에러 처리는 여기서 한 번 감싼 뒤
 *   `{ success, error?, message? }`처럼 **직렬화 가능한 결과만** 클라이언트로 돌려줌.
 *
 * 흐름: 폼(클라이언트) → server action(이 파일) → service(HTTP) → 백엔드(또는 BFF)
 */

export type SignupActionResult = {
  success: boolean;
  error?: string;
  message?: string;
};

const assertBaseUrl = (): string | null => {
  if (!BaseUrl) {
    return null;
  }
  return BaseUrl;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return '요청 처리 중 오류가 발생했습니다.';
};

const firstZodMessage = (issues: { message: string }[]) =>
  issues[0]?.message ?? '입력값을 확인해주세요.';

/**
 * 백엔드가 `{ available: true }` / `{ exists: false }` 등 다양한 형태를 줄 수 있어서
 * 여러 패턴을 허용. 실제 API 스펙이 정해지면 여기만 좁히면 됨.
 */
const parseAvailability = (
  data: unknown,
): {
  available: boolean;
  message?: string;
} => {
  if (data == null || typeof data !== 'object') {
    return { available: true };
  }
  const d = data as Record<string, unknown>;

  if (typeof d.available === 'boolean') {
    return {
      available: d.available,
      message: typeof d.message === 'string' ? d.message : undefined,
    };
  }
  if (typeof d.exists === 'boolean') {
    return {
      available: !d.exists,
      message: typeof d.message === 'string' ? d.message : undefined,
    };
  }
  if (typeof d.duplicate === 'boolean') {
    return {
      available: !d.duplicate,
      message: typeof d.message === 'string' ? d.message : undefined,
    };
  }
  if (typeof d.isDuplicate === 'boolean') {
    return {
      available: !d.isDuplicate,
      message: typeof d.message === 'string' ? d.message : undefined,
    };
  }
  if (d.data != null && typeof d.data === 'object') {
    return parseAvailability(d.data);
  }

  return {
    available: true,
    message: typeof d.message === 'string' ? d.message : undefined,
  };
};

export async function checkNicknameDuplicateAction(
  nickname: string,
): Promise<SignupActionResult> {
  const parsed = signupNicknameSchema.safeParse(nickname);
  if (!parsed.success) {
    return { success: false, error: firstZodMessage(parsed.error.issues) };
  }
  const trimmed = parsed.data;

  if (!assertBaseUrl()) {
    return { success: false, error: 'API 주소가 설정되지 않았습니다.' };
  }

  try {
    const data = await checkNicknameService(trimmed);
    const { available, message } = parseAvailability(data);
    if (!available) {
      return {
        success: false,
        error: message ?? '이미 사용 중인 닉네임입니다.',
      };
    }
    return {
      success: true,
      message: message ?? '사용 가능한 닉네임입니다.',
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function checkEmailDuplicateAction(
  email: string,
): Promise<SignupActionResult> {
  const parsed = signupEmailSchema.safeParse(email);
  if (!parsed.success) {
    return { success: false, error: firstZodMessage(parsed.error.issues) };
  }
  const normalized = parsed.data.toLowerCase();

  if (!assertBaseUrl()) {
    return { success: false, error: 'API 주소가 설정되지 않았습니다.' };
  }

  try {
    const data = await checkEmailService(normalized);
    const { available, message } = parseAvailability(data);
    if (!available) {
      return { success: false, error: message ?? '이미 가입된 이메일입니다.' };
    }
    return {
      success: true,
      message: message ?? '사용 가능한 이메일입니다.',
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function sendEmailVerificationCodeAction(
  email: string,
): Promise<SignupActionResult> {
  const parsed = sendVerificationEmailSchema.safeParse({ email });
  if (!parsed.success) {
    return { success: false, error: firstZodMessage(parsed.error.issues) };
  }
  const normalized = parsed.data.email.toLowerCase();

  if (!assertBaseUrl()) {
    return { success: false, error: 'API 주소가 설정되지 않았습니다.' };
  }

  try {
    const data = await sendCodeService(normalized);
    const message =
      typeof data === 'object' && data != null && 'message' in data
        ? String((data as { message?: unknown }).message)
        : undefined;
    return {
      success: true,
      message: message ?? '인증번호를 전송했습니다.',
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function signUpAction(
  payload: unknown,
): Promise<SignupActionResult> {
  const parsed = signUpActionSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: firstZodMessage(parsed.error.issues) };
  }

  const { nickname, email, password } = parsed.data;

  if (!assertBaseUrl()) {
    return { success: false, error: 'API 주소가 설정되지 않았습니다.' };
  }

  try {
    await signupService(
      nickname,
      email.toLowerCase(),
      password,
    );
    return { success: true, message: '회원가입이 완료되었습니다.' };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/** 인증번호 입력 UI를 붙일 때 폼에서 호출 */
export async function verifyEmailCodeAction(
  email: string,
  code: string,
): Promise<SignupActionResult> {
  const parsed = verifyEmailCodeFormSchema.safeParse({ email, code });
  if (!parsed.success) {
    return { success: false, error: firstZodMessage(parsed.error.issues) };
  }

  const normalizedEmail = parsed.data.email.toLowerCase();
  const trimmedCode = parsed.data.code;

  if (!assertBaseUrl()) {
    return { success: false, error: 'API 주소가 설정되지 않았습니다.' };
  }

  try {
    await verifyCodeService(normalizedEmail, trimmedCode);
    return { success: true, message: '이메일 인증이 완료되었습니다.' };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
