import sharp from 'sharp';
import { OG_COLORS, OG_HEIGHT, OG_WIDTH } from './constants';
import { getSiteHeaderStripPng } from './capture-site-header';

/** トップ OGP: 青背景に `site-header-strip.png` を縦中央配置（記事 OGP 上部と同じ見た目） */
export async function generateHomeOgPng(): Promise<Uint8Array> {
  const headerPng = await getSiteHeaderStripPng();
  const headerMeta = await sharp(headerPng).metadata();
  const headerHeight = headerMeta.height;
  const headerWidth = headerMeta.width;
  if (!headerHeight || headerWidth !== OG_WIDTH) {
    throw new Error(
      `OGP ヘッダー画像のサイズが不正です (${headerWidth ?? '?'}×${headerHeight ?? '?'}px)。` +
        'src/assets/og/site-header-strip.png を /og/header-strip/ から撮り直してください。',
    );
  }

  const top = Math.round((OG_HEIGHT - headerHeight) / 2);
  const png = await sharp({
    create: {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      channels: 3,
      background: OG_COLORS.accent,
    },
  })
    .composite([{ input: headerPng, top, left: 0 }])
    .png()
    .toBuffer();

  return new Uint8Array(png);
}
