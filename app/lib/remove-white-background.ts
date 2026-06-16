const DEFAULT_THRESHOLD = 240;

export function getTitleFromFilename(filename: string): string {
  const baseName = filename.split(/[/\\]/).pop() ?? filename;
  const title = baseName.replace(/\.[^.]+$/, "").trim();
  return title || "\u7121\u984c";
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("画像の読み込みに失敗しました"));
    };

    image.src = url;
  });
}

/**
 * ブラウザ Canvas で白背景（RGB 240 以上）を透明化し PNG Blob を返す
 */
export async function removeWhiteBackgroundFromFile(
  file: File,
  threshold = DEFAULT_THRESHOLD,
): Promise<Blob> {
  const image = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas が利用できません");
  }

  context.drawImage(image, 0, 0);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r >= threshold && g >= threshold && b >= threshold) {
      data[i + 3] = 0;
    }
  }

  context.putImageData(imageData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }
      reject(new Error("PNG の生成に失敗しました"));
    }, "image/png");
  });
}
