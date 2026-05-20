import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { decompress } from 'wawoff2';

type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 700 | 900;
  style: 'normal';
};

let fontsPromise: Promise<OgFont[]> | null = null;

const ROOT = process.cwd();

/** サイト `global.css` の `--font-sans` と同じ順序 */
export const OG_FONT_FAMILY = 'Inter, YakuHanJPs, "Zen Kaku Gothic New"';

export function getOgFonts(): Promise<OgFont[]> {
  if (!fontsPromise) fontsPromise = loadOgFonts();
  return fontsPromise;
}

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(
    buf.byteOffset,
    buf.byteOffset + buf.byteLength,
  ) as ArrayBuffer;
}

async function readFontFile(abs: string): Promise<ArrayBuffer> {
  return toArrayBuffer(await readFile(abs));
}

/** YakuHan は woff2 のみ配布。satori 用に TTF（SFNT）へ展開する */
async function readYakuHanFontFile(abs: string): Promise<ArrayBuffer> {
  const woff2 = await readFile(abs);
  const sfnt = await decompress(woff2);
  const bytes = Uint8Array.from(sfnt as Uint8Array);
  const copy = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  return copy;
}

async function loadOgFonts(): Promise<OgFont[]> {
  const interDir = path.join(ROOT, 'node_modules/@fontsource/inter/files');
  const zenDir = path.join(ROOT, 'node_modules/@fontsource/zen-kaku-gothic-new/files');
  const yakuDir = path.join(ROOT, 'node_modules/yakuhanjp/dist/fonts/YakuHanJPs');

  const [inter400, inter700, inter900, zen400, zen700, zen900, yaku400, yaku700, yaku900] =
    await Promise.all([
      readFontFile(path.join(interDir, 'inter-latin-400-normal.woff')),
      readFontFile(path.join(interDir, 'inter-latin-700-normal.woff')),
      readFontFile(path.join(interDir, 'inter-latin-900-normal.woff')),
      readFontFile(path.join(zenDir, 'zen-kaku-gothic-new-japanese-400-normal.woff')),
      readFontFile(path.join(zenDir, 'zen-kaku-gothic-new-japanese-700-normal.woff')),
      readFontFile(path.join(zenDir, 'zen-kaku-gothic-new-japanese-900-normal.woff')),
      readYakuHanFontFile(path.join(yakuDir, 'YakuHanJPs-Regular.woff2')),
      readYakuHanFontFile(path.join(yakuDir, 'YakuHanJPs-Bold.woff2')),
      readYakuHanFontFile(path.join(yakuDir, 'YakuHanJPs-Black.woff2')),
    ]);

  // フォントスタックの優先順はサイトと同じ（Inter → YakuHanJPs → Zen Kaku）
  return [
    { name: 'Inter', data: inter400, weight: 400, style: 'normal' },
    { name: 'Inter', data: inter700, weight: 700, style: 'normal' },
    { name: 'Inter', data: inter900, weight: 900, style: 'normal' },
    { name: 'YakuHanJPs', data: yaku400, weight: 400, style: 'normal' },
    { name: 'YakuHanJPs', data: yaku700, weight: 700, style: 'normal' },
    { name: 'YakuHanJPs', data: yaku900, weight: 900, style: 'normal' },
    { name: 'Zen Kaku Gothic New', data: zen400, weight: 400, style: 'normal' },
    { name: 'Zen Kaku Gothic New', data: zen700, weight: 700, style: 'normal' },
    { name: 'Zen Kaku Gothic New', data: zen900, weight: 900, style: 'normal' },
  ];
}
