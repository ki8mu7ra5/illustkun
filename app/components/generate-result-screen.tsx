"use client";

import { downloadImageFromUrl } from "@/app/lib/download";

type GenerateResultScreenProps = {
  title: string;
  imageUrl: string;
  onCreateAnother: () => void;
};

export function GenerateResultScreen({
  title,
  imageUrl,
  onCreateAnother,
}: GenerateResultScreenProps) {
  return (
    <div className="generate-result-enter max-w-[600px] rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-center gap-2 text-sm font-semibold text-accent-dark">
        <span className="text-lg">✨</span>
        <span>完成しました！</span>
        <span className="text-lg">✨</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-background-secondary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={title}
          className="mx-auto block max-h-[320px] w-full object-contain"
        />
      </div>

      <h3 className="mt-4 text-base font-bold">{title}</h3>
      <p className="mt-2 text-xs text-muted-light">
        承認後に新着イラストに掲載されます
      </p>

      <button
        type="button"
        onClick={() => downloadImageFromUrl(imageUrl, title)}
        className="mt-4 w-full rounded-[var(--radius-sm)] bg-foreground py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        ⬇ ダウンロード
      </button>

      <button
        type="button"
        onClick={onCreateAnother}
        className="mt-2.5 w-full rounded-[var(--radius-sm)] border border-border bg-transparent py-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground hover:bg-background-secondary"
      >
        もう一度作る
      </button>
    </div>
  );
}
