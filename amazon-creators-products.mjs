import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { loadEnv } from 'vite';
import { ApiClient, DefaultApi, GetItemsRequestContent } from 'amazon-creator-api-sdk';
import {
  AMAZON_ASSOCIATE_TAG_DEFAULT,
  extractAsinFromAmazonUrl,
  getAmazonAssociateTagFromEnv,
} from './amazon-affiliate-url.mjs';

const CACHE_FILE = '.cache/amazon-product-images.json';
const PUBLIC_AMAZON_DIR = path.join('public', 'gears', 'amazon');
const GET_ITEMS_CHUNK = 10;
const IMAGE_RESOURCES = ['images.primary.medium', 'images.primary.large', 'itemInfo.title'];

/** @type {Record<string, { imageSrc?: string; imageUrl?: string; title?: string }> | null} */
let memoryCache = null;

function loadCreatorsEnv() {
  const mode = process.env.MODE ?? process.env.NODE_ENV ?? 'development';
  return loadEnv(mode, process.cwd(), '');
}

function getCreatorsConfig() {
  const env = loadCreatorsEnv();
  return {
    credentialId: env.AMAZON_CREATORS_CREDENTIAL_ID?.trim() ?? '',
    credentialSecret: env.AMAZON_CREATORS_CREDENTIAL_SECRET?.trim() ?? '',
    version: env.AMAZON_CREATORS_VERSION?.trim() || '3.3',
    partnerTag: getAmazonAssociateTagFromEnv(env.AMAZON_ASSOCIATE_TAG),
    marketplace: env.AMAZON_MARKETPLACE?.trim() || 'www.amazon.co.jp',
  };
}

export function isAmazonCreatorsConfigured() {
  const { credentialId, credentialSecret } = getCreatorsConfig();
  return Boolean(credentialId && credentialSecret);
}

async function readCacheFile() {
  try {
    const raw = await fs.readFile(CACHE_FILE, 'utf8');
    return /** @type {Record<string, { imageSrc?: string; imageUrl?: string; title?: string }>} */ (
      JSON.parse(raw)
    );
  } catch {
    return {};
  }
}

async function writeCacheFile(cache) {
  await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
}

async function getCache() {
  if (!memoryCache) {
    memoryCache = await readCacheFile();
  }
  return memoryCache;
}

/**
 * @param {string} imageUrl
 * @param {string} asin
 * @returns {Promise<string | undefined>} `public/` からの相対パス
 */
async function downloadProductImage(imageUrl, asin) {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`image download failed (${response.status})`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  const ext = contentType.includes('png') ? 'png' : 'jpg';
  const relPath = `gears/amazon/${asin}.${ext}`;
  const absPath = path.join('public', relPath);

  await fs.mkdir(PUBLIC_AMAZON_DIR, { recursive: true });
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(absPath, buffer);

  return relPath;
}

/**
 * @param {string | undefined} imageSrc `public/` からの相対パス
 */
async function productImageFileExists(imageSrc) {
  if (!imageSrc) return false;
  try {
    await fs.access(path.join('public', imageSrc));
    return true;
  } catch {
    return false;
  }
}

const PRODUCT_IMAGE_EXTENSIONS = ['jpg', 'png', 'webp'];

/**
 * `public/gears/amazon/{ASIN}.{ext}` があればその相対パスを返す（キャッシュ不要）。
 * @param {string} asin
 * @returns {Promise<string | undefined>}
 */
export function findLocalProductImageSrcSync(asin) {
  const normalized = asin.trim().toUpperCase();
  for (const ext of PRODUCT_IMAGE_EXTENSIONS) {
    const relPath = `gears/amazon/${normalized}.${ext}`;
    if (fsSync.existsSync(path.join('public', relPath))) {
      return relPath;
    }
  }
  return undefined;
}

/** @param {string} asin */
export async function findLocalProductImageSrc(asin) {
  return findLocalProductImageSrcSync(asin);
}

/**
 * キャッシュの imageUrl からローカル画像を復元する（API 不要）。
 * @param {string} asin
 * @param {{ imageSrc?: string; imageUrl?: string; title?: string }} entry
 * @returns {Promise<string | undefined>}
 */
async function restoreProductImageFromCacheEntry(asin, entry) {
  if (entry.imageSrc && (await productImageFileExists(entry.imageSrc))) {
    return entry.imageSrc;
  }
  if (!entry.imageUrl) return undefined;

  try {
    const imageSrc = await downloadProductImage(entry.imageUrl, asin);
    entry.imageSrc = imageSrc;
    return imageSrc;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[amazon-creators] ${asin} image restore failed: ${message}`);
    return undefined;
  }
}

/**
 * @param {import('amazon-creator-api-sdk').Item} item
 */
function pickImageUrl(item) {
  return (
    item?.images?.primary?.medium?.url ??
    item?.images?.primary?.large?.url ??
    item?.images?.primary?.small?.url
  );
}

/**
 * @param {string[]} asins
 */
async function fetchProductsFromApi(asins) {
  const config = getCreatorsConfig();
  if (!config.credentialId || !config.credentialSecret) {
    console.warn('[amazon-creators] AMAZON_CREATORS_CREDENTIAL_ID / SECRET が未設定のため画像を取得しません');
    return {};
  }

  const client = new ApiClient();
  client.credentialId = config.credentialId;
  client.credentialSecret = config.credentialSecret;
  client.version = config.version;

  const api = new DefaultApi(client);
  /** @type {Record<string, { imageSrc?: string; imageUrl?: string; title?: string }>} */
  const fetched = {};

  for (let i = 0; i < asins.length; i += GET_ITEMS_CHUNK) {
    const chunk = asins.slice(i, i + GET_ITEMS_CHUNK);
    const request = new GetItemsRequestContent();
    request.partnerTag = config.partnerTag || AMAZON_ASSOCIATE_TAG_DEFAULT;
    request.itemIds = chunk;
    request.resources = IMAGE_RESOURCES;

    let response;
    try {
      response = await api.getItems(config.marketplace, request);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[amazon-creators] getItems failed: ${message}`);
      continue;
    }

    const items = response?.itemsResult?.items ?? [];
    for (const item of items) {
      const asin = item?.asin?.toUpperCase();
      if (!asin) continue;

      const imageUrl = pickImageUrl(item);
      const title = item?.itemInfo?.title?.displayValue;
      const entry = { title, imageUrl };

      if (imageUrl) {
        try {
          entry.imageSrc = await downloadProductImage(imageUrl, asin);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.warn(`[amazon-creators] ${asin} image download failed: ${message}`);
        }
      }

      fetched[asin] = entry;
    }
  }

  return fetched;
}

/** 本文中の Amazon.co.jp リンク（`amazon.co.jp/dp/…` および長い商品パス付き URL） */
const AMAZON_LINK_IN_BODY_PATTERN =
  /https?:\/\/(?:www\.)?amazon\.co\.jp[^\s)\]"']*/gi;

/**
 * @param {string} body
 * @returns {string[]}
 */
function collectAsinsFromAmazonLinksInBody(body) {
  /** @type {Set<string>} */
  const asins = new Set();
  for (const match of body.matchAll(AMAZON_LINK_IN_BODY_PATTERN)) {
    const asin = extractAsinFromAmazonUrl(match[0]);
    if (asin) asins.add(asin);
  }
  return [...asins];
}

/**
 * @param {import('astro:content').CollectionEntry<'blog'>} post
 * @returns {string | undefined}
 */
export function collectPrimaryAsinFromPost(post) {
  const affiliate = post.data.amazonAffiliate;
  if (affiliate) {
    const items = Array.isArray(affiliate) ? affiliate : [affiliate];
    for (const item of items) {
      const asin = item.asin?.trim().toUpperCase() || extractAsinFromAmazonUrl(item.href);
      if (asin) return asin;
    }
  }

  const gearAsin = post.data.gearAsin?.trim().toUpperCase();
  if (gearAsin && /^[A-Z0-9]{10}$/.test(gearAsin)) return gearAsin;

  const bodyAsins = collectAsinsFromAmazonLinksInBody(post.body);
  if (bodyAsins[0]) return bodyAsins[0];

  return undefined;
}

/**
 * @param {import('astro:content').CollectionEntry<'blog'>[]} posts
 */
export function collectAmazonAsinsFromPosts(posts) {
  /** @type {Set<string>} */
  const asins = new Set();

  for (const post of posts) {
    const primary = collectPrimaryAsinFromPost(post);
    if (primary) asins.add(primary);

    for (const asin of collectAsinsFromAmazonLinksInBody(post.body)) {
      asins.add(asin);
    }

    const affiliate = post.data.amazonAffiliate;
    if (affiliate) {
      const items = Array.isArray(affiliate) ? affiliate : [affiliate];
      for (const item of items) {
        const asin = item.asin?.trim().toUpperCase() || extractAsinFromAmazonUrl(item.href);
        if (asin) asins.add(asin);
      }
    }
  }

  return [...asins];
}

/**
 * @param {string[]} asins
 */
export async function prefetchAmazonProductAsins(asins) {
  const unique = [...new Set(asins.map((a) => a.trim().toUpperCase()).filter(Boolean))];
  if (unique.length === 0) return;

  const cache = await getCache();
  /** @type {string[]} */
  const needsApi = [];

  for (const asin of unique) {
    const local = await findLocalProductImageSrc(asin);
    if (local) {
      const entry = cache[asin] ?? {};
      entry.imageSrc = local;
      cache[asin] = entry;
      continue;
    }

    const entry = cache[asin];
    if (!entry) {
      needsApi.push(asin);
      continue;
    }

    const restored = await restoreProductImageFromCacheEntry(asin, entry);
    if (!restored) {
      needsApi.push(asin);
    }
  }

  if (needsApi.length > 0) {
    const fetched = await fetchProductsFromApi(needsApi);
    Object.assign(cache, fetched);
  }

  memoryCache = cache;
  await writeCacheFile(cache);
}

/**
 * @param {import('astro:content').CollectionEntry<'blog'>[]} posts
 */
export async function prefetchAmazonProductImages(posts) {
  await prefetchAmazonProductAsins(collectAmazonAsinsFromPosts(posts));
}

/**
 * @param {string} asin
 */
export async function getAmazonProductImageSrc(asin) {
  const normalized = asin.trim().toUpperCase();

  const local = await findLocalProductImageSrc(normalized);
  if (local) return local;

  const cache = await getCache();
  const entry = cache[normalized];
  if (!entry) return undefined;

  const restored = await restoreProductImageFromCacheEntry(normalized, entry);
  if (restored && restored !== entry.imageSrc) {
    memoryCache = cache;
    await writeCacheFile(cache);
  }
  return restored;
}
