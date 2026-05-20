/** OGP 用に最大文字数で切り詰める（タグ pill 等） */
export function truncateText(text: string, maxLen: number): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, Math.max(0, maxLen - 1))}…`;
}
