/**
 * Activities 向けラスタアイコン。
 * - `icons/activities/` … デザインガイド（太め黒線・白・深い青）に合わせた PNG
 * - ルート `images/` … ジョギング・トレラン用
 */
export const activityIconFiles = {
  jogging: 'images/runner-accent.png',
  trailRun: 'images/activity-trail-run.png',
  hike: 'images/icons/activities/activity-hike.png',
  walk: 'images/icons/activities/activity-walk.png',
  strength: 'images/icons/activities/activity-strength.png',
  rest: 'images/icons/activities/activity-rest.png',
  designSystemGuide: 'images/icons/activities/design-system-guide.png',
} as const;

export type ActivityIconKey = keyof typeof activityIconFiles;

/** カレンダー凡例などに並べる運動種別（デザインガイド PNG は除く） */
export const registeredActivities: ReadonlyArray<{
  key: Exclude<ActivityIconKey, 'designSystemGuide'>;
  /** 画面には出さず、支援技術向け */
  ariaLabel: string;
}> = [
  { key: 'jogging', ariaLabel: 'ジョギング' },
  { key: 'trailRun', ariaLabel: 'トレラン' },
  { key: 'hike', ariaLabel: 'ハイク・トレッキング' },
  { key: 'walk', ariaLabel: 'ウォーク' },
  { key: 'strength', ariaLabel: '筋トレ' },
  { key: 'rest', ariaLabel: '休憩' },
];

/** `import.meta.env.BASE_URL` と組み合わせて絶対パスを返す */
export function activityIconUrl(base: string, key: ActivityIconKey): string {
  const root = base.endsWith('/') ? base : `${base}/`;
  return `${root}${activityIconFiles[key]}`;
}
