import { Component, inject, signal } from '@angular/core';
import { RaceConfig } from '../../domain/readiness';
import { DashboardService } from '../../services/dashboard.service';
import { RaceService } from '../../services/race.service';
import { RaceDialogComponent } from '../race-dialog/race-dialog.component';
import { ReadinessPanelComponent } from '../readiness-panel/readiness-panel.component';

@Component({
  selector: 'app-readiness',
  standalone: true,
  imports: [ReadinessPanelComponent, RaceDialogComponent],
  templateUrl: './readiness.component.html',
  styleUrl: './readiness.component.less',
})
export class ReadinessComponent {
  private readonly dashboard = inject(DashboardService);
  private readonly race = inject(RaceService);

  readonly hasData = this.dashboard.hasData;
  readonly raceConfig = this.race.config;
  readonly readiness = this.race.readiness;
  readonly configuring = signal(false);

  onSave(config: RaceConfig): void {
    this.race.setConfig(config);
    this.configuring.set(false);
  }

  clear(): void {
    this.race.clear();
  }
}
