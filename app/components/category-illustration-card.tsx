import Link from "next/link";
import { highlightText } from "../lib/highlight";
import { formatRelativeTime, type IllustrationRecord } from "../lib/illustration-db";

type CategoryIllustrationCardProps = {
  item: IllustrationRecord;
  highlightKeywords?: string[];
};

export function CategoryIllustrationCard({
  item,
  highlightKeywords = [],
}: CategoryIllustrationCardProps) {
  const primaryTag = item.tags?.[0];

  return (
    <Link
      href={`/illustration/${item.id}`}
      className="block text-inherit no-underline"
    >
      <article className="cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)]">
        <div className="aspect-square border-b border-border bg-background-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image_url}
            alt={item.title}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="px-3 py-2.5">
          <h3 className="mb-1 text-xs font-semibold leading-snug">
            {highlightKeywords.length > 0
              ? highlightText(item.title, highlightKeywords)
              : item.title}
          </h3>
          <p className="text-[11px] text-muted-light">
            {item.subject || item.sub_genre || item.genre}・DL {item.download_count}回・
            {formatRelativeTime(item.created_at)}
          </p>
          {primaryTag && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              <span className="rounded bg-background-secondary px-1.5 py-0.5 text-[10px] text-muted">
                {primaryTag}
              </span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
