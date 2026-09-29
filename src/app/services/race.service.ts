import { Injectable, computed, inject, signal } from '@angular/core';
import { RaceConfig, computeReadiness } from '../domain/readiness';
import { DashboardService } from './dashboard.service';

const KEY = 'race_config_v1';

@Injectable({ providedIn: 'root' })
export class RaceService {
  private readonly dashboard = inject(DashboardService);

  private readonly _config = signal<RaceConfig | null>(this.read());
  readonly config = this._config.asReadonly();

  readonly readiness = computed(() => {
    const c = this._config();
    return c ? computeReadiness(c, this.dashboard.activities()) : null;
  });

  setConfig(config: RaceConfig): void {
    this._config.set(config);
    localStorage.setItem(KEY, JSON.stringify(config));
  }

  clear(): void {
    this._config.set(null);
    localStorage.removeItem(KEY);
  }

  private read(): RaceConfig | null {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as RaceConfig) : null;
    } catch {
      return null;
    }
  }
}
