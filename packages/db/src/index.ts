export { prisma } from "./client";
export type { PrismaClient } from "@prisma/client";

// Re-export enums for use in application code
export {
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

// Re-export model types
export type {
  Patient,
  Admission,
  MedicalHistory,
  VitalSign,
  LabResult,
  Prescription,
  RiskAssessment,
  HighRiskCareKasan,
  CarePlan,
  CarePlanItem,
  TranscriptionHistory,
  User,
  Session,
  Role,
  UserRole,
  PermissionCategory,
  Permission,
  RolePermission,
  MedicineMaster,
  MedicineNameSetting,
  ReferenceValueMaster,
  DataMapping,
  AuditLog,
  ImportLock,
  SystemSetting,
} from "@prisma/client";
