"use client";

import { downloadIllustrationWithLog } from "@/app/lib/download";

type DownloadButtonProps = {
  illustrationId: string;
  imageUrl: string;
  title: string;
};

export function DownloadButton({
  illustrationId,
  imageUrl,
  title,
}: DownloadButtonProps) {
  return (
    <button
      type="button"
      onClick={() => downloadIllustrationWithLog(illustrationId, imageUrl, title)}
      className="w-full rounded-[var(--radius-sm)] bg-foreground py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
    >
      ⬇ ダウンロード
    </button>
  );
}
