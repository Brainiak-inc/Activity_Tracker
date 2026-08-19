import { startOfDay } from './activity';
import { Discipline } from './discipline';

export interface PlannedWorkout {
  id: string;
  discipline: Discipline;
  title: string;
  note: string;
}

export type WorkoutInput = Omit<PlannedWorkout, 'id'>;

export interface PlanWeek {
  id: string;
  days: PlannedWorkout[][];
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
  };
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
