import { visit } from 'unist-util-visit';
import {
  buildPracticeLogAsideHtml,
  hasPracticeLogMetrics,
  parsePracticeLogBody,
  shouldTransformFirstFence,
} from './practice-log-parse.mjs';

/** @param {import('vfile').VFile} file */
function setPracticeLogFrontmatter(file, { html, title }) {
  file.data ??= {};
  file.data.astro ??= { frontmatter: {} };
  file.data.astro.frontmatter ??= {};
  if (typeof html === 'string' && html.trim()) {
    file.data.astro.frontmatter.practiceLogHtml = html;
  }
  const t = typeof title === 'string' ? title.trim() : '';
  if (t) file.data.astro.frontmatter.practiceLogTitle = t;
}

/**
 * 本文の「最初のコードフェンス」を活動記録にし、HTML を remarkPluginFrontmatter.practiceLogHtml に載せる（本文からは除去）。
 * 解釈: `練習:` 等のキー行、中黒区切りの1行、または改行区切りの2〜3行。
 * 本文先頭にはメニュー・距離・ペースの1行のみ（枠・見出しなし）。メトリクスが空の practice-log / tips-run は除去しない。
 * キー行 `タイトル:` / `title:` があると remarkPluginFrontmatter.practiceLogTitle に載せる（記事詳細では Activities で、フロントマターの title が無いときのみ使用）。
 */
export default function remarkPracticeLog() {
  /** @param {import('mdast').Root} tree */
  /** @param {import('vfile').VFile} file */
  return (tree, file) => {
    let sawFirstCode = false;
    visit(tree, 'code', (node, index, parent) => {
      if (!parent || typeof index !== 'number') return;
      if (sawFirstCode) return;
      sawFirstCode = true;

      if (!shouldTransformFirstFence(node)) return;

      const parsed = parsePracticeLogBody(node.value ?? '');
      const lang0 = (node.lang ?? '').trim().split(/\s+/)[0] ?? '';
      const tagged = lang0 === 'practice-log' || lang0 === 'tips-run';
      const titleTrim = typeof parsed.title === 'string' ? parsed.title.trim() : '';
      const metrics = hasPracticeLogMetrics(parsed);

      if (tagged && !metrics && !titleTrim) return;

      const base = import.meta.env.BASE_URL ?? '/';
      const html = metrics ? buildPracticeLogAsideHtml(parsed, { base }) : undefined;
      if (!html && !titleTrim) return;

      setPracticeLogFrontmatter(file, { html, title: parsed.title });
      parent.children.splice(index, 1);
      return index;
    });
  };
}
