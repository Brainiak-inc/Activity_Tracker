import { Injectable, computed, inject, signal } from '@angular/core';
import { FitnessInput, RaceConfig, computeReadiness } from '../domain/readiness';
import { DashboardService } from './dashboard.service';

const KEY = 'race_config_v1';

@Injectable({ providedIn: 'root' })
export class RaceService {
  private readonly dashboard = inject(DashboardService);

  private readonly _config = signal<RaceConfig | null>(this.read());
  readonly config = this._config.asReadonly();

  private readonly fitness = computed<FitnessInput | null>(() => {
    const series = this.dashboard.overallSeries();
    if (!series.length) return null;
    const last = series[series.length - 1];
    const trend =
      series.length >= 8 ? last.ctl - series[series.length - 8].ctl : 0;
    return { ctl: last.ctl, tsb: last.tsb, ctlTrend: trend };
  });

  readonly readiness = computed(() => {
    const c = this._config();
    if (!c) return null;
    return computeReadiness(c, this.dashboard.activities(), this.fitness());
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
