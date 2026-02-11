# Server Actions ガイドライン

## 1. 概要

本ドキュメントは、Next.js App RouterにおけるServer Actionsの実装パターンと規約を定義する。

### 関連ドキュメント

- [コーディングガイドライン](./coding-guidelines.md) - 基本的なServer Actionsパターン
- [フロントエンドパターン](./frontend-patterns.md) - クライアントとの連携

---

## 2. ディレクトリ構成

### 2.1 features配下の構成

```
features/{feature}/
├── queries/                    # データ取得（Server Component用）
│   ├── get{Feature}Detail.ts   # "use server"なし（Server Componentから直接呼び出し）
│   └── get{Feature}s.ts        # Clientから呼ぶ場合は"use server"維持
├── server-actions/             # mutation専用（"use server"あり）
│   ├── create{Feature}.ts
│   ├── update{Feature}.ts
│   └── delete{Feature}.ts
└── repositories/               # 純粋なDB操作
```

### 2.2 queries/ vs server-actions/

| ディレクトリ | 用途 | `"use server"` |
|-------------|------|----------------|
| `queries/` | データ取得（GET的操作） | Server Component専用なら不要、Clientから呼ぶなら必要 |
| `server-actions/` | データ変更（POST/PUT/DELETE的操作） | 必要 |

**背景**: Server Actionsは本来mutation用。データ取得処理を分離することで、意図が明確になり、Next.jsのキャッシュ機構の恩恵を受けやすくなる。

---

## 3. 基本パターン

### 3.1 標準的なServer Action

```typescript
"use server";

import { prisma } from "@delispect/db";
import { createPatientSchema, type CreatePatientInput } from "@/shared/schemata";
import type { Result } from "@/shared/types";

export async function createPatient(
  input: CreatePatientInput
): Promise<Result<Patient>> {
  // 1. バリデーション
  const parsed = createPatientSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  // 2. ビジネスロジック実行
  try {
    const patient = await prisma.patient.create({
      data: parsed.data,
    });
    return { success: true, value: patient };
  } catch (error) {
    return {
      success: false,
      value: { code: "CREATE_ERROR", cause: "患者の作成に失敗しました" },
    };
  }
}
```

---

## 4. バリデーション

### 4.1 原則

**入口でバリデーションし、以降の内部関数では型を信頼する。**

```typescript
const parsed = filterSchema.safeParse(input);
if (!parsed.success) {
  return {
    success: false,
    value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
  };
}

// 以降は parsed.data を使用（型安全）
return impl(parsed.data);
```

---

## 5. Raw SQLクエリ

### 5.1 使い分け

| 条件 | 推奨 |
|------|------|
| WHERE句が固定 | `$queryRaw`（tagged template） |
| WHERE句が動的（フィルター等） | `$queryRawUnsafe` |

### 5.2 $queryRaw（静的クエリ）

```typescript
const plans = await tx.$queryRaw<Plan[]>`
  SELECT id, name FROM plans
  WHERE workspace_id = ${token.workspaceId}::uuid
    AND deleted_at IS NULL
`;
```

### 5.3 $queryRawUnsafe（動的クエリ）

```typescript
const conditions: string[] = [`workspace_id = $1::uuid`];
const params: unknown[] = [token.workspaceId];
let paramIndex = 2;

if (planId) {
  conditions.push(`plan_id = $${paramIndex}::uuid`);
  params.push(planId);
  paramIndex++;
}

if (status) {
  conditions.push(`status = $${paramIndex}`);
  params.push(status);
  paramIndex++;
}

const result = await tx.$queryRawUnsafe<Patient[]>(
  `SELECT id, name, status FROM patients WHERE ${conditions.join(" AND ")}`,
  ...params
);
```

**注意**: 必ずパラメータバインディングを使用。文字列連結での値埋め込みは**禁止**。

---

## 6. Repository分離

### 6.1 分離の判断基準

| 条件 | 対応 |
|------|------|
| 単一クエリでシンプル | Server Action内に直接記述 |
| 複数DBクエリ / 複雑なロジック | `repositories/`に関数ごとのファイルとして切り出し |

### 6.2 Repository関数の例

```typescript
// features/patient/repositories/fetchPatientsWithCount.ts
import { prisma } from "@delispect/db";
import type { Result } from "@/shared/types";

export interface FetchPatientsOptions {
  wardId?: string;
  limit: number;
  offset: number;
}

export async function fetchPatientsWithCount(
  options: FetchPatientsOptions
): Promise<Result<{ patients: Patient[]; totalCount: number }>> {
  const { wardId, limit, offset } = options;

  try {
    const whereClause = {
      ...(wardId && { wardId }),
      deletedAt: null,
    };

    const [patients, totalCount] = await Promise.all([
      prisma.patient.findMany({
        where: whereClause,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
      }),
      prisma.patient.count({ where: whereClause }),
    ]);

    return { success: true, value: { patients, totalCount } };
  } catch (error) {
    return {
      success: false,
      value: { code: "DB_ERROR", cause: "DBエラー" },
    };
  }
}
```

---

## 7. エラーハンドリング

### 7.1 責務分担

| レイヤー | 責務 |
|---------|------|
| Repository | エラー検出・詳細情報を返却 |
| Server Action | ログ出力・ユーザー向けメッセージ変換 |

### 7.2 実装例

```typescript
// Server Action側
export async function getPatientList(input: GetPatientListInput): Promise<Result<...>> {
  // ... バリデーション

  const result = await fetchPatientsWithCount(parsed.data);

  if (!result.success) {
    logger.error({ code: result.value.code }, "fetchPatientsWithCount failed");
    return result;
  }

  return { success: true, value: result.value };
}
```

---

## 8. 外部API呼び出し時の注意

`fetch`でml-apiを呼び出す場合、mutation後は`revalidateTag`でキャッシュを無効化する。

---

## 9. ベストプラクティス

### 9.1 DO（推奨）

- `"use server"` ディレクティブを先頭に記載
- 入力は必ずZodでバリデーション
- Result型で結果を返却
- エラーログにコンテキスト情報を含める

### 9.2 DON'T（禁止）

- 生のErrorオブジェクトをクライアントに返す
- 文字列連結でSQLクエリを組み立てる
- try-catchなしで外部サービスを呼び出す
