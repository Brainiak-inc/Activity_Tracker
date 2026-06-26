import { dayKey } from './activity';

export type AdherenceStatus = 'full' | 'partial' | 'missed';

export interface DayMark {
  status: AdherenceStatus;
  comment: string;
}

export type AdherenceData = Record<string, Record<string, DayMark>>;

export interface CalendarCell {
  date: Date;
  key: string;
  inYear: boolean;
  isToday: boolean;
}

export interface CalendarWeek {
  monthLabel: string | null;
  cells: CalendarCell[];
}


export function buildYearWeeks(year: number, today: Date): CalendarWeek[] {
  const jan1 = new Date(year, 0, 1);
  const startOffset = (jan1.getDay() + 6) % 7;
  const gridStart = new Date(year, 0, 1 - startOffset);

  const dec31 = new Date(year, 11, 31);
  const endOffset = 6 - ((dec31.getDay() + 6) % 7);
  const gridEnd = new Date(year, 11, 31 + endOffset);

  const todayKey = dayKey(today);
  const weeks: CalendarWeek[] = [];
  let cursor = new Date(gridStart);

  while (cursor.getTime() <= gridEnd.getTime()) {
    const cells: CalendarCell[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(cursor);
      const key = dayKey(date);
      cells.push({
        date,
        key,
        inYear: date.getFullYear() === year,
        isToday: key === todayKey,
      });
      cursor = new Date(
        cursor.getFullYear(),
        cursor.getMonth(),
        cursor.getDate() + 1,
      );
    }

    const firstInYear = cells.find((c) => c.inYear);
    const monthLabel =
      firstInYear && firstInYear.date.getDate() <= 7
        ? firstInYear.date.toLocaleDateString('ru-RU', { month: 'short' })
        : null;

    weeks.push({ monthLabel, cells });
  }

  return weeks;
}
