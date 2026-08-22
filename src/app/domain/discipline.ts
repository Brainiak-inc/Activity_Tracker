export enum Discipline {
  Run = 'run',
  Bike = 'bike',
  Swim = 'swim',
  Other = 'other',
}

export interface DisciplineMeta {
  label: string;
  code: string;
}

export const DISCIPLINE_META: Record<Discipline, DisciplineMeta> = {
  [Discipline.Run]: { label: 'Бег', code: 'БЕГ' },
  [Discipline.Bike]: { label: 'Велосипед', code: 'ВЕЛ' },
  [Discipline.Swim]: { label: 'Плавание', code: 'ПЛВ' },
  [Discipline.Other]: { label: 'Другое', code: 'ПРЧ' },
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
