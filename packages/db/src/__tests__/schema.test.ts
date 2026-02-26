import { describe, it, expect } from "vitest";
import { Prisma } from "@prisma/client";
import {
  Gender,
  RiskLevel,
  PrescriptionType,
  CarePlanCategory,
  CarePlanItemStatus,
  LabItemCode,
  ReferenceItemType,
  ReferenceGender,
  DataMappingType,
} from "@prisma/client";

// =============================================================================
// Enum定義のテスト
// =============================================================================

describe("Enum定義", () => {
  describe("Gender", () => {
    it("MALE, FEMALE, UNKNOWN の3値が定義されている", () => {
      expect(Object.values(Gender)).toEqual(["MALE", "FEMALE", "UNKNOWN"]);
    });

    it("OTHER が含まれていない", () => {
      expect(Object.values(Gender)).not.toContain("OTHER");
    });
  });

  describe("RiskLevel", () => {
    it("HIGH, LOW, INDETERMINATE の3値が定義されている", () => {
      expect(Object.values(RiskLevel)).toEqual(["HIGH", "LOW", "INDETERMINATE"]);
    });

    it("MEDIUM が含まれていない", () => {
      expect(Object.values(RiskLevel)).not.toContain("MEDIUM");
    });
  });

  describe("PrescriptionType", () => {
    it("ORAL, INJECTION の2値が定義されている", () => {
      expect(Object.values(PrescriptionType)).toEqual(["ORAL", "INJECTION"]);
    });

    it("EXTERNAL が含まれていない", () => {
      expect(Object.values(PrescriptionType)).not.toContain("EXTERNAL");
    });
  });

  describe("CarePlanCategory", () => {
    it("10種のカテゴリが定義されている", () => {
      const expected = [
        "MEDICINE",
        "PAIN",
        "DEHYDRATION",
        "CONSTIPATION",
        "INFLAMMATION",
        "MOBILIZATION",
        "DEMENTIA",
        "SAFETY",
        "SLEEP",
        "PROVIDING_INFORMATION",
      ];
      expect(Object.values(CarePlanCategory)).toEqual(expected);
      expect(Object.values(CarePlanCategory)).toHaveLength(10);
    });
  });

  describe("CarePlanItemStatus", () => {
    it("NOT_STARTED, IN_PROGRESS, COMPLETED の3値が定義されている", () => {
      expect(Object.values(CarePlanItemStatus)).toEqual([
        "NOT_STARTED",
        "IN_PROGRESS",
        "COMPLETED",
      ]);
    });

    it("NOT_APPLICABLE が含まれていない", () => {
      expect(Object.values(CarePlanItemStatus)).not.toContain("NOT_APPLICABLE");
    });
  });

  describe("LabItemCode", () => {
    it("17種の検査項目コードが定義されている", () => {
      const expected = [
        "RBC",
        "WBC",
        "HB",
        "HT",
        "PLT",
        "AST",
        "ALT",
        "ALP",
        "GAMMA_GT",
        "CHE",
        "CRE",
        "UN",
        "NA",
        "K",
        "CA",
        "GLU",
        "CRP",
      ];
      expect(Object.values(LabItemCode)).toEqual(expected);
      expect(Object.values(LabItemCode)).toHaveLength(17);
    });
  });

  describe("ReferenceItemType", () => {
    it("VITAL, LAB の2値が定義されている", () => {
      expect(Object.values(ReferenceItemType)).toEqual(["VITAL", "LAB"]);
    });
  });

  describe("ReferenceGender", () => {
    it("MALE, FEMALE, COMMON の3値が定義されている", () => {
      expect(Object.values(ReferenceGender)).toEqual(["MALE", "FEMALE", "COMMON"]);
    });
  });

  describe("DataMappingType", () => {
    it("LAB_VALUE, VITAL_SIGN, PRESCRIPTION, ADMISSION_INFO の4値が定義されている", () => {
      expect(Object.values(DataMappingType)).toEqual([
        "LAB_VALUE",
        "VITAL_SIGN",
        "PRESCRIPTION",
        "ADMISSION_INFO",
      ]);
    });
  });
});

// =============================================================================
// モデル定義のテスト（Prisma DMMFを使用）
// =============================================================================

const dmmf = Prisma.dmmf;

/**
 * DMMFからモデルを取得するヘルパー
 */
function getModel(modelName: string) {
  const model = dmmf.datamodel.models.find((m) => m.name === modelName);
  if (!model) throw new Error(`Model ${modelName} not found`);
  return model;
}

/**
 * モデルのフィールド名一覧を取得
 */
function getFieldNames(modelName: string): string[] {
  return getModel(modelName).fields.map((f) => f.name);
}

/**
 * 特定のフィールドを取得
 */
function getField(modelName: string, fieldName: string) {
  const field = getModel(modelName).fields.find((f) => f.name === fieldName);
  if (!field) throw new Error(`Field ${fieldName} not found on ${modelName}`);
  return field;
}

describe("モデル定義", () => {
  describe("全テーブルの存在確認", () => {
    const expectedModels = [
      "Patient",
      "Admission",
      "MedicalHistory",
      "VitalSign",
      "LabResult",
      "Prescription",
      "RiskAssessment",
      "HighRiskCareKasan",
      "CarePlan",
      "CarePlanItem",
      "TranscriptionHistory",
      "User",
      "Session",
      "Role",
      "UserRole",
      "PermissionCategory",
      "Permission",
      "RolePermission",
      "MedicineMaster",
      "MedicineNameSetting",
      "ReferenceValueMaster",
      "DataMapping",
      "AuditLog",
      "ImportLock",
      "SystemSetting",
    ];

    it("25テーブルが定義されている", () => {
      const modelNames = dmmf.datamodel.models.map((m) => m.name);
      for (const name of expectedModels) {
        expect(modelNames).toContain(name);
      }
      expect(modelNames).toHaveLength(expectedModels.length);
    });
  });

  describe("共通カラム", () => {
    const modelsWithUpdatedAt = [
      "Patient",
      "Admission",
      "MedicalHistory",
      "VitalSign",
      "LabResult",
      "Prescription",
      "RiskAssessment",
      "HighRiskCareKasan",
      "CarePlan",
      "CarePlanItem",
      "Role",
      "PermissionCategory",
      "Permission",
      "MedicineMaster",
      "MedicineNameSetting",
      "ReferenceValueMaster",
      "DataMapping",
      "ImportLock",
      "SystemSetting",
      "User",
    ];

    it.each(modelsWithUpdatedAt)("%s にcreatedAt, updatedAtが存在する", (modelName) => {
      const fieldNames = getFieldNames(modelName);
      expect(fieldNames).toContain("createdAt");
      expect(fieldNames).toContain("updatedAt");
    });

    it("AuditLog にupdatedAtが存在しない（追記専用）", () => {
      const fieldNames = getFieldNames("AuditLog");
      expect(fieldNames).toContain("createdAt");
      expect(fieldNames).not.toContain("updatedAt");
    });
  });

  describe("楽観的ロック", () => {
    it("Admission にversion カラムが存在する", () => {
      const field = getField("Admission", "version");
      expect(field.type).toBe("Int");
      expect(field.default).toEqual(0);
    });

    it("MedicalHistory にversion カラムが存在する", () => {
      const field = getField("MedicalHistory", "version");
      expect(field.type).toBe("Int");
      expect(field.default).toEqual(0);
    });
  });

  describe("ソフトデリート", () => {
    it("RiskAssessment にis_active カラムが存在する", () => {
      const field = getField("RiskAssessment", "isActive");
      expect(field.type).toBe("Boolean");
      expect(field.default).toEqual(true);
    });
  });

  describe("Patient モデル", () => {
    it("必要なフィールドが全て存在する", () => {
      const fields = getFieldNames("Patient");
      expect(fields).toContain("patientId");
      expect(fields).toContain("lastName");
      expect(fields).toContain("firstName");
      expect(fields).toContain("lastNameKana");
      expect(fields).toContain("firstNameKana");
      expect(fields).toContain("birthday");
      expect(fields).toContain("sex");
    });

    it("patientId がユニーク", () => {
      const field = getField("Patient", "patientId");
      expect(field.isUnique).toBe(true);
    });
  });

  describe("Admission モデル", () => {
    it("必要なフィールドが全て存在する", () => {
      const fields = getFieldNames("Admission");
      expect(fields).toContain("patientId");
      expect(fields).toContain("externalAdmissionId");
      expect(fields).toContain("admissionDate");
      expect(fields).toContain("admissionTime");
      expect(fields).toContain("ageAtAdmission");
      expect(fields).toContain("height");
      expect(fields).toContain("weight");
      expect(fields).toContain("dischargeDate");
      expect(fields).toContain("ward");
      expect(fields).toContain("room");
      expect(fields).toContain("version");
    });

    it("externalAdmissionId がユニーク", () => {
      const field = getField("Admission", "externalAdmissionId");
      expect(field.isUnique).toBe(true);
    });
  });

  describe("MedicalHistory モデル", () => {
    it("全リスク因子フィールドが存在する", () => {
      const fields = getFieldNames("MedicalHistory");
      const riskFactors = [
        "hasDementia",
        "hasOrganicBrainDamage",
        "isHeavyAlcohol",
        "hasDeliriumHistory",
        "usesPsychotropicDrugs",
        "hasGeneralAnesthesia",
        "hasEmergencySurgery",
        "hasScheduledSurgery",
        "hasHeadNeckSurgery",
        "hasChestSurgery",
        "hasAbdominalSurgery",
        "hasAdmissionOxygenUse",
        "oxygenLevel",
      ];
      for (const factor of riskFactors) {
        expect(fields).toContain(factor);
      }
    });

    it("admissionId がユニーク（1入院1レコード）", () => {
      const field = getField("MedicalHistory", "admissionId");
      expect(field.isUnique).toBe(true);
    });
  });

  describe("VitalSign モデル", () => {
    it("各バイタル項目の測定日時カラムが存在する", () => {
      const fields = getFieldNames("VitalSign");
      expect(fields).toContain("bodyTemperatureAt");
      expect(fields).toContain("pulseAt");
      expect(fields).toContain("systolicBpAt");
      expect(fields).toContain("diastolicBpAt");
      expect(fields).toContain("spo2At");
      expect(fields).toContain("respiratoryRateAt");
    });
  });

  describe("Prescription モデル", () => {
    it("全カラムが存在する", () => {
      const fields = getFieldNames("Prescription");
      expect(fields).toContain("prescriptionType");
      expect(fields).toContain("yjCode");
      expect(fields).toContain("drugName");
      expect(fields).toContain("usageVolume");
      expect(fields).toContain("unit");
      expect(fields).toContain("administration");
      expect(fields).toContain("dosesPerDay");
      expect(fields).toContain("prescriber");
      expect(fields).toContain("medicinesComment");
      expect(fields).toContain("administrationComment");
      expect(fields).toContain("prescribedAt");
    });
  });

  describe("RiskAssessment モデル", () => {
    it("assessedAt, missingItems が存在する", () => {
      const fields = getFieldNames("RiskAssessment");
      expect(fields).toContain("assessedAt");
      expect(fields).toContain("missingItems");
      expect(fields).toContain("riskFactors");
      expect(fields).toContain("mlInputSnapshot");
    });

    it("riskFactors, mlInputSnapshot がnull許容", () => {
      const rf = getField("RiskAssessment", "riskFactors");
      expect(rf.isRequired).toBe(false);
      const ml = getField("RiskAssessment", "mlInputSnapshot");
      expect(ml.isRequired).toBe(false);
    });
  });

  describe("HighRiskCareKasan モデル", () => {
    it("全チェック項目カラムが存在する", () => {
      const fields = getFieldNames("HighRiskCareKasan");
      expect(fields).toContain("assessedAt");
      expect(fields).toContain("isEligible");
      expect(fields).toContain("isSeventyOrAbove");
      expect(fields).toContain("hasDementia");
      expect(fields).toContain("hasOrganicBrainDamage");
      expect(fields).toContain("isHeavyAlcohol");
      expect(fields).toContain("hasDeliriumHistory");
      expect(fields).toContain("hasRiskDrug");
      expect(fields).toContain("hasGeneralAnesthesia");
    });

    it("admissionId がユニーク（1入院1レコード）", () => {
      const field = getField("HighRiskCareKasan", "admissionId");
      expect(field.isUnique).toBe(true);
    });
  });

  describe("CarePlanItem モデル", () => {
    it("startedAt, completedAt が存在する", () => {
      const fields = getFieldNames("CarePlanItem");
      expect(fields).toContain("startedAt");
      expect(fields).toContain("completedAt");
    });
  });

  describe("TranscriptionHistory モデル", () => {
    it("transcribedById, transcribedAt が存在する", () => {
      const fields = getFieldNames("TranscriptionHistory");
      expect(fields).toContain("transcribedById");
      expect(fields).toContain("transcribedAt");
      expect(fields).toContain("content");
    });

    it("updatedAt が存在しない", () => {
      const fields = getFieldNames("TranscriptionHistory");
      expect(fields).not.toContain("updatedAt");
    });
  });

  describe("User モデル", () => {
    it("firstName, lastName が存在する", () => {
      const fields = getFieldNames("User");
      expect(fields).toContain("firstName");
      expect(fields).toContain("lastName");
    });
  });

  describe("Session モデル", () => {
    it("userAgent が存在する", () => {
      const fields = getFieldNames("Session");
      expect(fields).toContain("userAgent");
    });

    it("updatedAt が存在しない", () => {
      const fields = getFieldNames("Session");
      expect(fields).not.toContain("updatedAt");
    });
  });

  describe("PermissionCategory モデル", () => {
    it("description フィールドが存在する", () => {
      const fields = getFieldNames("PermissionCategory");
      expect(fields).toContain("description");
    });
  });

  describe("Permission モデル", () => {
    it("description フィールドが存在する", () => {
      const fields = getFieldNames("Permission");
      expect(fields).toContain("description");
    });
  });

  describe("MedicineMaster モデル", () => {
    it("全カラムが存在する", () => {
      const fields = getFieldNames("MedicineMaster");
      expect(fields).toContain("medicinesName");
      expect(fields).toContain("salesName");
      expect(fields).toContain("equivalentConversion");
      expect(fields).toContain("narcoticFlg");
      expect(fields).toContain("riskFactorFlg");
      expect(fields).toContain("painkillerFlg");
    });
  });

  describe("MedicineNameSetting モデル", () => {
    it("medicinesCode でユニーク", () => {
      const field = getField("MedicineNameSetting", "medicinesCode");
      expect(field.isUnique).toBe(true);
    });

    it("medicinesName, salesName が存在する", () => {
      const fields = getFieldNames("MedicineNameSetting");
      expect(fields).toContain("medicinesName");
      expect(fields).toContain("salesName");
    });
  });

  describe("ReferenceValueMaster モデル", () => {
    it("itemType, gender, displayName, sortOrder が存在する", () => {
      const fields = getFieldNames("ReferenceValueMaster");
      expect(fields).toContain("itemType");
      expect(fields).toContain("gender");
      expect(fields).toContain("displayName");
      expect(fields).toContain("sortOrder");
    });
  });

  describe("DataMapping モデル", () => {
    it("sourceName, targetName, isActive が存在する", () => {
      const fields = getFieldNames("DataMapping");
      expect(fields).toContain("sourceName");
      expect(fields).toContain("targetName");
      expect(fields).toContain("isActive");
    });
  });

  describe("AuditLog モデル", () => {
    it("全カラムが存在する", () => {
      const fields = getFieldNames("AuditLog");
      expect(fields).toContain("actorId");
      expect(fields).toContain("actorUsername");
      expect(fields).toContain("action");
      expect(fields).toContain("targetType");
      expect(fields).toContain("targetId");
      expect(fields).toContain("beforeData");
      expect(fields).toContain("afterData");
      expect(fields).toContain("diffData");
      expect(fields).toContain("context");
      expect(fields).toContain("ipAddress");
      expect(fields).toContain("userAgent");
      expect(fields).toContain("requestId");
      expect(fields).toContain("occurredAt");
      expect(fields).toContain("hash");
      expect(fields).toContain("prevHash");
    });

    it("actorId がnull許容（システム操作時）", () => {
      const field = getField("AuditLog", "actorId");
      expect(field.isRequired).toBe(false);
    });

    it("targetType, targetId がnull許容", () => {
      const tt = getField("AuditLog", "targetType");
      expect(tt.isRequired).toBe(false);
      const ti = getField("AuditLog", "targetId");
      expect(ti.isRequired).toBe(false);
    });
  });

  describe("ImportLock モデル", () => {
    it("acquiredAt, processInfo が存在する", () => {
      const fields = getFieldNames("ImportLock");
      expect(fields).toContain("acquiredAt");
      expect(fields).toContain("processInfo");
    });
  });

  describe("SystemSetting モデル", () => {
    it("description, updatedById が存在する", () => {
      const fields = getFieldNames("SystemSetting");
      expect(fields).toContain("description");
      expect(fields).toContain("updatedById");
    });
  });
});

// =============================================================================
// テーブルマッピングのテスト
// =============================================================================

describe("テーブルマッピング（@@map）", () => {
  const tableMapping: Record<string, string> = {
    Patient: "patients",
    Admission: "admissions",
    MedicalHistory: "medical_histories",
    VitalSign: "vital_signs",
    LabResult: "lab_results",
    Prescription: "prescriptions",
    RiskAssessment: "risk_assessments",
    HighRiskCareKasan: "high_risk_care_kasans",
    CarePlan: "care_plans",
    CarePlanItem: "care_plan_items",
    TranscriptionHistory: "transcription_histories",
    User: "users",
    Session: "sessions",
    Role: "roles",
    UserRole: "user_roles",
    PermissionCategory: "permission_categories",
    Permission: "permissions",
    RolePermission: "role_permissions",
    MedicineMaster: "medicine_masters",
    MedicineNameSetting: "medicine_name_settings",
    ReferenceValueMaster: "reference_value_masters",
    DataMapping: "data_mappings",
    AuditLog: "audit_logs",
    ImportLock: "import_locks",
    SystemSetting: "system_settings",
  };

  it.each(Object.entries(tableMapping))(
    "%s は %s にマッピングされている",
    (modelName, tableName) => {
      const model = getModel(modelName);
      expect(model.dbName).toBe(tableName);
    },
  );
});

// =============================================================================
// 中間テーブルのテスト
// =============================================================================

describe("中間テーブル", () => {
  it("UserRole は複合主キー (userId, roleId) を持つ", () => {
    const model = getModel("UserRole");
    expect(model.primaryKey).toBeTruthy();
    expect(model.primaryKey?.fields).toEqual(["userId", "roleId"]);
  });

  it("RolePermission は複合主キー (roleId, permissionId) を持つ", () => {
    const model = getModel("RolePermission");
    expect(model.primaryKey).toBeTruthy();
    expect(model.primaryKey?.fields).toEqual(["roleId", "permissionId"]);
  });

  it("UserRole にid カラムが存在しない", () => {
    const fields = getFieldNames("UserRole");
    expect(fields).not.toContain("id");
  });

  it("RolePermission にid カラムが存在しない", () => {
    const fields = getFieldNames("RolePermission");
    expect(fields).not.toContain("id");
  });
});
