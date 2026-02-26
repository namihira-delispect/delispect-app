import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ---------------------------------------------------------------------------
  // Roles
  // ---------------------------------------------------------------------------
  const roles = [
    { name: "GENERAL_USER", description: "一般ユーザー（看護師・医師）" },
    { name: "SYSTEM_ADMIN", description: "システム管理者" },
    { name: "SUPER_ADMIN", description: "全権管理者" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }
  console.log(`  Roles seeded: ${roles.map((r) => r.name).join(", ")}`);

  // ---------------------------------------------------------------------------
  // Permission Categories
  // ---------------------------------------------------------------------------
  const permissionCategories = [
    { name: "患者・入院管理", description: "患者情報・入院情報に関する権限" },
    { name: "リスク評価", description: "リスク評価に関する権限" },
    { name: "ケアプラン", description: "ケアプランに関する権限" },
    { name: "加算判定", description: "ハイリスクケア加算に関する権限" },
    { name: "電子カルテ連携", description: "電子カルテ連携に関する権限" },
    { name: "マスタ管理", description: "マスタデータに関する権限" },
    { name: "システム管理", description: "システム設定に関する権限" },
    { name: "ユーザー管理", description: "ユーザー・ロール管理に関する権限" },
    { name: "監査ログ", description: "監査ログに関する権限" },
  ];

  const categoryMap: Record<string, number> = {};
  for (const cat of permissionCategories) {
    const created = await prisma.permissionCategory.upsert({
      where: { name: cat.name },
      update: { description: cat.description },
      create: cat,
    });
    categoryMap[cat.name] = created.id;
  }
  console.log(`  Permission categories seeded: ${permissionCategories.length} categories`);

  // ---------------------------------------------------------------------------
  // Permissions
  // ---------------------------------------------------------------------------
  const permissions = [
    // 患者・入院管理
    {
      categoryName: "患者・入院管理",
      code: "PATIENT_LIST_VIEW",
      name: "患者一覧閲覧",
      description: "入院患者一覧の閲覧",
    },
    {
      categoryName: "患者・入院管理",
      code: "PATIENT_DETAIL_VIEW",
      name: "患者詳細閲覧",
      description: "患者詳細情報の閲覧",
    },
    {
      categoryName: "患者・入院管理",
      code: "MEDICAL_HISTORY_EDIT",
      name: "既往歴編集",
      description: "既往歴・リスク因子の編集",
    },
    // リスク評価
    {
      categoryName: "リスク評価",
      code: "RISK_ASSESSMENT_VIEW",
      name: "リスク評価閲覧",
      description: "リスク評価結果の閲覧",
    },
    {
      categoryName: "リスク評価",
      code: "RISK_ASSESSMENT_EXECUTE",
      name: "リスク評価実行",
      description: "リスク評価の実行",
    },
    // ケアプラン
    {
      categoryName: "ケアプラン",
      code: "CARE_PLAN_VIEW",
      name: "ケアプラン閲覧",
      description: "ケアプランの閲覧",
    },
    {
      categoryName: "ケアプラン",
      code: "CARE_PLAN_EDIT",
      name: "ケアプラン編集",
      description: "ケアプランの作成・編集",
    },
    // 加算判定
    {
      categoryName: "加算判定",
      code: "KASAN_VIEW",
      name: "加算判定閲覧",
      description: "ハイリスクケア加算判定の閲覧",
    },
    {
      categoryName: "加算判定",
      code: "KASAN_EXECUTE",
      name: "加算判定実行",
      description: "ハイリスクケア加算判定の実行",
    },
    // 電子カルテ連携
    {
      categoryName: "電子カルテ連携",
      code: "EMR_IMPORT",
      name: "電子カルテ取込",
      description: "電子カルテデータのインポート",
    },
    // マスタ管理
    {
      categoryName: "マスタ管理",
      code: "MASTER_VIEW",
      name: "マスタ閲覧",
      description: "マスタデータの閲覧",
    },
    {
      categoryName: "マスタ管理",
      code: "MASTER_EDIT",
      name: "マスタ編集",
      description: "マスタデータの編集",
    },
    // システム管理
    {
      categoryName: "システム管理",
      code: "SYSTEM_SETTINGS_VIEW",
      name: "システム設定閲覧",
      description: "システム設定の閲覧",
    },
    {
      categoryName: "システム管理",
      code: "SYSTEM_SETTINGS_EDIT",
      name: "システム設定編集",
      description: "システム設定の変更",
    },
    // ユーザー管理
    {
      categoryName: "ユーザー管理",
      code: "USER_VIEW",
      name: "ユーザー閲覧",
      description: "ユーザー情報の閲覧",
    },
    {
      categoryName: "ユーザー管理",
      code: "USER_EDIT",
      name: "ユーザー編集",
      description: "ユーザーの作成・編集",
    },
    {
      categoryName: "ユーザー管理",
      code: "ROLE_MANAGE",
      name: "ロール管理",
      description: "ロール・権限の管理",
    },
    // 監査ログ
    {
      categoryName: "監査ログ",
      code: "AUDIT_LOG_VIEW",
      name: "監査ログ閲覧",
      description: "監査ログの閲覧",
    },
  ];

  for (const perm of permissions) {
    const categoryId = categoryMap[perm.categoryName];
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {
        name: perm.name,
        description: perm.description,
        categoryId,
      },
      create: {
        code: perm.code,
        name: perm.name,
        description: perm.description,
        categoryId,
      },
    });
  }
  console.log(`  Permissions seeded: ${permissions.length} permissions`);

  // ---------------------------------------------------------------------------
  // Role-Permission assignments
  // ---------------------------------------------------------------------------
  const allPermissions = await prisma.permission.findMany();
  const superAdminRole = await prisma.role.findUniqueOrThrow({
    where: { name: "SUPER_ADMIN" },
  });
  const systemAdminRole = await prisma.role.findUniqueOrThrow({
    where: { name: "SYSTEM_ADMIN" },
  });
  const generalUserRole = await prisma.role.findUniqueOrThrow({
    where: { name: "GENERAL_USER" },
  });

  // SUPER_ADMIN gets all permissions
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: perm.id,
      },
    });
  }

  // SYSTEM_ADMIN gets system management and user management permissions
  const systemAdminPermCodes = [
    "PATIENT_LIST_VIEW",
    "PATIENT_DETAIL_VIEW",
    "MEDICAL_HISTORY_EDIT",
    "RISK_ASSESSMENT_VIEW",
    "RISK_ASSESSMENT_EXECUTE",
    "CARE_PLAN_VIEW",
    "CARE_PLAN_EDIT",
    "KASAN_VIEW",
    "KASAN_EXECUTE",
    "EMR_IMPORT",
    "MASTER_VIEW",
    "MASTER_EDIT",
    "SYSTEM_SETTINGS_VIEW",
    "SYSTEM_SETTINGS_EDIT",
    "USER_VIEW",
    "USER_EDIT",
    "AUDIT_LOG_VIEW",
  ];
  for (const code of systemAdminPermCodes) {
    const perm = allPermissions.find((p) => p.code === code);
    if (perm) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: systemAdminRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: systemAdminRole.id,
          permissionId: perm.id,
        },
      });
    }
  }

  // GENERAL_USER gets clinical operation permissions
  const generalUserPermCodes = [
    "PATIENT_LIST_VIEW",
    "PATIENT_DETAIL_VIEW",
    "MEDICAL_HISTORY_EDIT",
    "RISK_ASSESSMENT_VIEW",
    "RISK_ASSESSMENT_EXECUTE",
    "CARE_PLAN_VIEW",
    "CARE_PLAN_EDIT",
    "KASAN_VIEW",
    "KASAN_EXECUTE",
    "EMR_IMPORT",
  ];
  for (const code of generalUserPermCodes) {
    const perm = allPermissions.find((p) => p.code === code);
    if (perm) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: generalUserRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: generalUserRole.id,
          permissionId: perm.id,
        },
      });
    }
  }
  console.log("  Role-Permission assignments seeded");

  // ---------------------------------------------------------------------------
  // Admin User (default)
  // ---------------------------------------------------------------------------
  // Password: Admin123!@#$ (Argon2id hash placeholder for development)
  const adminUser = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "admin@delispect.local",
      firstName: "管理者",
      lastName: "システム",
      passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$placeholder_salt$placeholder_hash",
      isActive: true,
    },
  });

  // Assign SUPER_ADMIN role to admin user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: superAdminRole.id,
    },
  });
  console.log(`  Admin user seeded: ${adminUser.username} (role: SUPER_ADMIN)`);

  // ---------------------------------------------------------------------------
  // System Settings
  // ---------------------------------------------------------------------------
  const systemSettings = [
    {
      key: "BATCH_IMPORT_TIME",
      value: "06:00",
      description: "バッチインポート実行時刻",
    },
    {
      key: "BATCH_IMPORT_DATE_RANGE",
      value: "2",
      description: "バッチインポート対象日数（入院日の何日前まで）",
    },
  ];

  for (const setting of systemSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, description: setting.description },
      create: setting,
    });
  }
  console.log(`  System settings seeded: ${systemSettings.map((s) => s.key).join(", ")}`);

  console.log("Seeding completed successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
