import { Component, computed, inject, signal } from '@angular/core';
import { DISCIPLINE_META, IRONMAN_DISCIPLINES } from '../../domain/discipline';
import { RaceConfig } from '../../domain/readiness';
import { DashboardService } from '../../services/dashboard.service';
import { RaceService } from '../../services/race.service';
import { ActivityListComponent } from '../activity-list/activity-list.component';
import { FitnessChartComponent } from '../fitness-chart/fitness-chart.component';
import { RaceDialogComponent } from '../race-dialog/race-dialog.component';
import { ReadinessPanelComponent } from '../readiness-panel/readiness-panel.component';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    FitnessChartComponent,
    ActivityListComponent,
    ReadinessPanelComponent,
    RaceDialogComponent,
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.less',
})
export class OverviewComponent {
  private readonly service = inject(DashboardService);
  private readonly race = inject(RaceService);

  readonly hasData = this.service.hasData;
  readonly series = this.service.overallSeries;
  readonly recent = computed(() => this.service.recentActivities(15));

  readonly raceConfig = this.race.config;
  readonly readiness = this.race.readiness;
  readonly configuring = signal(false);

  readonly disciplines = computed(() => {
    const counts = this.service.countByDiscipline();
    return IRONMAN_DISCIPLINES.map((d) => ({
      key: d,
      label: DISCIPLINE_META[d].label,
      count: counts[d],
      ctl: Math.round(this.service.formFor(d)?.ctl ?? 0),
    }));
  });

  onSaveRace(config: RaceConfig): void {
    this.race.setConfig(config);
    this.configuring.set(false);
  }

  clearRace(): void {
    this.race.clear();
  }
}
