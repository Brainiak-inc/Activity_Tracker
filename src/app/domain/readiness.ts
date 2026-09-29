import { Activity } from './activity';
import { Discipline, IRONMAN_DISCIPLINES } from './discipline';

export type RaceDistance = 'full' | 'half';

export interface RaceConfig {
  distance: RaceDistance;
  date: string | null;
  targetSeconds: number;
  weeklyHours: number | null;
  fromZero: boolean;
}

export interface DisciplineReadiness {
  discipline: Discipline;
  percent: number;
  weeklyKm: number;
  targetWeeklyKm: number;
  longestKm: number;
  targetLongKm: number;
}

export type RaceStatus = 'ahead' | 'ontrack' | 'behind';

export interface FitnessInput {
  ctl: number;
  tsb: number;
  ctlTrend: number;
}

export interface Readiness {
  overall: number;
  volumeScore: number;
  disciplines: DisciplineReadiness[];
  limiting: Discipline;
  monthsToReady: number;
  weeksToRace: number | null;
  status: RaceStatus | null;
  hasVolume: boolean;
  ctl: number | null;
  tsb: number | null;
  ctlTrend: number | null;
  fitnessBonus: number;
}

const FITNESS_BONUS = 4;

interface DiscTarget {
  weekly: number;
  long: number;
}

const RACE_SPEC: Record<RaceDistance, Record<string, DiscTarget>> = {
  full: {
    [Discipline.Swim]: { weekly: 6, long: 3 },
    [Discipline.Bike]: { weekly: 180, long: 120 },
    [Discipline.Run]: { weekly: 40, long: 28 },
  },
  half: {
    [Discipline.Swim]: { weekly: 3, long: 1.9 },
    [Discipline.Bike]: { weekly: 110, long: 80 },
    [Discipline.Run]: { weekly: 25, long: 16 },
  },
};

export const RACE_LABEL: Record<RaceDistance, string> = {
  full: 'Полный (226 км)',
  half: 'Половинка (113 км)',
};

export const RACE_CUTOFF_SECONDS: Record<RaceDistance, number> = {
  full: 17 * 3600,
  half: 8.5 * 3600,
};

const WEEK_MS = 7 * 24 * 3600 * 1000;

function weeklyVolume(
  activities: Activity[],
  discipline: Discipline,
  now: number,
  weeks: number,
): number {
  const cutoff = now - weeks * WEEK_MS;
  let sum = 0;
  for (const a of activities) {
    if (a.discipline !== discipline) continue;
    if (a.start.getTime() < cutoff) continue;
    sum += a.distanceKm ?? 0;
  }
  return sum / weeks;
}

function longestSession(
  activities: Activity[],
  discipline: Discipline,
  now: number,
  weeks: number,
): number {
  const cutoff = now - weeks * WEEK_MS;
  let max = 0;
  for (const a of activities) {
    if (a.discipline !== discipline) continue;
    if (a.start.getTime() < cutoff) continue;
    max = Math.max(max, a.distanceKm ?? 0);
  }
  return max;
}

function paceFactor(config: RaceConfig): number {
  const cutoff = RACE_CUTOFF_SECONDS[config.distance];
  if (!config.targetSeconds || config.targetSeconds <= 0) return 1;
  const speedUp = cutoff / config.targetSeconds;
  return Math.min(2, Math.max(1, speedUp));
}

function estimateMonths(
  disciplines: DisciplineReadiness[],
  fromZero: boolean,
): number {
  const ramp = fromZero ? 0.045 : 0.07;
  let maxWeeks = 0;
  for (const d of disciplines) {
    if (d.weeklyKm >= d.targetWeeklyKm) continue;
    const base = Math.max(d.weeklyKm, d.targetWeeklyKm * 0.08);
    const weeks = Math.log(d.targetWeeklyKm / base) / Math.log(1 + ramp);
    maxWeeks = Math.max(maxWeeks, weeks);
  }
  if (maxWeeks === 0) return 0;
  const buffer = fromZero ? 12 : 4;
  return Math.round((maxWeeks + buffer) / 4.345);
}

export function computeReadiness(
  config: RaceConfig,
  activities: Activity[],
  fitness: FitnessInput | null = null,
): Readiness {
  const now = Date.now();
  const spec = RACE_SPEC[config.distance];
  const goalFactor = paceFactor(config);

  const disciplines: DisciplineReadiness[] = IRONMAN_DISCIPLINES.map((d) => {
    const base = spec[d];
    const targetWeeklyKm = base.weekly * goalFactor;
    const targetLongKm = base.long * goalFactor;
    const weeklyKm = weeklyVolume(activities, d, now, 4);
    const longestKm = longestSession(activities, d, now, 12);
    const volRatio = Math.min(1, weeklyKm / targetWeeklyKm);
    const longRatio = Math.min(1, longestKm / targetLongKm);
    const percent = Math.round((0.6 * volRatio + 0.4 * longRatio) * 100);
    return {
      discipline: d,
      percent,
      weeklyKm,
      targetWeeklyKm,
      longestKm,
      targetLongKm,
    };
  });

  const percents = disciplines.map((d) => d.percent);
  const min = Math.min(...percents);
  const mean = percents.reduce((s, x) => s + x, 0) / percents.length;
  const volumeScore = Math.round(0.5 * min + 0.5 * mean);
  const limiting = disciplines.reduce((a, b) =>
    b.percent < a.percent ? b : a,
  ).discipline;

  let ctl: number | null = null;
  let tsb: number | null = null;
  let ctlTrend: number | null = null;
  let fitnessBonus = 0;
  if (fitness) {
    ctl = Math.round(fitness.ctl);
    tsb = Math.round(fitness.tsb);
    ctlTrend = fitness.ctlTrend;
    fitnessBonus =
      fitness.ctlTrend > 0.5
        ? FITNESS_BONUS
        : fitness.ctlTrend < -0.5
          ? -FITNESS_BONUS
          : 0;
  }
  const overall = Math.max(0, Math.min(100, volumeScore + fitnessBonus));

  const monthsToReady = estimateMonths(disciplines, config.fromZero);

  let weeksToRace: number | null = null;
  let status: RaceStatus | null = null;
  if (config.date) {
    const [y, m, day] = config.date.split('-').map(Number);
    const raceMs = new Date(y, m - 1, day).getTime();
    const rawWeeks = (raceMs - now) / WEEK_MS;
    weeksToRace = Math.max(0, Math.round(rawWeeks));
    const weeksToReady = monthsToReady * 4.345;
    status =
      weeksToReady <= rawWeeks * 0.85
        ? 'ahead'
        : weeksToReady <= rawWeeks
          ? 'ontrack'
          : 'behind';
  }

  const hasVolume = disciplines.some((d) => d.weeklyKm > 0 || d.longestKm > 0);

  return {
    overall,
    volumeScore,
    disciplines,
    limiting,
    monthsToReady,
    weeksToRace,
    status,
    hasVolume,
    ctl,
    tsb,
    ctlTrend,
    fitnessBonus,
  };
}
