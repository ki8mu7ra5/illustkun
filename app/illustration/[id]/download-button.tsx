"use client";

import { useState, type MouseEvent } from "react";
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
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (downloading) return;

    setDownloading(true);
    try {
      await downloadIllustrationWithLog(illustrationId, imageUrl, title);
    } catch (error) {
      console.error("Download failed:", error);
      alert("ダウンロードに失敗しました。もう一度お試しください。");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading}
      className="w-full rounded-[var(--radius-sm)] bg-foreground py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {downloading ? "ダウンロード中…" : "⬇ ダウンロード"}
    </button>
  );
}
