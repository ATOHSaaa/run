export const ACTIVITY_MENU_SLUG_BY_MODIFIER = {
  jogging: 'jogging',
  'trail-run': 'trail-run',
  trekking: 'trekking',
} as const;

export type PracticeLogActivityModifier = keyof typeof ACTIVITY_MENU_SLUG_BY_MODIFIER;

export const ACTIVITY_MENU_SLUGS = Object.values(
  ACTIVITY_MENU_SLUG_BY_MODIFIER,
) as ActivityMenuSlug[];

export type ActivityMenuSlug =
  (typeof ACTIVITY_MENU_SLUG_BY_MODIFIER)[PracticeLogActivityModifier];

export const ACTIVITY_MENU_MODIFIER_BY_SLUG: Record<
  ActivityMenuSlug,
  PracticeLogActivityModifier
> = {
  jogging: 'jogging',
  'trail-run': 'trail-run',
  trekking: 'trekking',
};

export const ACTIVITY_MENU_LABEL_BY_SLUG: Record<ActivityMenuSlug, string> = {
  jogging: 'ジョギング',
  'trail-run': 'トレラン',
  trekking: 'トレッキング',
};

/** @param {string} base `import.meta.env.BASE_URL` */
export function getActivityMenuListHref(
  base: string,
  activityMod: PracticeLogActivityModifier | null | undefined,
): string | null {
  if (!activityMod) return null;
  const slug = ACTIVITY_MENU_SLUG_BY_MODIFIER[activityMod];
  if (!slug) return null;
  const root = base.endsWith('/') ? base : `${base}/`;
  return `${root}blog/activities/menu/${slug}/`;
}
