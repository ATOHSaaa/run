/**
 * トップページ「プロフィール」欄の表示用データ。
 * 体重は1件。タイムは recordedOn（YYYY-MM-DD）で年月日を揃えて表示します。
 */

/** 表示用アイコンを切り替える識別子（必要に応じて追加） */
export type ProfileSnsPlatform = 'twitter' | 'website';

export type ProfileSnsLink = {
  platform: ProfileSnsPlatform;
  url: string;
};

export type ProfileWeightEntry = {
  /** 測定日（YYYY-MM-DD、UTC 日付として解釈） */
  asOf: string;
  kg: number;
};

export type ProfileDistanceTime = {
  /** 例: 5km、10km、ハーフマラソン、フルマラソン */
  distanceLabel: string;
  /** 表示用タイム（例: 25:30、1:45:00） */
  time: string;
  /** 記録日（YYYY-MM-DD、UTC 日付として解釈） */
  recordedOn: string;
  /** 大会名など（任意） */
  eventNote?: string;
};

export type SiteProfile = {
  displayName: string;
  sns: ProfileSnsLink[];
  /** 改行は \n で区切ると段落に分かれます */
  bio: string;
  /**
   * 誕生日（YYYY-MM-DD）。満何歳かは東京（Asia/Tokyo）の暦での「当日」により計算します。
   * 未設定のときこの欄を出さない。
   */
  birthDate?: string;
  /** 身長 cm。未設定のときこの欄を出さない。 */
  heightCm?: number;
  /** 体重は1件のみ（未設定のときは null） */
  weight: ProfileWeightEntry | null;
  distanceTimes: ProfileDistanceTime[];
};

function parseYmdUtc(ymd: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!m) return new Date(NaN);
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  return new Date(Date.UTC(y, mo - 1, d));
}

export function profileDateForDisplay(ymd: string): Date {
  return parseYmdUtc(ymd);
}

export const siteProfile: SiteProfile = {
  displayName: 'あとーす',
  sns: [
    { platform: 'twitter', url: 'https://x.com/atohsaaa' },
    { platform: 'website', url: 'https://atohs.me' },
  ],
  bio: '',
  birthDate: '1993-11-13',
  heightCm: 173,
  weight: { asOf: '2026-05-13', kg: 73.2 },
  distanceTimes: [
    {
      distanceLabel: '5km',
      time: '23:05',
      recordedOn: '2026-05-01',
      eventNote: 'Apple Watch',
    },
    {
      distanceLabel: '10km',
      time: '46:58',
      recordedOn: '2026-05-01',
      eventNote: 'Apple Watch',
    },
    {
      distanceLabel: 'フルマラソン',
      time: '4:44:15',
      recordedOn: '2026-02-15',
      eventNote: '熊本城マラソン2026 net',
    },
  ],
};
