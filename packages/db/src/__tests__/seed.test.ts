import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

/**
 * seed.ts の構造的なテスト（DBなしで実行可能）
 */
describe("Seed データ定義", () => {
  const seedPath = path.resolve(__dirname, "../../prisma/seed.ts");

  it("seed.ts ファイルが存在する", () => {
    expect(fs.existsSync(seedPath)).toBe(true);
  });

  it("seed.ts に必要なシードデータが含まれている", () => {
    const content = fs.readFileSync(seedPath, "utf-8");

    // ロール定義
    expect(content).toContain("GENERAL_USER");
    expect(content).toContain("SYSTEM_ADMIN");
    expect(content).toContain("SUPER_ADMIN");

    // 管理者ユーザー
    expect(content).toContain("admin");
    expect(content).toContain("admin@delispect.local");

    // システム設定
    expect(content).toContain("BATCH_IMPORT_TIME");
    expect(content).toContain("BATCH_IMPORT_DATE_RANGE");
  });

  it("seed.ts に権限定義が含まれている", () => {
    const content = fs.readFileSync(seedPath, "utf-8");

    // 代表的な権限コード
    expect(content).toContain("PATIENT_LIST_VIEW");
    expect(content).toContain("PATIENT_DETAIL_VIEW");
    expect(content).toContain("RISK_ASSESSMENT_EXECUTE");
    expect(content).toContain("CARE_PLAN_EDIT");
    expect(content).toContain("KASAN_EXECUTE");
    expect(content).toContain("EMR_IMPORT");
    expect(content).toContain("MASTER_EDIT");
    expect(content).toContain("SYSTEM_SETTINGS_EDIT");
    expect(content).toContain("USER_EDIT");
    expect(content).toContain("AUDIT_LOG_VIEW");
  });

  it("seed.ts に権限カテゴリ定義が含まれている", () => {
    const content = fs.readFileSync(seedPath, "utf-8");

    expect(content).toContain("患者・入院管理");
    expect(content).toContain("リスク評価");
    expect(content).toContain("ケアプラン");
    expect(content).toContain("加算判定");
    expect(content).toContain("電子カルテ連携");
    expect(content).toContain("マスタ管理");
    expect(content).toContain("システム管理");
    expect(content).toContain("ユーザー管理");
    expect(content).toContain("監査ログ");
  });

  it("seed.ts でupsertパターンが使用されている（冪等性）", () => {
    const content = fs.readFileSync(seedPath, "utf-8");

    // upsertの使用を確認
    const upsertCount = (content.match(/\.upsert\(/g) || []).length;
    expect(upsertCount).toBeGreaterThan(0);
  });
});

describe("Migration ファイル", () => {
  const migrationsDir = path.resolve(__dirname, "../../prisma/migrations");

  it("migrations ディレクトリが存在する", () => {
    expect(fs.existsSync(migrationsDir)).toBe(true);
  });

  it("migration_lock.toml が存在する", () => {
    const lockPath = path.join(migrationsDir, "migration_lock.toml");
    expect(fs.existsSync(lockPath)).toBe(true);
  });

  it("初期マイグレーションが存在する", () => {
    const dirs = fs.readdirSync(migrationsDir).filter((d) => {
      return fs.statSync(path.join(migrationsDir, d)).isDirectory();
    });
    expect(dirs.length).toBeGreaterThanOrEqual(1);
  });

  it("初期マイグレーションに全テーブルのCREATE TABLEが含まれている", () => {
    const dirs = fs.readdirSync(migrationsDir).filter((d) => {
      return fs.statSync(path.join(migrationsDir, d)).isDirectory();
    });
    const migrationSql = fs.readFileSync(
      path.join(migrationsDir, dirs[0], "migration.sql"),
      "utf-8",
    );

    const expectedTables = [
      "patients",
      "admissions",
      "medical_histories",
      "vital_signs",
      "lab_results",
      "prescriptions",
      "risk_assessments",
      "high_risk_care_kasans",
      "care_plans",
      "care_plan_items",
      "transcription_histories",
      "users",
      "sessions",
      "roles",
      "user_roles",
      "permission_categories",
      "permissions",
      "role_permissions",
      "medicine_masters",
      "medicine_name_settings",
      "reference_value_masters",
      "data_mappings",
      "audit_logs",
      "import_locks",
      "system_settings",
    ];

    for (const table of expectedTables) {
      expect(migrationSql).toContain(`CREATE TABLE "${table}"`);
    }
  });

  it("初期マイグレーションに全EnumのCREATE TYPEが含まれている", () => {
    const dirs = fs.readdirSync(migrationsDir).filter((d) => {
      return fs.statSync(path.join(migrationsDir, d)).isDirectory();
    });
    const migrationSql = fs.readFileSync(
      path.join(migrationsDir, dirs[0], "migration.sql"),
      "utf-8",
    );

    const expectedEnums = [
      "Gender",
      "RiskLevel",
      "PrescriptionType",
      "CarePlanCategory",
      "CarePlanItemStatus",
      "LabItemCode",
      "ReferenceItemType",
      "ReferenceGender",
      "DataMappingType",
    ];

    for (const enumName of expectedEnums) {
      expect(migrationSql).toContain(`CREATE TYPE "${enumName}"`);
    }
  });
});
