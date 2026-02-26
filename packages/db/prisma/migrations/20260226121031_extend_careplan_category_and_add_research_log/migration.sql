-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "LabItemCode" AS ENUM ('WBC', 'RBC', 'HGB', 'HCT', 'PLT', 'CRP', 'ALB', 'BUN', 'CRE', 'NA', 'K', 'CL', 'AST', 'ALT', 'LDH', 'GGT', 'TBIL', 'GLU');

-- CreateEnum
CREATE TYPE "PrescriptionType" AS ENUM ('ORAL', 'INJECTION', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "CarePlanCategory" AS ENUM ('MEDICATION', 'PAIN', 'DEHYDRATION', 'CONSTIPATION', 'INFLAMMATION', 'MOBILITY', 'DEMENTIA', 'SAFETY', 'SLEEP', 'INFORMATION');

-- CreateEnum
CREATE TYPE "CarePlanItemStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "DataMappingType" AS ENUM ('WARD', 'LAB_ITEM', 'PRESCRIPTION_TYPE');

-- CreateTable
CREATE TABLE "patients" (
    "id" SERIAL NOT NULL,
    "patient_id" VARCHAR(20) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "first_name" VARCHAR(50) NOT NULL,
    "last_name_kana" VARCHAR(50),
    "first_name_kana" VARCHAR(50),
    "birthday" DATE NOT NULL,
    "sex" "Gender" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admissions" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "external_admission_id" VARCHAR(30) NOT NULL,
    "admission_date" DATE NOT NULL,
    "admission_time" TIME,
    "age_at_admission" INTEGER,
    "height" DECIMAL(5,1),
    "weight" DECIMAL(5,1),
    "discharge_date" DATE,
    "ward" VARCHAR(50),
    "room" VARCHAR(50),
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "admissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_histories" (
    "id" SERIAL NOT NULL,
    "admission_id" INTEGER NOT NULL,
    "has_dementia" BOOLEAN,
    "has_organic_brain_damage" BOOLEAN,
    "is_heavy_alcohol" BOOLEAN,
    "has_delirium_history" BOOLEAN,
    "uses_psychotropic_drugs" BOOLEAN,
    "has_general_anesthesia" BOOLEAN,
    "has_emergency_surgery" BOOLEAN,
    "has_scheduled_surgery" BOOLEAN,
    "has_head_neck_surgery" BOOLEAN,
    "has_chest_surgery" BOOLEAN,
    "has_abdominal_surgery" BOOLEAN,
    "has_admission_oxygen_use" BOOLEAN,
    "oxygen_level" DECIMAL(4,1),
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "medical_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vital_signs" (
    "id" SERIAL NOT NULL,
    "admission_id" INTEGER NOT NULL,
    "body_temperature" DECIMAL(4,1),
    "pulse" INTEGER,
    "systolic_bp" INTEGER,
    "diastolic_bp" INTEGER,
    "spo2" DECIMAL(4,1),
    "respiratory_rate" INTEGER,
    "measured_at" TIMESTAMPTZ NOT NULL,
    "body_temperature_at" TIMESTAMPTZ,
    "pulse_at" TIMESTAMPTZ,
    "systolic_bp_at" TIMESTAMPTZ,
    "diastolic_bp_at" TIMESTAMPTZ,
    "spo2_at" TIMESTAMPTZ,
    "respiratory_rate_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "vital_signs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_results" (
    "id" SERIAL NOT NULL,
    "admission_id" INTEGER NOT NULL,
    "item_code" "LabItemCode" NOT NULL,
    "value" DECIMAL(10,3) NOT NULL,
    "measured_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "lab_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" SERIAL NOT NULL,
    "admission_id" INTEGER NOT NULL,
    "yj_code" VARCHAR(20),
    "drug_name" VARCHAR(200) NOT NULL,
    "prescription_type" "PrescriptionType" NOT NULL,
    "prescribed_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_assessments" (
    "id" SERIAL NOT NULL,
    "admission_id" INTEGER NOT NULL,
    "assessed_by_id" INTEGER NOT NULL,
    "risk_level" "RiskLevel" NOT NULL,
    "risk_factors" JSONB NOT NULL,
    "ml_input_snapshot" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "risk_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "high_risk_care_kasans" (
    "id" SERIAL NOT NULL,
    "admission_id" INTEGER NOT NULL,
    "assessed_by_id" INTEGER NOT NULL,
    "is_eligible" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "high_risk_care_kasans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_plans" (
    "id" SERIAL NOT NULL,
    "admission_id" INTEGER NOT NULL,
    "created_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "care_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_plan_items" (
    "id" SERIAL NOT NULL,
    "care_plan_id" INTEGER NOT NULL,
    "category" "CarePlanCategory" NOT NULL,
    "status" "CarePlanItemStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "current_question_id" VARCHAR(50),
    "details" JSONB,
    "instructions" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "care_plan_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transcription_histories" (
    "id" SERIAL NOT NULL,
    "care_plan_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transcription_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" VARCHAR(255) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "permission_categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "permission_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "medicine_masters" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "medicines_code" VARCHAR(20) NOT NULL,
    "risk_factor_flg" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "medicine_masters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicine_name_settings" (
    "id" SERIAL NOT NULL,
    "medicine_master_id" INTEGER NOT NULL,
    "hospital_code" VARCHAR(20) NOT NULL,
    "display_name" VARCHAR(200) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "medicine_name_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reference_value_masters" (
    "id" SERIAL NOT NULL,
    "item_code" VARCHAR(20) NOT NULL,
    "item_name" VARCHAR(100) NOT NULL,
    "unit" VARCHAR(20),
    "lower_limit" DECIMAL(10,3),
    "upper_limit" DECIMAL(10,3),
    "gender" "Gender",
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "reference_value_masters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_mappings" (
    "id" SERIAL NOT NULL,
    "mapping_type" "DataMappingType" NOT NULL,
    "source_code" VARCHAR(50) NOT NULL,
    "target_code" VARCHAR(50) NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "data_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" BIGSERIAL NOT NULL,
    "actor_id" INTEGER NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "target_type" VARCHAR(50) NOT NULL,
    "target_id" VARCHAR(50) NOT NULL,
    "before_data" JSONB,
    "after_data" JSONB,
    "hash" VARCHAR(64) NOT NULL,
    "prev_hash" VARCHAR(64),
    "occurred_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_locks" (
    "id" SERIAL NOT NULL,
    "lock_key" VARCHAR(100) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "import_locks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_logs" (
    "id" BIGSERIAL NOT NULL,
    "anonymized_id" VARCHAR(64) NOT NULL,
    "action_type" VARCHAR(50) NOT NULL,
    "details" JSONB,
    "occurred_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "research_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patients_patient_id_key" ON "patients"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "admissions_external_admission_id_key" ON "admissions"("external_admission_id");

-- CreateIndex
CREATE INDEX "admissions_patient_id_idx" ON "admissions"("patient_id");

-- CreateIndex
CREATE INDEX "admissions_admission_date_idx" ON "admissions"("admission_date");

-- CreateIndex
CREATE UNIQUE INDEX "medical_histories_admission_id_key" ON "medical_histories"("admission_id");

-- CreateIndex
CREATE UNIQUE INDEX "vital_signs_admission_id_measured_at_key" ON "vital_signs"("admission_id", "measured_at");

-- CreateIndex
CREATE INDEX "lab_results_admission_id_idx" ON "lab_results"("admission_id");

-- CreateIndex
CREATE UNIQUE INDEX "lab_results_admission_id_item_code_measured_at_key" ON "lab_results"("admission_id", "item_code", "measured_at");

-- CreateIndex
CREATE INDEX "prescriptions_admission_id_idx" ON "prescriptions"("admission_id");

-- CreateIndex
CREATE INDEX "risk_assessments_admission_id_idx" ON "risk_assessments"("admission_id");

-- CreateIndex
CREATE UNIQUE INDEX "high_risk_care_kasans_admission_id_key" ON "high_risk_care_kasans"("admission_id");

-- CreateIndex
CREATE UNIQUE INDEX "care_plans_admission_id_key" ON "care_plans"("admission_id");

-- CreateIndex
CREATE INDEX "care_plan_items_care_plan_id_idx" ON "care_plan_items"("care_plan_id");

-- CreateIndex
CREATE INDEX "transcription_histories_care_plan_id_idx" ON "transcription_histories"("care_plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permission_categories_name_key" ON "permission_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "medicine_masters_medicines_code_key" ON "medicine_masters"("medicines_code");

-- CreateIndex
CREATE UNIQUE INDEX "medicine_name_settings_medicine_master_id_hospital_code_key" ON "medicine_name_settings"("medicine_master_id", "hospital_code");

-- CreateIndex
CREATE UNIQUE INDEX "reference_value_masters_item_code_gender_key" ON "reference_value_masters"("item_code", "gender");

-- CreateIndex
CREATE UNIQUE INDEX "data_mappings_mapping_type_source_code_key" ON "data_mappings"("mapping_type", "source_code");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_idx" ON "audit_logs"("actor_id");

-- CreateIndex
CREATE INDEX "audit_logs_target_type_target_id_idx" ON "audit_logs"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "audit_logs_occurred_at_idx" ON "audit_logs"("occurred_at");

-- CreateIndex
CREATE INDEX "import_locks_lock_key_is_active_idx" ON "import_locks"("lock_key", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- CreateIndex
CREATE INDEX "research_logs_anonymized_id_idx" ON "research_logs"("anonymized_id");

-- CreateIndex
CREATE INDEX "research_logs_action_type_idx" ON "research_logs"("action_type");

-- CreateIndex
CREATE INDEX "research_logs_occurred_at_idx" ON "research_logs"("occurred_at");

-- AddForeignKey
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_histories" ADD CONSTRAINT "medical_histories_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vital_signs" ADD CONSTRAINT "vital_signs_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_yj_code_fkey" FOREIGN KEY ("yj_code") REFERENCES "medicine_masters"("medicines_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_assessments" ADD CONSTRAINT "risk_assessments_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_assessments" ADD CONSTRAINT "risk_assessments_assessed_by_id_fkey" FOREIGN KEY ("assessed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "high_risk_care_kasans" ADD CONSTRAINT "high_risk_care_kasans_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "high_risk_care_kasans" ADD CONSTRAINT "high_risk_care_kasans_assessed_by_id_fkey" FOREIGN KEY ("assessed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plans" ADD CONSTRAINT "care_plans_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plans" ADD CONSTRAINT "care_plans_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_items" ADD CONSTRAINT "care_plan_items_care_plan_id_fkey" FOREIGN KEY ("care_plan_id") REFERENCES "care_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcription_histories" ADD CONSTRAINT "transcription_histories_care_plan_id_fkey" FOREIGN KEY ("care_plan_id") REFERENCES "care_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "permission_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicine_name_settings" ADD CONSTRAINT "medicine_name_settings_medicine_master_id_fkey" FOREIGN KEY ("medicine_master_id") REFERENCES "medicine_masters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_locks" ADD CONSTRAINT "import_locks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
