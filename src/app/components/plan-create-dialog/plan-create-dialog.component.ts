import { Component, output, signal } from '@angular/core';
import { dayKey } from '../../domain/activity';
import { mondayOf } from '../../domain/plan';
import { ModalComponent } from '../modal/modal.component';

export interface CreatePlanData {
  name: string;
  startMonday: string | null;
  weeks: number;
}

@Component({
  selector: 'app-plan-create-dialog',
  standalone: true,
  imports: [ModalComponent],
  templateUrl: './plan-create-dialog.component.html',
})
export class PlanCreateDialogComponent {
  create = output<CreatePlanData>();
  cancel = output<void>();

  readonly name = signal('');
  readonly dated = signal(true);
  readonly date = signal(dayKey(mondayOf(new Date())));
  readonly count = signal(1);

  onName(event: Event): void {
    this.name.set((event.target as HTMLInputElement).value);
  }

  toggleDated(event: Event): void {
    this.dated.set((event.target as HTMLInputElement).checked);
  }

  onDate(event: Event): void {
    this.date.set((event.target as HTMLInputElement).value);
  }

  onCount(event: Event): void {
    const n = Number((event.target as HTMLInputElement).value);
    this.count.set(Math.min(52, Math.max(1, Math.floor(n) || 1)));
  }

  onCreate(): void {
    const name = this.name().trim() || 'План';
    let startMonday: string | null = null;
    if (this.dated() && this.date()) {
      const [y, m, d] = this.date().split('-').map(Number);
      startMonday = dayKey(mondayOf(new Date(y, m - 1, d)));
    }
    this.create.emit({ name, startMonday, weeks: this.count() });
  }
}
