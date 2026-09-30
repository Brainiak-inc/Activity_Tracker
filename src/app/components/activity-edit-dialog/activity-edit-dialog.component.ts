import { Component, OnInit, computed, input, output, signal } from '@angular/core';
import { Activity } from '../../domain/activity';
import { DISCIPLINE_META, Discipline } from '../../domain/discipline';
import { formatDateTime } from '../../domain/format';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-activity-edit-dialog',
  standalone: true,
  imports: [ModalComponent],
  templateUrl: './activity-edit-dialog.component.html',
})
export class ActivityEditDialogComponent implements OnInit {
  activity = input.required<Activity>();
  save = output<Discipline>();
  remove = output<void>();
  cancel = output<void>();

  readonly disciplines = [
    Discipline.Run,
    Discipline.Bike,
    Discipline.Swim,
    Discipline.Strength,
    Discipline.Other,
  ].map((key) => ({ key, ...DISCIPLINE_META[key] }));

  readonly discipline = signal<Discipline>(Discipline.Other);
  readonly when = computed(() => formatDateTime(this.activity().start));

  ngOnInit(): void {
    this.discipline.set(this.activity().discipline);
  }

  onSave(): void {
    this.save.emit(this.discipline());
  }
}
