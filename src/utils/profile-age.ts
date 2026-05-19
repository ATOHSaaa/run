/** プロフィールの年齢表示用（暦・誕生日未満の年は切り下げ）。 */

export const PROFILE_AGE_TIME_ZONE = 'Asia/Tokyo';

/**
 * `timeZone` の暦での「その日」を `{ y, m, d }` で返す。
 */
export function calendarYmdPartsInTz(date: Date, timeZone: string): { y: number; m: number; d: number } {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  let y = 0;
  let m = 0;
  let d = 0;
  for (const p of fmt.formatToParts(date)) {
    if (p.type === 'year') y = Number(p.value);
    if (p.type === 'month') m = Number(p.value);
    if (p.type === 'day') d = Number(p.value);
  }
  return { y, m, d };
}

/**
 * `birthIso` が YYYY-MM-DD のとき、その時点の経過「満」年。
 */
export function ageCompletedYears(
  birthIso: string,
  todayCalendar: { y: number; m: number; d: number },
): number | null {
  const matched = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthIso.trim());
  if (!matched) return null;
  const by = Number(matched[1]);
  const bm = Number(matched[2]);
  const bd = Number(matched[3]);
  if (!Number.isFinite(by) || !Number.isFinite(bm) || !Number.isFinite(bd)) return null;

  let age = todayCalendar.y - by;
  if (todayCalendar.m < bm || (todayCalendar.m === bm && todayCalendar.d < bd)) {
    age -= 1;
  }
  return age;
}
