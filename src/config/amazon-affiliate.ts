import {
  AMAZON_ASSOCIATE_TAG_DEFAULT,
  buildAmazonDpProductUrl,
  extractAsinFromAmazonUrl,
  getAmazonAssociateTagFromEnv,
  isAmazonAffiliateCardUrl,
  isAmazonProductUrl,
  toAmazonAffiliateUrl,
} from '../../amazon-affiliate-url.mjs';

export function getAmazonAssociateTag(): string {
  return getAmazonAssociateTagFromEnv();
}

export {
  AMAZON_ASSOCIATE_TAG_DEFAULT,
  buildAmazonDpProductUrl,
  extractAsinFromAmazonUrl,
  isAmazonAffiliateCardUrl,
  isAmazonProductUrl,
  toAmazonAffiliateUrl,
};
