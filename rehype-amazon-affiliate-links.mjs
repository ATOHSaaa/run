import { loadEnv } from 'vite';
import { visit } from 'unist-util-visit';
import {
  extractAsinFromAmazonUrl,
  getAmazonAssociateTagFromEnv,
  isAmazonProductUrl,
  toAmazonAffiliateUrl,
} from './amazon-affiliate-url.mjs';

function resolveAssociateTag() {
  const mode = process.env.MODE ?? process.env.NODE_ENV ?? 'development';
  const env = loadEnv(mode, process.cwd(), '');
  return getAmazonAssociateTagFromEnv(env.AMAZON_ASSOCIATE_TAG);
}

/** @param {unknown} raw */
function hrefString(raw) {
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'string') return raw[0];
  return '';
}

/** @param {unknown} raw @param {string[]} tokens */
function mergeRel(raw, tokens) {
  const set = new Set();
  if (typeof raw === 'string') {
    for (const t of raw.split(/\s+/)) if (t) set.add(t);
  } else if (Array.isArray(raw)) {
    for (const item of raw) {
      const s = String(item);
      for (const t of s.split(/\s+/)) if (t) set.add(t);
    }
  }
  for (const t of tokens) set.add(t);
  return [...set].join(' ');
}

/**
 * 記事 Markdown 内の Amazon 商品 URL に `run-atohs-22`（または `.env` のタグ）を付与する。
 */
export default function rehypeAmazonAffiliateLinks() {
  const associateTag = resolveAssociateTag();

  /** @param {import('hast').Root} tree */
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'a') return;

      const href = hrefString(node.properties.href);
      if (!href || !isAmazonProductUrl(href)) return;

      const asin = extractAsinFromAmazonUrl(href);
      node.properties.href = toAmazonAffiliateUrl(href, associateTag);
      node.properties.target = '_blank';
      node.properties.rel = mergeRel(node.properties.rel, ['noopener', 'noreferrer', 'sponsored']);
      node.properties['data-aff-program'] = 'amazon';
      node.properties['data-aff-kind'] = 'text_link';
      node.properties['data-aff-placement'] = 'body';
      if (asin) node.properties['data-aff-item-id'] = asin;
    });
  };
}
