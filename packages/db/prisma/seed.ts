import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * パーミッションカテゴリとパーミッションの定義
 */
const PERMISSION_CATEGORIES = [
  {
    name: "患者情報",
    permissions: [
      { code: "patient:view", name: "患者情報の閲覧" },
      { code: "patient:edit", name: "患者情報の編集" },
    ],
  },
  {
    name: "ケアプラン",
    permissions: [
      { code: "care_plan:create", name: "ケアプランの作成" },
      { code: "care_plan:edit", name: "ケアプランの編集" },
      { code: "care_plan:view", name: "ケアプランの閲覧" },
    ],
  },
  {
    name: "電子カルテ連携",
    permissions: [{ code: "emr:sync", name: "電子カルテ同期" }],
  },
  {
    name: "リスク評価",
    permissions: [
      { code: "risk_assessment:view", name: "リスク評価の閲覧" },
      { code: "risk_assessment:create", name: "リスク評価の実行" },
    ],
  },
  {
    name: "ハイリスクケア加算",
    permissions: [
      { code: "high_risk_care:view", name: "ハイリスクケア加算の閲覧" },
      { code: "high_risk_care:assess", name: "ハイリスクケア加算の判定" },
    ],
  },
  {
    name: "マスタデータ管理",
    permissions: [
      { code: "master_data:view", name: "マスタデータの閲覧" },
      { code: "master_data:edit", name: "マスタデータの編集" },
    ],
  },
  {
    name: "基準値設定",
    permissions: [
      { code: "reference_value:view", name: "基準値の閲覧" },
      { code: "reference_value:edit", name: "基準値の編集" },
    ],
  },
  {
    name: "監査ログ",
    permissions: [{ code: "audit_log:view", name: "監査ログの閲覧" }],
  },
  {
    name: "システム設定",
    permissions: [
      { code: "system_setting:view", name: "システム設定の閲覧" },
      { code: "system_setting:edit", name: "システム設定の編集" },
    ],
  },
  {
    name: "データマッピング",
    permissions: [
      { code: "data_mapping:view", name: "データマッピングの閲覧" },
      { code: "data_mapping:edit", name: "データマッピングの編集" },
    ],
  },
  {
    name: "ユーザー管理",
    permissions: [{ code: "user:manage", name: "ユーザーの管理" }],
  },
  {
    name: "ロール管理",
    permissions: [{ code: "role:manage", name: "ロールの管理" }],
  },
];

/**
 * ロール定義と割り当てる権限コード
 *
 * 要件定義1.2節に基づく:
 * - 一般ユーザー（看護師・医師）: 患者情報表示、ケアプラン作成・編集、電子カルテ同期
 * - システム管理者: マスタデータ管理・基準値設定・監査ログ閲覧。患者情報アクセス不可
 * - 全権管理者: すべての操作
 */
const ROLES = [
  {
    name: "GENERAL",
    description: "一般ユーザー（看護師・医師）",
    permissionCodes: [
      "patient:view",
      "patient:edit",
      "care_plan:create",
      "care_plan:edit",
      "care_plan:view",
      "emr:sync",
      "risk_assessment:view",
      "risk_assessment:create",
      "high_risk_care:view",
      "high_risk_care:assess",
    ],
  },
  {
    name: "SYSTEM_ADMIN",
    description: "システム管理者",
    permissionCodes: [
      "master_data:view",
      "master_data:edit",
      "reference_value:view",
      "reference_value:edit",
      "audit_log:view",
      "system_setting:view",
      "system_setting:edit",
      "data_mapping:view",
      "data_mapping:edit",
    ],
  },
  {
    name: "SUPER_ADMIN",
    description: "全権管理者",
    permissionCodes: [
      // すべての権限
      "patient:view",
      "patient:edit",
      "care_plan:create",
      "care_plan:edit",
      "care_plan:view",
      "emr:sync",
      "risk_assessment:view",
      "risk_assessment:create",
      "high_risk_care:view",
      "high_risk_care:assess",
      "master_data:view",
      "master_data:edit",
      "reference_value:view",
      "reference_value:edit",
      "audit_log:view",
      "system_setting:view",
      "system_setting:edit",
      "data_mapping:view",
      "data_mapping:edit",
      "user:manage",
      "role:manage",
    ],
  },
];

async function main() {
  console.log("Seeding database...");

  // パーミッションカテゴリとパーミッションの作成
  for (const category of PERMISSION_CATEGORIES) {
    const createdCategory = await prisma.permissionCategory.upsert({
      where: { name: category.name },
      update: {},
      create: { name: category.name },
    });

    for (const permission of category.permissions) {
      await prisma.permission.upsert({
        where: { code: permission.code },
        update: { name: permission.name, categoryId: createdCategory.id },
        create: {
          code: permission.code,
          name: permission.name,
          categoryId: createdCategory.id,
        },
      });
    }
  }

  console.log("  Permissions seeded.");

  // ロールの作成
  for (const roleDef of ROLES) {
    const role = await prisma.role.upsert({
      where: { name: roleDef.name },
      update: { description: roleDef.description },
      create: { name: roleDef.name, description: roleDef.description },
    });

    // ロールと権限の関連付け
    for (const permCode of roleDef.permissionCodes) {
      const permission = await prisma.permission.findUnique({
        where: { code: permCode },
      });

      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
      }
    }
  }

  console.log("  Roles seeded.");
  console.log("Seeding complete.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
