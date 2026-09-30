import { Activity } from './activity';
import { Discipline } from './discipline';
import { mondayOf } from './plan';

const WEEK_MS = 7 * 24 * 3600 * 1000;

export function weeklyVolumeSeries(
  activities: Activity[],
  discipline: Discipline,
  weeks: number,
  now: Date = new Date(),
): number[] {
  const lastComplete = mondayOf(now).getTime() - WEEK_MS;
  const first = lastComplete - (weeks - 1) * WEEK_MS;
  const buckets = new Array(weeks).fill(0);
  for (const a of activities) {
    if (a.discipline !== discipline) continue;
    if (a.distanceKm == null) continue;
    const wk = mondayOf(a.start).getTime();
    const idx = Math.round((wk - first) / WEEK_MS);
    if (idx < 0 || idx >= weeks) continue;
    buckets[idx] += a.distanceKm;
  }
  return buckets;
}
