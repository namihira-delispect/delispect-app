import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { RoleName } from "@delispect/auth";
import { getSessionUser } from "@/lib/authService";
import { getUserById, getRoles } from "../actions";
import { EditUserForm } from "./EditUserForm";
import { ResetPasswordForm } from "./ResetPasswordForm";

const SESSION_COOKIE_NAME = "delispect_session";

type Params = Promise<{ id: string }>;

export default async function EditUserPage({
  params,
}: {
  params: Params;
}) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    redirect("/login");
  }

  const currentUser = await getSessionUser(sessionId);

  if (!currentUser) {
    redirect("/login");
  }

  if (!currentUser.roles.includes(RoleName.SUPER_ADMIN)) {
    redirect("/");
  }

  const { id } = await params;
  const userId = Number(id);

  if (isNaN(userId)) {
    notFound();
  }

  const [targetUser, roles] = await Promise.all([
    getUserById(userId),
    getRoles(),
  ]);

  if (!targetUser) {
    notFound();
  }

  return (
    <div data-testid="edit-user-page">
      <div style={styles.header}>
        <h1 style={styles.title}>ユーザー編集</h1>
        <Link href="/admin/users" style={styles.backLink}>
          &larr; 一覧に戻る
        </Link>
      </div>

      <div style={styles.sections}>
        <section>
          <h2 style={styles.sectionTitle}>基本情報</h2>
          <EditUserForm user={targetUser} roles={roles} />
        </section>

        <section>
          <h2 style={styles.sectionTitle}>パスワードリセット</h2>
          <ResetPasswordForm userId={targetUser.id} />
        </section>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#1a1a2e",
    margin: 0,
  },
  backLink: {
    color: "#2563eb",
    fontSize: "0.875rem",
    textDecoration: "none",
  },
  sections: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  },
  sectionTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "#374151",
    marginTop: 0,
    marginBottom: "1rem",
    paddingBottom: "0.5rem",
    borderBottom: "1px solid #e5e7eb",
  },
};
