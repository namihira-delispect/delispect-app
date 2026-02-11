# フロントエンドパターン

## 1. 概要

本ドキュメントは、Next.js App Routerにおけるコンポーネント設計とデータ取得パターンを定義する。

### 関連ドキュメント

- [コーディングガイドライン](./coding-guidelines.md) - 命名規則・型定義
- [Server Actionsガイドライン](./server-actions.md) - Server Actionsの実装パターン

---

## 2. コンポーネント設計

### 2.1 Server Components vs Client Components

| 使うべき場合 | コンポーネント |
|-------------|---------------|
| データ取得、静的表示 | Server Component |
| ユーザー操作（検索・フィルタ・フォーム） | Client Component |

---

## 3. データ取得パターン

### 3.1 データ取得の責務分担

| 取得場所 | 対象データ |
|----------|-----------|
| `page.tsx` | ページ全体の表示可否、複数コンポーネントで共有 |
| コンポーネント | そのコンポーネントに閉じたデータ |

### 3.2 コンポーネント内でのデータ取得

コンポーネントが自身でデータ取得・エラーハンドリングを行う。

```typescript
// components/CarePlanSummary/CarePlanSummary.tsx
export async function CarePlanSummary({ planId }: Props) {
  const result = await getCarePlanSummary({ planId });

  if (!result.success) {
    return <ErrorMessage message="データの取得に失敗しました" />;
  }

  return <CarePlanSummaryView data={result.value} />;
}
```

### 3.3 React cache()による重複呼び出し防止

同一リクエスト内で同じデータを複数回取得する場合に使用。

```typescript
import { cache } from "react";

// オブジェクト引数はJSONキーで安定化
const getDataByKey = cache(async (filterKey: string) => {
  const filter = JSON.parse(filterKey);
  return getDataImpl(filter);
});

export async function getData(filter: Filter) {
  const filterKey = JSON.stringify(filter, Object.keys(filter).sort());
  return getDataByKey(filterKey);
}
```

---

## 4. Client Componentとの連携

### 4.1 Server Componentラッパーパターン

D3.js等のクライアントライブラリはServer Componentラッパーを作成。

```
CarePlanCharts/
├── CarePlanCharts.tsx        # Server Component（データ取得）
└── CarePlanChartsClient.tsx  # Client Component（描画）
```

```typescript
// CarePlanCharts.tsx (Server Component)
export async function CarePlanCharts({ planId }: Props) {
  const result = await getCarePlanSummary({ planId });

  if (!result.success) {
    return <ErrorMessage />;
  }

  return <CarePlanChartsClient data={result.value} />;
}
```

```typescript
// CarePlanChartsClient.tsx (Client Component)
"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

export function CarePlanChartsClient({ data }: { data: CarePlanData }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    // D3.jsによる描画処理
  }, [data]);

  return <svg ref={svgRef} />;
}
```

---

## 5. 状態管理

### 5.1 状態の種類と手法

| 種類 | 手法 |
|------|------|
| ローカル状態 | `useState`, `useReducer` |
| サーバー状態 | Server Components + Server Actions |
| 複雑な状態 | Context API |

### 5.2 状態管理の原則

- **サーバー状態はServer Componentsで管理**: データ取得はServer Components、変更はServer Actions
- **クライアント状態は最小限に**: フォーム入力、UI状態（モーダル開閉等）のみ
- **Contextは慎重に使用**: 本当にグローバルに必要な場合のみ

---

## 6. ローディングとエラーハンドリング

### 6.1 Suspenseによるローディング

```typescript
// app/(auth)/patients/page.tsx
import { Suspense } from "react";
import { PatientList } from "@/app/components/PatientList";
import { PatientListSkeleton } from "@/app/components/PatientList/PatientListSkeleton";

export default function PatientsPage() {
  return (
    <Suspense fallback={<PatientListSkeleton />}>
      <PatientList />
    </Suspense>
  );
}
```

### 6.2 Error Boundaryによるエラーハンドリング

```typescript
// app/(auth)/patients/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>エラーが発生しました</h2>
      <button onClick={reset}>再試行</button>
    </div>
  );
}
```

---
