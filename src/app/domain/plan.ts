import { Activity, startOfDay } from './activity';
import { Discipline, IRONMAN_DISCIPLINES } from './discipline';

export interface PlannedWorkout {
  id: string;
  discipline: Discipline;
  title: string;
  note: string;
  distanceKm: number | null;
}

export type WorkoutInput = Omit<PlannedWorkout, 'id'>;

export interface DisciplineVolume {
  discipline: Discipline;
  km: number;
}

export interface VolumeCompare {
  discipline: Discipline;
  planned: number;
  actual: number;
}

export interface PlanWeek {
  id: string;
  days: PlannedWorkout[][];
  done: boolean[];
}

export interface WeekProgress {
  done: number;
  total: number;
  complete: boolean;
}

export interface TrainingPlan {
  id: string;
  name: string;
  startMonday: string | null;
  weeks: PlanWeek[];
}

export const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function mondayOf(date: Date): Date {
  const d = startOfDay(date);
  const offset = (d.getDay() + 6) % 7;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - offset);
}

export function emptyWeek(): PlanWeek {
  return {
    id: crypto.randomUUID(),
    days: Array.from({ length: 7 }, () => []),
    done: Array.from({ length: 7 }, () => false),
  };
}

export function weekProgress(week: PlanWeek): WeekProgress {
  let total = 0;
  let done = 0;
  week.days.forEach((day, i) => {
    if (day.length === 0) return;
    total++;
    if (week.done[i]) done++;
  });
  return { done, total, complete: total > 0 && done === total };
}

export function weekVolume(week: PlanWeek): DisciplineVolume[] {
  const totals = new Map<Discipline, number>();
  week.days.forEach((day) => {
    day.forEach((w) => {
      if (w.distanceKm == null) return;
      if (!IRONMAN_DISCIPLINES.includes(w.discipline)) return;
      totals.set(w.discipline, (totals.get(w.discipline) ?? 0) + w.distanceKm);
    });
  });
  return IRONMAN_DISCIPLINES.filter((d) => totals.has(d)).map((d) => ({
    discipline: d,
    km: totals.get(d) ?? 0,
  }));
}

function dateFromStart(startMonday: string, offset: number): Date {
  const [y, m, d] = startMonday.split('-').map(Number);
  return new Date(y, m - 1, d + offset);
}

export function weekStartDate(
  plan: TrainingPlan,
  weekIndex: number,
): Date | null {
  if (!plan.startMonday) return null;
  return dateFromStart(plan.startMonday, weekIndex * 7);
}

export function weekComparison(
  week: PlanWeek,
  activities: Activity[],
  start: Date,
  end: Date,
): VolumeCompare[] {
  const planned = new Map<Discipline, number>();
  for (const v of weekVolume(week)) planned.set(v.discipline, v.km);

  const actual = new Map<Discipline, number>();
  const from = start.getTime();
  const to = end.getTime();
  for (const a of activities) {
    if (a.distanceKm == null) continue;
    if (!IRONMAN_DISCIPLINES.includes(a.discipline)) continue;
    const t = a.start.getTime();
    if (t < from || t >= to) continue;
    actual.set(a.discipline, (actual.get(a.discipline) ?? 0) + a.distanceKm);
  }

  return IRONMAN_DISCIPLINES.filter(
    (d) => planned.has(d) || actual.has(d),
  ).map((d) => ({
    discipline: d,
    planned: planned.get(d) ?? 0,
    actual: actual.get(d) ?? 0,
  }));
}

export function weekDayLabel(
  plan: TrainingPlan,
  weekIndex: number,
  dayIndex: number,
): string {
  if (!plan.startMonday) return WEEKDAYS[dayIndex];
  const date = dateFromStart(plan.startMonday, weekIndex * 7 + dayIndex);
  return `${WEEKDAYS[dayIndex]} ${date.getDate()}`;
}

export function weekLabel(plan: TrainingPlan, weekIndex: number): string {
  if (!plan.startMonday) return `Неделя ${weekIndex + 1}`;
  const fmt = (dt: Date) =>
    dt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  const first = dateFromStart(plan.startMonday, weekIndex * 7);
  const last = dateFromStart(plan.startMonday, weekIndex * 7 + 6);
  return `${fmt(first)} — ${fmt(last)}`;
}
