# 3번: Server Components에서 직접 fetch해서 API route 줄이기

## 요약

- **페이지가 서버 컴포넌트**일 때, 그 페이지(또는 레이아웃) 안에서 **API route를 거치지 않고** 서버 전용 함수로 데이터를 가져올 수 있다.
- 그러면 **그 페이지 전용** Next.js API route(`/api/companies/.../cash-flow` 등)를 **안 만들어도 된다**.
- 대신 **클라이언트에서 같은 데이터를 다시 불러와야 할 때**(기간 전환, 탭 전환 등)는 API route를 하나 두거나, **Server Action**으로 대체할 수 있다.

---

## 1. 지금 구조 (API route 필수)

```
[브라우저]
  CashFlowView (client)
    → useCashFlow()
      → fetch('/api/companies/AAPL/statements/cash-flow?period=annual')
        → [Next API route] app/api/companies/[symbol]/statements/cash-flow/route.ts
          → getCashFlow() 등
            → fetch(FMP BaseUrl)  // 실제 외부 API
```

- 클라이언트는 **반드시** Next API 주소(`/api/...`)로만 요청할 수 있다.
- 그래서 **경로마다** `route.ts`를 만들어야 한다.

---

## 2. Server Component란?

- **기본이 서버에서만 실행**되는 컴포넌트.
- `async` 가능 → 그 안에서 `await fetch(...)` 또는 `await getCashFlow(...)` 같은 **서버 전용 함수** 호출 가능.
- 이 컴포넌트 코드는 **브라우저로 안 내려감** → 번들 크기 감소.
- Next 13+ App Router에서는 **기본이 Server Component**이고, `'use client'`를 쓰면 Client Component가 됨.

---

## 3. 3번 방식: 서버에서만 데이터 가져오기

**아이디어:**  
데이터가 **해당 페이지(또는 그 하위)에서만** 필요하고, **최초 로드 한 번**이면 충분할 때는, **페이지(Server Component)에서 직접** 데이터를 가져온다.  
그러면 그 데이터를 위한 **Next API route는 만들지 않아도 된다**.

### 예시: 현금흐름표 페이지 (단순화 버전)

**지금:**

- `app/companies/[symbol]/cash-flow/page.tsx` → Server Component지만 **데이터 안 가져옴**.
- `CashFlowView` (client)가 `useCashFlow` → `fetch(/api/.../cash-flow)` 호출 → **그래서** `/api/companies/[symbol]/statements/cash-flow/route.ts` 필요.

**3번 적용 시:**

- `getCashFlow`는 이미 **BaseUrl(FMP)** 로 직접 요청하는 **서버용 함수**다.
- 이걸 **페이지(Server Component)**에서 직접 호출하면, **API route 없이** 같은 데이터를 쓸 수 있다.

```tsx
// app/companies/[symbol]/cash-flow/page.tsx (Server Component)
import { getCashFlow } from '@/services/companies/statements/getCashFlow';
import CashFlowTable from '@/components/.../CashFlowTable';

export default async function CompanyCashFlowPage({ params }) {
  const { symbol } = await params;
  // 서버에서 직접 호출 → /api/... route 불필요
  const data = await getCashFlow({ symbol, period: 'annual', limit: 5 });

  return (
    <div>
      <h1>{symbol} 현금흐름표</h1>
      <CashFlowTable data={data} />
    </div>
  );
}
```

- 이렇게 하면 **이 페이지용** `/api/companies/[symbol]/statements/cash-flow` **route는 안 만들어도 됨**.

---

## 4. 그럼 API route는 언제 필요해?

다음처럼 **클라이언트에서 같은 데이터를 다시 요청**해야 할 때는 여전히 필요하다.

- **기간 전환**: 연간 ↔ 분기 (지금 `CashFlowView`의 `PeriodToggle`).
- **다른 탭/모달**에서 같은 API를 호출할 때.
- **여러 페이지**에서 같은 엔드포인트를 쓰는 경우.

이때 선택지는 두 가지다.

1. **API route 유지**  
   - `useCashFlow`가 계속 `fetch(/api/.../cash-flow)` 호출.
   - 기간 바꿀 때마다 같은 API로 refetch.

2. **Server Action 사용**  
   - 서버에서만 돌아가는 함수를 `'use server'`로 두고,  
     클라이언트에서 `period`만 바꿔가며 그 함수를 호출해서 **새 데이터**를 받는다.  
   - 그러면 “데이터 가져오기 전용” API route 하나는 줄일 수 있음 (대신 Server Action 파일은 필요).

---

## 5. 정리

| 상황 | API route 필요? | 3번(서버에서 직접 fetch) |
|------|-----------------|---------------------------|
| 페이지 최초 로드만, 그 페이지에서만 씀 | **필요 없음** | ✅ 페이지(Server Component)에서 `getCashFlow()` 등 직접 호출 |
| 클라이언트에서 기간/탭 바꿀 때 다시 불러옴 | **필요** (또는 Server Action) | ✅ 초기 데이터는 서버에서, refetch만 API/Server Action |

**실전 적용 예:**

- **초기 데이터**: `page.tsx`(Server Component)에서 `getCashFlow` 직접 호출 → **cash-flow용 API route 제거 가능**.
- **기간 전환**:  
  - 그대로 두려면 → `/api/.../cash-flow` 하나는 유지.  
  - 줄이려면 → Server Action 하나 만들어서 “period 받아서 getCashFlow 호출 후 결과 반환” 하면, API route 대신 쓸 수 있음.

이렇게 하면 “API를 몇 개 만들어야 하지?” 하는 부담을, **페이지 단위로는** 꽤 줄일 수 있다.
