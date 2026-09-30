import { Location } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { tsbStatus } from '../../domain/form-status';
import { DashboardService } from '../../services/dashboard.service';
import { FitnessChartComponent } from '../fitness-chart/fitness-chart.component';
import { MetricCardComponent } from '../metric-card/metric-card.component';

@Component({
  selector: 'app-form-page',
  standalone: true,
  imports: [FitnessChartComponent, MetricCardComponent],
  templateUrl: './form-page.component.html',
  styleUrl: './form-page.component.less',
})
export class FormPageComponent {
  private readonly dashboard = inject(DashboardService);
  private readonly location = inject(Location);

  readonly hasData = this.dashboard.hasData;
  readonly series = this.dashboard.overallSeries;
  readonly form = this.dashboard.currentForm;

  readonly tsb = computed(() => {
    const f = this.form();
    return f ? tsbStatus(f.tsb) : null;
  });

  round(v: number): string {
    return Math.round(v).toString();
  }

  back(): void {
    this.location.back();
  }
}
