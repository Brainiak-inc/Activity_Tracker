import { Component, computed, inject } from '@angular/core';
import { DISCIPLINE_META, IRONMAN_DISCIPLINES } from '../../domain/discipline';
import { tsbStatus } from '../../domain/form-status';
import { DashboardService } from '../../services/dashboard.service';
import { ActivityListComponent } from '../activity-list/activity-list.component';
import { FitnessChartComponent } from '../fitness-chart/fitness-chart.component';
import { MetricCardComponent } from '../metric-card/metric-card.component';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [MetricCardComponent, FitnessChartComponent, ActivityListComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.less',
})
export class OverviewComponent {
  private readonly service = inject(DashboardService);

  readonly form = this.service.currentForm;
  readonly series = this.service.overallSeries;
  readonly recent = computed(() => this.service.recentActivities(15));

  readonly disciplines = computed(() => {
    const counts = this.service.countByDiscipline();
    return IRONMAN_DISCIPLINES.map((d) => ({
      key: d,
      label: DISCIPLINE_META[d].label,
      emoji: DISCIPLINE_META[d].emoji,
      count: counts[d],
      ctl: Math.round(this.service.formFor(d)?.ctl ?? 0),
    }));
  });

  readonly tsb = computed(() => {
    const f = this.form();
    return f ? tsbStatus(f.tsb) : null;
  });

  round(v: number): string {
    return Math.round(v).toString();
  }
}
