import satori from 'satori';
import sharp from 'sharp';
import { OG_HEIGHT, OG_WIDTH } from './constants';
import { getOgFonts } from './fonts';
import { buildHomeOgTemplate } from './home-template';

export async function generateHomeOgPng(): Promise<Uint8Array> {
  const [fonts, element] = await Promise.all([getOgFonts(), buildHomeOgTemplate()]);
  const svg = await satori(element, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts,
  });
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Uint8Array(png);
}
