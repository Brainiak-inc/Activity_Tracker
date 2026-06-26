import { Injectable } from '@angular/core';
import {
  Activity,
  activityFromJson,
  activityToJson,
} from '../domain/activity';
import { AthleteSettings, DEFAULT_SETTINGS } from '../domain/athlete-settings';

export interface PersistedState {
  activities: Activity[];
  settings: AthleteSettings;
  lthrManuallySet: boolean;
}

@Injectable({ providedIn: 'root' })
export class ActivityStore {
  private readonly kActivities = 'activities_v1';
  private readonly kSettings = 'settings_v1';
  private readonly kLthrManual = 'lthr_manual_v1';

  load(): PersistedState {
    const acts =
      this.readJson<Record<string, unknown>[]>(this.kActivities) ?? [];
    const settings =
      this.readJson<AthleteSettings>(this.kSettings) ?? DEFAULT_SETTINGS;
    return {
      activities: acts.map(activityFromJson),
      settings,
      lthrManuallySet: localStorage.getItem(this.kLthrManual) === 'true',
    };
  }

  save(state: PersistedState): void {
    localStorage.setItem(
      this.kActivities,
      JSON.stringify(state.activities.map(activityToJson)),
    );
    localStorage.setItem(this.kSettings, JSON.stringify(state.settings));
    localStorage.setItem(this.kLthrManual, String(state.lthrManuallySet));
  }

  private readJson<T>(key: string): T | null {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }
}
