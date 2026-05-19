import GitHubSlugger from 'github-slugger';

export type MarkdownTocItem = {
  depth: number;
  text: string;
  slug: string;
};

function stripHeadingMarkup(raw: string): string {
  return raw
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
}

/**
 * Markdown 本文から h2〜h6 の目次を取り出す（コードフェンス内は除外）。
 * `rehype-slug` が付与する id と一致するよう GitHubSlugger で slug を生成する。
 */
export function extractTocFromMarkdown(body: string): MarkdownTocItem[] {
  const slugger = new GitHubSlugger();
  const items: MarkdownTocItem[] = [];
  let inFence = false;

  for (const line of body.split('\n')) {
    const trimmedEnd = line.trimEnd();
    if (trimmedEnd.startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const m = trimmedEnd.match(/^(#{2,6})\s+(.+?)(?:\s+#+\s*)?$/);
    if (!m) continue;

    const depth = m[1].length;
    const plain = stripHeadingMarkup(m[2]);
    if (!plain) continue;

    const slug = slugger.slug(plain);
    items.push({ depth, text: plain, slug });
  }

  return items;
}
