import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { VolumeTrendComponent } from '../volume-trend/volume-trend.component';

@Component({
  selector: 'app-volume-page',
  standalone: true,
  imports: [VolumeTrendComponent],
  templateUrl: './volume-page.component.html',
  styleUrl: './volume-page.component.less',
})
export class VolumePageComponent {
  private readonly dashboard = inject(DashboardService);
  private readonly location = inject(Location);

  readonly hasData = this.dashboard.hasData;

  back(): void {
    this.location.back();
  }
}
