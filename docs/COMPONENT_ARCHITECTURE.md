# コンポーネント・アーキテクチャ

このリポジトリ（`sub3-blog`）の構成メモ。**このプロジェクトで作業・質問するときは、まず本ファイルを参照する。**

最終更新の目安: 2026-05（Astro 4・静的サイト・GitHub Pages 想定）

---

## 技術スタック

| 項目 | 内容 |
|------|------|
| フレームワーク | [Astro](https://astro.build/) 4（`output: static` 相当の静的生成） |
| コンテンツ | Content Collections（`src/content/blog/`） |
| スタイル | `src/styles/global.css` + 各 `.astro` の `<style>`（スコープ付き） |
| Markdown | `@astrojs/mdx` / `remark-practice-log` / `remark-strip-activity-stat-placeholders` / `rehype-slug` / `rehype-apple-watch-gear-link` / `rehype-site-internal-links-blank` / `rehype-external-links-blank` |
| OGP 画像 | ビルド時に `satori` + `sharp` で 1200×630 PNG を生成（`src/pages/og/blog/[...slug].png.ts`）。**初回生成後は `og-cache/blog/` に保存し、記事タイトル（Gears は商品名＋記事タイトル）が変わるまで再利用** |
| 画像 | `astro:assets` + `sharp`（記事内は `ArticleFigure`） |
| デプロイ | GitHub Actions。`PUBLIC_SITE_URL=https://run.atohs.me`・`PUBLIC_BASE_PATH=/`（`.github/workflows/deploy.yml`） |
| サイトマップ | `@astrojs/sitemap`（`3.1.6`・Astro 4 向け）。ビルドで `dist/sitemap-index.xml` と `sitemap-0.xml` を生成。`astro.config.mjs` の `site` に依存 |
| robots.txt | `src/pages/robots.txt.ts`（`Sitemap:` で index を案内、`/og/` は Disallow） |
| アクセス解析 | `SiteAnalytics.astro` + `config/analytics.ts`（GA4 `G-CVWK7M20LS`・Clarity `wtfvqup85d`）。**本番ビルドのみ**読み込み |

---

## ディレクトリ一覧

```
run/
├── astro.config.mjs              # Markdown プラグイン・site/base
├── practice-log-parse.mjs        # 練習ログ HTML 生成（記事・remark 共通）
├── activity-menus.mjs            # 活動種別 slug（TS から re-export）
├── remark-practice-log.mjs
├── remark-strip-activity-stat-placeholders.mjs
├── rehype-apple-watch-gear-link.mjs
├── rehype-site-internal-links-blank.mjs
├── rehype-external-links-blank.mjs
├── docs/
│   └── COMPONENT_ARCHITECTURE.md # 本ファイル
├── public/                       # 静的アセット（images/, gears/ など）
└── src/
    ├── components/               # UI コンポーネント（Astro）
    ├── layouts/                  # ページ共通シェル
    ├── pages/                    # ファイルベースルーティング
    ├── content/
    │   ├── config.ts             # blog コレクション Zod スキーマ
    │   └── blog/
    │       ├── activities/       # Activities 記事
    │       ├── tips/
    │       ├── gears/
    │       └── news/
    ├── data/                     # 静的ページ用データ（ペース表など）
    ├── utils/                    # 純関数ヘルパ（TS）
    ├── constants/                # アイコン・活動メニュー等
    ├── config/                   # 機能フラグ・プロフィール定義
    └── styles/global.css
```

---

## レイアウト

### `src/layouts/BaseLayout.astro`

全ページ共通の HTML シェル。

| Prop | 説明 |
|------|------|
| `title` | ページタイトル（サイト名は自動付与） |
| `description?` | meta description |
| `ogImage?` | OGP 画像（絶対 URL） |
| `ogType?` | `website` / `article`（記事詳細は `article`） |
| `mainClass?` | `<main>` に付与するクラス（記事目次レイアウト等） |
| `hideSiteMarquees?` | `Header` の横マーキーを非表示 |

**子要素**: `Header` → `<main>`（slot）→ `Footer`  
**読み込み**: `global.css`

---

## コンポーネント（`src/components/`）

### `Header.astro`

サイトヘッダー・グローバルナビ・横スクロールマーキー（プロフィール / 最新 News）。

| Prop | 説明 |
|------|------|
| `hideSiteMarquees?` | 記事詳細などでマーキー非表示 |

**データ**: `getCollection('blog')` から最新 News を取得。

---

### `Footer.astro`

サイトフッター（著作・リンク等）。Props なし。

---

### `WaveDivider.astro`

セクション間の区切り線（画面幅いっぱいの直線）。  
`variant` / `flip` は互換用で見た目は同一。

**使用箇所**: トップ、記事一覧、タグ、about など。

---

### `HomeProfile.astro`

トップのプロフィールブロック（`#heading-profile`）。

**データ源**: `src/config/profile.ts`（`siteProfile`）  
**表示**: 自己紹介、年齢・体重・目標、SNS、距離別タイム表など。  
Props なし（設定ファイル駆動）。

---

### `ActivitiesCalendar.astro`

Activities 用の月次カレンダー + 登録運動アイコン凡例。

| Prop | 説明 |
|------|------|
| `activitiesPosts` | `category: Activities` の記事配列 |
| `base` | `import.meta.env.BASE_URL` |
| `anchorDate?` | 初期表示月（記事 `pubDate` など） |
| `rootId?` | 同一ページに複数置くときの DOM id 接頭辞 |

**表示条件**: `SHOW_ACTIVITIES_CALENDAR`（`src/config/features.ts`）かつ投稿あり。  
**ロジック**: `src/utils/diary-calendar.ts`  
**アイコン**: `src/constants/activity-icons.ts`（`registeredActivities`）

**使用箇所**:

- `src/pages/index.astro`（トップ Activities）
- `src/pages/[...slug].astro`（Activities 記事末尾）

---

### `AmazonAffiliateCard.astro`

記事末尾用の Amazon アフィリエイト・リッチカードリンク（Gears / Tips など）。

| Prop | 説明 |
|------|------|
| `href` | ビルド後のアソシエイト URL（フロントマターには **通常の Amazon 商品 URL** を書く） |
| `label` | CTA 文言（例: `Amazonで「…」を探す`） |
| `productName?` | カード見出しの商品名 |
| `imageSrc?` | `public/` からの相対パス（未指定時プレースホルダー） |

**使用箇所**: `[...slug].astro` 本文末（`post.data.amazonAffiliate` があるとき）  
**リンク**: `target="_blank"` / `rel="noopener noreferrer sponsored"`

### `AmazonAffiliateSidebar.astro`

デスクトップ右サイドバー用のコンパクトな商品一覧（見出し「この記事に出てくる商品」）。`amazonAffiliate` フロントマターに加え、本文中の Amazon 商品 URL（`/dp/{ASIN}`）も `resolvePostAmazonAffiliateItems` で重複なくマージする。画像は Creators API キャッシュと同じ。目次の下に表示（`min-width: 62rem`）。

**本文中の Amazon リンク**: `rehype-amazon-inline-affiliate-cards.mjs` が、リンクを含む段落の直後に `AmazonAffiliateCard` 相当の HTML を挿入（商品 `/dp/{ASIN}` に加え、Amazon 上の Audible ストア URL も対象）。段落が **Amazon アフィリエイト用リンクだけ**（他のテキストなし）のときは段落ごとカードに置き換え、リンク文字列は表示しない。記事末の `amazonAffiliate` ブロックの前にも同見出し（`AmazonAffiliateSectionHeading.astro`）。

### Amazon アソシエイト URL の自動変換

記事では **amzn.to 等の短縮リンクは使わず**、ブラウザのアドレスバーにある **通常の商品 URL**（`https://www.amazon.co.jp/dp/B0…` など）を書く。ビルド時にアソシエイト URL へ変換される。

| 対象 | 処理 |
|------|------|
| フロントマター `amazonAffiliate[].href` | `[...slug].astro` で `toAmazonAffiliateUrl()` |
| 本文 Markdown の Amazon リンク | `rehype-amazon-affiliate-links.mjs` |

**実装**: `amazon-affiliate-url.mjs` / `src/config/amazon-affiliate.ts`

**環境変数**（`.env`、テンプレは `.env.example`）:

| 変数 | 説明 |
|------|------|
| `AMAZON_ASSOCIATE_TAG` | アソシエイト ID。未設定時は **`run-atohs-22`**（`amazon-affiliate-url.mjs` の既定値） |
| `AMAZON_CREATORS_CREDENTIAL_ID` | Creators API 認証情報 ID |
| `AMAZON_CREATORS_CREDENTIAL_SECRET` | Creators API シークレット |
| `AMAZON_CREATORS_VERSION` | 例: `3.3` |
| `AMAZON_MARKETPLACE` | 例: `www.amazon.co.jp` |

変換例: `https://www.amazon.co.jp/dp/B0XXXXXX/...` → `https://amazon.co.jp/dp/B0XXXXXX?tag=run-atohs-22`（`/dp/{ASIN}` と `tag` のみ）

**商品画像（Creators API）**: ビルド時に `amazon-creators-products.mjs` が `getItems` で `images.primary.medium` を取得し、`public/gears/amazon/{ASIN}.jpg` に保存。キャッシュは `.cache/amazon-product-images.json`（git 管理外）。`amazonAffiliate` の `href` から ASIN を抽出（または `asin` を明示）。手動の `imageSrc` があれば API より優先。

**本番（GitHub Actions）**: `public/gears/amazon/{ASIN}.jpg` をリポジトリにコミットしておけば、`.cache` が無くてもビルド時にそのパスを参照する（CI で API 未設定でも表示可能）。新規 ASIN を API で取る場合は、リポジトリの **Settings → Secrets and variables → Actions** に `AMAZON_CREATORS_CREDENTIAL_ID` / `AMAZON_CREATORS_CREDENTIAL_SECRET`（任意で `AMAZON_CREATORS_VERSION`・`AMAZON_MARKETPLACE`）を登録し、`.github/workflows/deploy.yml` の Build ステップで渡す。取得後は `public/gears/amazon/` をコミットしておくと API なしのビルドでも安定する。

---

## ページとコンポーネントの対応

| ルート | ファイル | 主な構成 |
|--------|----------|----------|
| `/` | `pages/index.astro` | `BaseLayout` + Tips / Gears / Activities ブロック + `HomeProfile` + `ActivitiesCalendar` |
| `/category/{category}/` | `pages/category/[category].astro` | カテゴリ別一覧 |
| `/{slug}/` | `pages/[...slug].astro` | 記事詳細（例: `/gears/.../`・`/tips/.../`）・練習ログ・目次・`AmazonAffiliateCard` |
| `/activities/menu/{menu}/` | `pages/activities/menu/[menu].astro` | 活動種別で Activities 絞り込み |
| `/tags/` | `pages/tags/index.astro` | タグ一覧 |
| `/tags/{tag}/` | `pages/tags/[tag].astro` | タグ別記事 |
| `/search/` | `pages/search/index.astro` | クライアント検索 |
| `/about/` | `pages/about.astro` | 静的 about |
| `/tools/` | `pages/tools/index.astro` | Tools 一覧（`src/data/tools.ts` の `SITE_TOOLS`） |
| `/tools/marathon-pace/` | `pages/tools/marathon-pace.astro` | 1km ペース別の想定タイム表（5秒刻み・2:50/km〜8:00/km、`marathon-pace-chart.ts` で生成） |
| `/tools/marathon-goal/` | `pages/tools/marathon-goal.astro` | フル目標タイム入力 → 1kmペース / 5km / 10km / 20km 換算（`src/utils/marathon-pace-calculator.ts`、クライアント計算） |
| `/404` | `pages/404.astro` | 404 |

記事 URL 例: `/gears/new-balance-fresh-foam-1080-v14/`（Tips / Gears のファイル名は日付なし・slug も日付なし。旧 `/{category}/YYYY-MM-DD-{category}-.../` と旧 `/blog/...` は `blog-slug.mjs` 経由で `astro.config.mjs` の `redirects` に登録）。

---

## 記事詳細（`[...slug].astro`）の処理フロー

1. `getCollection('blog')` → 全記事を静的パス生成
2. `post.render()` → Markdown 本文
3. **練習ログ**（Activities 中心）
   - 本文先頭の ` ```practice-log ` フェンスを `remark-practice-log` が除去
   - HTML は `practice-log-parse.mjs` → `article__practice-log` として本文上に表示
   - 活動名（ジョギング等）は `/activities/menu/{slug}/` へリンク
4. **目次**: `extractTocFromMarkdown` → デスクトップで右サイドバー
5. **Gears**: `amazonAffiliate` フロントマター → `AmazonAffiliateCard`
6. **Activities**: `SHOW_ACTIVITIES_CALENDAR` 時、末尾に `ActivitiesCalendar`

本文は `.article__body.prose .article__main` 内。段落は `text-align: justify`（見出し・`pre`・`table` は除外）。

**Markdown の表（GFM）**: `| 列 | 列 |` 形式で書くと `<table>` になる。見た目は `[...slug].astro` の `.article__body.prose .article__main table` で枠線・ヘッダ背景を付与。表の直前後は空行を入れる。

---

## コンテンツスキーマ（`src/content/config.ts`）

`blog` コレクション:

| フィールド | 説明 |
|------------|------|
| `title?` | Activities は省略可 |
| `description` | 必須 |
| `pubDate` | 必須 |
| `category` | `Activities` \| `Tips` \| `Gears` \| `News` |
| `tags` | デフォルト `[]`。Activities で本文・`description` に「江津湖」があれば `resolveBlogTags`（`src/utils/blog-tags.ts`）が `江津湖` を付与（frontmatter に無くても一覧・タグページ・OGP で反映） |
| `gearsName?` | Gears 一覧表示名 |
| `coverImage?` | `public/` 相対パス |
| `amazonAffiliate?` | `{ href, label, productName? }`（`href` は通常の Amazon 商品 URL） |

記事配置: **`category` と同じサブフォルダ**（`assertBlogEntryFolder` で検証）。

### Activities 記事の練習ログフェンス

```markdown
```practice-log
ジョギング・12.13km・5:27/km
```
```

または `練習:` / 改行区切り / キー行 `title:` など（`practice-log-parse.mjs` 参照）。

### 記事内写真（最適化）

`public/` ではなく **`src/assets/`** に置き、**`.mdx`** 記事から `ArticleFigure` を使う。`astro:assets` の `Image` が **WebP 変換・複数幅の srcset** をビルド時に生成する（`.md` のみでは JSX は解釈されない）。

```mdx
import ArticleFigure from '@/components/ArticleFigure.astro';
import photo from '@/assets/images/activities/example.jpg';

<ArticleFigure src={photo} alt="説明" caption="キャプション（任意）" />
```

| 項目 | 内容 |
|------|------|
| コンポーネント | `src/components/ArticleFigure.astro` |
| 依存 | `sharp`（`astro.config.mjs` の image service） |
| スタイル | 記事詳細 `[...slug].astro` の `.article-figure` |
| 縦長画像 | `ImageMetadata` で高さ＞幅なら `.article-figure--portrait`（最大 20rem・中央寄せ・狭めの `srcset`） |

**Tips など `.md` で本文画像を載せる場合**（`public/images/{category}/` + HTML の `<figure class="article-figure">`）も、スタイルは上記 `.article-figure` を共用。縦長スクショは `article-figure--portrait` を手付け。

### note から記事をインポートする場合

`note-export/`（gitignore）の XML や note 本文をブログ用に写すときの慣習。

| ルール | 内容 |
|--------|------|
| **サムネイルは入れない** | note の**冒頭サムネイル（アイキャッチ）**は本文に含めない。エクスポート HTML では先頭の `<figure>`（`rectangle_large_type` 等）や本文テキストより前の1枚目の画像が該当しやすい。 |
| **再編集の注記** | 先頭に `（※この記事は、YYYY年M月D日にnoteで公開したものを再編集したものです。）` を付ける（既存 Tips と同様）。 |
| **`pubDate`** | note で公開した日付を入れる（一覧・ホームの並びは `pubDate` 降順）。ファイル名の日付プレフィックスはブログへ取り込んだ日でもよい。 |
| **末尾の note 誘導** | シリーズ紹介・他記事への note 内部リンクブロックは削るか、ブログ向けに書き換える。 |
| **画像の置き場** | Tips は `public/images/tips/`。縦長は `<figure class="article-figure article-figure--portrait">`。 |
| **体裁** | 誤記・note 固有の表記は直す。外部リンクに手書き `target` は付けない。 |

### Gears 記事の構成

`src/content/blog/gears/` の商品メモ。更新・新規作成時は **1080 v14 / Propel v5 / Cloud 6 WP** など既存記事と同じトーン・構成に揃える。

| 項目 | 内容 |
|------|------|
| **frontmatter** | `title`, `gearName`, `description`, `pubDate`, `category: Gears`, `gearAsin`, `tags`。末尾カード用に **`amazonAffiliate`**（`href`・`asin`・`label`・`productName`）を付ける。 |
| **本文の語り** | 一人称は **「僕」**。「このブログ主」は使わない。 |
| **見出しの例** | 用途に応じて組み立てる。よく使うもの: `## 購入・走行距離` または `## 購入・いまの使い方`、`## 選んだ理由`、`## 履き心地`、`## 使い方`、`## 他の靴との住み分け`、`## こんな人におすすめ`、`## サイズ感`、`## まとめ`。 |
| **相互リンク** | 関連 Gears は `/gears/{slug}/` でリンク（`/blog/` プレフィックスなし）。Propel ↔ 1080 ↔ Cloud 6 WP など住み分けがわかるようにする。 |
| **Amazon カード** | `amazonAffiliate` を書くと記事詳細の **本文末尾**（`[...slug].astro`）に `AmazonAffiliateCard` が自動表示。手書きのカード HTML は不要。 |
| **更新の進め方** | 本文を書く前にユーザーへ用途・購入経緯・他靴との関係などを質問してから反映する（エージェント向け）。 |
| **表** | 持ち物の対応などは Markdown 表でよい（上記 GFM）。 |

参考: `2026-05-15-gears-new-balance-fresh-foam-1080-v14.md`、`2026-05-15-gears-new-balance-fuelcell-propel-v5.md`、`2026-05-15-gears-on-cloud-6-wp.md`。

### 同じ日（`pubDate`）に Activities を複数書く場合

**1日に2回以上走るなど、同日の記事が複数あることは想定内。** エージェント・人手とも、次を守る。

| ルール | 内容 |
|--------|------|
| **上書き禁止** | その日の Activities 用 `.md` が **1つでも既にある** とき、新しい走りを **同じファイルに書き換えない**。必ず **別ファイルを新規作成** する。 |
| **事前確認** | 作成前に `src/content/blog/activities/` を確認し、`pubDate` が同じファイル（例: `2026-05-17-*.md`）がないか見る。 |
| **ファイル名** | **1本目（その日で最古）:** `YYYY-MM-DD-diary-activities.md`（**数字 suffix なし**）。**2本目以降:** `-2`、`-3`…（例: `2026-05-17-diary-activities-2.md`）。`-1` は使わない。 |
| **`pubDate`** | 複数本とも同じ日付でよい。一覧は新しい順（`-2` が無印より上）。カレンダー同日セルは古い順（`utils/blog-post-sort.ts`）。 |
| **距離・ペースが違う＝別記事** | ユーザーが別の数値を渡したら、既存記事の「訂正」か「同日の追加」かを推測せず、**既存ファイルがあるなら追加**を優先する。 |

**悪い例:** `2026-05-17-diary-activities.md`（12.13km）があるのに、11.26km の依頼で同ファイルを上書きする。

**よい例:** 2本目を `2026-05-17-diary-activities-2.md` として新規作成し、1本目はそのまま残す。

---

## ユーティリティ・定数（コンポーネント外だが密接）

| パス | 役割 |
|------|------|
| `utils/post-title.ts` | 一覧・詳細タイトル、`getGearsDisplayName` |
| `utils/blog-category-path.ts` | カテゴリ URL slug |
| `utils/blog-post-path.ts` | 記事 URL・フォルダ検証 |
| `utils/blog-post-sort.ts` | 記事一覧の公開日順・同日 Activities の並び |
| `utils/diary-calendar.ts` | カレンダーグリッド |
| `utils/activity-menu.ts` | 活動種別での記事フィルタ |
| `utils/markdown-toc.ts` | 目次抽出 |
| `constants/activity-icons.ts` | 運動種別アイコン PNG パス |
| `constants/activity-menus.ts` | ジョギング / トレラン / トレッキング slug |
| `config/features.ts` | `SHOW_PRACTICE_DIARY`, `SHOW_ACTIVITIES_CALENDAR` |

---

## Markdown・リンクの慣習

- **外部リンク**（`http://` / `https://`）: `rehype-external-links-blank` で `target="_blank"` + `rel="noopener noreferrer"`（Amazon アフィリエイトは `sponsored` を追加）
- **サイト内リンク**（`/` で始まり `//` ではないパス）: `rehype-site-internal-links-blank` で `target="_blank"`（**Gears 記事 `/gears/` へのリンクは同一タブ**）。記事本文のサイト内リンクは太字にしない（`global.css`）
- **Apple Watch**: 記事本文で初出の「Apple Watch」を `rehype-apple-watch-gear-link` が `/gears/apple-watch-ultra-2/` へリンク（見出し・既存リンク内・対象 Gears 記事自身は除外）

### OGP 画像（`src/utils/og-image/`）

ビルド時に 1200×630 PNG を生成する。**記事 OGP は `og-cache/blog/` にキャッシュ**し、タイトルが前回と同じなら satori をスキップする（Gears は `gearName` と記事 `title` の組み合わせで判定）。キャッシュは **リポジトリにコミット**して CI の再生成を抑える。レイアウトやヘッダー帯を変えたときは該当 slug の PNG と `og-cache/blog/.og-title-cache.json` のエントリを削除するか、タイトルを一時変更して再ビルドする。

- **青帯（ブログ名）**: `src/assets/og/site-header-strip.png`（コミット済み）を `sharp` で記事 OGP 上部に合成。見た目を変えたときは `npm run capture:og-header`（Puppeteer・**devDependencies のみ**。`build` では実行しない）で `/og/header-strip/` から再生成する。
- **本文（カテゴリ・タグ・記事タイトル等）**: `satori` + `sharp`。フォントは `fonts.ts` で埋め込み（YakuHan は woff2 を `wawoff2` で TTF に展開）。

| ルート | 用途 |
|--------|------|
| `/og/home.png` | トップ（`index.astro`）。青背景にヘッダーブランドを `home-brand-template.ts`（satori）で中央描画。記事 OGP の青帯は `site-header-strip.png` を上部合成 |
| `/og/blog/{slug}.png` | 記事詳細 |

記事 OGP のレイアウト:

| カテゴリ | レイアウト |
|----------|------------|
| Tips / Activities / News | ブログ名・カテゴリ pill・タグ（最大4）・記事タイトル |
| Gears | 左に商品画像（`coverImage` または `public/gears/amazon/{ASIN}.jpg`）・右にブログ名・Gears pill・商品名 |

記事タイトルは `wrap-title.ts` で **最大3行**（Zen Kaku 900 の実測幅。本文エリアの最大幅 `OG_ARTICLE_TITLE_MAX_WIDTH` 等で折り返し。3行以内に収まる場合は省略なし。4行目以降が必要なときだけ最終行を `…` で切り詰め。52px への縮小は3行に収まるフォントサイズの選択用）。青帯のブログ名は `header-strip.astro` で `white-space: nowrap` とコンテナ幅ベースの `font-size`。

プレビュー: ローカル `http://localhost:4321/og/blog/{slug}.png`、記事 URL を [opengraph.xyz](https://www.opengraph.xyz/) や [Meta Sharing Debugger](https://developers.facebook.com/tools/debug/) に渡す。
- **Amazon 商品リンク**: 通常 URL を書くと `rehype-amazon-affiliate-links` が `AMAZON_ASSOCIATE_TAG` 付き URL に変換（`rel="sponsored"`）
- **Gears 相互リンク**: Markdown で `[商品名](/gears/.../)`
- **練習ログの活動名**: 自動で `/activities/menu/{jogging|trail-run|trekking}/`

---

## スタイルの慣習

- CSS 変数は `global.css` の `:root`（`--color-accent`, `--site-max-width`, `--site-activities-max-width` 等）
- コンポーネント固有スタイルは各 `.astro` の `<style>`（デフォルトスコープ）
- 記事本文の `:global(...)` は `[...slug].astro` 内に集約
- トップ Gears カード: `index.astro` 内の `.gears-card`（コンポーネント化されていない）

---

## 新規追加時の指針

| やりたいこと | 置き場所 |
|--------------|----------|
| 再利用 UI | `src/components/X.astro` → ページから import |
| 全ページ共通 | `BaseLayout` または `Header` / `Footer` |
| 記事だけの UI | `[...slug].astro` または remark/rehype プラグイン |
| 記事データ | `src/content/blog/{category}/` + `config.ts` スキーマ拡張 |
| 同日の Activities を追加 | **既存 `.md` を上書きしない** → 別 slug で新規ファイル（上記「同じ日に複数記事」） |
| 一覧・URL ルール | `utils/` + `pages/` の新ルート |

**Amazon カードを足す**: フロントマターに `amazonAffiliate` を追加。`href` は `https://www.amazon.co.jp/dp/…` の通常リンク（`.env` の `AMAZON_ASSOCIATE_TAG` 必須）。

**活動種別一覧を足す**: `src/constants/activity-menus.ts` と `practiceLogMenuActivityModifier`（`practice-log-parse.mjs`）を同期。

---

## 機能フラグ（`src/config/features.ts`）

| 定数 | 現在値 | 効果 |
|------|--------|------|
| `SHOW_PRACTICE_DIARY` | `false` | `/blog/` 一覧・検索から Activities を隠す。タグ一覧・タグ別ページ・トップ Activities は表示 |
| `SHOW_ACTIVITIES_CALENDAR` | `true` | トップ・記事詳細のカレンダー |

---

## 関連ドキュメント

| ファイル | 内容 |
|----------|------|
| [design.md](./design.md) | カラー・タイポ・コンポーネント別 UI・デザイン原則 |
| `.cursor/rules/project-architecture.mdc` | エージェント向け「上記 MD を先に読む」ルール |

本ファイルまたは `design.md` を更新したら、実装とずれがないかあわせて直す。
