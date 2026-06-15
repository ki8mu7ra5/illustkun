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
  link.download = `${title}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
