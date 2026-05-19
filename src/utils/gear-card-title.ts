/** Gears カードタイトル: ブランド行と商品名行 */
export type GearCardTitleLines = {
  brand: string;
  product: string | null;
};

/** 複合ブランド（先頭1語分割のフォールバックより優先） */
const KNOWN_GEAR_BRAND_PREFIXES = [
  'New Balance',
  'Salomon',
  'Shokz',
  'Tigora',
  'On',
] as const;

function findGearBrandPrefix(name: string, tags: string[]): string | undefined {
  const candidates = [
    ...KNOWN_GEAR_BRAND_PREFIXES,
    ...tags.map((t) => t.trim()).filter(Boolean),
  ];
  const unique = [...new Set(candidates)].sort((a, b) => b.length - a.length);

  return unique.find((brand) => name === brand || name.startsWith(`${brand} `));
}

/**
 * カード表示用にブランド名の直後で改行する位置を返す。
 * Apple Watch 系は 1 行目を先頭語（Apple）、2 行目を商品名全文とする。
 */
export function splitGearCardTitle(
  displayName: string,
  tags: string[] = [],
): GearCardTitleLines {
  const name = displayName.trim();
  if (!name) return { brand: '無題', product: null };

  if (name.startsWith('Apple Watch')) {
    const space = name.indexOf(' ');
    const brand = space > 0 ? name.slice(0, space) : name;
    return { brand, product: name };
  }

  const brand = findGearBrandPrefix(name, tags);

  if (brand) {
    const product = name.slice(brand.length).trim();
    return product ? { brand, product } : { brand, product: null };
  }

  const space = name.indexOf(' ');
  if (space > 0) {
    const product = name.slice(space + 1).trim();
    return { brand: name.slice(0, space), product: product || null };
  }

  return { brand: name, product: null };
}
