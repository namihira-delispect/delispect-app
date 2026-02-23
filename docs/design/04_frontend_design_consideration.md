# DELISPECT - フロントエンド全体検討資料

## 目次

- [DELISPECT - フロントエンド全体検討資料](#delispect---フロントエンド全体検討資料)
  - [目次](#目次)
  - [1. 文書の目的と範囲](#1-文書の目的と範囲)
  - [2. 現状スタック（確認ベース）](#2-現状スタック確認ベース)
  - [3. フレームワーク（Next.js 15）方針](#3-フレームワークnextjs-15方針)
  - [4. UI（MUI）方針](#4-uimui方針)
  - [5. フォーム（react-hook-form）方針](#5-フォームreact-hook-form方針)
  - [6. スタイリング方針（運用・移行観点）](#6-スタイリング方針運用移行観点)
  - [7. バリデーション（zod）方針](#7-バリデーションzod方針)
  - [8. データ取得（SWR -> React Query）方針](#8-データ取得swr---react-query方針)
  - [9. ロギング（pino）方針](#9-ロギングpino方針)
  - [10. テスト（Jest / Testing Library / Playwright）方針](#10-テストjest--testing-library--playwright方針)
  - [11. Storybook（廃止方針）](#11-storybook廃止方針)

## 1. 文書の目的と範囲

- 本書はフロントエンド全体の設計方針を整理する資料
- 対象:
  - フレームワーク運用
  - フォーム/バリデーション
  - データ取得
  - ロギング
  - テスト
  - スタイリング運用
- UIキット選定（`MUI` / `Tailwind + shadcn` の比較）は別紙で管理する

## 2. 現状スタック（確認ベース）

本章は、検討入力として提示された構成をベースに記載する。

- フレームワーク: `Next.js 16`（devはturbopack）
- UI: `MUI v6 + emotion`（`styled-components` も共存）
- フォーム: `react-hook-form`
- バリデーション: `zod`
- データ取得: `SWR`（`React Query` へ移行予定）
- ロギング: `pino`
- テスト: `Jest` / `Testing Library` / `Playwright`（E2E）
- Storybook: `8.x`（廃止予定）

## 3. フレームワーク（Next.js 16）方針

- App Routerで実装する
- バックエンド方針に合わせ、データ更新は `Server Actions` ではなくAPI経由に統一する
- 開発時はturbopackを利用し、開発体験とビルド性能を維持する

## 4. UI（MUI）方針

- UIキットの比較・採用方針は別資料で検討する
- 採用方針は `MUI` を継続利用しつつ `tailwindcss + shadcn` を部分的に採用していく
- 本書では詳細記載を行わず、以下を参照する
  - [ADR-0004: フロントエンドUIキット選定](../decision-records/0004-frontend-ui-kit.md)

## 5. フォーム（react-hook-form）方針

- `react-hook-form` を継続利用する
- `form default values` と入力変換処理はフォーム単位でモジュール化する
- フォーム部品の再利用は `ui` 層で共通化し、画面ごとの差分実装を最小化する

## 6. スタイリング方針（運用・移行観点）

- 基本は `MUI` で実装する
- 部分的に独自デザインを取り入れたい箇所のみ `tailwindcss + shadcn` を利用する
- `styled-components` は廃止する
- 現時点では `GlobalSpinner` での利用が中心という認識のため、優先的に置換して除去する

## 7. バリデーション（zod）方針

- `zod` を継続利用する
- APIスキーマ（request/response）とフォームスキーマを分離し、責務を明確化する
- レスポンスは `zod` でパースし、ランタイムで型保証を行う

## 8. データ取得（SWR -> React Query）方針

- `SWR` は廃止し、データ取得は `React Query（TanStack Query）` を採用する
- API層は共通化し、取得実装の分散を抑制する

### 8.1 React Query採用メリット

- 更新系（POST/PUT/DELETE）を含めた server state 管理を一貫した設計で扱える
- キャッシュ無効化、再取得、依存クエリの制御を標準機能で実装できる
- 楽観更新やリトライ戦略を統一しやすく、画面ごとの差分実装を減らせる
- 将来的な画面増加時も、取得/更新パターンの再利用性を維持しやすい

## 9. ロギング（pino）方針

- `pino` を継続利用する
  - 現状フロントエンドのログは記録していないので、重要度は低い


## 10. テスト（Jest / Testing Library / Playwright）方針

- Unit/Integration: `Jest + Testing Library` を継続
- E2E: `Playwright` を継続

## 11. Storybook（廃止方針）

- Storybookは廃止する
- 理由:
  - デザイナー不在かつ少人数体制では、あまりメリットがなく継続運用負荷が大きい
  - MUI中心のため最低限のデザイン品質は担保しやすい
