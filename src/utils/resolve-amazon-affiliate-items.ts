import { extractAsinFromAmazonUrl, toAmazonAffiliateUrl } from '@/config/amazon-affiliate';
import { getAmazonProductImageSrc } from '../../amazon-creators-products.mjs';

export type AmazonAffiliateFrontmatter = {
  href: string;
  label: string;
  productName?: string;
  asin?: string;
  imageSrc?: string;
};

export type ResolvedAmazonAffiliateItem = AmazonAffiliateFrontmatter & {
  href: string;
  imageSrc?: string;
};

function normalizeAffiliateList(
  affiliate: AmazonAffiliateFrontmatter | AmazonAffiliateFrontmatter[] | undefined,
): AmazonAffiliateFrontmatter[] {
  if (!affiliate) return [];
  return Array.isArray(affiliate) ? affiliate : [affiliate];
}

export async function resolveAmazonAffiliateItems(
  affiliate: AmazonAffiliateFrontmatter | AmazonAffiliateFrontmatter[] | undefined,
  associateTag: string,
): Promise<ResolvedAmazonAffiliateItem[]> {
  const items = normalizeAffiliateList(affiliate);

  return Promise.all(
    items.map(async (item) => {
      const href = toAmazonAffiliateUrl(item.href, associateTag);
      const asin = item.asin?.trim().toUpperCase() || extractAsinFromAmazonUrl(item.href);
      const imageSrc =
        item.imageSrc ?? (asin ? await getAmazonProductImageSrc(asin) : undefined);

      return {
        ...item,
        href,
        imageSrc,
      };
    }),
  );
}
