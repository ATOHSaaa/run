import { OG_COLORS, SITE_TITLE } from './constants';
import { OG_FONT_FAMILY } from './fonts';
import { readPublicImageDataUrl } from './public-image';

const FONT = OG_FONT_FAMILY;
const SITE_MARK_PATH = 'images/runner-accent.png';

/** `/og/header-strip/` のキャプチャと揃えたサイズ（トップ OGP は satori で同寸をベクター描画） */
const MARK_RING_SIZE = 96;
const MARK_IMG_SIZE = 82;
const TITLE_FONT_SIZE = 56;
const BRAND_GAP = 24;

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

/** トップ OGP: 青背景にヘッダーブランド（アイコン＋ブログ名）を中央配置 */
export async function buildHomeOgBrandTemplate(): Promise<OgNode> {
  const markSrc = await readPublicImageDataUrl(SITE_MARK_PATH);

  const markChildren: OgChildren = markSrc
    ? [
        ogEl('img', { objectFit: 'contain' }, undefined, {
          src: markSrc,
          width: MARK_IMG_SIZE,
          height: MARK_IMG_SIZE,
        }),
      ]
    : 'Run';

  return ogEl(
    'motion.div',
    {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      backgroundColor: OG_COLORS.accent,
      padding: '48px 64px',
    },
    ogEl(
      'motion.div',
      {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: BRAND_GAP,
        maxWidth: '100%',
      },
      [
        ogEl(
          'motion.div',
          {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: MARK_RING_SIZE,
            height: MARK_RING_SIZE,
            borderRadius: 999,
            backgroundColor: '#ffffff',
            flexShrink: 0,
          },
          markChildren,
        ),
        ogEl(
          'motion.div',
          {
            fontFamily: FONT,
            fontSize: TITLE_FONT_SIZE,
            fontWeight: 700,
            color: OG_COLORS.headerText,
            lineHeight: 1.25,
            letterSpacing: '0.06em',
            textAlign: 'center',
            maxWidth: 1000,
          },
          SITE_TITLE,
        ),
      ],
    ),
  );
}
