# DELISPECT - 採用プロダクト ライセンス整理（別紙）

## 目次

- [DELISPECT - 採用プロダクト ライセンス整理（別紙）](#delispect---採用プロダクト-ライセンス整理別紙)
  - [目次](#目次)
  - [1. 目的と範囲](#1-目的と範囲)
  - [2. 採用プロダクトとライセンス](#2-採用プロダクトとライセンス)
  - [3. 採用対象外・未確定（参考）](#3-採用対象外未確定参考)
  - [4. ライセンス運用ルール](#4-ライセンス運用ルール)
  - [文書情報](#文書情報)

## 1. 目的と範囲

- 本書は、検討資料で採用方針が示されたプロダクトのライセンスを別紙として整理する。
- 対象資料:
  - `01_system_architecture.md`
  - `03_backend_design_consideration.md`
  - `04_frontend_design_consideration.md`
  - [ADR-0004](../decision-records/0004-frontend-ui-kit.md)
- 本書の「採用」は、上記資料で「採用」「継続」「部分採用」と記載されたものを対象とする。

## 2. 採用プロダクトとライセンス

| 区分 | プロダクト | 採用方針 | ライセンス | 参考 |
|---|---|---|---|---|
| Web基盤 | Next.js (App Router) | 採用 | MIT | <https://github.com/vercel/next.js> |
| 言語 | TypeScript | 採用 | Apache-2.0 | <https://github.com/microsoft/TypeScript> |
| 認証 | NextAuth (Credentials) | 採用 | ISC | <https://github.com/nextauthjs/next-auth> |
| DB | PostgreSQL 15 | 採用 | PostgreSQL License | <https://www.postgresql.org/about/licence/> |
| ORM | Prisma | 採用 | Apache-2.0 | <https://github.com/prisma/prisma> |
| 監査DB拡張 | pgAudit | 採用 | PostgreSQL License | <https://github.com/pgaudit/pgaudit> |
| 履歴管理 | Temporal Tables | 初期リリースで導入可否を検討 | PostgreSQL License（PostgreSQL実装を利用する場合） | <https://www.postgresql.org/about/licence/> |
| バリデーション | Zod | 採用 | MIT | <https://github.com/colinhacks/zod> |
| 管理画面 | React-admin | 連携前提で採用 | MIT | <https://github.com/marmelab/react-admin> |
| UI | MUI (`@mui/material`) | 継続採用 | MIT | <https://github.com/mui/material-ui> |
| UI（部分採用） | Tailwind CSS | 部分採用 | MIT | <https://github.com/tailwindlabs/tailwindcss> |
| UI（部分採用） | shadcn/ui | 部分採用 | MIT | <https://github.com/shadcn-ui/ui> |
| スタイリング | emotion (`@emotion/react`) | 継続採用 | MIT | <https://github.com/emotion-js/emotion> |
| フォーム | react-hook-form | 継続採用 | MIT | <https://github.com/react-hook-form/react-hook-form> |
| データ取得 | TanStack Query (`@tanstack/react-query`) | 採用 | MIT | <https://github.com/TanStack/query> |
| ロギング | pino | 継続採用 | MIT | <https://github.com/pinojs/pino> |
| テスト | Jest | 継続採用 | MIT | <https://github.com/jestjs/jest> |
| テスト | Testing Library | 継続採用 | MIT | <https://github.com/testing-library/react-testing-library> |
| E2E | Playwright | 継続採用 | Apache-2.0 | <https://github.com/microsoft/playwright> |
| コンテナ | Docker Engine | 採用 | Apache-2.0 | <https://docs.docker.com/engine/install/> |
| コンテナ構成 | Docker Compose | 採用 | Apache-2.0 | <https://github.com/docker/compose> |
| Monorepo | pnpm workspace | 採用 | MIT | <https://github.com/pnpm/pnpm> |

## 3. 採用対象外・未確定（参考）

- `SWR`: 廃止方針（React Queryへ移行）
- `styled-components`: 廃止方針
- `Storybook`: 廃止方針

## 4. ライセンス運用ルール

- 原則として、MIT / Apache-2.0 / ISC / PostgreSQL License を採用可能ライセンスとして運用する。
- `Docker Desktop` を利用する場合は、OSSライセンスとは別に Docker Subscription Service Agreement の契約条件を確認する。
- `MUI DataGrid` は Community版（MIT）と Pro/Premium（商用ライセンス）の違いがあるため、導入エディションを固定して運用する。
- `Temporal Tables` は実装方式（PostgreSQL本体機能/拡張）でライセンス確認対象が変わるため、導入時に採用品目を固定して再確認する。
- リリース前に依存ライセンスを再確認し、プロダクト導入版数と差異がないことを記録する。

## 文書情報

- 作成日: 2026年02月17日
- バージョン: v1.0
- 作成者: Codex
- 変更履歴:
  - v1.0 - 検討資料で採用するプロダクトのライセンス別紙を新規作成
