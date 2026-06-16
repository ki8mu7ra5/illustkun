import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { fetchMonthlyRanking } from "@/app/lib/illustration-db";

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

        <h1 className="mb-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
          ダウンロードランキング
        </h1>
        <p className="mb-8 text-sm text-muted">
          過去1ヶ月のダウンロード数が多いイラスト TOP10
        </p>

        {ranking.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted">
            まだランキングデータがありません
          </p>
        ) : (
          <ol className="space-y-4">
            {ranking.map((item, index) => (
              <li key={item.id}>
                <Link
                  href={`/illustration/${item.id}`}
                  className="flex gap-4 rounded-2xl border border-border bg-card p-4 no-underline text-inherit transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] sm:gap-6 sm:p-5"
                >
                  <div className="flex w-10 shrink-0 items-center justify-center text-xl font-extrabold text-accent-dark sm:w-12 sm:text-2xl">
                    {index + 1}
                  </div>
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-border bg-background-secondary sm:h-28 sm:w-28">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="mb-1 text-base font-bold sm:text-lg">{item.title}</h2>
                    <p className="mb-2 text-xs text-muted">
                      {item.genre}
                      {item.sub_genre ? ` / ${item.sub_genre}` : ""}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <span className="rounded-full bg-accent/30 px-3 py-1 font-medium">
                        1ヶ月のDL数: {item.monthly_download_count}
                      </span>
                      <span className="rounded-full border border-border px-3 py-1 text-muted">
                        総DL数: {item.download_count}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
