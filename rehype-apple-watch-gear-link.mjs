import { visitParents } from 'unist-util-visit-parents';

const PHRASE = 'Apple Watch';
const GEARS_HREF = '/blog/gears/2026-05-15-gears-apple-watch-ultra-2/';
const EXCLUDE_FILE_RE = /[/\\]2026-05-15-gears-apple-watch-ultra-2\.mdx?$/i;

const SKIP_ANCESTOR_TAGS = new Set(['a', 'code', 'pre', 'script', 'style', 'svg']);

/** @param {import('unist').Node[]} ancestors */
function hasSkipAncestor(ancestors) {
  for (const node of ancestors) {
    if (node.type !== 'element') continue;
    if (SKIP_ANCESTOR_TAGS.has(node.tagName)) return true;
    if (/^h[1-6]$/.test(node.tagName)) return true;
  }
  return false;
}

/**
 * 記事本文で初出の「Apple Watch」を Gears（Apple Watch Ultra 2）記事へリンクする。
 * 対象 Gears 記事自身・見出し・既存リンク内・コードは除外。
 */
export default function rehypeAppleWatchGearLink() {
  /** @param {import('hast').Root} tree @param {import('vfile').VFile} file */
  return (tree, file) => {
    const filePath = String(file?.path ?? file?.history?.[0] ?? '');
    if (EXCLUDE_FILE_RE.test(filePath)) return;

    let linked = false;

    visitParents(tree, 'text', (node, ancestors) => {
      if (linked || !node.value.includes(PHRASE)) return;
      if (hasSkipAncestor(ancestors)) return;

      const parent = ancestors[ancestors.length - 1];
      if (!parent || !('children' in parent) || !Array.isArray(parent.children)) return;

      const index = parent.children.indexOf(node);
      if (index === -1) return;

      const start = node.value.indexOf(PHRASE);
      const before = node.value.slice(0, start);
      const after = node.value.slice(start + PHRASE.length);

      /** @type {import('hast').Content[]} */
      const replacement = [];
      if (before) replacement.push({ type: 'text', value: before });
      replacement.push({
        type: 'element',
        tagName: 'a',
        properties: { href: GEARS_HREF },
        children: [{ type: 'text', value: PHRASE }],
      });
      if (after) replacement.push({ type: 'text', value: after });

      parent.children.splice(index, 1, ...replacement);
      linked = true;
    });
  };
}
