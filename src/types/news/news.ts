/** 보도자료 API 요청 (page는 0부터) */
export interface GetPressReleasesProps {
  symbol: string;
  page: number;
  limit: number;
  /** 상한 일자 필터 (YYYY-MM-DD), 백엔드가 지원할 때만 전달 */
  to?: string;
}

/** 무한 스크롤 훅 — page는 내부에서만 증가 */
export type InfinitePressReleasesParams = Omit<GetPressReleasesProps, 'page'>;

export interface PressReleaseItem {
  id: number;
  image: string;
  publishedDate: string;
  publisher: string;
  site: string;
  symbol: string;
  text: string;
  title: string;
  url: string;
}

/** 뉴스·보도자료 리스트 UI 공통 항목 (보도자료 스키마와 동일) */
export type NewsItem = PressReleaseItem;

/**
 * 주식 뉴스 등 클라이언트 fetch 후 `result.data` 형태.
 * 배열이거나 `data`/`content`에 목록이 올 수 있음.
 */
export type NewsResponse =
  | NewsItem[]
  | {
      data?: NewsItem[];
      content?: NewsItem[];
      last?: boolean;
      page?: number;
    };

export interface PressReleasesResponse {
  success: boolean;
  data: {
    content: PressReleaseItem[];
    last: boolean;
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}
