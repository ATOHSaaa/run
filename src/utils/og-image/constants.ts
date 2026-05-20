export const SITE_TITLE = '体重100kgからサブ3を目指すブログ';
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
/** 記事 OGP 本文エリアの左右 padding（`template.ts` の ogCardBody と一致） */
export const OG_BODY_PADDING_X = 64;
/** 記事タイトル行の最大幅（中央配置ブロック） */
export const OG_ARTICLE_TITLE_MAX_WIDTH = OG_WIDTH - OG_BODY_PADDING_X * 2;
/** Gears 右カラムのタイトル最大幅（商品画像 300 + gap 40） */
export const OG_GEARS_TITLE_MAX_WIDTH = OG_ARTICLE_TITLE_MAX_WIDTH - 300 - 40;

/** 記事 OGP（青ヘッダー + 白本文） */
export const OG_COLORS = {
  accent: '#1d4ed8',
  headerBg: '#1d4ed8',
  bodyBg: '#ffffff',
  headerText: '#ffffff',
  bodyText: '#141414',
  bodyMuted: '#5c5c5c',
  markCircleBg: '#ffffff',
  markFallbackText: '#141414',
  pillBg: '#ffffff',
  pillText: '#141414',
  pillBorder: '#141414',
  pillTagBg: '#e8eefb',
  pillTagBorder: '#a8bdec',
  pillTagText: '#1d4ed8',
  imageFrameBg: '#ffffff',
  imagePlaceholderBg: '#e8eefb',
  imageFrameBorder: '#141414',
} as const;
