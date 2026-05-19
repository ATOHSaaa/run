# デザイン仕様（提出版）

**体重100kgからサブ3を目指すブログ** の現行 UI デザインをまとめたドキュメント。  
実装の正は `src/styles/global.css` および各 `.astro` の `<style>`。本ファイルと実装がずれたら、**実装を優先して本 MD を更新**する。

関連: [コンポーネント構成](./COMPONENT_ARCHITECTURE.md)

---

## 1. デザインコンセプト

| 項目 | 方針 |
|------|------|
| トーン | ライトのみ（`color-scheme: light`）。落ち着いた日記・ランニングブログ |
| 印象 | 白背景 + 深いブルーアクセント。黒に近いテキストと **2px の太い枠線** でメリハリ |
| モチーフ | ランナー・ショートソールのイラスト由来のブルー（`#1d4ed8`） |
| 言語 | 日本語中心。欧文は Inter、括弧類は YakuHanJPs、和文は Zen Kaku Gothic New（フォントスタックで自動切替） |
| レイアウト | 中央寄せの読みやすいカラム。Activities 本文はやや狭め |

---

## 2. カラーパレット

### 2.1 CSS 変数（`global.css` `:root`）

| トークン | 値 | 用途 |
|----------|-----|------|
| `--color-accent` | `#1d4ed8` | リンク、ヘッダー背景、強調線、カレンダーヘッダー、練習ログ区切り |
| `--color-accent-soft` | accent 12% + white | カテゴリ pill 背景、カードグラデーション、目次サイドバー |
| `--color-text` | `#141414` | 本文・見出し・太枠（Gears カード等） |
| `--color-muted` | `#5c5c5c` | 補助テキスト、日付、カレンダー曜日 |
| `--color-border` | `#e8e8e8` | 区切り線、表セル、フッター上線 |
| `--color-bg` | `#ffffff` | ページ背景 |

### 2.2 イラスト・アイコン用

| トークン | 値 | 用途 |
|----------|-----|------|
| `--illustration-outline` | `#141414` | 活動アイコン PNG の線色想定 |
| `--illustration-fill` | `#ffffff` | 塗り |
| `--illustration-accent` | `var(--color-accent)` | アクセント部分 |

**活動アイコン（PNG）のガイド**: 太めの黒線・白塗り・深い青アクセント。  
参照: `public/images/icons/activities/design-system-guide.png`

### 2.3 その他の定番色

| 用途 | 色 |
|------|-----|
| ヘッダー検索・カレンダーボタン文字 | `#000` |
| カレンダー月ラベル（青帯上） | `#fff` |
| Amazon バッジ背景 | `#ff9900`（コンポーネント内のみ） |
| 横マーキー（ticker） | ヘッダー直下・accent 系（`Header.astro` 参照） |

---

## 3. タイポグラフィ

### 3.1 フォント

```css
--font-sans: Inter, YakuHanJPs, "Zen Kaku Gothic New", "Hiragino Kaku Gothic ProN", ...;
```

- **読み込み**: Google Fonts（`BaseLayout`）+ **YakuHanJPs**（npm `yakuhanjp` の `yakuhanjp_s.css`）。括弧類（`「」『』（）【】` など）のみ半角幅。読点・句点は Zen Kaku のまま。
- **禁則・行末**: `html` に `line-break: strict`、`hanging-punctuation: allow-end`、`text-wrap: pretty`（`global.css`）
- **本文**: `html { font-size: 105%; line-height: var(--line-height-body); }`（`--line-height-body: 1.85`）
- **コード**: `ui-monospace`, `"IBM Plex Mono"`（`.prose pre/code`）

### 3.2 見出しスケール（グローバル）

| 要素 | サイズ | ウェイト |
|------|--------|----------|
| h1 | 45px | 700 |
| h2 | 32px | 700 |
| h3 | 24px | 700 |
| h4 | 20px | 600 |
| h5 | 17px | 600 |
| h6 | 15px | 600 |

記事本文（`.prose`）内 h2〜h3 は上下マージンを別途調整。記事詳細の h2 は `[...slug].astro` で `scroll-margin-top: 5.5rem`（固定ヘッダー回避）。

### 3.3 トップ・セクション見出し

Tips / Gears / Activities ブロック:

- 英字タイトル: `clamp(2.75rem, 6.5vw, 4rem)`、左揃え、`letter-spacing: 0.04em`
- 日本語タグライン: `0.8125rem`、`font-weight: 600`、`letter-spacing: 0.06em`

### 3.4 記事本文・静的ページ

- **記事（`.article__main`）**: `text-align: justify` + `text-justify: inter-character`
- **見出し・pre**: `text-align: start`（両端揃えの対象外）
- **記事内写真**: `ArticleFigure` + `src/assets/`（WebP・responsive、`astro:assets`）。`.article-figure` に左右 `clamp(2rem, 6vw, 3.25rem)`、下 `48px`（直前段落の `margin-bottom` と同量）、画像に **3px** 黒枠・`border-radius: 0.4rem`。縦長（高さ＞幅）は `.article-figure--portrait` で最大 **20rem**・中央寄せ（`ArticleFigure` が `ImageMetadata` から自動判定）
- **写真キャプション（`.article-figure__caption`）**: 画像下 `var(--space-md)`、中央揃え、`0.875rem`、`font-weight: 700`
- **静的ページ（about / profile / privacy / contact / 404 本文）**: `global.css` の `.static-prose` — 本文色 `--color-text`、段落は両端揃え

### 3.5 練習ログ（Activities 記事上部）

- 1行表示・中央揃え
- `font-weight: 900`、`clamp(1rem, 2.8vw, 1.15rem)`
- 直下に **3px** のアクセント横線（画面幅いっぱい）

---

## 4. スペーシング・レイアウト

| トークン | 値 |
|----------|-----|
| `--space-xs` | 0.35rem |
| `--space-sm` | 0.65rem |
| `--space-md` | 1.1rem |
| `--space-lg` | 1.75rem |
| `--space-xl` | 2.5rem |

| トークン | 値 | 用途 |
|----------|-----|------|
| `--site-max-width` | 68rem | メインカラム（トップ・記事・フッター内側） |
| `--site-activities-max-width` | 40rem | Activities / News 記事本文幅 |
| `--site-header-sticky-height` | 5.75rem（初期値） | 記事目次・ペース表 sticky の `top` 計算用。`Header.astro` の script が `.site-header` の実測高さ（px）で上書き（スマホ2行レイアウト対応） |

**ブレークポイント（主なもの）**

| px | 用途 |
|----|------|
| 36rem | Gears グリッド 3 列 |
| 40rem | Amazon カードのパディング |
| 48rem | Gears 4 列、メイン左右パディング調整 |
| 62rem | 記事目次サイドバー（2 カラム） |

---

## 5. コンポーネント別 UI

### 5.1 ヘッダー（`Header.astro`）

- **背景**: `--color-accent` 全面
- **下線**: 2px、`color-mix(black 12%, accent)`
- **sticky** `top: 0` / `z-index: 100`
- **ブランド**: ランナー PNG（56×56）+ サイトタイトルリンク（白系想定の上に載るスタイルはコンポーネント内定義）
- **ナビ**: Tips / Gears / Activities（アンカー）
- **検索**: 白フィールド + 「GO!」ボタン
- **横マーキー**（`hideSiteMarquees` で非表示可）: プロフィール・最新 News を横スクロール

### 5.2 フッター（`Footer.astro`）

- 上線 **3px** `--color-border`
- リンク右寄せ、`font-weight: 600`、ホバーで accent

### 5.3 区切り線（`WaveDivider.astro`）

- 画面幅いっぱい（`100vw`）の **水平線**
- `variant` / `flip` は互換用（見た目同一）
- 上下マージン: `--space-lg`

### 5.4 カテゴリ pill（記事・一覧）

共通ベース（`[...slug].astro` 等）:

- 角丸 `999px`
- 枠: accent 35% mix
- 背景: `--color-accent-soft`
- 文字: accent、`0.8rem` / `500`

修飾子 `pill--diary` | `pill--tips` | `pill--news`（見た目は同一ベース、拡張用）。

### 5.5 Gears カード（トップ `index.astro`）

- グリッド: 2 → 3 → 4 列（レスポンシブ）
- サムネ: **1:1**、`border-radius: 0.65rem`、**2px solid `--color-text`**
- ラベル: 中央、`0.8125rem` / `600`
- ホバー: 枠・ラベルが accent

プレースホルダー: `public/gears/placeholder-*.svg`（薄青 `#f0f4fc` + accent 12〜20%）

### 5.6 Amazon アフィリエイトカード（`AmazonAffiliateCard.astro`）

- 2 列グリッド（サムネ + 本文）
- **2px** 黒枠、角丸 `0.85rem`
- 背景: accent-soft → 白のグラデーション
- バッジ「Amazon.co.jp」: オレンジ `#ff9900`
- ホバー: accent 枠 + 軽いシャドウ + `translateY(-1px)`

### 5.7 Activities カレンダー（`ActivitiesCalendar.astro`）

- **月ナビ帯**: accent 背景、白文字、前月/次月は白ボタン
- **表**: 黒い曜日行下線（2px）、セル 1px ボーダー
- **凡例**: 登録運動アイコン横並び（ラベルなし、`aria-label` のみ）
- 記事がある日: タイトルリンク

### 5.8 記事目次（デスクトップ `min-width: 62rem`）

- 右サイドバー、左に accent 系の縦線 + ドット
- sticky、最大高さ `100dvh - header - spacing`
- 記事 + 目次時: フッター上線を **2px accent** で接続

### 5.9 プロフィール（`HomeProfile.astro`）

- トップ最下部ブロック（`#heading-profile`）
- 設定駆動（`src/config/profile.ts`）
- 距離別タイム表・SNS 等（詳細はコンポーネント CSS 参照）

---

## 6. インタラクション・リンク

| 種類 | 挙動 |
|------|------|
| 通常リンク（本文） | accent 色、下線、ホバーで下線をやや太く（太字にはしない） |
| OGP 画像 | 1200×630 PNG。トップは `og/home.png`（青背景・マーク・タイトル）。記事は `og/blog/{slug}.png`（Tips/Activities はブログ名・カテゴリ・タグ・タイトル。Gears は商品写真入り） |
| 外部リンク（Markdown） | **新しいタブ**（`rehype-external-links-blank`） |
| サイト内（Markdown） | 基本 **新しいタブ**（`rehype-site-internal-links-blank`） |
| 例外: `/gears/` | **同一タブ** |
| 練習ログの活動名 | 同一タブで活動別一覧へ |
| Amazon カード | 新しいタブ、`rel="sponsored"` |
| フォーカス | `outline: 2px solid var(--color-accent)`（ボタン・pill 等） |

---

## 7. アイコン・アセット

| 種類 | 場所 | 備考 |
|------|------|------|
| サイトマーク | `public/images/runner-accent.png` | ヘッダー・練習ログ（ジョギング） |
| 活動 PNG | `public/images/icons/activities/` | 6 種 + デザインガイド |
| 練習ログ SVG | `public/images/practice-log-*.svg` | 距離・ペース・標高 |
| トレラン | `public/images/activity-trail-run.png` | |
| favicon | `public/images/favicon.png` | |

---

## 8. コンテンツ別の見え方

| カテゴリ | 一覧での pill | 本文幅 | 特有 UI |
|----------|---------------|--------|---------|
| Activities | `pill--diary` | 狭め（40rem） | 練習ログ、カレンダー、活動リンク |
| Tips | `pill--tips` | 標準（max-width 内 prose） | — |
| Gears | `pill--tips` 修飾子 | 標準 | 末尾 Amazon カード可 |
| News | `pill--news` | 狭め（Activities 同様） | — |

---

## 9. デザイン原則（実装時のチェックリスト）

1. **アクセントは `#1d4ed8` を軸に** — 別の青に寄せない（イラストと統一）
2. **強調枠は 2px `#141414` が基本** — Gears・Amazon カードと揃える
3. **角丸は 0.45rem〜0.85rem 程度** — 過度な大きな radius は使わない
4. **セクション見出しは英字大きく + 日本語タグライン小さく**（トップ）
5. **Activities 本文は justify** — 見出し・コードは除外
6. **新規イラスト**は activity-icons ガイド（太線・白・青）に合わせる
7. **ダークモードは未対応** — 追加する場合は `:root` から設計し直す

---

## 10. ファイル対応表

| デザイン領域 | 主な実装ファイル |
|--------------|------------------|
| トークン・本文ベース・静的 prose | `src/styles/global.css` |
| 静的ページ（about 等） | `src/pages/about.astro`, `profile/`, `privacy/`, `contact/`, `404.astro` |
| シェル・main 幅 | `src/layouts/BaseLayout.astro` |
| ヘッダー・マーキー | `src/components/Header.astro` |
| フッター | `src/components/Footer.astro` |
| トップ・Gears グリッド | `src/pages/index.astro` |
| 記事詳細・pill・練習ログ・目次 | `src/pages/[...slug].astro` |
| カレンダー | `src/components/ActivitiesCalendar.astro` |
| Amazon カード | `src/components/AmazonAffiliateCard.astro` |
| 区切り線 | `src/components/WaveDivider.astro` |
| プロフィール | `src/components/HomeProfile.astro` |

---

## 11. 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-05 | 初版（現行ライトテーマ・コンポーネント構成に合わせて整理） |
