import { readFile } from 'node:fs/promises';
import path from 'node:path';

/** コミット済みアセット（ヘッダー見た目変更時は `/og/header-strip/` を手動で撮り直して上書き） */
export const OG_SITE_HEADER_STRIP_PATH = path.join(
  process.cwd(),
  'src/assets/og/site-header-strip.png',
);

let cachedStrip: Buffer | null = null;

export async function getSiteHeaderStripPng(): Promise<Buffer> {
  if (cachedStrip) return cachedStrip;
  try {
    cachedStrip = await readFile(OG_SITE_HEADER_STRIP_PATH);
    return cachedStrip;
  } catch {
    throw new Error(
      `OGP 用ヘッダー画像が見つかりません (${OG_SITE_HEADER_STRIP_PATH})。` +
        'src/assets/og/site-header-strip.png を用意するか、/og/header-strip/ から手動で撮り直してください。',
    );
  }
}
