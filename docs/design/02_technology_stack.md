# DELISPECT - 技術スタック

## 目次

- [DELISPECT - 技術スタック](#delispect---技術スタック)
    - [目次](#目次)
    - [1. 概要](#1-概要)
    - [2. Webアプリケーション](#2-webアプリケーション)
        - [2.1 フレームワーク・ランタイム](#21-フレームワークランタイム)
        - [2.2 データベース・ORM](#22-データベースorm)
        - [2.3 バリデーション](#23-バリデーション)
    - [3. インフラ・ツール](#3-インフラツール)
        - [3.1 Docker Desktopの利用条件（組織規模別）](#31-docker-desktopの利用条件組織規模別)
    - [4. ライセンスポリシー](#4-ライセンスポリシー)
        - [4.1 LGPL with exceptions（psycopg2-binary）の運用方針](#41-lgpl-with-exceptionspsycopg2-binaryの運用方針)
    - [5. 現状ライセンスリスト（別紙）](#5-現状ライセンスリスト別紙)
    - [文書情報](#文書情報)

## 1. 概要

本文書は、DELISPECTで使用する主要パッケージ・ツールの一覧と選定理由を記載する。
システム全体の技術構成は[システムアーキテクチャ設計書](./01_system_architecture.md)を参照。

## 2. Webアプリケーション

### 2.1 フレームワーク・ランタイム

| パッケージ                | 用途         | 選定理由                                                               | ライセンス      | 調査ソース |
|----------------------|------------|--------------------------------------------------------------------|------------|------------|
| TypeScript           | 開発言語       | フロントエンド〜バックエンドの型統一（[ADR-0001](../decision-records/0001-monorepo-typescript.md)） | Apache-2.0 | [microsoft/TypeScript](https://github.com/microsoft/TypeScript) |
| Next.js (App Router) | Webフレームワーク | Server Components/Actionsによるフルスタック統合                               | MIT        | [vercel/next.js](https://github.com/vercel/next.js) |
| React                | UIライブラリ    | Next.jsの基盤                                                         | MIT        | [facebook/react](https://github.com/facebook/react) |
| Node.js              | ランタイム      | TypeScript実行環境                                                     | MIT        | [nodejs/node](https://github.com/nodejs/node) |

### 2.2 データベース・ORM

| パッケージ         | 用途     | 選定理由                       | ライセンス          | 調査ソース |
|---------------|--------|----------------------------|---------------|------------|
| PostgreSQL 15 | データベース | ACID特性、JSON対応、高信頼性         | PostgreSQL License | [PostgreSQL License](https://www.postgresql.org/about/licence/) |
| Prisma        | ORM    | TypeScript型自動生成、マイグレーション管理 | Apache-2.0    | [prisma/prisma](https://github.com/prisma/prisma) |

### 2.3 バリデーション

| パッケージ | 用途          | 選定理由                                 | ライセンス | 調査ソース |
|-------|-------------|--------------------------------------|-------|------------|
| Zod   | スキーマバリデーション | TypeScript型推論との統合、Server Actions入力検証 | MIT   | [colinhacks/zod](https://github.com/colinhacks/zod) |

## 3. インフラ・ツール

| パッケージ          | 用途             | 選定理由                         | ライセンス | 調査ソース |
|----------------|----------------|------------------------------|-------|------------|
| Docker         | コンテナ           | 実行環境の一貫性                     | Apache-2.0 (Docker Engine) / Docker Subscription Service Agreement (Docker Desktop) | [Docker Engine docs (Licensing)](https://docs.docker.com/engine/install/), [Docker Desktop license agreement](https://docs.docker.com/subscription/desktop-license/) |
| Docker Compose | コンテナオーケストレーション | 複数コンテナの定義・管理                 | Apache-2.0 | [docker/compose](https://github.com/docker/compose) |
| pnpm           | パッケージマネージャ     | ワークスペースによるMonorepo管理、厳格な依存解決 | MIT   | [pnpm/pnpm](https://github.com/pnpm/pnpm) |

### 3.1 Docker Desktopの利用条件（組織規模別）

2026-02-16時点のDocker公式ドキュメントに基づく整理。

| 区分 | Docker Desktopの利用条件 | 必要な契約 | 調査ソース |
|------|--------------------------|------------|------------|
| 無料利用可能 | 個人利用、教育用途、非商用OSS利用、または「従業員250人未満 かつ 年商1,000万USD未満」の商用利用 | Docker Personal（無償） | [Docker Desktop license agreement](https://docs.docker.com/subscription/desktop-license/), [Docker Personal](https://www.docker.com/products/personal/) |
| 有償サブスク必須 | 上記無料範囲を超える商用利用（従業員250人以上 または 年商1,000万USD以上）、Government Entityでの利用 | Pro / Team / Business のいずれか | [Docker Desktop license agreement](https://docs.docker.com/subscription/desktop-license/), [Docker Subscription Service Agreement](https://www.docker.com/legal/docker-subscription-service-agreement) |

> 補足: Docker Engine自体のOSSライセンス（Apache-2.0）と、Docker Desktopのサブスクリプション利用条件は別管理であるため、導入時は両方を確認する。

## 4. ライセンスポリシー

- 許可するライセンス: MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, PostgreSQL License, LGPL with exceptions（配布を伴わない自社運用に限る）
- 禁止するライセンス: GPL系（コピーレフト）、AGPL、SSPL
- 確認方法: `npx license-checker` による依存パッケージのライセンス一括確認

### 4.1 LGPL with exceptions（psycopg2-binary）の運用方針

- DELISPECTの標準運用（弊社資産サーバを病院内に設置し、弊社がDockerイメージをデプロイして運用し、病院へソフトウェアコピーを引き渡さない）では、通常は「配布（convey）」に該当しない想定のため、`psycopg2-binary`（LGPL with exceptions）は利用可。
- ただし、病院・委託先など第三者へコンテナイメージ、VMスナップショット、バックアップ等のコピーを引き渡す場合は配布に該当し得るため、LGPL条件対応または代替パッケージへの切替を実施する。
- 契約書と運用手順には「ソフトウェアコピーを病院へ移転しない」ことを明記する。
- 調査ソース: [GNU LGPLv3+GPLv3（conveyの定義）](https://www.gnu.org/licenses/lgpl%2Bgpl-3.0-standalone.html), [GNU GPL FAQ: UnreleasedMods](https://www.gnu.org/licenses/gpl-faq.html#UnreleasedMods), [GNU GPL FAQ: InternalDistribution](https://www.gnu.org/licenses/gpl-faq.html#InternalDistribution), [psycopg2 license](https://www.psycopg.org/docs/license.html)

## 5. 旧システム依存パッケージライセンス（参考）

- 移行前システム（Django / 現行フロントエンド）の依存パッケージライセンス一覧は `docs/reference/legacy_license_list.md` を参照する。

## 文書情報

- 作成日: 2026年02月
- バージョン: v1.2
- 作成者: 波平
- 最終更新: 2026年2月
- 変更履歴:
    - v1.2 - 依存パッケージの現状ライセンス一覧を `05_license_list_current.md` に分離
    - v1.1 - 各プロダクトのライセンス、Docker Desktopの組織規模別利用条件、Pipfile / package.json依存ライセンス一覧、LGPL with exceptions（psycopg2-binary）の運用方針を追記
    - v1.0 - 初版
