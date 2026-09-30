import { Component, OnInit, computed, input, output, signal } from '@angular/core';
import { dayKey } from '../../domain/activity';
import { formatClock } from '../../domain/format';
import {
  RACE_CUTOFF_SECONDS,
  RACE_LABEL,
  RaceConfig,
  RaceDistance,
} from '../../domain/readiness';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-race-dialog',
  standalone: true,
  imports: [ModalComponent],
  templateUrl: './race-dialog.component.html',
})
export class RaceDialogComponent implements OnInit {
  config = input<RaceConfig | null>(null);
  save = output<RaceConfig>();
  cancel = output<void>();

  readonly distances: { key: RaceDistance; label: string }[] = [
    { key: 'full', label: RACE_LABEL.full },
    { key: 'half', label: RACE_LABEL.half },
  ];

  readonly distance = signal<RaceDistance>('full');
  readonly noDate = signal(true);
  readonly date = signal(dayKey(new Date()));
  readonly time = signal(formatClock(RACE_CUTOFF_SECONDS.full));
  readonly weeklyHours = signal<number | null>(null);
  readonly fromZero = signal(false);

  readonly isEdit = computed(() => this.config() !== null);

  ngOnInit(): void {
    const c = this.config();
    if (!c) return;
    this.distance.set(c.distance);
    this.noDate.set(c.date === null);
    if (c.date) this.date.set(c.date);
    this.time.set(formatClock(c.targetSeconds));
    this.weeklyHours.set(c.weeklyHours);
    this.fromZero.set(c.fromZero);
  }

  selectDistance(d: RaceDistance): void {
    this.distance.set(d);
    this.time.set(formatClock(RACE_CUTOFF_SECONDS[d]));
  }

  toggleNoDate(event: Event): void {
    this.noDate.set((event.target as HTMLInputElement).checked);
  }

  onDate(event: Event): void {
    this.date.set((event.target as HTMLInputElement).value);
  }

  onTime(event: Event): void {
    this.time.set((event.target as HTMLInputElement).value);
  }

  onWeeklyHours(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.weeklyHours.set(value === '' ? null : Math.max(0, Number(value)));
  }

  toggleFromZero(event: Event): void {
    this.fromZero.set((event.target as HTMLInputElement).checked);
  }

  onSave(): void {
    const [h, m] = this.time().split(':').map(Number);
    const seconds = (h || 0) * 3600 + (m || 0) * 60;
    this.save.emit({
      distance: this.distance(),
      date: this.noDate() || !this.date() ? null : this.date(),
      targetSeconds: seconds > 0 ? seconds : RACE_CUTOFF_SECONDS[this.distance()],
      weeklyHours: this.weeklyHours(),
      fromZero: this.fromZero(),
    });
  }
}
