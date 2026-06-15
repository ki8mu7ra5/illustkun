"use client";

import { downloadImageFromUrl } from "@/app/lib/download";

type DownloadButtonProps = {
  imageUrl: string;
  title: string;
};

export function DownloadButton({ imageUrl, title }: DownloadButtonProps) {
  return (
    <button
      type="button"
      onClick={() => downloadImageFromUrl(imageUrl, title)}
      className="w-full rounded-[var(--radius-sm)] bg-foreground py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
    >
      ⬇ ダウンロード
    </button>
  );
}
