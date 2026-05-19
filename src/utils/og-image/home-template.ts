import { OG_COLORS, SITE_TITLE } from './constants';
import { readPublicImageDataUrl } from './public-image';

const FONT = 'Noto Sans JP';
const SITE_MARK_PATH = 'images/runner-accent.png';

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

export async function buildHomeOgTemplate(): Promise<OgNode> {
  const markSrc = await readPublicImageDataUrl(SITE_MARK_PATH);

  const markChildren: OgChildren = markSrc
    ? [
        ogEl('img', { objectFit: 'contain' }, undefined, {
          src: markSrc,
          width: 140,
          height: 140,
        }),
      ]
    : 'Run';

  return ogEl(
    'div',
    {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      backgroundColor: OG_COLORS.accent,
      padding: '48px 72px',
    },
    [
      ogEl(
        'div',
        {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 200,
          height: 200,
          borderRadius: 999,
          backgroundColor: '#ffffff',
          marginBottom: 44,
          flexShrink: 0,
        },
        markChildren,
      ),
      ogEl(
        'div',
        {
          fontFamily: FONT,
          fontSize: 44,
          fontWeight: 700,
          color: '#ffffff',
          lineHeight: 1.3,
          letterSpacing: '0.02em',
          textAlign: 'center',
          whiteSpace: 'nowrap',
        },
        SITE_TITLE,
      ),
    ],
  );
}
