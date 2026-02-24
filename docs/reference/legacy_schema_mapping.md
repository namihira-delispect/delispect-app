# 旧スキーマとの対応

旧システム（Django/Python）から新システム（TypeScript/Prisma）への移行におけるテーブル対応と設計改善点をまとめる。

## 1. テーブル対応表

| 旧テーブル                      | 新テーブル                                                                             | 主な変更点                                                                            |
|----------------------------|-----------------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| `T_Patients`               | `patients`                                                                        | 変更なし（カラム名をsnake_caseに統一）                                                         |
| `T_PatientAdmissions`      | `admissions`                                                                      | `care_implementation_status` を削除（導出可能）                                           |
| `T_PatientAssessment`      | `medical_histories`                                                               | ML入力用のリスク因子テーブルに特化。`uses_psychotropic_drugs` を継続保持                                 |
| `T_PatientMeasurement`     | `vital_signs` + `lab_results`                                                     | バイタルと検査値を分離。検査値は横持ち→縦持ちに正規化。バイタルは項目別タイムスタンプを保持                                    |
| `T_PatientPrescription`    | `prescriptions`                                                                   | `prescription_type` を追加（内服/注射の区別）。コメント系カラムを継続保持                                   |
| `T_PatientRiskEvaluations` | `risk_assessments`                                                                | `ml_input_snapshot` を追加。`is_high_risk_for_add_fee` は `high_risk_care_kasans` に分離 |
| `T_CareStatus`             | `care_plan_items`                                                                 | 横持ち（20カラム）→縦持ち（カテゴリ別レコード）に正規化                                                    |
| `T_CareMedicine`           | `care_plan_items.details` (JSONB)                                                 | 個別テーブル → JSONB統合。カテゴリ=MEDICINE のレコードに格納                                          |
| `T_CarePain`               | `care_plan_items.details` (JSONB)                                                 | 個別テーブル → JSONB統合。カテゴリ=PAIN のレコードに格納                                              |
| `T_CarePainSite`           | `care_plan_items.details.sites[]` (JSONB内配列)                                      | サブテーブル → JSONB内のネスト配列に統合                                                         |
| `T_CarePainInfluences`     | `care_plan_items.details.influenceOn*` (JSONB)                                    | サブテーブル → JSONBトップレベルにフラット化（1:1関係のため）                                             |
| `T_CareDehydration`        | `care_plan_items.details` (JSONB)                                                 | 個別テーブル → JSONB統合。カテゴリ=DEHYDRATION のレコードに格納                                       |
| `T_CareConstipation`       | `care_plan_items.details` (JSONB)                                                 | 個別テーブル → JSONB統合。カテゴリ=CONSTIPATION のレコードに格納                                      |
| `T_CareFever`              | `care_plan_items.details` (JSONB)                                                 | 個別テーブル → JSONB統合。カテゴリ=INFLAMMATION のレコードに格納                                      |
| `T_CareOther`              | `care_plan_items.details` (JSONB)                                                 | 1行5JSON → カテゴリ別レコードのJSONBに正規化（情報提供カテゴリを含む）                                        |
| `auth_user`                | `users`                                                                           | Django auth_user → 独自テーブル。ログインロック機能を追加                                           |
| `T_ImportLocks`            | `import_locks`                                                                    | タイムスタンプカラム名を共通規則に統一                                                              |
| `T_Roles` 等 (TODO)         | `roles`, `user_roles`, `permissions`, `permission_categories`, `role_permissions` | TODO状態だった定義を完成                                                                   |
| `T_UserCustomFields`       | (廃止)                                                                              | 機能廃止のため移行しない                                                                     |
| `T_UserManagementConfigurations` | `system_settings`                                                           | TODO状態だった設定管理を `system_settings` として整備                                            |
| (なし)                       | `high_risk_care_kasans`                                                           | 新規。旧は `risk_assessments` に埋め込み                                                   |
| (なし)                       | `care_plans`                                                                      | 新規。ケアプランヘッダーとして追加                                                                |
| (なし)                       | `care_plan_items`                                                                 | 新規。カテゴリ別ステータス管理 + 各カテゴリの問診回答をJSONBで保持                                            |
| (なし)                       | `transcription_histories`                                                         | 新規。看護記録転記の履歴管理                                                                   |
| (なし)                       | `reference_value_masters`                                                                | 新規。基準値マスタ                                                                        |
| (なし)                       | `data_mappings`                                                                   | 新規。病院コード変換マッピング                                                                  |
| (なし)                       | `audit_logs`                                                                      | 新規。アプリ層監査ログ                                                                      |
| (なし)                       | `system_settings`                                                                 | 新規。システム設定                                                                        |

## 2. 主な設計改善点

1. **PK戦略の統一**: 全テーブルで `id` (SERIAL) を主キーとして使用。旧スキーマの `patient_admissions_id` をPKに使うパターンを廃止
2. **タイムスタンプの統一**: 全テーブルで `created_at` / `updated_at` を統一（旧: `insert_datetime` / `update_datetime`
   が混在）
3. **検査結果の正規化**: 横持ち49カラム → 縦持ち（項目別レコード）に変更。柔軟性・拡張性が向上
4. **ケアプランステータスの正規化**: 横持ち20カラム → 縦持ち（カテゴリ別レコード）に変更
5. **ケアプラン詳細のJSONB統合**: 旧8テーブル（+サブテーブル）→ `care_plan_items.details` (JSONB)
   に統合。カテゴリ固有の問診データをZodスキーマで型安全に管理
6. **ケアプランヘッダーの追加**: ケアプラン全体を管理するヘッダーテーブルを新設
7. **加算判定の分離**: リスク評価テーブルに埋め込まれていた加算判定を独立テーブルに分離
8. **ロール・権限の完成**: TODO状態だった6テーブルの定義を完成
9. **監査ログの新設**: ハッシュチェーンによる改ざん検知機能を備えた監査ログテーブル
10. **Enum型の採用**: 文字列リテラルではなくPostgreSQL Enum型を使用し、型安全性を向上
11. **リスク評価ステータスの簡素化**: 旧 `evaluation` の `NOT_IMPLEMENTED`（未実施）を廃止。未実施はレコードが存在しないことで表現する
12. **バイタルサインの項目別タイムスタンプ**: `measured_at`（代表日時）に加え、各バイタル項目ごとの測定日時カラムを保持

## 関連ドキュメント

- [データベース設計](../design/06_database_design.md)
