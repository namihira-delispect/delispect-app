# ADR-0001: Monorepo + TypeScript統一（ML除く）

## ステータス

承認

## コンテキスト

DELISPECTは病院ごとに異なる電子カルテシステムとの連携が必要であり、データインポートのカスタマイズが前提となるアプリケーションである。

### 現状の課題

1. **言語の分散**
   - フロントエンド: TypeScript (Next.js)
   - バックエンド: Python (Django)
   - ML: Python
   - 型定義の共有ができず、APIの型不整合が発生しやすい

2. **病院別カスタマイズの管理**
   - 病院ごとに電子カルテのデータ形式が異なる
   - カスタマイズコードの管理方法が未確立
   - 共通ロジックと病院固有ロジックの分離が不明確

3. **コード共有の困難さ**
   - フロントエンドとバックエンドで型定義を二重管理
   - バリデーションロジックの重複
   - ユーティリティの再実装

### 要件

- 病院ごとのカスタマイズを効率的に管理したい
- コードの型安全性を高めたい
- 開発者の学習コストを下げたい
- ビルド・テストの効率を上げたい

---

## 検討した選択肢

### 選択肢1: 現状維持（マルチリポジトリ + Python/TypeScript混在）

**概要**:
フロントエンド（TypeScript）とバックエンド（Python）を別リポジトリで管理し続ける。

**メリット**:
- 移行コストがゼロ
- 各チームが独立して開発可能
- Python MLエコシステムをそのまま活用

**デメリット**:
- 型定義の二重管理が継続
- APIスキーマの不整合リスク
- 病院別カスタマイズの管理が困難
- 2言語の習熟が必要

### 選択肢2: Monorepo + Python/TypeScript混在

**概要**:
単一リポジトリにまとめるが、言語はPythonとTypeScriptを継続。

**メリット**:
- アトミックなコミットが可能
- 変更の追跡が容易
- Python MLエコシステムを維持

**デメリット**:
- 型定義の共有ができない
- ビルドツールが複雑化
- 2言語の習熟が必要

### 選択肢3: Monorepo + TypeScript統一（ML除く）

**概要**:
単一リポジトリにまとめ、Webアプリ・バッチ処理はTypeScriptに統一する。
ただし、ML（リスク判定）は Python エコシステムの優位性を活かしPythonで継続する。

**メリット**:
- 型定義をWeb層〜DB層で共有
- Webアプリ開発は言語統一で効率化
- ディレクトリ間の依存が明確
- MLはPythonエコシステムをフル活用

**デメリット**:
- Python → TypeScript移行コスト（バックエンド部分）
- ML部分は型共有の恩恵を受けられない

---

## 決定

**選択肢3: Monorepo + TypeScript統一（ML除く）** を採用する。

- Webアプリ（定期バッチ含む）: **TypeScript**
- ML（リスク判定）: **Python**（例外的に継続）

---

## 理由

### TypeScript統一を選んだ理由

1. **型安全性の向上**
   - API境界での型不整合がなくなる
   - フロントエンド〜DB層まで一貫した型定義

2. **開発効率の向上**
   - Webアプリ開発は1言語で完結
   - コードの再利用が容易
   - バリデーションロジックの共有

3. **MLはPython継続が適切**
   - scikit-learn、pandas等のMLエコシステムが成熟
   - モデル開発・検証のツールチェーンが充実
   - ML専門知識を持つ人材はPythonに習熟していることが多い
   - TypeScript移行のコスト対効果が低い

### Monorepoを選んだ理由

1. **病院別カスタマイズの管理**
   - ディレクトリ分離で責務を明確化
   - `hospitals/{hospital}/` で病院固有コードを分離
   - 共通基盤（`import-base`）の再利用

2. **変更管理の効率化**
   - アトミックなコミットで関連変更を一括管理
   - 影響範囲が明確

### 選ばなかった選択肢の理由

- **選択肢1（現状維持）**: 型不整合、カスタマイズ管理の課題が解決しない
- **選択肢2（Monorepo + 混在）**: Monorepoの利点の一部しか得られない

---

## 影響

### ポジティブな影響

- **型安全性**: フロントエンド〜DB層まで型定義を共有
- **開発効率**: 言語統一、コード共有の容易さ
- **依存管理**: ディレクトリ間の依存が明確
- **カスタマイズ管理**: 病院別ディレクトリで明確に分離

### ネガティブな影響・リスク

| リスク | 対策 |
|--------|------|
| Python移行コスト（バックエンド） | 段階的に移行。既存コードは動作させながら |
| ML部分の型共有不可 | ML APIのスキーマを定義し、型安全性を担保 |
| 2言語の管理（TypeScript + Python） | MLは独立性が高いため影響は限定的 |

### 必要な対応

1. **リポジトリセットアップ**
   - `/web/src/` 配下のディレクトリ構成（core, db, import-base, hospitals）
   - ML API（Python）の配置

2. **移行作業**
   - フロントエンドの移行（Next.js App Router）
   - バックエンドのTypeScript化（Server Actions）
   - 内部スケジューラの実装（定期バッチ用）
   - ML APIとの連携インターフェース定義

3. **ドキュメント整備**
   - コーディングガイドライン
   - 開発フロー
   - 病院追加手順

---

## リポジトリ構成

```
delispect/
├── packages/                    # TypeScriptパッケージ
│   ├── core/                    # @delispect/core - 共通型定義・ユーティリティ
│   ├── db/                      # @delispect/db - Prismaスキーマ・DBクライアント
│   ├── import-base/             # @delispect/import-base - インポート共通基盤
│   └── hospitals/               # 病院別インポート実装
│       ├── import-juntendo/     # @delispect/import-juntendo
│       ├── import-shinjo/       # @delispect/import-shinjo
│       └── _template/           # 新病院追加用テンプレート
├── apps/
│   ├── web/                     # Next.js Webアプリケーション
│   └── batch/                   # バッチ処理CLI
├── services/
│   └── ml-api/                  # Python ML API（リスク判定）
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.base.json
```

---

## 技術スタック

| 領域 | 選定 | 備考 |
|------|------|------|
| 言語（Webアプリ） | TypeScript | フロントエンド〜バックエンド統一 |
| 言語（ML） | Python | MLエコシステム活用のため継続 |
| ランタイム | Node.js / Python | LTS版を使用 |
| Webフレームワーク | Next.js | App Router, Server Actions |
| ML | scikit-learn等 | リスク判定モデル |

---

## 関連情報

- 関連ADR: なし（初回ADR）
- 元ドキュメント: `docs/re_archtect/project_management_decision.md`
