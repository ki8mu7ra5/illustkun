import { downloadIllustration } from "../lib/download";
import { highlightText } from "../lib/highlight";
import type { Illustration } from "../lib/illustrations";

type CategoryIllustrationCardProps = {
  item: Illustration;
  highlightKeywords?: string[];
};

export function CategoryIllustrationCard({
  item,
  highlightKeywords = [],
}: CategoryIllustrationCardProps) {
  return (
    <article className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)]">
      <div className="relative flex aspect-square items-center justify-center border-b border-border bg-background-secondary text-5xl">
        {item.emoji}
        <div className="absolute inset-0 flex items-center justify-center bg-[rgba(28,28,26,0.5)] opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              downloadIllustration(item.emoji, item.title);
            }}
            className="rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-foreground"
          >
            ⬇ ダウンロード
          </button>
        </div>
      </div>
      <div className="px-3 py-2.5">
        <h3 className="mb-1 text-xs font-semibold leading-snug">
          {highlightKeywords.length > 0
            ? highlightText(item.title, highlightKeywords)
            : item.title}
        </h3>
        <p className="text-[11px] text-muted-light">
          {item.subject}・DL {item.downloads}回
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          <span className="rounded bg-background-secondary px-1.5 py-0.5 text-[10px] text-muted">
            {item.tag}
          </span>
        </div>
      </div>
    </article>
  );
}
