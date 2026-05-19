import type { CollectionEntry } from 'astro:content';
import { resolveBlogTags } from '@/utils/blog-tags';
import { getCategoryDisplayLabel } from '@/utils/category-label';
import { getGearDisplayName, getPostDisplayTitle, gearListShowsArticleTitle } from '@/utils/post-title';
import { OG_COLORS, SITE_TITLE } from './constants';
import { splitTitleLines, truncateText } from './truncate';
import { resolveGearOgImageDataUrl } from './gear-image';

const FONT = 'Noto Sans JP';

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
  border: `2px solid ${OG_COLORS.text}`,
  fontFamily: FONT,
  fontSize: 24,
  fontWeight: 700,
  letterSpacing: '0.04em',
  lineHeight: 1.2,
};

function categoryPill(label: string, background: string): OgNode {
  return ogEl(
    'div',
    {
      ...pillBase,
      backgroundColor: background,
      color: OG_COLORS.text,
    },
    label,
  );
}

function tagPill(label: string): OgNode {
  return ogEl(
    'div',
    {
      ...pillBase,
      border: '1px solid #a8bdec',
      backgroundColor: OG_COLORS.accentSoft,
      color: OG_COLORS.accent,
      fontWeight: 600,
      fontSize: 22,
    },
    `#${label}`,
  );
}

function siteTitleLine(): OgNode {
  return ogEl(
    'div',
    {
      fontFamily: FONT,
      fontSize: 26,
      fontWeight: 600,
      color: OG_COLORS.muted,
      letterSpacing: '0.03em',
      lineHeight: 1.3,
      marginBottom: 20,
    },
    SITE_TITLE,
  );
}

function titleBlock(lines: string[]): OgNode {
  const fontSize = lines[0].length > 36 || (lines[1] && lines[1].length > 36) ? 46 : 54;
  return ogEl(
    'div',
    {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      marginTop: 'auto',
    },
    lines.map((line) =>
      ogEl(
        'div',
        {
          fontFamily: FONT,
          fontSize,
          fontWeight: 700,
          color: OG_COLORS.text,
          lineHeight: 1.25,
          letterSpacing: '0.02em',
        },
        line,
      ),
    ),
  );
}

function categoryPillBackground(category: CollectionEntry<'blog'>['data']['category']): string {
  if (category === 'News') return '#f3f4f6';
  return OG_COLORS.accentSoft;
}

function buildStandardTemplate(entry: CollectionEntry<'blog'>): OgNode {
  const { category } = entry.data;
  const tags = resolveBlogTags(entry);
  const articleTitle = getPostDisplayTitle(entry.data);
  const titleLines = splitTitleLines(articleTitle, 28);
  const displayTags = tags.slice(0, 4).map((t) => truncateText(t, 14));

  return ogEl(
    'div',
    {
      display: 'flex',
      width: '100%',
      height: '100%',
      backgroundColor: OG_COLORS.bg,
    },
    [
      ogEl('div', {
        width: 14,
        height: '100%',
        backgroundColor: OG_COLORS.accent,
        flexShrink: 0,
      }),
      ogEl(
        'div',
        {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '52px 64px 56px',
          minWidth: 0,
        },
        [
          siteTitleLine(),
          ogEl(
            'div',
            {
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              alignItems: 'center',
            },
            [
              categoryPill(getCategoryDisplayLabel(category), categoryPillBackground(category)),
              ...displayTags.map(tagPill),
            ],
          ),
          titleBlock(titleLines),
        ],
      ),
    ],
  );
}

async function buildGearsTemplate(entry: CollectionEntry<'blog'>): Promise<OgNode> {
  const gearName = getGearDisplayName(entry.data);
  const articleTitle = getPostDisplayTitle(entry.data);
  const showArticleTitle = gearListShowsArticleTitle(entry.data);
  const productImage = await resolveGearOgImageDataUrl(entry);
  const gearLines = splitTitleLines(gearName, 22);

  const rightChildren: OgNode[] = [
    siteTitleLine(),
    categoryPill('Gears', OG_COLORS.accentSoft),
    titleBlock(gearLines),
  ];

  if (showArticleTitle) {
    rightChildren.push(
      ogEl(
        'div',
        {
          fontFamily: FONT,
          fontSize: 28,
          fontWeight: 600,
          color: OG_COLORS.muted,
          lineHeight: 1.35,
          marginTop: 8,
        },
        truncateText(articleTitle, 48),
      ),
    );
  }

  const leftColumn: OgNode = productImage
    ? ogEl(
        'div',
        {
          display: 'flex',
          flexShrink: 0,
          width: 340,
          height: 340,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: OG_COLORS.bg,
          border: `3px solid ${OG_COLORS.text}`,
          borderRadius: 20,
          overflow: 'hidden',
          marginRight: 48,
        },
        ogEl('img', { objectFit: 'cover' }, undefined, {
          src: productImage,
          width: 340,
          height: 340,
        }),
      )
    : ogEl(
        'div',
        {
          flexShrink: 0,
          width: 340,
          height: 340,
          marginRight: 48,
          backgroundColor: OG_COLORS.accentSoft,
          border: `3px solid ${OG_COLORS.text}`,
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

  return ogEl(
    'div',
    {
      display: 'flex',
      width: '100%',
      height: '100%',
      backgroundColor: OG_COLORS.bg,
    },
    [
      ogEl('div', {
        width: 14,
        height: '100%',
        backgroundColor: OG_COLORS.accent,
        flexShrink: 0,
      }),
      ogEl(
        'div',
        {
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          padding: '48px 64px',
          minWidth: 0,
        },
        [
          leftColumn,
          ogEl(
            'div',
            {
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              height: '100%',
              justifyContent: 'center',
            },
            rightChildren,
          ),
        ],
      ),
    ],
  );
}

export async function buildOgTemplate(entry: CollectionEntry<'blog'>): Promise<OgNode> {
  if (entry.data.category === 'Gears') return buildGearsTemplate(entry);
  return buildStandardTemplate(entry);
}
