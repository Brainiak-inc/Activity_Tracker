import { Component, input } from '@angular/core';
import { Activity } from '../../domain/activity';
import { DISCIPLINE_META } from '../../domain/discipline';
import { formatDateTime, formatDuration } from '../../domain/format';

@Component({
  selector: 'app-activity-list',
  standalone: true,
  templateUrl: './activity-list.component.html',
  styleUrl: './activity-list.component.less',
})
export class ActivityListComponent {
  activities = input.required<Activity[]>();
  showEmoji = input<boolean>(true);

  emoji(activity: Activity): string {
    return DISCIPLINE_META[activity.discipline].emoji;
  }

  subtitle(activity: Activity): string {
    const parts = [formatDateTime(activity.start), formatDuration(activity.durationMs)];
    if (activity.distanceKm != null && activity.distanceKm > 0) {
      parts.push(`${activity.distanceKm.toFixed(1)} км`);
    }
    if (activity.avgHr != null) {
      parts.push(`${activity.avgHr} уд/мин`);
    }
    return parts.join(' · ');
  }
}
