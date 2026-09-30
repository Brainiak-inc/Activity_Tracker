import { Discipline } from './discipline';

export function formatDuration(ms: number): string {
  const totalMin = Math.round(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h} ч ${m} мин` : `${m} мин`;
}

export function formatDistance(discipline: Discipline, km: number): string {
  if (discipline === Discipline.Swim) {
    return `${Math.round(km * 1000).toLocaleString('ru-RU')} м`;
  }
  return `${km.toFixed(1)} км`;
}

export function formatClock(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return `${h}:${`${m}`.padStart(2, '0')}`;
}

function minSec(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${m}:${`${s}`.padStart(2, '0')}`;
}

export function formatPace(discipline: Discipline, speedKmh: number): string {
  if (speedKmh <= 0) return '—';
  if (discipline === Discipline.Swim) {
    return `${minSec(360 / speedKmh)}/100м`;
  }
  if (discipline === Discipline.Bike) {
    return `${speedKmh.toFixed(1)} км/ч`;
  }
  return `${minSec(3600 / speedKmh)}/км`;
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export function formatDateTime(d: Date): string {
  const date = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  const time = d.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${date}, ${time}`;
}
