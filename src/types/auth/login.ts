export type LoginSuccessData = {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  nickname?: string;
  email?: string;
};

export type LoginResponse = {
  success: boolean;
  data?: LoginSuccessData;
  message?: string;
  errorCode?: string;
};
