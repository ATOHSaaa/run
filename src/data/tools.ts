/** `/tools/` 一覧と各ツールページで共有する定義 */
export type SiteTool = {
  slug: string;
  title: string;
  description: string;
};

export const SITE_TOOLS: SiteTool[] = [
  {
    slug: 'marathon-pace',
    title: 'マラソン ペース表',
    description:
      '1km あたりのペースから、5km・10km・20km・フルマラソンの想定タイムを一覧で確認できます。',
  },
  {
    slug: 'marathon-goal',
    title: 'フルマラソン目標から1kmペースを換算',
    description:
      'フルマラソンの目標タイムを入力すると、1kmペースと 5km・10km・20km の目安タイムを算出します。',
  },
];
