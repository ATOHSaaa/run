import { readFile } from 'node:fs/promises';
import path from 'node:path';

/** `public/` 配下の画像を satori 用 data URL にする */
export async function readPublicImageDataUrl(relPath: string): Promise<string | undefined> {
  const normalized = relPath.replace(/^\/+/, '');
  const abs = path.join(process.cwd(), 'public', normalized);
  try {
    const buf = await readFile(abs);
    const ext = abs.endsWith('.png') ? 'png' : abs.endsWith('.webp') ? 'webp' : 'jpeg';
    return `data:image/${ext};base64,${buf.toString('base64')}`;
  } catch {
    return undefined;
  }
}
