# Services 규칙

## API 호출 역할 분리

- **클라이언트(브라우저)**  
  - Next API Route만 호출합니다.  
  - 상대 경로(`/api/...`)를 쓰는 함수를 사용하고, 훅은 이 함수만 호출합니다.  
  - 예: `getStockListFromNextApi` → `fetch('/api/stocks?...')`

- **서버(API Route)**  
  - 외부 API만 호출합니다.  
  - `BaseUrl`(환경 변수)을 쓰는 서비스 함수만 사용합니다.  
  - 예: `getStockList` → `fetch(BaseUrl + '/api/stockList?...')`

정리: **클라이언트는 API Route만, 서버는 services만** 호출합니다.
