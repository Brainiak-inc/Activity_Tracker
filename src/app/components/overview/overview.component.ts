import { Component, computed, inject } from '@angular/core';
import { DISCIPLINE_META, IRONMAN_DISCIPLINES } from '../../domain/discipline';
import { DashboardService } from '../../services/dashboard.service';
import { ActivityListComponent } from '../activity-list/activity-list.component';
import { FitnessChartComponent } from '../fitness-chart/fitness-chart.component';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [FitnessChartComponent, ActivityListComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.less',
})
export class OverviewComponent {
  private readonly service = inject(DashboardService);

  readonly series = this.service.overallSeries;
  readonly recent = computed(() => this.service.recentActivities(15));

  readonly disciplines = computed(() => {
    const counts = this.service.countByDiscipline();
    return IRONMAN_DISCIPLINES.map((d) => ({
      key: d,
      label: DISCIPLINE_META[d].label,
      count: counts[d],
      ctl: Math.round(this.service.formFor(d)?.ctl ?? 0),
    }));
  });
}
