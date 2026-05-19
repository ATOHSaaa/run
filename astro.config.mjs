import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import rehypeSlug from 'rehype-slug';
import rehypeAmazonAffiliateLinks from './rehype-amazon-affiliate-links.mjs';
import rehypeAmazonInlineAffiliateCards from './rehype-amazon-inline-affiliate-cards.mjs';
import rehypeExternalLinksBlank from './rehype-external-links-blank.mjs';
import rehypeAppleWatchGearLink from './rehype-apple-watch-gear-link.mjs';
import rehypeSiteInternalLinksBlank from './rehype-site-internal-links-blank.mjs';
import remarkPracticeLog from './remark-practice-log.mjs';
import remarkStripActivityStatPlaceholders from './remark-strip-activity-stat-placeholders.mjs';
import { buildTipsGearsRedirects } from './blog-slug.mjs';

// GitHub Pages（Project / User）向け:
// - ローカル: base は '/' のまま
// - CI: PUBLIC_SITE_URL と PUBLIC_BASE_PATH（例: /run/ または User サイトなら /）を渡す
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://example.github.io',
  base: process.env.PUBLIC_BASE_PATH ?? '/',
  trailingSlash: 'always',
  redirects: {
    '/blog': '/',
    '/blog/': '/',
    ...buildTipsGearsRedirects(),
  },
  integrations: [
    mdx(),
    sitemap(),
  ],
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
  markdown: {
    remarkPlugins: [remarkPracticeLog, remarkStripActivityStatPlaceholders],
    rehypePlugins: [
      rehypeSlug,
      rehypeAppleWatchGearLink,
      rehypeSiteInternalLinksBlank,
      rehypeAmazonAffiliateLinks,
      rehypeAmazonInlineAffiliateCards,
      rehypeExternalLinksBlank,
    ],
  },
});
