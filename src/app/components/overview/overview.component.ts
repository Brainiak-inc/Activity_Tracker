import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DISCIPLINE_META, IRONMAN_DISCIPLINES } from '../../domain/discipline';
import { tsbStatus } from '../../domain/form-status';
import { weeklyVolumeSeries } from '../../domain/volume';
import { DashboardService } from '../../services/dashboard.service';
import { RaceService } from '../../services/race.service';
import { ActivityListComponent } from '../activity-list/activity-list.component';

interface TrendMark {
  arrow: string;
  color: string;
}

function mark(delta: number, threshold: number): TrendMark {
  if (delta > threshold) return { arrow: '▲', color: 'var(--accent)' };
  if (delta < -threshold) return { arrow: '▼', color: 'var(--fatigue)' };
  return { arrow: '→', color: 'var(--text-muted)' };
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [RouterLink, ActivityListComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.less',
})
export class OverviewComponent {
  private readonly service = inject(DashboardService);
  private readonly race = inject(RaceService);

  readonly hasData = this.service.hasData;
  readonly recent = computed(() => this.service.recentActivities(6));

  readonly readiness = this.race.readiness;
  readonly limitingLabel = computed(() => {
    const r = this.readiness();
    return r ? DISCIPLINE_META[r.limiting].label : '';
  });

  readonly form = this.service.currentForm;

  readonly tsbStat = computed(() => {
    const f = this.form();
    return f ? tsbStatus(f.tsb) : null;
  });

  readonly ctlTrend = computed(() => {
    const s = this.service.overallSeries();
    if (s.length < 8) return mark(0, 0.5);
    return mark(s[s.length - 1].ctl - s[s.length - 8].ctl, 0.5);
  });

  readonly weekVolume = computed(() => {
    const acts = this.service.activities();
    let last = 0;
    let prev = 0;
    for (const d of IRONMAN_DISCIPLINES) {
      const s = weeklyVolumeSeries(acts, d, 2);
      prev += s[0];
      last += s[1];
    }
    return { last, prev, trend: mark(last - prev, 0.5) };
  });

  colorFor(percent: number): string {
    return percent >= 75
      ? 'var(--accent)'
      : percent >= 40
        ? 'var(--form)'
        : 'var(--fatigue)';
  }

  round(v: number): string {
    return Math.round(v).toString();
  }

  tsbText(): string {
    const f = this.form();
    if (!f) return '—';
    const v = Math.round(f.tsb);
    return v > 0 ? `+${v}` : `${v}`;
  }
}
