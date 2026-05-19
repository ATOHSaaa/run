/** @param {unknown} raw */
export function hrefString(raw) {
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'string') return raw[0];
  return '';
}

/** @param {import('hast').Element | import('hast').Text | import('hast').Root} node */
export function getNodePlainText(node) {
  if (!node || typeof node !== 'object') return '';
  if (node.type === 'text' && 'value' in node) return String(node.value);
  if ('children' in node && Array.isArray(node.children)) {
    return node.children.map((child) => getNodePlainText(child)).join('');
  }
  return '';
}

/**
 * @param {{
 *   href: string;
 *   productName: string;
 *   label: string;
 *   imageSrc?: string;
 *   baseUrl: string;
 *   inline?: boolean;
 * }} options
 * @returns {import('hast').Element}
 */
export function createAmazonAffiliateCardElement({
  href,
  productName,
  label,
  imageSrc,
  baseUrl,
  inline = false,
}) {
  const root = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const thumbSrc = imageSrc
    ? `${root}${imageSrc.replace(/^\//, '')}`
    : `${root}gears/placeholder-1.svg`;

  const className = ['amazon-affiliate-card'];
  if (inline) className.push('amazon-affiliate-card--inline');

  return {
    type: 'element',
    tagName: 'a',
    properties: {
      className,
      href,
      target: '_blank',
      rel: ['noopener', 'noreferrer', 'sponsored'],
    },
    children: [
      {
        type: 'element',
        tagName: 'span',
        properties: { className: ['amazon-affiliate-card__media'], ariaHidden: 'true' },
        children: [
          {
            type: 'element',
            tagName: 'img',
            properties: {
              className: ['amazon-affiliate-card__thumb'],
              src: thumbSrc,
              alt: '',
              width: 160,
              height: 160,
              loading: 'lazy',
              decoding: 'async',
            },
            children: [],
          },
          {
            type: 'element',
            tagName: 'span',
            properties: { className: ['amazon-affiliate-card__badge'] },
            children: [{ type: 'text', value: 'Amazon.co.jp' }],
          },
        ],
      },
      {
        type: 'element',
        tagName: 'span',
        properties: { className: ['amazon-affiliate-card__body'] },
        children: [
          {
            type: 'element',
            tagName: 'span',
            properties: { className: ['amazon-affiliate-card__eyebrow'] },
            children: [{ type: 'text', value: '購入・在庫を確認' }],
          },
          {
            type: 'element',
            tagName: 'span',
            properties: { className: ['amazon-affiliate-card__title'] },
            children: [{ type: 'text', value: productName }],
          },
          {
            type: 'element',
            tagName: 'span',
            properties: { className: ['amazon-affiliate-card__cta'] },
            children: [
              {
                type: 'element',
                tagName: 'span',
                properties: { className: ['amazon-affiliate-card__cta-text'] },
                children: [{ type: 'text', value: label }],
              },
              {
                type: 'element',
                tagName: 'svg',
                properties: {
                  className: ['amazon-affiliate-card__arrow'],
                  xmlns: 'http://www.w3.org/2000/svg',
                  viewBox: '0 0 24 24',
                  fill: 'none',
                  ariaHidden: 'true',
                },
                children: [
                  {
                    type: 'element',
                    tagName: 'path',
                    properties: {
                      d: 'M5 12h14m0 0-5-5m5 5-5 5',
                      stroke: 'currentColor',
                      strokeWidth: '2.2',
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                    },
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}
