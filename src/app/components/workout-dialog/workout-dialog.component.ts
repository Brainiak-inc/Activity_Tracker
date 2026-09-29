import { Component, OnInit, computed, input, output, signal } from '@angular/core';
import { DISCIPLINE_META, Discipline } from '../../domain/discipline';
import { PlannedWorkout, WorkoutInput } from '../../domain/plan';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-workout-dialog',
  standalone: true,
  imports: [ModalComponent],
  templateUrl: './workout-dialog.component.html',
})
export class WorkoutDialogComponent implements OnInit {
  workout = input<PlannedWorkout | null>(null);
  save = output<WorkoutInput>();
  remove = output<void>();
  cancel = output<void>();

  readonly disciplines = [
    Discipline.Run,
    Discipline.Bike,
    Discipline.Swim,
    Discipline.Strength,
    Discipline.Other,
  ].map((key) => ({ key, ...DISCIPLINE_META[key] }));

  readonly discipline = signal<Discipline>(Discipline.Run);
  readonly title = signal('');
  readonly note = signal('');
  readonly distance = signal<number | null>(null);

  readonly isEdit = computed(() => this.workout() !== null);
  readonly heading = computed(() =>
    this.workout() ? 'Тренировка' : 'Новая тренировка',
  );
  readonly unit = computed(() =>
    this.discipline() === Discipline.Swim ? 'м' : 'км',
  );

  ngOnInit(): void {
    const w = this.workout();
    if (w) {
      this.discipline.set(w.discipline);
      this.title.set(w.title);
      this.note.set(w.note);
      if (w.distanceKm != null) {
        this.distance.set(
          w.discipline === Discipline.Swim
            ? Math.round(w.distanceKm * 1000)
            : w.distanceKm,
        );
      }
    }
  }

  onTitle(event: Event): void {
    this.title.set((event.target as HTMLInputElement).value);
  }

  onNote(event: Event): void {
    this.note.set((event.target as HTMLTextAreaElement).value);
  }

  onDistance(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.distance.set(value === '' ? null : Number(value));
  }

  onSave(): void {
    const raw = this.distance();
    const distanceKm =
      raw == null || !Number.isFinite(raw) || raw <= 0
        ? null
        : this.discipline() === Discipline.Swim
          ? raw / 1000
          : raw;
    this.save.emit({
      discipline: this.discipline(),
      title: this.title().trim(),
      note: this.note().trim(),
      distanceKm,
    });
  }
}
