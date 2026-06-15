import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "イラストくん - 世界の誰か1人にだけ刺さるイラスト集",
  description: "世界の誰か1人にだけ刺さるイラスト集。AIがその場で生成。無料・商用利用OK。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
