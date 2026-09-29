import { startOfDay } from './activity';
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
