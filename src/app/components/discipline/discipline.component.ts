import { Component, computed, inject, input } from '@angular/core';
import { Discipline } from '../../domain/discipline';
import { tsbStatus } from '../../domain/form-status';
import { formatDuration } from '../../domain/format';
import { DashboardService } from '../../services/dashboard.service';
import { ActivityListComponent } from '../activity-list/activity-list.component';
import { FitnessChartComponent } from '../fitness-chart/fitness-chart.component';
import { MetricCardComponent } from '../metric-card/metric-card.component';

@Component({
  selector: 'app-discipline',
  standalone: true,
  imports: [MetricCardComponent, FitnessChartComponent, ActivityListComponent],
  templateUrl: './discipline.component.html',
  styleUrl: './discipline.component.less',
})
export class DisciplineComponent {
  private readonly service = inject(DashboardService);

  discipline = input.required<Discipline>();

  readonly totals = computed(() => this.service.totalsFor(this.discipline()));
  readonly series = computed(() => this.service.seriesFor(this.discipline()));
  readonly form = computed(() => this.service.formFor(this.discipline()));
  readonly activities = computed(() =>
    this.service.activitiesFor(this.discipline()),
  );

  readonly tsb = computed(() => {
    const f = this.form();
    return f ? tsbStatus(f.tsb) : null;
  });

  readonly durationText = computed(() =>
    formatDuration(this.totals().durationMs),
  );

  round(v: number): string {
    return Math.round(v).toString();
  }
}
