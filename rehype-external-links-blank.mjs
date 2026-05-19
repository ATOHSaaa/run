import { visit } from 'unist-util-visit';

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

/** @param {string} href */
function isExternalHttpHref(href) {
  return /^https?:\/\//i.test(href);
}

/**
 * 記事 Markdown の外部リンク（`http://` / `https://`）に `target="_blank"` を付ける。
 */
export default function rehypeExternalLinksBlank() {
  /** @param {import('hast').Root} tree */
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'a') return;

      const href = hrefString(node.properties.href);
      if (!href || !isExternalHttpHref(href)) return;

      node.properties.target = '_blank';
      node.properties.rel = mergeRel(node.properties.rel, ['noopener', 'noreferrer']);
    });
  };
}
