import type { CollectionEntry } from 'astro:content';
import { resolveBlogTags } from '@/utils/blog-tags';
import { getCategoryDisplayLabel } from '@/utils/category-label';
import { getGearDisplayName, getPostDisplayTitle, gearListShowsArticleTitle } from '@/utils/post-title';
import {
  OG_ARTICLE_TITLE_MAX_WIDTH,
  OG_COLORS,
  OG_GEARS_TITLE_MAX_WIDTH,
} from './constants';
import { OG_FONT_FAMILY } from './fonts';
import { truncateText } from './truncate';
import { layoutOgTitle } from './wrap-title';
import { resolveGearOgImageDataUrl } from './gear-image';

const FONT = OG_FONT_FAMILY;

type OgChildren = string | OgNode | Array<string | OgNode>;

type OgNode = {
  type: string;
  props: Record<string, unknown>;
};

function ogEl(
  type: string,
  style: Record<string, unknown>,
  children?: OgChildren,
  extraProps?: Record<string, unknown>,
): OgNode {
  const props: Record<string, unknown> = { style, ...extraProps };
  if (children !== undefined) props.children = children;
  return { type, props };
}

const pillBase = {
  display: 'flex',
  alignItems: 'center',
  padding: '8px 20px',
  borderRadius: 999,
  fontFamily: FONT,
  fontSize: 24,
  fontWeight: 700,
  letterSpacing: '0.04em',
  lineHeight: 1.2,
};

function categoryPill(label: string): OgNode {
  return ogEl(
    'div',
    {
      ...pillBase,
      backgroundColor: OG_COLORS.pillBg,
      color: OG_COLORS.pillText,
      border: `2px solid ${OG_COLORS.pillBorder}`,
    },
    label,
  );
}

function tagPill(label: string): OgNode {
  return ogEl(
    'div',
    {
      display: 'flex',
      alignItems: 'center',
      fontFamily: FONT,
      fontSize: 22,
      fontWeight: 700,
      letterSpacing: '0.04em',
      lineHeight: 1.2,
      color: OG_COLORS.pillTagText,
    },
    `#${label}`,
  );
}

function titleBlock(lines: string[], fontSize: number, centered = true): OgNode {
  return ogEl(
    'div',
    {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      alignItems: centered ? 'center' : 'flex-start',
      width: '100%',
    },
    lines.map((line) =>
      ogEl(
        'div',
        {
          fontFamily: FONT,
          fontSize,
          fontWeight: 900,
          color: OG_COLORS.bodyText,
          lineHeight: 1.25,
          letterSpacing: '0.02em',
          textAlign: centered ? 'center' : 'left',
          whiteSpace: 'nowrap',
        },
        line,
      ),
    ),
  );
}

/** 白背景の本文エリア（青帯はヘッダー PNG を sharp で合成） */
function ogCardBody(body: OgNode): OgNode {
  return ogEl(
    'div',
    {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      width: '100%',
      height: '100%',
      minHeight: 0,
      boxSizing: 'border-box',
      padding: '64px 64px 40px',
      backgroundColor: OG_COLORS.bodyBg,
      overflow: 'hidden',
    },
    body,
  );
}

function centeredArticleBlock(
  pills: OgNode[],
  titleLines: string[],
  titleFontSize: number,
): OgNode {
  return ogEl(
    'div',
    {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      minHeight: 0,
      width: '100%',
      gap: 36,
      paddingTop: 32,
    },
    [
      ogEl(
        'div',
        {
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '100%',
        },
        pills,
      ),
      titleBlock(titleLines, titleFontSize, true),
    ],
  );
}

async function buildStandardTemplate(entry: CollectionEntry<'blog'>): Promise<OgNode> {
  const { category } = entry.data;
  const tags = resolveBlogTags(entry);
  const articleTitle = getPostDisplayTitle(entry.data);
  const { lines: titleLines, fontSize: titleFontSize } = await layoutOgTitle(
    articleTitle,
    OG_ARTICLE_TITLE_MAX_WIDTH,
  );
  const displayTags = tags.slice(0, 4).map((t) => truncateText(t, 14));
  const pills = [
    categoryPill(getCategoryDisplayLabel(category)),
    ...displayTags.map(tagPill),
  ];

  return ogCardBody(centeredArticleBlock(pills, titleLines, titleFontSize));
}

async function buildGearsTemplate(entry: CollectionEntry<'blog'>): Promise<OgNode> {
  const gearName = getGearDisplayName(entry.data);
  const articleTitle = getPostDisplayTitle(entry.data);
  const showArticleTitle = gearListShowsArticleTitle(entry.data);
  const productImage = await resolveGearOgImageDataUrl(entry);
  const { lines: gearLines, fontSize: gearFontSize } = await layoutOgTitle(
    gearName,
    OG_GEARS_TITLE_MAX_WIDTH,
  );

  const leftColumn: OgNode = productImage
    ? ogEl(
        'div',
        {
          display: 'flex',
          flexShrink: 0,
          width: 300,
          height: 300,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: OG_COLORS.imageFrameBg,
          border: `3px solid ${OG_COLORS.imageFrameBorder}`,
          borderRadius: 20,
          overflow: 'hidden',
        },
        ogEl('img', { objectFit: 'cover' }, undefined, {
          src: productImage,
          width: 300,
          height: 300,
        }),
      )
    : ogEl(
        'div',
        {
          flexShrink: 0,
          width: 300,
          height: 300,
          backgroundColor: OG_COLORS.imagePlaceholderBg,
          border: `3px solid ${OG_COLORS.pillTagBorder}`,
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT,
          fontSize: 28,
          fontWeight: 700,
          color: OG_COLORS.accent,
        },
        'Gears',
      );

  const gearTitleBlock = titleBlock(gearLines, gearFontSize, true);

  const subtitle = showArticleTitle
    ? ogEl(
        'div',
        {
          fontFamily: FONT,
          fontSize: 26,
          fontWeight: 700,
          color: OG_COLORS.bodyMuted,
          lineHeight: 1.35,
          textAlign: 'center',
          marginTop: 4,
        },
        truncateText(articleTitle, 48),
      )
    : null;

  const gearsBody = ogEl(
    'div',
    {
      flex: 1,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 40,
      minHeight: 0,
      width: '100%',
    },
    [
      leftColumn,
      ogEl(
        'div',
        {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          minWidth: 0,
          gap: 20,
          paddingTop: 12,
        },
        [
          categoryPill('Gears'),
          gearTitleBlock,
          ...(subtitle ? [subtitle] : []),
        ],
      ),
    ],
  );

  return ogCardBody(gearsBody);
}

export async function buildOgTemplate(entry: CollectionEntry<'blog'>): Promise<OgNode> {
  if (entry.data.category === 'Gears') return buildGearsTemplate(entry);
  return buildStandardTemplate(entry);
}
