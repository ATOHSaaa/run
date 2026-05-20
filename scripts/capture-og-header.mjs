/**
 * 開発サーバー上の /og/header-strip/ を Puppeteer で撮影し、
 * 記事 OGP の青帯（ブログ名）に使う PNG を .cache に保存する。
 */
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { puppeteerLaunchOptions } from './puppeteer-launch.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 4322;
const OUT = path.join(ROOT, '.cache/og-site-header-strip.png');

const basePath = (process.env.PUBLIC_BASE_PATH ?? '/').replace(/\/?$/, '/');
const captureUrl = `http://127.0.0.1:${PORT}${basePath}og/header-strip/`;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // retry
    }
    await wait(400);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function startDevServer() {
  return spawn('npx', ['astro', 'dev', '--port', String(PORT), '--host', '127.0.0.1'], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NODE_ENV: 'development' },
  });
}

async function main() {
  const dev = startDevServer();

  try {
    await waitForServer(captureUrl);
    const browser = await puppeteer.launch(puppeteerLaunchOptions);
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 320, deviceScaleFactor: 1 });
    await page.goto(captureUrl, { waitUntil: 'networkidle0', timeout: 60_000 });
    await page.evaluateHandle('document.fonts.ready');
    const target = await page.waitForSelector('[data-og-header-capture]');
    const png = await target.screenshot({ type: 'png' });
    await browser.close();

    await mkdir(path.dirname(OUT), { recursive: true });
    await writeFile(OUT, png);
    console.log(`Wrote ${OUT} (${png.length} bytes)`);
  } finally {
    dev.kill('SIGTERM');
    await wait(300);
    if (dev.exitCode === null) dev.kill('SIGKILL');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
