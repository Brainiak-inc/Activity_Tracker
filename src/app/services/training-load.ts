import { Activity, dayKey, startOfDay } from '../domain/activity';
import { AthleteSettings, lthrFor } from '../domain/athlete-settings';
import { Discipline } from '../domain/discipline';

export interface LoadPoint {
  day: Date;
  tss: number;
  ctl: number;
  atl: number;
  tsb: number;
}

const CTL_DAYS = 42;
const ATL_DAYS = 7;
const MIN_ESTIMATE_DURATION_MS = 20 * 60_000;

type ActivityFilter = (a: Activity) => boolean;

export function hrTss(a: Activity, settings: AthleteSettings): number {
  const hr = a.avgHr;
  if (hr == null || hr <= 0) return 0;

  const lthr = lthrFor(settings, a.discipline);
  const intensity = hr / lthr;
  const hours = a.durationMs / 3_600_000;
  return hours * intensity * intensity * 100;
}

export function dailyTss(
  activities: Activity[],
  settings: AthleteSettings,
  filter?: ActivityFilter,
): Map<string, number> {
  const byDay = new Map<string, number>();
  for (const a of activities) {
    if (filter && !filter(a)) continue;
    const key = dayKey(a.start);
    byDay.set(key, (byDay.get(key) ?? 0) + hrTss(a, settings));
  }
  return byDay;
}

export function performanceSeries(
  activities: Activity[],
  settings: AthleteSettings,
  filter?: ActivityFilter,
  until?: Date,
): LoadPoint[] {
  const relevant = filter ? activities.filter(filter) : activities;
  if (relevant.length === 0) return [];

  const byDay = dailyTss(relevant, settings);

  const first = startOfDay(relevant[0].start);
  const lastActivity = relevant[relevant.length - 1].start;
  const last = startOfDay(until ?? lastActivity);

  const ctlAlpha = 1 - Math.exp(-1 / CTL_DAYS);
  const atlAlpha = 1 - Math.exp(-1 / ATL_DAYS);

  const series: LoadPoint[] = [];
  let ctl = 0;
  let atl = 0;

  for (
    let d = new Date(first);
    d.getTime() <= last.getTime();
    d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
  ) {
    const tss = byDay.get(dayKey(d)) ?? 0;
    const tsb = ctl - atl;

    ctl += (tss - ctl) * ctlAlpha;
    atl += (tss - atl) * atlAlpha;

    series.push({ day: new Date(d), tss, ctl, atl, tsb });
  }

  return series;
}

export function estimateLthr(
  activities: Activity[],
  d: Discipline,
): number | null {
  let best: number | null = null;
  for (const a of activities) {
    if (a.discipline !== d) continue;
    if (a.durationMs < MIN_ESTIMATE_DURATION_MS) continue;
    if (a.avgHr == null) continue;
    if (best === null || a.avgHr > best) best = a.avgHr;
  }
  return best;
}
