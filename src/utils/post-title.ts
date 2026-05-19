import type { CollectionEntry } from 'astro:content';

type BlogData = CollectionEntry<'blog'>['data'];

export type PostDisplayTitleOpts = {
  /** 記事詳細のみ: remark が拾ったフェンス内 `タイトル:`（フロントマターの title が無いとき） */
  practiceLogTitle?: string;
};

/** pubDate（UTC 暦日）から Activities の既定タイトル — formatDateYmd と同じ解釈 */
export function formatDiaryTitle(pubDate: Date): string {
  const y = pubDate.getUTCFullYear();
  const m = pubDate.getUTCMonth() + 1;
  const d = pubDate.getUTCDate();
  return `${y}年${m}月${d}日`;
}

/**
 * 一覧・詳細で表示するタイトル。
 * Activities はフロントマターの title を最優先。無ければフェンスのタイトル行 → 日付。
 * 中黒区切りの活動行は記事詳細の本文上（practice-log の1行）のみ。
 */
export function getPostDisplayTitle(data: BlogData, opts?: PostDisplayTitleOpts): string {
  if (data.category === 'Activities') {
    const t = data.title?.trim();
    if (t) return t;
    const pt = opts?.practiceLogTitle?.trim();
    if (pt) return pt;
    return formatDiaryTitle(data.pubDate);
  }
  return data.title?.trim() ?? '無題';
}

/** Gears 一覧・カード用。`gearName` → `title` の順でフォールバック */
export function getGearDisplayName(data: BlogData): string {
  const name = data.gearName?.trim();
  if (name) return name;
  return data.title?.trim() ?? '無題';
}

/** 記事一覧のリンク文言（Gears は商品名、それ以外は表示タイトル） */
export function getPostListLabel(data: BlogData, opts?: PostDisplayTitleOpts): string {
  if (data.category === 'Gears') return getGearDisplayName(data);
  return getPostDisplayTitle(data, opts);
}

/** Gears で記事タイトルと商品名が異なるとき、一覧のサブ行用 */
export function gearListShowsArticleTitle(data: BlogData): boolean {
  if (data.category !== 'Gears') return false;
  const articleTitle = data.title?.trim();
  if (!articleTitle) return false;
  return articleTitle !== getGearDisplayName(data);
}
