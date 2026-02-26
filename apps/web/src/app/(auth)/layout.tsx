import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ログイン - DELISPECT",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="auth-layout">
      <main className="auth-layout__main">{children}</main>
    </div>
  );
}
