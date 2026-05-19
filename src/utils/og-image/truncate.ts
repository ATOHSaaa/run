/** OGP 用に1行あたりの最大文字数で切り詰める */
export function truncateText(text: string, maxLen: number): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, Math.max(0, maxLen - 1))}…`;
}

/** 長いタイトルを2行に分割（改行は satori ではそのまま反映されないため2要素に分ける） */
export function splitTitleLines(
  text: string,
  maxPerLine: number,
): [string] | [string, string] {
  const t = text.trim();
  if (t.length <= maxPerLine) return [t];
  if (t.length <= maxPerLine * 2) {
    const mid = Math.ceil(t.length / 2);
    let breakAt = mid;
    const space = t.lastIndexOf(' ', mid + 8);
    const comma = t.lastIndexOf('、', mid + 8);
    const candidate = Math.max(space, comma);
    if (candidate > maxPerLine * 0.4) breakAt = candidate + (t[candidate] === ' ' ? 1 : 0);
    return [t.slice(0, breakAt).trim(), t.slice(breakAt).trim()];
  }
  return [truncateText(t, maxPerLine * 2 - 1)];
}
