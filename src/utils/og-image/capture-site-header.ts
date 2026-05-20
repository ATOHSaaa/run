import { readFile } from 'node:fs/promises';
import path from 'node:path';

/** コミット済みアセット（見た目変更時は `npm run capture:og-header` で再生成） */
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
        'npm run capture:og-header を実行するか、src/assets/og/site-header-strip.png を用意してください。',
    );
  }
}
