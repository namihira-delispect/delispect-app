import type { Metadata } from "next";

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
      <body>{children}</body>
    </html>
  );
}
