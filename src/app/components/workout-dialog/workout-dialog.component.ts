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

  readonly isEdit = computed(() => this.workout() !== null);
  readonly heading = computed(() =>
    this.workout() ? 'Тренировка' : 'Новая тренировка',
  );

  ngOnInit(): void {
    const w = this.workout();
    if (w) {
      this.discipline.set(w.discipline);
      this.title.set(w.title);
      this.note.set(w.note);
    }
  }

  onTitle(event: Event): void {
    this.title.set((event.target as HTMLInputElement).value);
  }

  onNote(event: Event): void {
    this.note.set((event.target as HTMLTextAreaElement).value);
  }

  onSave(): void {
    const title = this.title().trim();
    if (!title) return;
    this.save.emit({
      discipline: this.discipline(),
      title,
      note: this.note().trim(),
    });
  }
}
