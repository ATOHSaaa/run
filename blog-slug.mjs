/**
 * Tips / Gears リネーム前の slug（公開済み URL）。
 * キー: 新 slug、値: 旧 slug（日付入り・ファイル名と一致）
 */
const TIPS_GEARS_LEGACY_SLUG = {
  'tips/bungei-weight-loss-lifehacks': 'tips/2026-05-19-tips-bungei-weight-loss-lifehacks',
  'tips/shokz-openrun-pro-2-review': 'tips/2026-05-19-tips-shokz-openrun-pro-2-review',
  'tips/weight-loss-1650kcal-10000-steps': 'tips/2026-05-19-tips-weight-loss-1650kcal-10000-steps',
  'tips/running-gear-multi-pocket-pants': 'tips/2026-05-18-tips-running-gear-multi-pocket-pants',
  'tips/weight-loss-paid-items': 'tips/2026-05-19-tips-weight-loss-paid-items',
  'tips/first-full-marathon-sub5h': 'tips/2026-05-19-tips-first-full-marathon-sub5h',
  'tips/treadmill-diet-running': 'tips/2026-05-19-tips-treadmill-diet-running',
  'tips/running-boredom-solutions': 'tips/2026-05-19-tips-running-boredom-solutions',
  'tips/daily-10km-running': 'tips/2026-05-19-tips-daily-10km-running',
  'gears/on-cloud-6-wp': 'gears/2026-05-15-gears-on-cloud-6-wp',
  'gears/salomon-speedcross-6': 'gears/2026-05-15-gears-salomon-speedcross-6',
  'gears/shokz-openrun-pro-2': 'gears/2026-05-15-gears-shokz-openrun-pro-2',
  'gears/new-balance-fresh-foam-1080-v14': 'gears/2026-05-15-gears-new-balance-fresh-foam-1080-v14',
  'gears/apple-watch-ultra-2': 'gears/2026-05-15-gears-apple-watch-ultra-2',
  'gears/tigora-multi-pocket-pants': 'gears/2026-05-15-gears-tigora-multi-pocket-pants',
  'gears/new-balance-fuelcell-propel-v5': 'gears/2026-05-15-gears-new-balance-fuelcell-propel-v5',
};

/** 旧 URL（日付入り）→ 新 URL へのリダイレクト（trailingSlash: always 向け） */
export function buildTipsGearsRedirects() {
  const redirects = {};

  for (const [newSlug, oldSlug] of Object.entries(TIPS_GEARS_LEGACY_SLUG)) {
    if (oldSlug === newSlug) continue;
    redirects[`/${oldSlug}/`] = `/${newSlug}/`;
  }

  return redirects;
}
