#!/usr/bin/env node
/** Gears 記事タイトルで SearchItems → 先頭結果の ASIN を表示（確認用） */
import { ApiClient, DefaultApi, SearchItemsRequestContent } from 'amazon-creator-api-sdk';
import { loadEnv } from 'vite';
import { getAmazonAssociateTagFromEnv } from '../amazon-affiliate-url.mjs';

const env = loadEnv(process.env.MODE ?? 'development', process.cwd(), '');
const client = new ApiClient();
client.credentialId = env.AMAZON_CREATORS_CREDENTIAL_ID?.trim() ?? '';
client.credentialSecret = env.AMAZON_CREATORS_CREDENTIAL_SECRET?.trim() ?? '';
client.version = env.AMAZON_CREATORS_VERSION?.trim() || '3.3';

const api = new DefaultApi(client);
const marketplace = env.AMAZON_MARKETPLACE?.trim() || 'www.amazon.co.jp';
const partnerTag = getAmazonAssociateTagFromEnv(env.AMAZON_ASSOCIATE_TAG);

const QUERIES = [
  ['apple-watch-ultra-2', 'Apple Watch Ultra 2'],
  ['tigora-multi-pocket-pants', 'Tigora マルチポケットパンツ'],
  ['nb-fuelcell-propel-v5', 'New Balance FuelCell Propel v5'],
  ['salomon-speedcross-6', 'Salomon SPEEDCROSS 6'],
  ['on-cloud-6-wp', 'On Cloud 6 WP'],
  ['shokz-openrun-pro-2', 'Shokz OpenRun Pro 2'],
  ['nb-fresh-foam-1080-v14', 'New Balance Fresh Foam X 1080 v14'],
  ['apple-watch-ultra-2-new', 'Apple Watch Ultra 2 GPS セルラー'],
];

async function searchAsin(keywords) {
  const request = new SearchItemsRequestContent();
  request.partnerTag = partnerTag;
  request.keywords = keywords;
  request.itemCount = 3;
  request.resources = ['itemInfo.title', 'images.primary.medium'];

  const response = await api.searchItems(marketplace, { searchItemsRequestContent: request });
  const items = response?.searchResult?.items ?? [];
  return items.map((item) => ({
    asin: item?.asin,
    title: item?.itemInfo?.title?.displayValue,
    image: item?.images?.primary?.medium?.url,
  }));
}

for (const [slug, keywords] of QUERIES) {
  try {
    const hits = await searchAsin(keywords);
    console.log(`\n=== ${slug} :: "${keywords}" ===`);
    for (const h of hits) {
      console.log(`  ${h.asin}  ${h.title?.slice(0, 80) ?? ''}`);
    }
    if (hits.length === 0) console.log('  (no results)');
  } catch (e) {
    console.log(`\n=== ${slug} ERROR ===`, e.message);
  }
}
