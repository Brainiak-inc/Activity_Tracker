import { Injectable, signal } from '@angular/core';
import { AdherenceData, AdherenceStatus, DayMark } from '../domain/adherence';

@Injectable({ providedIn: 'root' })
export class AdherenceService {
  private readonly storageKey = 'adherence_v1';
  private readonly _data = signal<AdherenceData>(this.read());

  readonly data = this._data.asReadonly();

  setMark(
    track: string,
    day: string,
    status: AdherenceStatus,
    comment: string,
  ): void {
    this._data.update((data) => {
      const next = { ...data };
      const trackMarks = { ...(next[track] ?? {}) };
      trackMarks[day] = { status, comment: comment.trim() };
      next[track] = trackMarks;
      return next;
    });
    this.persist();
  }

  clearMark(track: string, day: string): void {
    this._data.update((data) => {
      const trackMarks = { ...(data[track] ?? {}) };
      delete trackMarks[day];
      return { ...data, [track]: trackMarks };
    });
    this.persist();
  }

  markOf(track: string, day: string): DayMark | null {
    return this._data()[track]?.[day] ?? null;
  }

  private read(): AdherenceData {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return {};
    try {
      return JSON.parse(raw) as AdherenceData;
    } catch {
      return {};
    }
  }

  private persist(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this._data()));
  }
}
