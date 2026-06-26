import { Discipline, disciplineFromGarminType } from './discipline';

export interface Activity {
  start: Date;
  discipline: Discipline;
  garminType: string;
  title: string;
  durationMs: number;
  distanceKm: number | null;
  avgHr: number | null;
  maxHr: number | null;
  calories: number | null;
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function dayKey(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function dedupKey(a: Activity): string {
  return `${a.start.toISOString()}|${a.garminType}`;
}

export function activityFromJson(json: Record<string, unknown>): Activity {
  const garminType = json['garminType'] as string;
  return {
    start: new Date(json['start'] as string),
    discipline: disciplineFromGarminType(garminType),
    garminType,
    title: json['title'] as string,
    durationMs: json['durationMs'] as number,
    distanceKm: (json['distanceKm'] as number | null) ?? null,
    avgHr: (json['avgHr'] as number | null) ?? null,
    maxHr: (json['maxHr'] as number | null) ?? null,
    calories: (json['calories'] as number | null) ?? null,
  };
}

export function activityToJson(a: Activity): Record<string, unknown> {
  return {
    start: a.start.toISOString(),
    garminType: a.garminType,
    title: a.title,
    durationMs: a.durationMs,
    distanceKm: a.distanceKm,
    avgHr: a.avgHr,
    maxHr: a.maxHr,
    calories: a.calories,
  };
}
