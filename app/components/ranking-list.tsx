import Link from "next/link";
import type { RankingIllustration } from "@/app/lib/illustration-db";

const MEDALS = ["🥇", "🥈", "🥉"] as const;

type RankingListProps = {
  items: RankingIllustration[];
  compact?: boolean;
};

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    return <span className="text-2xl leading-none sm:text-3xl">{MEDALS[rank - 1]}</span>;
  }

  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-background-secondary text-sm font-bold text-muted">
      {rank}
    </span>
  );
}

export function RankingList({ items, compact = false }: RankingListProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted">
        まだランキングデータがありません
      </p>
    );
  }

  return (
    <ol className={compact ? "space-y-3" : "space-y-4"}>
      {items.map((item, index) => {
        const rank = index + 1;
        const isTopThree = rank <= 3;

        return (
          <li key={item.id}>
            <Link
              href={`/illustration/${item.id}`}
              className={`flex items-center gap-3 rounded-2xl border bg-card p-3 no-underline text-inherit transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] sm:gap-4 sm:p-4 ${
                isTopThree ? "border-accent/50 bg-accent/10" : "border-border"
              }`}
            >
              <div className="flex w-10 shrink-0 items-center justify-center sm:w-12">
                <RankBadge rank={rank} />
              </div>

              <div
                className={`shrink-0 overflow-hidden rounded-xl border border-border bg-background-secondary ${
                  compact ? "h-16 w-16 sm:h-20 sm:w-20" : "h-20 w-20 sm:h-24 sm:w-24"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h3
                  className={`mb-1 font-bold leading-snug ${
                    compact ? "text-sm sm:text-base" : "text-base sm:text-lg"
                  }`}
                >
                  {item.title}
                </h3>
                {!compact && (
                  <p className="mb-2 text-xs text-muted">
                    {item.genre}
                    {item.sub_genre ? ` / ${item.sub_genre}` : ""}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs">
                  <span className="rounded-full bg-accent/40 px-2.5 py-1 font-medium">
                    月間 {item.monthly_download_count} DL
                  </span>
                  <span className="rounded-full border border-border bg-background px-2.5 py-1 text-muted">
                    総 {item.download_count} DL
                  </span>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
