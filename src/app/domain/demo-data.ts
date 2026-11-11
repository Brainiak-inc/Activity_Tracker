import { Discipline } from './discipline';

const DAY = 86_400_000;

interface DemoActivity {
  start: string;
  discipline: Discipline;
  garminType: string;
  title: string;
  durationMs: number;
  distanceKm: number | null;
  avgHr: number | null;
  maxHr: number | null;
  calories: number | null;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function dayKey(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function mondayOf(d: Date): Date {
  const base = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const offset = (base.getDay() + 6) % 7;
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() - offset);
}

function activity(
  date: Date,
  hour: number,
  discipline: Discipline,
  garminType: string,
  km: number | null,
  speedKmh: number,
  avgHr: number,
): DemoActivity {
  const start = new Date(date);
  start.setHours(hour, 0, 0, 0);
  const durationMs =
    km && km > 0 ? Math.round((km / speedKmh) * 3_600_000) : 40 * 60_000;
  return {
    start: start.toISOString(),
    discipline,
    garminType,
    title: garminType,
    durationMs,
    distanceKm: km,
    avgHr,
    maxHr: avgHr + 15,
    calories: Math.round((durationMs / 60_000) * 9),
  };
}

function demoActivities(now: Date): DemoActivity[] {
  const acts: DemoActivity[] = [];
  for (let d = 14 * 7; d >= 1; d--) {
    const date = new Date(now.getTime() - d * DAY);
    const weekday = (date.getDay() + 6) % 7;
    const weeksAgo = Math.floor((d - 1) / 7);
    const grow = 1 + (13 - Math.min(13, weeksAgo)) * 0.03;
    if (weekday === 0) {
      acts.push(activity(date, 7, Discipline.Run, 'Running', round1(9 * grow), 10.5, 150));
    } else if (weekday === 1) {
      acts.push(activity(date, 18, Discipline.Bike, 'Cycling', round1(32 * grow), 28, 140));
    } else if (weekday === 2) {
      acts.push(activity(date, 7, Discipline.Swim, 'Lap Swimming', round1(1.6 * grow), 3, 135));
    } else if (weekday === 3) {
      acts.push(activity(date, 18, Discipline.Run, 'Running', round1(8 * grow), 10.8, 150));
    } else if (weekday === 5) {
      if (weeksAgo % 2 === 0) {
        acts.push(activity(date, 9, Discipline.Bike, 'Cycling', round1(55 * grow), 27, 138));
      } else {
        acts.push(activity(date, 9, Discipline.Run, 'Running', round1(15 * grow), 10, 148));
      }
    } else if (weekday === 6) {
      acts.push(activity(date, 8, Discipline.Swim, 'Lap Swimming', round1(2 * grow), 3, 134));
    }
  }
  acts.push(activity(new Date(now.getTime() - 4 * DAY), 19, Discipline.Strength, 'Strength Training', null, 1, 118));
  acts.push(activity(new Date(now.getTime() - 9 * DAY), 19, Discipline.Strength, 'Strength Training', null, 1, 120));
  acts.push(activity(new Date(now.getTime() - 6 * DAY), 12, Discipline.Other, 'Walking', 4, 5, 105));
  return acts.sort((a, b) => a.start.localeCompare(b.start));
}

function workout(discipline: Discipline, distanceKm: number, title = ''): Record<string, unknown> {
  return { id: crypto.randomUUID(), discipline, title, note: '', distanceKm };
}

function planWeek(doneDays: number[]): Record<string, unknown> {
  const days = [
    [workout(Discipline.Bike, 40)],
    [workout(Discipline.Run, 10)],
    [workout(Discipline.Swim, 2)],
    [workout(Discipline.Run, 8)],
    [],
    [workout(Discipline.Bike, 60, 'Длинная')],
    [workout(Discipline.Swim, 2.5)],
  ];
  const done = Array.from({ length: 7 }, (_, i) => doneDays.includes(i));
  return { id: crypto.randomUUID(), days, done };
}

function demoPlan(now: Date): Record<string, unknown> {
  const startMonday = mondayOf(new Date(now.getTime() - 14 * DAY));
  return {
    id: crypto.randomUUID(),
    name: 'База',
    startMonday: dayKey(startMonday),
    weeks: [
      planWeek([0, 1, 2, 3, 5, 6]),
      planWeek([0, 1, 2, 3, 5, 6]),
      planWeek([0, 1]),
      planWeek([]),
    ],
  };
}

function demoRace(now: Date): Record<string, unknown> {
  const date = new Date(now.getFullYear() + 3, 5, 1);
  return {
    distance: 'full',
    date: dayKey(date),
    targetSeconds: 17 * 3600,
    weeklyHours: 8,
    fromZero: true,
  };
}

export function seedDemoIfEmpty(): void {
  try {
    const hasActivities = !!localStorage.getItem('activities_v1');
    const seeded = localStorage.getItem('demo_seeded_v1') === 'true';
    if (hasActivities || seeded) return;

    const now = new Date();
    localStorage.setItem('activities_v1', JSON.stringify(demoActivities(now)));
    localStorage.setItem(
      'settings_v1',
      JSON.stringify({ defaultLthr: 172, lthrByDiscipline: {} }),
    );
    localStorage.setItem('lthr_manual_v1', 'true');
    localStorage.setItem('plan_v1', JSON.stringify([demoPlan(now)]));
    localStorage.setItem('race_config_v1', JSON.stringify(demoRace(now)));
    localStorage.setItem('demo_seeded_v1', 'true');
    localStorage.setItem('demo_active_v1', 'true');
  } catch {
    return;
  }
}
