/** Gears オービット・カードと揃えるカテゴリ（`tags` の日本語タグ） */
const GEAR_TYPE_BY_TAG: Record<
  string,
  { label: 'Wear' | 'Gadget' | 'Shoes'; variant: 'wear' | 'gadget' | 'shoes' }
> = {
  ウェア: { label: 'Wear', variant: 'wear' },
  ガジェット: { label: 'Gadget', variant: 'gadget' },
  シューズ: { label: 'Shoes', variant: 'shoes' },
};

export type GearTypeDisplay = (typeof GEAR_TYPE_BY_TAG)[string];

/** `tags` から Wear / Gadget / Shoes を返す（該当タグが無ければ `undefined`） */
export function getGearTypeFromTags(tags: string[]): GearTypeDisplay | undefined {
  for (const tag of tags) {
    const found = GEAR_TYPE_BY_TAG[tag];
    if (found) return found;
  }
  return undefined;
}
