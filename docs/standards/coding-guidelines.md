# コーディングガイドライン

## 1. 概要

本ドキュメントは、DELISPECTプロジェクトのコーディング規約を定義する。
Monorepo構成における統一的なコードスタイルと設計パターンを確立する。

### 関連ドキュメント

- [ディレクトリ設計ガイドライン](./package-design.md) - ディレクトリ構成・依存関係
- [フロントエンドパターン](./frontend-patterns.md) - コンポーネント設計・データ取得
- [Server Actionsガイドライン](./server-actions.md) - Server Actionsの実装パターン
- [テストガイドライン](./testing-guidelines.md) - テスト方針
- [ADR#0001](../adr/0001-monorepo-typescript.md) - 技術選定の背景

---

## 2. 設計原則

### 2.1 基本原則

| 原則 | 説明 |
|------|------|
| **単一責任** | 1つのモジュールは1つの責務のみを持つ |
| **DRY** | 重複を避け、共通ロジックは適切なパッケージに配置 |
| **YAGNI** | 必要になるまで機能を追加しない |
| **型安全性** | TypeScriptの型システムを最大限活用 |

### 2.2 アーキテクチャ原則

- **機能ベースアーキテクチャ**: フィーチャーごとにコードを整理
- **Server Actions優先**: Next.js App RouterのServer Actionsを活用
- **Result型パターン**: エラーハンドリングの統一
- **依存の方向**: 上位レイヤーから下位レイヤーへの一方向

---

## 3. ディレクトリ構造

ディレクトリ構成の詳細は [ディレクトリ設計ガイドライン](./package-design.md) を参照。

本セクションでは、フロントエンド層の構成規約を定義する。

### 3.1 フロントエンド構成

```
web/src/
├── features/                 # 機能別ディレクトリ
│   └── {feature}/
│       ├── components/       # 機能固有コンポーネント
│       ├── hooks/            # カスタムフック
│       ├── repositories/     # データアクセス関数
│       ├── server-actions/   # Server Actions
│       └── types/            # 型定義
├── shared/                   # 共通コード
│   ├── components/           # 共通コンポーネント
│   ├── types/                # Result型定義等
│   ├── schemata.ts           # Zodスキーマ（バリデーション用）
│   └── constants.ts          # 表示用定数（ラベル、色など）
├── lib/                      # ライブラリ設定（認証、DB等）
└── app/                      # Next.js App Router
    ├── (auth)/               # 認証が必要なルート
    │   ├── patients/
    │   │   ├── page.tsx
    │   │   └── [id]/
    │   │       └── page.tsx
    │   └── layout.tsx
    ├── api/                  # API Routes（必要な場合のみ）
    └── layout.tsx
```

### 3.2 スキーマと定数の分離

| ファイル | 責務 | 内容 |
|---------|------|------|
| `constants.ts` | 定数定義 | Enum値、ラベル、色、設定値 |
| `schemata.ts` | バリデーション | Zodスキーマ、型定義 |

依存関係: `schemata.ts` → `constants.ts`（単方向）

### 3.3 コンポーネントディレクトリ

```
components/
└── PatientCard/
    ├── PatientCard.tsx           # メインコンポーネント（index.tsxは使わない）
    ├── PatientCardHeader.tsx     # サブコンポーネント（同一ディレクトリに配置）
    ├── index.ts                  # re-exportのみ
    └── __tests__/
        ├── PatientCard.test.tsx
        └── PatientCardHeader.test.tsx
```

---

## 4. 命名規則

### 4.1 基本規則

| 種類 | 規則 | 例 |
|------|------|-----|
| コンポーネント | PascalCase | `PatientList`, `CareStatusBadge` |
| 関数 | camelCase | `getPatientById`, `calculateRiskScore` |
| 定数 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `DEFAULT_PAGE_SIZE` |
| 型・インターフェース | PascalCase | `Patient`, `CareStatus` |
| Enum | PascalCase（値もPascalCase） | `CareStatus.InProgress` |

### 4.2 ファイル・ディレクトリ命名

| 種類 | 規則 | 例 |
|------|------|-----|
| 一般ファイル | camelCase | `patientRepository.ts` |
| コンポーネントファイル | PascalCase | `PatientCard.tsx` |
| コンポーネントディレクトリ | PascalCase | `PatientCard/` |
| 一般ディレクトリ | kebab-case | `server-actions/` |
| テストファイル | `{対象}.test.ts(x)` | `patientRepository.test.ts` |

---

## 5. インポート規則

パッケージのインポートについては [ディレクトリ設計ガイドライン](./package-design.md#6-パッケージのインポート) を参照。

インポート順序はlint設定で強制する。

- 各モジュールは公開API（`index.ts`）からのみインポート
- 内部実装への直接アクセス禁止
- 循環インポート禁止

```typescript
// ✅ 良い例（パッケージから）
import { Patient } from '@delispect/core';

// ✅ 良い例（web内部）
import { useAuth } from '@/lib/auth';

// ❌ 悪い例（内部ファイルへの直接アクセス）
import { Patient } from '@delispect/core/src/types/patient';
```

---

## 6. エラーハンドリング

### 6.1 Result型

すべてのビジネスロジック、Server Actionは Result型 を返却する。

```typescript
export type Result<T> = Success<T> | Failure;
interface Success<T> { success: true; value: T; }
interface Failure { success: false; value: { code: string; cause: unknown }; }
```

### 6.2 エラーコード体系

```
{DOMAIN}_{OPERATION}_{ERROR_TYPE}
```

| カテゴリ | コード例 | 説明 |
|----------|----------|------|
| 共通 | `NOT_FOUND` | リソースが見つからない |
| 共通 | `INVALID_INPUT` | 入力検証エラー |
| 共通 | `UNAUTHORIZED` | 認証エラー |
| 共通 | `FORBIDDEN` | 権限不足 |
| 機能固有 | `PATIENT_CREATE_DUPLICATE` | 患者作成時の重複エラー |
| 機能固有 | `IMPORT_PARSE_ERROR` | インポート時のパースエラー |

### 6.3 例外の使用

| ケース | 手法 | 例 |
|--------|------|-----|
| 論理的にあり得ない状態 | 例外 | exhaustive checkのdefault到達、外部からの不正データ混入 |
| 回復不可能なエラー | 例外 | DB接続断、設定ファイル読み込み失敗 |
| ユーザー入力の検証エラー | Result型 | 不正なフォーマット、範囲外の値 |
| ビジネスルール違反 | Result型 | 重複登録、権限不足、リソース不存在 |

---

## 7. ログ出力

### 7.1 ログレベル

| レベル | 用途 |
|--------|------|
| `error` | エラー、例外 |
| `warn` | 警告、非推奨の使用 |
| `info` | 重要なイベント、処理開始・完了 |
| `debug` | デバッグ情報（開発時のみ） |

### 7.2 ログ出力のルール

```typescript
// 構造化ログを使用
logger.info('Patient created', {
  patientId: patient.id,
  wardId: patient.wardId,
  userId: currentUser.id,
});

// エラーログには必ずcontextを含める
logger.error('Failed to create patient', {
  input,
  error,
  userId: currentUser.id,
});

// 個人情報・機密情報はログに出力しない
// ❌ logger.info('Patient data', { patient }); // 患者情報全体
// ✅ logger.info('Patient created', { patientId: patient.id });
```

---

## 8. コメント・ドキュメント

### 8.1 コメントのルール

- **自明なコードにはコメント不要**
- **なぜ（Why）を説明するコメントは有用**
- **何を（What）説明するコメントは避ける**（コードで表現）

```typescript
// ❌ 悪い例（何をしているか説明）
// 年齢を計算する
const age = calculateAge(birthday);

// ✅ 良い例（なぜそうするか説明）
// 誕生日が未来の場合は0歳として扱う（入力エラー時の防御的処理）
const age = birthday > today ? 0 : calculateAge(birthday);
```

### 8.2 JSDoc

公開APIには JSDoc を記載する。

```typescript
/**
 * 患者の年齢を計算する
 *
 * @param birthday - 生年月日
 * @param baseDate - 基準日（省略時は現在日）
 * @returns 年齢（満年齢）
 *
 * @example
 * ```ts
 * const age = calculateAge(new Date('1990-01-15'));
 * ```
 */
export function calculateAge(birthday: Date, baseDate: Date = new Date()): number {
  // ...
}
```
