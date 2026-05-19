import type { CollectionEntry } from 'astro:content';
import { compareActivitiesSameDayAsc } from '@/utils/blog-post-sort';

export type DiaryCalendarCell = {
  day: number | null;
  dateKey: string | null;
  posts: CollectionEntry<'blog'>[];
  /** 表示中の月の外（前月・翌月の日付を週の揃え用に表示） */
  isAdjacentMonth?: boolean;
};

/** 月の1日が何曜日か（月曜始まりで 0=月 … 6=日） */
function mondayIndexFromUtcSunday(sunday0: number): number {
  return (sunday0 + 6) % 7;
}

function utcYmd(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 指定 UTC 年月のカレンダー行（各セルは日付 or 空） */
export function buildDiaryCalendarGrid(
  year: number,
  monthIndex: number,
  diaryPosts: CollectionEntry<'blog'>[],
): DiaryCalendarCell[][] {
  const byDay = new Map<string, CollectionEntry<'blog'>[]>();
  for (const p of diaryPosts) {
    const key = utcYmd(p.data.pubDate);
    const list = byDay.get(key) ?? [];
    list.push(p);
    byDay.set(key, list);
  }

  for (const list of byDay.values()) {
    list.sort(compareActivitiesSameDayAsc);
  }

  const first = new Date(Date.UTC(year, monthIndex, 1));
  const lead = mondayIndexFromUtcSunday(first.getUTCDay());
  const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

  const cells: DiaryCalendarCell[] = [];

  const prevMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
  const prevYear = monthIndex === 0 ? year - 1 : year;
  const prevLastDay = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();
  for (let i = 0; i < lead; i++) {
    const d = prevLastDay - (lead - 1 - i);
    const key = `${prevYear}-${String(prevMonthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      day: d,
      dateKey: key,
      posts: byDay.get(key) ?? [],
      isAdjacentMonth: true,
    });
  }

  for (let d = 1; d <= lastDay; d++) {
    const key = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      day: d,
      dateKey: key,
      posts: byDay.get(key) ?? [],
    });
  }

  let nextY = year;
  let nextM = monthIndex + 1;
  if (nextM > 11) {
    nextM = 0;
    nextY++;
  }
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    const key = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`;
    cells.push({
      day: nextDay,
      dateKey: key,
      posts: byDay.get(key) ?? [],
      isAdjacentMonth: true,
    });
    nextDay++;
  }

  const rows: DiaryCalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
}

/** 表示する UTC 年月（Activities が無いときは「今月」） */
export function pickDiaryCalendarMonth(
  diaryPosts: CollectionEntry<'blog'>[],
): { year: number; monthIndex: number } {
  if (diaryPosts.length === 0) {
    const n = new Date();
    return { year: n.getUTCFullYear(), monthIndex: n.getUTCMonth() };
  }
  const newest = diaryPosts.reduce((a, b) =>
    a.data.pubDate > b.data.pubDate ? a : b,
  );
  const d = newest.data.pubDate;
  return { year: d.getUTCFullYear(), monthIndex: d.getUTCMonth() };
}

/** Activities の UTC 公開月の最小〜最大までの各月（昇順）。投稿が無いときは pickDiaryCalendarMonth と同じ1ヶ月のみ。 */
export function enumerateDiaryMonthsUtc(
  diaryPosts: CollectionEntry<'blog'>[],
): { year: number; monthIndex: number }[] {
  if (diaryPosts.length === 0) {
    return [pickDiaryCalendarMonth([])];
  }
  let minMs = Infinity;
  let maxMs = -Infinity;
  for (const p of diaryPosts) {
    const t = p.data.pubDate.getTime();
    if (t < minMs) minMs = t;
    if (t > maxMs) maxMs = t;
  }
  const minD = new Date(minMs);
  const maxD = new Date(maxMs);
  let y = minD.getUTCFullYear();
  let mi = minD.getUTCMonth();
  const endY = maxD.getUTCFullYear();
  const endMi = maxD.getUTCMonth();
  const out: { year: number; monthIndex: number }[] = [];
  for (;;) {
    out.push({ year: y, monthIndex: mi });
    if (y === endY && mi === endMi) break;
    mi++;
    if (mi > 11) {
      mi = 0;
      y++;
    }
  }
  return out;
}
