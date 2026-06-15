import type { ReactNode } from "react";
import { normalize } from "./normalize";

function findRanges(text: string, keyword: string): [number, number][] {
  const trimmed = keyword.trim();
  if (!trimmed) return [];

  const normText = normalize(text);
  const normKeyword = normalize(trimmed);
  const ranges: [number, number][] = [];
  let start = 0;

  while (start <= normText.length - normKeyword.length) {
    const idx = normText.indexOf(normKeyword, start);
    if (idx === -1) break;
    ranges.push([idx, idx + normKeyword.length]);
    start = idx + 1;
  }

  return ranges;
}

function mergeRanges(ranges: [number, number][]): [number, number][] {
  if (ranges.length === 0) return [];
  const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    const current = sorted[i];
    if (current[0] <= last[1]) {
      last[1] = Math.max(last[1], current[1]);
    } else {
      merged.push(current);
    }
  }

  return merged;
}

export function highlightText(text: string, keywords: string[]) {
  const ranges = mergeRanges(keywords.flatMap((kw) => findRanges(text, kw)));
  if (ranges.length === 0) return text;

  const parts: ReactNode[] = [];
  let cursor = 0;

  ranges.forEach(([start, end], i) => {
    if (cursor < start) {
      parts.push(text.slice(cursor, start));
    }
    parts.push(
      <mark
        key={`${start}-${end}-${i}`}
        className="rounded-sm bg-[#FFF3B0] px-0.5 text-inherit"
      >
        {text.slice(start, end)}
      </mark>,
    );
    cursor = end;
  });

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return parts;
}
