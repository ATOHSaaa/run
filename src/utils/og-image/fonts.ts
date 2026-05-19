import { readFile } from 'node:fs/promises';
import path from 'node:path';

type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 700;
  style: 'normal';
};

let fontsPromise: Promise<OgFont[]> | null = null;

const FONT_DIR = path.join(
  process.cwd(),
  'node_modules',
  '@fontsource',
  'noto-sans-jp',
  'files',
);

export function getOgFonts(): Promise<OgFont[]> {
  if (!fontsPromise) fontsPromise = loadOgFonts();
  return fontsPromise;
}

async function loadOgFonts(): Promise<OgFont[]> {
  const [regular, bold] = await Promise.all([
    readFile(path.join(FONT_DIR, 'noto-sans-jp-japanese-400-normal.woff')),
    readFile(path.join(FONT_DIR, 'noto-sans-jp-japanese-700-normal.woff')),
  ]);

  return [
    {
      name: 'Noto Sans JP',
      data: regular.buffer.slice(regular.byteOffset, regular.byteOffset + regular.byteLength),
      weight: 400,
      style: 'normal',
    },
    {
      name: 'Noto Sans JP',
      data: bold.buffer.slice(bold.byteOffset, bold.byteOffset + bold.byteLength),
      weight: 700,
      style: 'normal',
    },
  ];
}
