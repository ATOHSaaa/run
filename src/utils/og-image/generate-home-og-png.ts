import satori from 'satori';
import sharp from 'sharp';
import { OG_HEIGHT, OG_WIDTH } from './constants';
import { getOgFonts } from './fonts';
import { buildHomeOgBrandTemplate } from './home-brand-template';

/** トップ OGP: 青背景にヘッダーブランドを satori で描画（PNG 拡大よりくっきり） */
export async function generateHomeOgPng(): Promise<Uint8Array> {
  const [fonts, element] = await Promise.all([getOgFonts(), buildHomeOgBrandTemplate()]);
  const svg = await satori(element, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts,
  });
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Uint8Array(png);
}
