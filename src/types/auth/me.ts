export type MeData = {
  memberId: number;
  email: string;
  nickname: string;
  role: string;
  tier: string;
  status: string;
};

export type MeResponse = {
  success: boolean;
  data: MeData;
  message: string;
  errorCode: string;
};
