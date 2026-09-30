export enum Discipline {
  Run = 'run',
  Bike = 'bike',
  Swim = 'swim',
  Strength = 'strength',
  Other = 'other',
}

export interface DisciplineMeta {
  label: string;
}

export const DISCIPLINE_META: Record<Discipline, DisciplineMeta> = {
  [Discipline.Run]: { label: 'Бег' },
  [Discipline.Bike]: { label: 'Велосипед' },
  [Discipline.Swim]: { label: 'Плавание' },
  [Discipline.Strength]: { label: 'Силовая' },
  [Discipline.Other]: { label: 'Другое' },
};

export const IRONMAN_DISCIPLINES: Discipline[] = [
  Discipline.Swim,
  Discipline.Bike,
  Discipline.Run,
];

export function disciplineFromGarminType(rawType: string): Discipline {
  const t = rawType.toLowerCase();

  if (t.includes('swim')) return Discipline.Swim;
  if (t.includes('cycl') || t.includes('biking') || t.includes('bike')) {
    return Discipline.Bike;
  }
  if (t.includes('run')) return Discipline.Run;
  if (t.includes('strength')) return Discipline.Strength;

  return Discipline.Other;
}
