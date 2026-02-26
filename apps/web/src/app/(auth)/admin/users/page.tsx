import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RoleName } from "@delispect/auth";
import { getSessionUser } from "@/lib/authService";
import { getUsers } from "./actions";
import { UserListClient } from "./UserListClient";

const SESSION_COOKIE_NAME = "delispect_session";

type SearchParams = Promise<{
  query?: string;
  page?: string;
  pageSize?: string;
  sortKey?: string;
  sortDirection?: string;
  isActive?: string;
}>;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    redirect("/login");
  }

  const user = await getSessionUser(sessionId);

  if (!user) {
    redirect("/login");
  }

  // 全権管理者のみアクセス可能
  if (!user.roles.includes(RoleName.SUPER_ADMIN)) {
    redirect("/");
  }

  const params = await searchParams;

  const result = await getUsers({
    query: params.query ?? "",
    page: params.page ? Number(params.page) : 1,
    pageSize: params.pageSize ? Number(params.pageSize) : 20,
    sortKey: (params.sortKey as "username" | "lastName" | "email" | "isActive" | "createdAt") ?? "createdAt",
    sortDirection: (params.sortDirection as "asc" | "desc") ?? "desc",
    isActive: params.isActive,
  });

  return (
    <UserListClient
      users={result.users}
      totalCount={result.totalCount}
      totalPages={result.totalPages}
      currentPage={params.page ? Number(params.page) : 1}
      query={params.query ?? ""}
      sortKey={params.sortKey ?? "createdAt"}
      sortDirection={(params.sortDirection as "asc" | "desc") ?? "desc"}
      isActiveFilter={params.isActive}
    />
  );
}
