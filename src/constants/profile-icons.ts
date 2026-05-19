/**
 * プロフィール欄向けラスタアイコン（`public/images/icons/profile/`）。
 */
export const profileIconFiles = {
  scale: 'images/icons/profile/profile-scale.png',
} as const;

export type ProfileIconKey = keyof typeof profileIconFiles;

/** `import.meta.env.BASE_URL` と組み合わせて絶対パスを返す */
export function profileIconUrl(base: string, key: ProfileIconKey): string {
  const root = base.endsWith('/') ? base : `${base}/`;
  return `${root}${profileIconFiles[key]}`;
}
