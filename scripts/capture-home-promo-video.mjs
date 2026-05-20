/**
 * 開発サーバー上のトップページ（PC 幅）を Puppeteer でフレーム撮影し、
 * ffmpeg で Twitter 紹介用のスクロール動画を promo/ に出力する。
 *
 * 使い方: npm run capture:home-promo
 * 要: ffmpeg（PATH にあること）
 */
import { spawn, spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 4323;
const VIEWPORT = { width: 1280, height: 720 };
const OUT_DIR = path.join(ROOT, 'promo');
const OUT_FILE = path.join(OUT_DIR, 'home-top-pc.mp4');

const FPS = 24;
/** 冒頭の静止（0 = 最初のフレームからスクロール） */
const INTRO_MS = 0;
/** トップからフッターまでのスクロール */
const SCROLL_MS = 15_000;
/** フッター付近で止める */
const OUTRO_MS = 2_500;
/** ヘッダーマーキー・Gears オービット等の CSS アニメ速度倍率（大きいほど遅い） */
const ANIMATION_SLOWDOWN = 2.5;
const TOTAL_MS = INTRO_MS + SCROLL_MS + OUTRO_MS;

const basePath = (process.env.PUBLIC_BASE_PATH ?? '/').replace(/\/?$/, '/');
const homeUrl = `http://127.0.0.1:${PORT}${basePath}`;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

function assertFfmpeg() {
  const probe = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  if (probe.status !== 0) {
    throw new Error('ffmpeg が見つかりません。Homebrew 等でインストールしてください。');
  }
}

async function waitForServer(url, timeoutMs = 120_000) {
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

/** 撮影中だけマーキー等を遅くする（本番 CSS は変えない） */
async function applyPromoAnimationPacing(page, factor) {
  await page.evaluate((scale) => {
    const root = document.documentElement;
    root.dataset.promoCapture = '1';
    root.style.setProperty('--promo-anim-scale', String(scale));
    let style = document.getElementById('promo-capture-slow');
    if (!style) {
      style = document.createElement('style');
      style.id = 'promo-capture-slow';
      document.head.appendChild(style);
    }
    style.textContent = `
      html[data-promo-capture] .site-ticker__track {
        animation-duration: calc(15s * var(--promo-anim-scale, 1)) !important;
      }
      html[data-promo-capture] .home-gears-orbit__slot {
        animation-duration: calc(var(--orbit-duration, 48s) * var(--promo-anim-scale, 1)) !important;
      }
      html[data-promo-capture] .activities-icon-legend__track {
        animation-duration: calc(22s * var(--promo-anim-scale, 1)) !important;
      }
      html[data-promo-capture] .home-block__head--scroll-reveal {
        transition-duration: calc(0.75s * var(--promo-anim-scale, 1)) !important;
      }
    `;
  }, factor);
}

function encodeVideo(framesDir, outFile) {
  const inputPattern = path.join(framesDir, 'frame-%05d.png');
  const args = [
    '-y',
    '-framerate',
    String(FPS),
    '-i',
    inputPattern,
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-crf',
    '20',
    '-movflags',
    '+faststart',
    outFile,
  ];
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let err = '';
    proc.stderr?.on('data', (chunk) => {
      err += String(chunk);
    });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited ${code}\n${err}`));
    });
  });
}

async function main() {
  assertFfmpeg();
  await mkdir(OUT_DIR, { recursive: true });

  const dev = startDevServer();
  const framesDir = await mkdtemp(path.join(os.tmpdir(), 'home-promo-frames-'));

  try {
    await waitForServer(homeUrl);

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ ...VIEWPORT, deviceScaleFactor: 1 });
    await page.goto(homeUrl, { waitUntil: 'networkidle0', timeout: 120_000 });
    await page.evaluateHandle('document.fonts.ready');
    await page.waitForSelector('.home-sections', { timeout: 30_000 });
    await applyPromoAnimationPacing(page, ANIMATION_SLOWDOWN);

    const maxScrollY = await page.evaluate(() =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
    );

    const totalFrames = Math.max(1, Math.round((TOTAL_MS / 1000) * FPS));
    const introFrames = Math.round((INTRO_MS / 1000) * FPS);
    const scrollFrames = Math.max(1, totalFrames - introFrames - Math.round((OUTRO_MS / 1000) * FPS));

    for (let i = 0; i < totalFrames; i += 1) {
      let scrollY = 0;
      if (i < introFrames) {
        scrollY = 0;
      } else if (i < introFrames + scrollFrames) {
        const t = scrollFrames <= 1 ? 1 : (i - introFrames) / (scrollFrames - 1);
        scrollY = maxScrollY * easeInOutQuad(Math.min(1, Math.max(0, t)));
      } else {
        scrollY = maxScrollY;
      }

      await page.evaluate((y) => window.scrollTo(0, y), scrollY);
      const framePath = path.join(framesDir, `frame-${String(i).padStart(5, '0')}.png`);
      await page.screenshot({ path: framePath, type: 'png' });
    }

    await browser.close();
    await encodeVideo(framesDir, OUT_FILE);

    const durationSec = (totalFrames / FPS).toFixed(1);
    console.log(`Wrote ${OUT_FILE}`);
    console.log(
      `Viewport: ${VIEWPORT.width}×${VIEWPORT.height} (16:9). ${totalFrames} frames @ ${FPS} fps (~${durationSec}s)`,
    );
  } finally {
    await rm(framesDir, { recursive: true, force: true });
    dev.kill('SIGTERM');
    await wait(300);
    if (dev.exitCode === null) dev.kill('SIGKILL');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
