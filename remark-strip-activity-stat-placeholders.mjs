import { visit } from 'unist-util-visit';

/** テンプレ用の空欄見出し＋次行のダッシュのみの段落を落とす */
const PLACEHOLDER_HEADINGS = new Set(['練習メニュー', '走行距離', '平均走行タイム']);

/** @param {import('mdast').PhrasingContent | import('mdast').Heading} node */
function toPlain(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value;
  if ('children' in node && Array.isArray(node.children)) {
    return node.children.map((c) => toPlain(/** @type {*} */ (c))).join('');
  }
  return '';
}

/** 段落が「— / - / ー」等だけならプレースホルダとみなす */
function isDashOnlyParagraph(node) {
  if (node.type !== 'paragraph' || !node.children?.length) return false;
  const t = toPlain(node).trim();
  return /^[—\-－ー\u2013\u2014\u2212\s]+$/u.test(t);
}

/**
 * 旧テンプレの「見出し＋ダッシュ1行」を本文から除去する（practice-log カードとは別）。
 */
export default function remarkStripActivityStatPlaceholders() {
  /** @param {import('mdast').Root} tree */
  return (tree) => {
    visit(tree, 'heading', (node, index, parent) => {
      if (!parent || typeof index !== 'number') return;
      const text = toPlain(node).trim();
      if (!PLACEHOLDER_HEADINGS.has(text)) return;
      const next = parent.children[index + 1];
      if (!next || !isDashOnlyParagraph(next)) return;
      parent.children.splice(index, 2);
      return index;
    });
  };
}
