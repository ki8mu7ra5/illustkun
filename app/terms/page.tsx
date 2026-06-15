import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";

export const metadata: Metadata = {
  title: "利用規約 | イラストくん",
  description: "イラストくんの利用規約。商用利用OK・クレジット表記不要・改変NGなど。",
};

const TERMS = [
  "商用利用OK",
  "クレジット表記不要",
  "改変NG",
  "再配布・転売禁止",
  "AIが生成したイラストのため著作権は放棄",
  "不適切な用途への使用禁止",
  "サービスは予告なく変更・終了する場合あり",
];

export default function TermsPage() {
  return (
    <div className="min-h-full bg-background text-foreground">
      <SiteHeader variant="category" />

      <main className="mx-auto max-w-[720px] px-4 py-10 sm:px-7 sm:py-14">
        <nav className="mb-6 text-xs text-muted-light">
          <Link href="/" className="text-muted no-underline hover:text-foreground">
            トップ
          </Link>
          <span aria-hidden> › </span>
          <span className="text-foreground">利用規約</span>
        </nav>

        <h1 className="mb-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
          利用規約
        </h1>
        <p className="mb-8 text-sm text-muted">サービス名：イラストくん</p>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <p className="mb-6 text-sm leading-relaxed text-muted">
            イラストくん（以下「本サービス」）をご利用いただくにあたり、以下の内容に同意いただいたものとみなします。
          </p>

          <ol className="space-y-4">
            {TERMS.map((term, index) => (
              <li key={term} className="flex gap-3 text-sm leading-relaxed">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/40 text-xs font-bold">
                  {index + 1}
                </span>
                <span>{term}</span>
              </li>
            ))}
          </ol>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
