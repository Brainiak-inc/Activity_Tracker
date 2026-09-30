import { Component, computed, inject } from '@angular/core';
import {
  DISCIPLINE_META,
  Discipline,
  IRONMAN_DISCIPLINES,
} from '../../domain/discipline';
import { formatDistance } from '../../domain/format';
import { weeklyVolumeSeries } from '../../domain/volume';
import { DashboardService } from '../../services/dashboard.service';

const WEEKS = 10;

interface Bar {
  h: number;
  label: string;
}

interface TrendMark {
  arrow: string;
  color: string;
}

interface VolumeRow {
  discipline: Discipline;
  code: string;
  label: string;
  lastText: string;
  bars: Bar[];
  trend: TrendMark | null;
}

@Component({
  selector: 'app-volume-trend',
  standalone: true,
  templateUrl: './volume-trend.component.html',
  styleUrl: './volume-trend.component.less',
})
export class VolumeTrendComponent {
  private readonly dashboard = inject(DashboardService);

  readonly rows = computed<VolumeRow[]>(() => {
    const acts = this.dashboard.activities();
    const rows: VolumeRow[] = [];
    for (const d of IRONMAN_DISCIPLINES) {
      const series = weeklyVolumeSeries(acts, d, WEEKS);
      const total = series.reduce((s, x) => s + x, 0);
      if (total <= 0) continue;
      const max = Math.max(...series);
      const bars = series.map((km) => ({
        h: max > 0 ? Math.max(3, Math.round((km / max) * 100)) : 3,
        label: formatDistance(d, km),
      }));
      const n = series.length;
      const last = series[n - 1];
      const prev = series.slice(Math.max(0, n - 4), n - 1);
      const prevAvg = prev.length
        ? prev.reduce((s, x) => s + x, 0) / prev.length
        : 0;
      rows.push({
        discipline: d,
        code: DISCIPLINE_META[d].code,
        label: DISCIPLINE_META[d].label,
        lastText: formatDistance(d, last),
        bars,
        trend: this.trendMark(last, prevAvg),
      });
    }
    return rows;
  });

  private trendMark(last: number, prevAvg: number): TrendMark | null {
    if (prevAvg <= 0) {
      return last > 0 ? { arrow: '▲', color: 'var(--accent)' } : null;
    }
    const rel = (last - prevAvg) / prevAvg;
    if (rel > 0.05) return { arrow: '▲', color: 'var(--accent)' };
    if (rel < -0.05) return { arrow: '▼', color: 'var(--fatigue)' };
    return { arrow: '→', color: 'var(--text-muted)' };
  }
}
