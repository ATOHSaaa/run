import fs from 'node:fs';
import path from 'node:path';
import { loadEnv } from 'vite';
import { visit } from 'unist-util-visit';
import {
  extractAsinFromAmazonUrl,
  getAmazonAssociateTagFromEnv,
  isAmazonAffiliateCardUrl,
  toAmazonAffiliateUrl,
} from './amazon-affiliate-url.mjs';
import {
  createAmazonAffiliateCardElement,
  getNodePlainText,
  hrefString,
} from './amazon-affiliate-card-hast.mjs';
import { findLocalProductImageSrcSync } from './amazon-creators-products.mjs';

function loadProductCache() {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), '.cache/amazon-product-images.json'), 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function resolveBaseUrl() {
  const mode = process.env.MODE ?? process.env.NODE_ENV ?? 'development';
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.PUBLIC_BASE_PATH ?? '/';
  return base.endsWith('/') ? base : `${base}/`;
}

/**
 * 本文中の Amazon リンクを含む段落の直後にアフィリエイトカードを挿入する。
 */
function resolveAssociateTag() {
  const mode = process.env.MODE ?? process.env.NODE_ENV ?? 'development';
  const env = loadEnv(mode, process.cwd(), '');
  return getAmazonAssociateTagFromEnv(env.AMAZON_ASSOCIATE_TAG);
}

/** 段落が Amazon アフィリエイト用リンクのみ（空白除く）か */
function isCardOnlyAffiliateParagraph(node) {
  if (node.tagName !== 'p') return false;

  let hasAffiliateLink = false;

  for (const child of node.children) {
    if (child.type === 'text') {
      if (child.value.trim()) return false;
      continue;
    }
    if (child.type !== 'element' || child.tagName !== 'a') return false;

    const href = hrefString(child.properties?.href);
    if (!href || !isAmazonAffiliateCardUrl(href)) return false;
    hasAffiliateLink = true;
  }

  return hasAffiliateLink;
}

export default function rehypeAmazonInlineAffiliateCards() {
  const baseUrl = resolveBaseUrl();
  const associateTag = resolveAssociateTag();

  /** @param {import('hast').Root} tree */
  return (tree) => {
    const productCache = loadProductCache();
    /** @type {Array<{ parent: import('hast').Element; index: number; cards: import('hast').Element[]; replaceParagraph: boolean }>} */
    const insertions = [];

    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'p' || !parent || index == null) return;

      /** @type {Array<{ href: string; dedupeKey: string; linkText: string }>} */
      const links = [];

      visit(node, 'element', (child) => {
        if (child.tagName !== 'a') return;
        const href = hrefString(child.properties.href);
        if (!href || !isAmazonAffiliateCardUrl(href)) return;

        const asin = extractAsinFromAmazonUrl(href);
        links.push({
          href,
          dedupeKey: asin ?? href,
          linkText: getNodePlainText(child).trim(),
        });
      });

      if (links.length === 0) return;

      const seen = new Set();
      const cards = [];

      for (const link of links) {
        if (seen.has(link.dedupeKey)) continue;
        seen.add(link.dedupeKey);

        const asin = extractAsinFromAmazonUrl(link.href);
        const cached = asin ? productCache[asin] : undefined;
        const imageSrc =
          cached?.imageSrc ?? (asin ? findLocalProductImageSrcSync(asin) : undefined);
        const productName = cached?.title ?? link.linkText ?? asin ?? 'Amazon';
        const linkLabel =
          link.linkText && !/^amazon(\.co\.jp)?$/i.test(link.linkText)
            ? link.linkText
            : productName;
        const label = `Amazonで「${linkLabel.length > 40 ? `${linkLabel.slice(0, 40)}…` : linkLabel}」を探す`;

        cards.push(
          createAmazonAffiliateCardElement({
            href: toAmazonAffiliateUrl(link.href, associateTag),
            productName,
            label,
            asin,
            imageSrc,
            baseUrl,
            inline: true,
            placement: 'inline_card',
          }),
        );
      }

      insertions.push({
        parent,
        index,
        cards,
        replaceParagraph: isCardOnlyAffiliateParagraph(node),
      });
    });

    for (const { parent, index, cards, replaceParagraph } of insertions.reverse()) {
      if (replaceParagraph) {
        parent.children.splice(index, 1, ...cards);
      } else {
        parent.children.splice(index + 1, 0, ...cards);
      }
    }
  };
}
