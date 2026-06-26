import { Discipline } from './discipline';

export interface AthleteSettings {
  defaultLthr: number;
  lthrByDiscipline: Partial<Record<Discipline, number>>;
}

export const DEFAULT_SETTINGS: AthleteSettings = {
  defaultLthr: 170,
  lthrByDiscipline: {},
};

export function lthrFor(settings: AthleteSettings, d: Discipline): number {
  return settings.lthrByDiscipline[d] ?? settings.defaultLthr;
}
