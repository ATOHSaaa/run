import opentype from '@shuding/opentype.js';
import { getOgTitleMeasureFont } from './fonts';

const TITLE_FONT_SIZES = [60, 52] as const;
const MAX_TITLE_LINES = 3;

function measureWidth(text: string, font: opentype.Font, fontSize: number): number {
  if (!text) return 0;
  return font.getAdvanceWidth(text, fontSize);
}

function truncateTextByWidth(
  text: string,
  maxWidth: number,
  font: opentype.Font,
  fontSize: number,
): string {
  const t = text.trim();
  if (!t || measureWidth(t, font, fontSize) <= maxWidth) return t;
  let lo = 0;
  let hi = t.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    const candidate = `${t.slice(0, mid)}…`;
    if (measureWidth(candidate, font, fontSize) <= maxWidth) lo = mid;
    else hi = mid - 1;
  }
  return lo > 0 ? `${t.slice(0, lo)}…` : '…';
}

type WrapResult = { lines: string[]; truncated: boolean };

/** 指定幅を超えた位置で改行（最大 maxLines 行。4 行目以降は最終行を幅で切り詰め） */
export function wrapTitleByWidth(
  text: string,
  maxWidth: number,
  font: opentype.Font,
  fontSize: number,
  maxLines = MAX_TITLE_LINES,
): WrapResult {
  const t = text.trim();
  if (!t) return { lines: [''], truncated: false };

  const lines: string[] = [];
  let offset = 0;

  while (offset < t.length && lines.length < maxLines) {
    let end = offset;
    let lastBreak = offset;

    for (let i = offset + 1; i <= t.length; i++) {
      const slice = t.slice(offset, i);
      if (measureWidth(slice, font, fontSize) <= maxWidth) {
        end = i;
        const ch = t[i - 1];
        if (ch === ' ' || ch === '　') lastBreak = i;
      } else {
        break;
      }
    }

    if (end === offset) {
      end = Math.min(offset + 1, t.length);
      lastBreak = end;
    }

    let breakAt = end;
    if (end < t.length && lastBreak > offset) {
      breakAt = lastBreak;
    }

    lines.push(t.slice(offset, breakAt).trimEnd());
    offset = breakAt;
    while (offset < t.length && (t[offset] === ' ' || t[offset] === '　')) offset += 1;
  }

  if (offset < t.length && lines.length > 0) {
    const rest = t.slice(offset).trimStart();
    const last = lines.length - 1;
    lines[last] = truncateTextByWidth(`${lines[last]}${rest}`, maxWidth, font, fontSize);
    return { lines: lines.filter((line) => line.length > 0), truncated: true };
  }

  return { lines: lines.filter((line) => line.length > 0), truncated: false };
}

function titleFitsInLines(
  lines: string[],
  font: opentype.Font,
  fontSize: number,
  maxWidth: number,
): boolean {
  return (
    lines.length > 0 &&
    lines.length <= MAX_TITLE_LINES &&
    lines.every((line) => measureWidth(line, font, fontSize) <= maxWidth)
  );
}

export type OgTitleLayout = {
  lines: string[];
  fontSize: number;
};

/** OGP タイトル: 最大3行。3行以内に収まる場合は省略なし。超える場合のみ最終行を `…` で切り詰め */
export async function layoutOgTitle(
  text: string,
  maxWidth: number,
): Promise<OgTitleLayout> {
  const font = await getOgTitleMeasureFont();

  for (const fontSize of TITLE_FONT_SIZES) {
    const { lines, truncated } = wrapTitleByWidth(text, maxWidth, font, fontSize, MAX_TITLE_LINES);
    if (!truncated && titleFitsInLines(lines, font, fontSize, maxWidth)) {
      return { lines, fontSize };
    }
  }

  const fontSize = TITLE_FONT_SIZES[TITLE_FONT_SIZES.length - 1];
  const { lines } = wrapTitleByWidth(text, maxWidth, font, fontSize, MAX_TITLE_LINES);
  return { lines, fontSize };
}
