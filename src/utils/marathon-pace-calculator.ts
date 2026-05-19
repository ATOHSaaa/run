import { MARATHON_PACE_DISTANCES } from '@/data/marathon-pace-chart';

export type MarathonGoalTimes = {
  pacePerKm: string;
  fiveKm: string;
  tenKm: string;
  twentyKm: string;
};

export type DurationParts = {
  hours: number;
  minutes: number;
  seconds: number;
};

/** 60秒・60分の繰り上げ／繰り下げ（例: 0秒 −1 → 59秒・分 −1、59分 +1 → 0分・時間 +1） */
export function normalizeDurationParts(
  hours: number,
  minutes: number,
  seconds: number,
): DurationParts {
  let h = Number.isFinite(hours) ? Math.trunc(hours) : 0;
  let m = Number.isFinite(minutes) ? Math.trunc(minutes) : 0;
  let s = Number.isFinite(seconds) ? Math.trunc(seconds) : 0;

  while (s < 0) {
    if (m <= 0 && h <= 0) {
      s = 0;
      break;
    }
    m -= 1;
    s += 60;
  }

  while (m < 0) {
    if (h <= 0) {
      m = 0;
      break;
    }
    h -= 1;
    m += 60;
  }

  if (s >= 60) {
    m += Math.floor(s / 60);
    s %= 60;
  }
  if (m >= 60) {
    h += Math.floor(m / 60);
    m %= 60;
  }

  h = Math.max(0, h);

  return { hours: h, minutes: m, seconds: s };
}

/** 時・分・秒から総秒数（不正なら null） */
export function parseDurationToSeconds(
  hours: number,
  minutes: number,
  seconds: number,
): number | null {
  const { hours: h, minutes: m, seconds: s } = normalizeDurationParts(hours, minutes, seconds);
  if (![h, m, s].every((n) => Number.isFinite(n) && n >= 0)) return null;
  if (m >= 60 || s >= 60) return null;
  const total = Math.round(h * 3600 + m * 60 + s);
  if (total <= 0) return null;
  return total;
}

/** フルマラソン総秒数から、一定ペース換算の各距離タイム */
export function goalsFromFullMarathonSeconds(fullSeconds: number): MarathonGoalTimes {
  const pacePerKmSeconds = fullSeconds / MARATHON_PACE_DISTANCES.fullKm;

  return {
    pacePerKm: formatPacePerKm(pacePerKmSeconds),
    fiveKm: formatRaceTime(pacePerKmSeconds * MARATHON_PACE_DISTANCES.fiveKm),
    tenKm: formatRaceTime(pacePerKmSeconds * MARATHON_PACE_DISTANCES.tenKm),
    twentyKm: formatRaceTime(pacePerKmSeconds * MARATHON_PACE_DISTANCES.twentyKm),
  };
}

/** 1km ペース（秒）→ 「4分30秒」 */
export function formatPacePerKm(seconds: number): string {
  const rounded = Math.round(seconds);
  const minutes = Math.floor(rounded / 60);
  const secs = rounded % 60;
  return `${minutes}分${String(secs).padStart(2, '0')}秒`;
}

/** ペース表のフルタイム区切り（2時間〜5時間・30分刻み）とサブラベル */
export const PACE_CHART_FULL_TIME_DIVIDERS = [
  { limitSeconds: 2 * 3600, label: 'サブ2' },
  { limitSeconds: 2 * 3600 + 30 * 60, label: 'サブ2.5' },
  { limitSeconds: 3 * 3600, label: 'サブ3' },
  { limitSeconds: 3 * 3600 + 30 * 60, label: 'サブ3.5' },
  { limitSeconds: 4 * 3600, label: 'サブ4' },
  { limitSeconds: 4 * 3600 + 30 * 60, label: 'サブ4.5' },
  { limitSeconds: 5 * 3600, label: 'サブ5' },
] as const;

export type PaceChartSubLabel = (typeof PACE_CHART_FULL_TIME_DIVIDERS)[number]['label'];

/** ペース表のサブ目標ジャンプ用 id（例: サブ2.5 → pace-sub2-5） */
export function getPaceChartSubAnchorId(label: PaceChartSubLabel): string {
  return `pace-${label.replace('サブ', 'sub').replace('.', '-')}`;
}

/** 「2時間27分41秒」「35分00秒」などを秒に変換 */
export function parseRaceTimeToSeconds(text: string): number | null {
  if (!text.includes('分')) return null;

  const hours = text.includes('時間') ? Number(text.match(/(\d+)時間/)?.[1] ?? 0) : 0;
  const minutes = Number(text.match(/(\d+)分/)?.[1] ?? NaN);
  const seconds = Number(text.match(/(\d+)秒/)?.[1] ?? 0);

  if (!Number.isFinite(minutes) || minutes < 0 || !Number.isFinite(seconds) || seconds < 0) {
    return null;
  }

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * フルタイムが 2h / 2h30 / … / 5h をまたぐ行の直下に区切り線を引く。
 * 現行行が制限以内で、次行が制限超え（または次行なし）のときラベルを返す。
 */
export function getPaceChartFullTimeDividerLabelAfter(
  currentFullMarathon: string,
  nextFullMarathon?: string,
): PaceChartSubLabel | null {
  const current = parseRaceTimeToSeconds(currentFullMarathon);
  const next = nextFullMarathon ? parseRaceTimeToSeconds(nextFullMarathon) : null;
  if (current == null) return null;

  for (const { limitSeconds, label } of PACE_CHART_FULL_TIME_DIVIDERS) {
    if (current <= limitSeconds && (next == null || next > limitSeconds)) {
      return label;
    }
  }

  return null;
}

/** レース距離タイム（秒）→ 「2時間27分41秒」 / 「35分00秒」 */
export function formatRaceTime(seconds: number): string {
  const rounded = Math.max(0, Math.round(seconds));
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const secs = rounded % 60;

  if (hours > 0) {
    return `${hours}時間${minutes}分${String(secs).padStart(2, '0')}秒`;
  }
  return `${minutes}分${String(secs).padStart(2, '0')}秒`;
}

/** フルマラソン目標の妥当な範囲（秒） */
export const FULL_MARATHON_GOAL_MIN_SECONDS = 2 * 3600; // 2:00:00
export const FULL_MARATHON_GOAL_MAX_SECONDS = 8 * 3600; // 8:00:00
