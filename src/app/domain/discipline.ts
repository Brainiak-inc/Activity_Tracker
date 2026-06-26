export enum Discipline {
  Run = 'run',
  Bike = 'bike',
  Swim = 'swim',
  Other = 'other',
}

export interface DisciplineMeta {
  label: string;
  emoji: string;
}

export const DISCIPLINE_META: Record<Discipline, DisciplineMeta> = {
  [Discipline.Run]: { label: 'Бег', emoji: '🏃' },
  [Discipline.Bike]: { label: 'Велосипед', emoji: '🚴' },
  [Discipline.Swim]: { label: 'Плавание', emoji: '🏊' },
  [Discipline.Other]: { label: 'Другое', emoji: '🩹' },
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

  return Discipline.Other;
}
