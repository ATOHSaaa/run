import { readFile } from 'node:fs/promises';
import path from 'node:path';

/** `npm run capture:og-header` が書き出すキャッシュ（`.gitignore` 対象） */
export const OG_SITE_HEADER_STRIP_PATH = path.join(
  process.cwd(),
  '.cache/og-site-header-strip.png',
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
        '先に npm run capture:og-header を実行してください。',
    );
  }
}
