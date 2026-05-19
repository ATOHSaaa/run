import { defineCollection, z } from 'astro:content';

/**
 * 記事はカテゴリごとのサブフォルダに置く。
 * - Activities → `src/content/blog/activities/`
 * - Tips       → `src/content/blog/tips/`
 * - Gears      → `src/content/blog/gears/`
 * - News       → `src/content/blog/news/`（お知らせ）
 */
const blog = defineCollection({
  type: 'content',
  schema: z
    .object({
      /** `category: Activities` のときは title 省略可（先頭フロントマターまたはフェンスの `タイトル:` / `title:`、なければ pubDate の日付タイトル） */
      title: z.string().optional(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      category: z.enum(['Activities', 'Tips', 'Gears', 'News']),
      /**
       * Gears 一覧・カード用の商品名（メーカー表記どおり）。
       * 記事タイトル `title` とは別。未設定時は一覧で `title` にフォールバック。
       */
      gearName: z.string().optional(),
      /**
       * Gears 一覧サムネ用 Amazon ASIN（Creators API で `public/gears/amazon/{ASIN}.jpg` を取得）。
       * `coverImage` 未設定時に使用。`amazonAffiliate` の ASIN を優先し、無いときのフォールバック。
       */
      gearAsin: z.string().optional(),
      /** 一覧サムネ用。`public/` からの相対パス（例: `gears/photo.jpg`） */
      coverImage: z.string().optional(),
      /**
       * 記事末尾の Amazon アフィリエイトカード（1件または複数）。
       * `href` には amzn.to ではなく Amazon の商品 URL（`https://amazon.co.jp/dp/{ASIN}` など）を書く。
       * ビルド時に `https://amazon.co.jp/dp/{ASIN}?tag=…` のみの形式に正規化される。
       */
      amazonAffiliate: z
        .union([
          z.object({
            href: z.string().url(),
            label: z.string(),
            productName: z.string().optional(),
            asin: z.string().optional(),
            /** 手動指定時は Creators API より優先。`public/` からの相対パス */
            imageSrc: z.string().optional(),
          }),
          z
            .array(
              z.object({
                href: z.string().url(),
                label: z.string(),
                productName: z.string().optional(),
                asin: z.string().optional(),
                imageSrc: z.string().optional(),
              }),
            )
            .min(1),
        ])
        .optional(),
    })
    .superRefine((data, ctx) => {
      const needsTitle =
        data.category === 'Tips' || data.category === 'Gears' || data.category === 'News';
      if (needsTitle && !data.title?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${data.category} 記事は title が必須です`,
          path: ['title'],
        });
      }
    }),
});

export const collections = { blog };
