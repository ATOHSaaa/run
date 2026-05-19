/** @typedef {'amazon.co.jp' | 'www.amazon.co.jp' | 'amazon.com' | 'www.amazon.com'} AmazonHost */

/** @type {ReadonlySet<string>} */
const AMAZON_HOSTS = new Set([
  'amazon.co.jp',
  'www.amazon.co.jp',
  'amazon.com',
  'www.amazon.com',
]);

/** 本サイトのアソシエイトタグ（`.env` 未設定時の既定値） */
export const AMAZON_ASSOCIATE_TAG_DEFAULT = 'run-atohs-22';

/**
 * @param {string | undefined} raw
 * @returns {string}
 */
export function getAmazonAssociateTagFromEnv(raw = process.env.AMAZON_ASSOCIATE_TAG) {
  const fromEnv = typeof raw === 'string' ? raw.trim() : '';
  return fromEnv || AMAZON_ASSOCIATE_TAG_DEFAULT;
}

/**
 * @param {string} href
 * @returns {string | undefined}
 */
export function extractAsinFromAmazonUrl(href) {
  let url;
  try {
    url = new URL(href);
  } catch {
    return undefined;
  }

  const patterns = [
    /\/dp\/([A-Z0-9]{10})(?:[/?]|$)/i,
    /\/gp\/product\/([A-Z0-9]{10})(?:[/?]|$)/i,
    /\/gp\/aw\/d\/([A-Z0-9]{10})(?:[/?]|$)/i,
    /\/exec\/obidos\/ASIN\/([A-Z0-9]{10})(?:[/?]|$)/i,
    /\/product\/([A-Z0-9]{10})(?:[/?]|$)/i,
  ];

  for (const pattern of patterns) {
    const match = url.pathname.match(pattern);
    if (match?.[1]) return match[1].toUpperCase();
  }

  const asinParam = url.searchParams.get('asin');
  if (asinParam && /^[A-Z0-9]{10}$/i.test(asinParam)) return asinParam.toUpperCase();

  return undefined;
}

/**
 * @param {string} href
 */
export function isAmazonProductUrl(href) {
  try {
    const url = new URL(href);
    if (!AMAZON_HOSTS.has(url.hostname.toLowerCase())) return false;
    return Boolean(extractAsinFromAmazonUrl(href));
  } catch {
    return false;
  }
}

/**
 * Audible ストアなど、商品 dp 以外でアフィリエイトカードを出す Amazon URL。
 * @param {string} href
 */
export function isAmazonAffiliateStoreUrl(href) {
  try {
    const url = new URL(href);
    if (!AMAZON_HOSTS.has(url.hostname.toLowerCase())) return false;
    return /audible/i.test(url.pathname);
  } catch {
    return false;
  }
}

/** 本文インラインのアフィリエイトカード対象か（商品 dp または Audible ストア等） */
export function isAmazonAffiliateCardUrl(href) {
  return isAmazonProductUrl(href) || isAmazonAffiliateStoreUrl(href);
}

/**
 * @param {string} hostname
 * @returns {'amazon.co.jp' | 'amazon.com'}
 */
function canonicalAmazonDpHost(hostname) {
  return hostname.toLowerCase().includes('amazon.co.jp') ? 'amazon.co.jp' : 'amazon.com';
}

/**
 * `https://amazon.co.jp/dp/{ASIN}` 形式の商品 URL を組み立てる。
 *
 * @param {string} asin
 * @param {string} [associateTag]
 * @param {'amazon.co.jp' | 'amazon.com'} [marketHost]
 */
export function buildAmazonDpProductUrl(
  asin,
  associateTag,
  marketHost = 'amazon.co.jp',
) {
  const normalizedAsin = asin.trim().toUpperCase();
  const base = `https://${marketHost}/dp/${normalizedAsin}`;
  const tag = associateTag?.trim();
  if (!tag) return base;
  return `${base}?tag=${encodeURIComponent(tag)}`;
}

/**
 * Amazon の商品 URL を `https://amazon.co.jp/dp/{ASIN}?tag=…` のみのシンプルな形式に正規化する。
 * 非 Amazon URL・ASIN 抽出不可のときは href をそのまま返す。
 *
 * @param {string} href
 * @param {string | undefined} associateTag
 */
export function toAmazonAffiliateUrl(href, associateTag = getAmazonAssociateTagFromEnv()) {
  let url;
  try {
    url = new URL(href);
  } catch {
    return href;
  }

  if (!AMAZON_HOSTS.has(url.hostname.toLowerCase())) return href;

  const tag = associateTag?.trim();
  const asin = extractAsinFromAmazonUrl(href);
  if (asin) {
    const host = canonicalAmazonDpHost(url.hostname);
    return buildAmazonDpProductUrl(asin, tag, host);
  }

  if (tag && isAmazonAffiliateStoreUrl(href)) {
    url.searchParams.set('tag', tag);
    return url.toString();
  }

  return href;
}
