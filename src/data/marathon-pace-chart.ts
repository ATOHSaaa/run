/** 1km あたりのペースと、距離別の想定タイム（表示用文字列） */
export type MarathonPaceChartRow = {
  pacePerKm: string;
  fullMarathon: string;
  twentyKm: string;
  tenKm: string;
  fiveKm: string;
};

export const MARATHON_PACE_DISTANCES = {
  fullKm: 42.195,
  twentyKm: 20,
  tenKm: 10,
  fiveKm: 5,
} as const;

/** ペース表: 5秒刻み、2:50/km（最速）〜 8:00/km */
export const MARATHON_PACE_CHART_CONFIG = {
  paceStepSeconds: 5,
  paceMinSecondsPerKm: 2 * 60 + 50,
  paceMaxSecondsPerKm: 8 * 60,
} as const;

function formatPacePerKm(seconds: number): string {
  const rounded = Math.round(seconds);
  const minutes = Math.floor(rounded / 60);
  const secs = rounded % 60;
  return `${minutes}分${String(secs).padStart(2, '0')}秒`;
}

function formatRaceTime(seconds: number): string {
  const rounded = Math.max(0, Math.round(seconds));
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const secs = rounded % 60;

  if (hours > 0) {
    return `${hours}時間${minutes}分${String(secs).padStart(2, '0')}秒`;
  }
  return `${minutes}分${String(secs).padStart(2, '0')}秒`;
}

function buildMarathonPaceChartRows(): MarathonPaceChartRow[] {
  const { fullKm, fiveKm, tenKm, twentyKm } = MARATHON_PACE_DISTANCES;
  const { paceStepSeconds, paceMinSecondsPerKm, paceMaxSecondsPerKm } = MARATHON_PACE_CHART_CONFIG;

  const rows: MarathonPaceChartRow[] = [];

  for (let paceSec = paceMinSecondsPerKm; paceSec <= paceMaxSecondsPerKm; paceSec += paceStepSeconds) {
    rows.push({
      pacePerKm: formatPacePerKm(paceSec),
      fiveKm: formatRaceTime(paceSec * fiveKm),
      tenKm: formatRaceTime(paceSec * tenKm),
      twentyKm: formatRaceTime(paceSec * twentyKm),
      fullMarathon: formatRaceTime(paceSec * fullKm),
    });
  }

  return rows;
}

export const MARATHON_PACE_CHART_ROWS = buildMarathonPaceChartRows();
