import type { Metadata } from "next";
import { AppShell } from "./AppShell";

export const metadata: Metadata = {
  title: "DELISPECT",
  description: "Delirium Risk Assessment System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, fontFamily: "sans-serif" }}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
