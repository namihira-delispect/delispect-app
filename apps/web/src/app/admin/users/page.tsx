import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getUserList } from "@/features/user-management/queries/getUserList";
import { UserListPage } from "@/features/user-management/components/UserListPage";
import type { SortDirection } from "@/shared/types";
import type { CSSProperties } from "react";

interface UsersPageProps {
  searchParams: Promise<{
    search?: string;
    role?: string;
    isActive?: string;
    sortColumn?: string;
    sortDirection?: string;
    page?: string;
    pageSize?: string;
  }>;
}

const errorStyle: CSSProperties = {
  maxWidth: "60rem",
};

const titleStyle: CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: 700,
  color: "#1e293b",
  marginBottom: "1.5rem",
};

export default async function UsersPage({ searchParams }: UsersPageProps) {
  // 認証・認可チェック: 全権管理者のみ
  await requireAuth({ roles: ["SUPER_ADMIN"] });

  const params = await searchParams;

  const filter = {
    search: params.search ?? "",
    role: params.role ?? "",
    isActive: params.isActive ?? "",
    sortColumn: params.sortColumn ?? "createdAt",
    sortDirection: (params.sortDirection ?? "desc") as SortDirection,
    page: params.page ? parseInt(params.page, 10) : 1,
    pageSize: params.pageSize ? parseInt(params.pageSize, 10) : 20,
  };

  const result = await getUserList(filter);

  if (!result.success) {
    if (result.value.code === "UNAUTHORIZED") {
      redirect("/login");
    }
    if (result.value.code === "FORBIDDEN") {
      redirect("/forbidden");
    }
    return (
      <div style={errorStyle}>
        <h1 style={titleStyle}>ユーザー管理</h1>
        <p>ユーザー一覧の取得に失敗しました。</p>
      </div>
    );
  }

  return (
    <UserListPage
      initialData={result.value}
      initialFilter={filter}
    />
  );
}
