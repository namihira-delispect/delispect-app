import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { RoleName } from "@delispect/auth";
import { getSessionUser } from "@/lib/authService";
import { getRoles } from "../actions";
import { CreateUserForm } from "./CreateUserForm";

const SESSION_COOKIE_NAME = "delispect_session";

export default async function NewUserPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    redirect("/login");
  }

  const user = await getSessionUser(sessionId);

  if (!user) {
    redirect("/login");
  }

  if (!user.roles.includes(RoleName.SUPER_ADMIN)) {
    redirect("/");
  }

  const roles = await getRoles();

  return (
    <div data-testid="create-user-page">
      <div style={styles.header}>
        <h1 style={styles.title}>ユーザー新規登録</h1>
        <Link href="/admin/users" style={styles.backLink}>
          &larr; 一覧に戻る
        </Link>
      </div>

      <CreateUserForm roles={roles} />
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
};
