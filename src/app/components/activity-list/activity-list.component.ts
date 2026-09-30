import { Component, input, output } from '@angular/core';
import { Activity } from '../../domain/activity';
import { DISCIPLINE_META } from '../../domain/discipline';
import {
  formatDateTime,
  formatDistance,
  formatDuration,
} from '../../domain/format';

@Component({
  selector: 'app-activity-list',
  standalone: true,
  templateUrl: './activity-list.component.html',
  styleUrl: './activity-list.component.less',
})
export class ActivityListComponent {
  activities = input.required<Activity[]>();
  showTag = input<boolean>(true);
  editable = input<boolean>(false);
  select = output<Activity>();

  code(activity: Activity): string {
    return DISCIPLINE_META[activity.discipline].code;
  }

  subtitle(activity: Activity): string {
    const parts = [formatDateTime(activity.start), formatDuration(activity.durationMs)];
    if (activity.distanceKm != null && activity.distanceKm > 0) {
      parts.push(formatDistance(activity.discipline, activity.distanceKm));
    }
    if (activity.avgHr != null) {
      parts.push(`${activity.avgHr} уд/мин`);
    }
    return parts.join(' · ');
  }
}
