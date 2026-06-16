import sharp from "sharp";

export async function removeWhiteBackground(
  input: Buffer,
  threshold = 240,
): Promise<Buffer> {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r >= threshold && g >= threshold && b >= threshold) {
      data[i + 3] = 0;
    }
  }

  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();
}

export function getTitleFromFilename(filename: string): string {
  const baseName = filename.split(/[/\\]/).pop() ?? filename;
  const title = baseName.replace(/\.[^.]+$/, "").trim();
  return title || "\u7121\u984c";
}
