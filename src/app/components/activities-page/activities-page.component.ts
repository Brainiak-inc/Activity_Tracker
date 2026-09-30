import { Location } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Activity } from '../../domain/activity';
import { Discipline } from '../../domain/discipline';
import { DashboardService } from '../../services/dashboard.service';
import { ActivityEditDialogComponent } from '../activity-edit-dialog/activity-edit-dialog.component';
import { ActivityListComponent } from '../activity-list/activity-list.component';

@Component({
  selector: 'app-activities-page',
  standalone: true,
  imports: [ActivityListComponent, ActivityEditDialogComponent],
  templateUrl: './activities-page.component.html',
  styleUrl: './activities-page.component.less',
})
export class ActivitiesPageComponent {
  private readonly dashboard = inject(DashboardService);
  private readonly location = inject(Location);

  readonly all = computed(() => [...this.dashboard.activities()].reverse());
  readonly editing = signal<Activity | null>(null);

  back(): void {
    this.location.back();
  }

  onSave(discipline: Discipline): void {
    const a = this.editing();
    if (a) this.dashboard.setDiscipline(a, discipline);
    this.editing.set(null);
  }

  onRemove(): void {
    const a = this.editing();
    if (a) this.dashboard.deleteActivity(a);
    this.editing.set(null);
  }
}
