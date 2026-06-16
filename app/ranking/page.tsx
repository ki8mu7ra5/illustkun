import type { Metadata } from "next";
import Link from "next/link";
import { RankingList } from "@/app/components/ranking-list";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { fetchMonthlyRanking } from "@/app/lib/illustration-db";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "ダウンロードランキング | イラストくん",
  description:
    "過去1ヶ月で人気のイラストランキング。無料・商用利用OKのフリーイラスト素材。",
};

export default async function RankingPage() {
  const ranking = await fetchMonthlyRanking(10);

  return (
    <div className="min-h-full bg-background text-foreground">
      <SiteHeader variant="category" />

      <main className="mx-auto max-w-[900px] px-4 py-10 sm:px-7 sm:py-14">
        <nav className="mb-6 text-xs text-muted-light">
          <Link href="/" className="text-muted no-underline hover:text-foreground">
            トップ
          </Link>
          <span aria-hidden> › </span>
          <span className="text-foreground">ランキング</span>
        </nav>

        <div className="mb-8 text-center sm:text-left">
          <p className="mb-2 text-sm">🏆 みんなの人気イラスト</p>
          <h1 className="mb-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
            ダウンロードランキング
          </h1>
          <p className="text-sm text-muted">
            過去1ヶ月のダウンロード数が多いイラスト TOP10
          </p>
        </div>

        <RankingList items={ranking} />
      </main>

      <SiteFooter />
    </div>
  );
}
