import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "控除AIチャット | 確定申告サポート",
  description:
    "よくある控除・確定申告の疑問にAIが一次回答。最終判断は税理士が行います。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-100 min-h-screen antialiased">{children}</body>
    </html>
  );
}
