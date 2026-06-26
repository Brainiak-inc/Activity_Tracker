import { Injectable, computed, inject, signal } from '@angular/core';
import { Activity, dedupKey } from '../domain/activity';
import { AthleteSettings, DEFAULT_SETTINGS } from '../domain/athlete-settings';
import { Discipline } from '../domain/discipline';
import { ActivityStore } from './activity-store.service';
import { GarminCsvParser } from './garmin-csv-parser';
import {
  LoadPoint,
  estimateLthr,
  performanceSeries,
} from './training-load';

export interface DisciplineTotals {
  count: number;
  distanceKm: number;
  durationMs: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly store = inject(ActivityStore);
  private readonly parser = new GarminCsvParser();

  private readonly _activities = signal<Activity[]>([]);
  private readonly _settings = signal<AthleteSettings>(DEFAULT_SETTINGS);
  private readonly _lastImportInfo = signal<string | null>(null);
  private lthrManuallySet = false;

  readonly activities = this._activities.asReadonly();
  readonly settings = this._settings.asReadonly();
  readonly lastImportInfo = this._lastImportInfo.asReadonly();

  readonly hasData = computed(() => this._activities().length > 0);

  readonly overallSeries = computed(() =>
    performanceSeries(this._activities(), this._settings()),
  );

  readonly currentForm = computed<LoadPoint | null>(() => {
    const s = this.overallSeries();
    return s.length ? s[s.length - 1] : null;
  });

  private readonly seriesByDiscipline = computed(() => {
    const acts = this._activities();
    const settings = this._settings();
    const map = {} as Record<Discipline, LoadPoint[]>;
    for (const d of Object.values(Discipline)) {
      map[d] = performanceSeries(acts, settings, (a) => a.discipline === d);
    }
    return map;
  });

  readonly countByDiscipline = computed(() => {
    const map = {} as Record<Discipline, number>;
    for (const d of Object.values(Discipline)) map[d] = 0;
    for (const a of this._activities()) map[a.discipline]++;
    return map;
  });

  constructor() {
    const state = this.store.load();
    this._activities.set(
      [...state.activities].sort(
        (a, b) => a.start.getTime() - b.start.getTime(),
      ),
    );
    this._settings.set(state.settings);
    this.lthrManuallySet = state.lthrManuallySet;
  }

  seriesFor(d: Discipline): LoadPoint[] {
    return this.seriesByDiscipline()[d];
  }

  formFor(d: Discipline): LoadPoint | null {
    const s = this.seriesFor(d);
    return s.length ? s[s.length - 1] : null;
  }

  activitiesFor(d: Discipline): Activity[] {
    return this._activities()
      .filter((a) => a.discipline === d)
      .reverse();
  }

  recentActivities(limit: number): Activity[] {
    return [...this._activities()].reverse().slice(0, limit);
  }

  totalsFor(d: Discipline): DisciplineTotals {
    let count = 0;
    let distanceKm = 0;
    let durationMs = 0;
    for (const a of this._activities()) {
      if (a.discipline !== d) continue;
      count++;
      distanceKm += a.distanceKm ?? 0;
      durationMs += a.durationMs;
    }
    return { count, distanceKm, durationMs };
  }

  import(content: string): void {
    const result = this.parser.parse(content);

    const byKey = new Map<string, Activity>();
    for (const a of this._activities()) byKey.set(dedupKey(a), a);

    let added = 0;
    for (const a of result.activities) {
      const key = dedupKey(a);
      if (!byKey.has(key)) {
        byKey.set(key, a);
        added++;
      }
    }

    const merged = [...byKey.values()].sort(
      (a, b) => a.start.getTime() - b.start.getTime(),
    );
    this._activities.set(merged);

    if (!this.lthrManuallySet) {
      const est = estimateLthr(merged, Discipline.Run);
      if (est !== null) {
        this._settings.update((s) => ({ ...s, defaultLthr: est }));
      }
    }

    this._lastImportInfo.set(
      added > 0
        ? `Добавлено ${added} новых тренировок` +
            (result.skipped > 0 ? `, пропущено ${result.skipped}` : '')
        : 'Новых тренировок не найдено (возможно, уже импортированы)',
    );

    this.persist();
  }

  setDefaultLthr(value: number): void {
    this._settings.update((s) => ({ ...s, defaultLthr: value }));
    this.lthrManuallySet = true;
    this.persist();
  }

  clear(): void {
    this._activities.set([]);
    this._lastImportInfo.set(null);
    this.persist();
  }

  private persist(): void {
    this.store.save({
      activities: this._activities(),
      settings: this._settings(),
      lthrManuallySet: this.lthrManuallySet,
    });
  }
}
