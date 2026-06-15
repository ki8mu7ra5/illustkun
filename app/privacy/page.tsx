import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";

export const metadata: Metadata = {
  title: "プライバシーポリシー | イラストくん",
  description: "イラストくんのプライバシーポリシー。収集する情報と利用目的について。",
};

const POLICY_SECTIONS = [
  {
    title: "収集する情報",
    body: "本サービスでは、アクセスログおよび生成したイラストの内容（入力テキスト・生成結果など）を収集する場合があります。",
  },
  {
    title: "利用目的",
    body: "収集した情報は、サービス改善および不正利用防止のために利用します。",
  },
  {
    title: "第三者提供",
    body: "収集した情報を第三者に提供することはありません。",
  },
  {
    title: "アクセス解析",
    body: "本サービスでは、Google Analytics を使用する予定です。Cookie 等を通じてアクセス情報が収集される場合があります。",
  },
  {
    title: "お問い合わせ",
    body: "プライバシーポリシーに関するお問い合わせ先は、後日本ページに掲載します。",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-full bg-background text-foreground">
      <SiteHeader variant="category" />

      <main className="mx-auto max-w-[720px] px-4 py-10 sm:px-7 sm:py-14">
        <nav className="mb-6 text-xs text-muted-light">
          <Link href="/" className="text-muted no-underline hover:text-foreground">
            トップ
          </Link>
          <span aria-hidden> › </span>
          <span className="text-foreground">プライバシーポリシー</span>
        </nav>

        <h1 className="mb-8 text-2xl font-extrabold tracking-tight sm:text-3xl">
          プライバシーポリシー
        </h1>

        <div className="space-y-4">
          {POLICY_SECTIONS.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-border bg-card p-6 sm:p-8"
            >
              <h2 className="mb-3 text-base font-bold">{section.title}</h2>
              <p className="text-sm leading-relaxed text-muted">{section.body}</p>
            </section>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
