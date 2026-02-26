import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { LoginForm } from "@/features/auth/components";

export default async function LoginPage() {
  // 既にログイン済みならトップへリダイレクト
  const session = await getServerSession();
  if (session) {
    redirect("/");
  }

  return <LoginForm />;
}
