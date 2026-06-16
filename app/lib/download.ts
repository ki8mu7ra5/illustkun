function sanitizeDownloadFilename(title: string): string {
  const sanitized = title.replace(/[\\/:*?"<>|]/g, "_").trim();
  return sanitized || "illustration";
}

export function downloadIllustration(emoji: string, title: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#F7F6F1";
  ctx.fillRect(0, 0, 512, 512);
  ctx.font = "200px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, 256, 256);

  const link = document.createElement("a");
  link.download = `${sanitizeDownloadFilename(title)}.png`;
  link.href = canvas.toDataURL("image/png");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function downloadImageFromUrl(imageUrl: string, title: string) {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error("画像の取得に失敗しました");
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = `${sanitizeDownloadFilename(title)}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(blobUrl);
}

export async function downloadIllustrationWithLog(
  illustrationId: string,
  imageUrl: string,
  title: string,
) {
  try {
    await fetch("/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: illustrationId }),
    });
  } catch (error) {
    console.error("Download log failed:", error);
  }

  await downloadImageFromUrl(imageUrl, title);
}
