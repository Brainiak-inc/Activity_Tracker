import { Activity } from '../domain/activity';
import { disciplineFromGarminType } from '../domain/discipline';

export interface ImportResult {
  activities: Activity[];
  skipped: number;
}

const MIN_DURATION_MS = 60_000;

function parseCsvRows(text: string): string[][] {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < normalized.length; i++) {
    const c = normalized[i];
    if (inQuotes) {
      if (c === '"') {
        if (normalized[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

function parseNum(raw: string | undefined): number | null {
  if (raw == null) return null;
  const t = raw.trim();
  if (t === '' || t === '--') return null;
  const cleaned = t.replace(/,/g, '').replace(/'/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parseDate(raw: string | undefined): Date | null {
  if (raw == null) return null;
  const t = raw.trim();
  if (t === '' || t === '--') return null;
  const d = new Date(t.replace(' ', 'T'));
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseDurationMs(raw: string | undefined): number | null {
  if (raw == null) return null;
  const t = raw.trim();
  if (t === '' || t === '--') return null;
  const parts = t.split(':');
  if (parts.length === 0 || parts.length > 3) return null;

  let h = 0;
  let m = 0;
  let s = 0;
  if (parts.length === 3) {
    h = Number(parts[0]) || 0;
    m = Number(parts[1]) || 0;
    s = Number(parts[2]) || 0;
  } else if (parts.length === 2) {
    m = Number(parts[0]) || 0;
    s = Number(parts[1]) || 0;
  } else {
    s = Number(parts[0]) || 0;
  }

  return Math.round((h * 3600 + m * 60 + s) * 1000);
}

export class GarminCsvParser {
  parse(content: string): ImportResult {
    const rows = parseCsvRows(content);
    if (rows.length === 0) {
      return { activities: [], skipped: 0 };
    }

    const header = rows[0].map((c) => c.trim());
    const col = new Map<string, number>();
    header.forEach((name, i) => col.set(name, i));

    const cell = (row: string[], name: string): string | undefined => {
      const i = col.get(name);
      if (i === undefined || i >= row.length) return undefined;
      return row[i].trim();
    };

    const activities: Activity[] = [];
    let skipped = 0;

    for (const row of rows.slice(1)) {
      const start = parseDate(cell(row, 'Date'));
      const durationMs = parseDurationMs(cell(row, 'Time'));
      if (start === null || durationMs === null || durationMs < MIN_DURATION_MS) {
        skipped++;
        continue;
      }

      const garminType = cell(row, 'Activity Type') ?? 'Unknown';
      activities.push({
        start,
        discipline: disciplineFromGarminType(garminType),
        garminType,
        title: cell(row, 'Title') ?? garminType,
        durationMs,
        distanceKm: parseNum(cell(row, 'Distance')),
        avgHr: parseNum(cell(row, 'Avg HR')),
        maxHr: parseNum(cell(row, 'Max HR')),
        calories: parseNum(cell(row, 'Calories')),
      });
    }

    activities.sort((a, b) => a.start.getTime() - b.start.getTime());
    return { activities, skipped };
  }
}
