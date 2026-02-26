# DELISPECT - Claude Code プロジェクトコンテキスト

## プロジェクト概要

せん妄リスク評価システム（DELISPECT）。入院患者のせん妄リスクを評価し、ケアプラン策定・ハイリスクケア加算判定を支援する医療向けWebアプリケーション。

## リポジトリ構成

```
delispect-app/
├── apps/
│   └── web/                        # Next.js Web Application (App Router)
│       ├── src/
│       │   ├── app/                 # Next.js App Router
│       │   ├── features/            # 機能別ディレクトリ
│       │   ├── shared/              # 共通コード（Result型、Zodスキーマ、定数）
│       │   └── lib/                 # ライブラリ設定（認証、DB等）
│       ├── eslint.config.mjs
│       └── vitest.config.ts
├── packages/
│   ├── db/                          # Prisma Schema & DB Client
│   │   ├── prisma/schema.prisma
│   │   └── src/
│   └── auth/                        # 認証パッケージ
├── docs/
│   ├── requirements-definition/     # 要件定義書
│   ├── design/                      # 設計書
│   ├── standards/                   # コーディング規約・テスト規約
│   ├── development-workflows/       # 開発フロー
│   ├── decision-records/            # ADR
│   ├── reference/                   # リファレンス
│   └── templates/                   # テンプレート
├── docker-compose.yml               # 開発環境（web + internaldb + externaldb）
├── pnpm-workspace.yaml              # Monorepo workspace config
├── tsconfig.base.json               # Shared TypeScript config
└── package.json                     # Root workspace config
```

## アーキテクチャ原則

- **機能ベースアーキテクチャ**: フィーチャーごとにコードを整理（`features/{feature}/`）
- **Server Actions優先**: Next.js App RouterのServer Actionsでmutation、queriesでデータ取得
- **Result型パターン**: エラーハンドリングの統一（`{ success: true, value } | { success: false, value: { code, cause } }`）
- **依存の方向**: 上位レイヤー→下位レイヤーの一方向（web → db → core）
- **型安全性**: TypeScriptのstrict modeを最大限活用

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript 5.7 |
| Backend | Next.js Server Actions |
| DB | PostgreSQL 15 (内部DB: 5432, 外部DB: 5433), Prisma 6.3 |
| Test | Vitest 3 (単体・統合), Playwright (E2E) |
| Infra | Docker / Docker Compose |
| Lint/Format | ESLint 9, Prettier 3 |
| Package | pnpm 10 (workspace) |

## 開発規約

### ブランチ・コミット
- **ブランチ**: `feature/xxx`, `fix/xxx`, `docs/xxx`
- **コミット**: Conventional Commits + 日本語
  - type: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`
  - scope: `web`, `db`, `auth`, `docs`
- **PR**: マージ戦略は squash merge

### 命名規則
| 対象 | スタイル | 例 |
|------|---------|-----|
| ファイル名（一般） | camelCase | `patientRepository.ts` |
| ディレクトリ名 | kebab-case | `server-actions/` |
| コンポーネント | PascalCase | `PatientCard.tsx` |
| 関数 | camelCase | `getPatientById` |
| 定数 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 型・インターフェース | PascalCase | `Patient`, `CareStatus` |

## テスト方針

- **テストピラミッド**: 単体テスト → 統合テスト(実DB) → E2Eテスト(重要フロー)
- **テスト記述**: 日本語で記述（`describe` + `it`）
- **パターン**: Arrange-Act-Assert
- Mock対象: 認証（authorizeServerAction）、外部サービス（ml-api等）、監査ログ
- Mockしない: DB操作（Prisma）、ビジネスロジック関数

## ドキュメントマップ

| カテゴリ | パス |
|---------|------|
| 要件定義 | `docs/requirements-definition/` |
| 設計書 | `docs/design/` |
| コーディング規約 | `docs/standards/coding-guidelines.md` |
| テスト規約 | `docs/standards/testing-guidelines.md` |
| フロントエンドパターン | `docs/standards/frontend-patterns.md` |
| Server Actions規約 | `docs/standards/server-actions.md` |
| ディレクトリ設計 | `docs/standards/package-design.md` |
| 開発フロー | `docs/development-workflows/` |
| ADR | `docs/decision-records/` |
| テンプレート | `docs/templates/` |

## 品質ゲート

```
lint → typecheck → test
```

## よく使うコマンド

```bash
# 開発
pnpm dev                        # 開発サーバー起動
pnpm build                      # 全パッケージビルド

# 品質チェック
pnpm lint                       # ESLint実行（全パッケージ）
pnpm lint:fix                   # ESLint自動修正
pnpm typecheck                  # TypeScript型チェック
pnpm test                       # 全テスト実行
pnpm test:watch                 # ウォッチモード
pnpm test:coverage              # カバレッジ付き実行
pnpm format                     # Prettier フォーマット
pnpm format:check               # フォーマットチェック

# データベース
pnpm db:generate                # Prismaクライアント生成
pnpm db:migrate:dev             # マイグレーション実行（開発）
pnpm db:migrate:deploy          # マイグレーション実行（本番）
pnpm db:push                    # スキーマをDBに反映
pnpm db:seed                    # シードデータ投入

# Docker
docker compose up -d            # 開発環境起動
docker compose down             # 開発環境停止
```
