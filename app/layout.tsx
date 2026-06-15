import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "イラストくん",
  description: "世界の誰か1人にだけ刺さるイラスト集",
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
