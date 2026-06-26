import { Component, output, signal } from '@angular/core';
import {
  DISCIPLINE_META,
  IRONMAN_DISCIPLINES,
} from '../../domain/discipline';
import { CalendarComponent } from '../calendar/calendar.component';
import { DataControlsComponent } from '../data-controls/data-controls.component';

interface TrackOption {
  key: string;
  label: string;
}

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CalendarComponent, DataControlsComponent],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.less',
})
export class SideMenuComponent {
  close = output<void>();

  readonly tracks: TrackOption[] = [
    { key: 'general', label: 'Общая' },
    ...IRONMAN_DISCIPLINES.map((d) => ({
      key: d as string,
      label: DISCIPLINE_META[d].label,
    })),
  ];

  readonly track = signal<string>('general');
}
