/** Frontmatter の日付を YYYY.MM.DD で表示（YAML の日付は UTC 0時として解釈されることが多い） */
export function formatDateYmd(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}
