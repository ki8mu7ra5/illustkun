export function normalize(text: string): string {
  let result = text;
  // ひらがな→カタカナ
  result = result.replace(/[\u3041-\u3096]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60),
  );
  return result.toLowerCase();
}
